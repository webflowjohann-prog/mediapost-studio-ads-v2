// ============================================================
// Background Function: generate-video-background (15 min timeout)
// Called DIRECTLY by the client with just { jobId } (tiny body).
// The -background suffix tells Netlify to run this async (202).
// 1. Reads image + prompt from Netlify Blobs
// 2. Calls Veo predictLongRunning
// 3. Polls until done
// 4. Downloads and stores the video in Blobs
// ============================================================
import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let jobId = '';
  let store: any;

  try {
    const body = await request.json();
    jobId = body.jobId;
    if (!jobId) { console.error("[video-bg] No jobId"); return; }

    const apiKey = Netlify.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) { console.error("[video-bg] No API key"); return; }

    store = getStore({ name: "video-jobs", consistency: "strong" });

    // Read the full payload from Blobs
    const jobData = await store.get(jobId, { type: 'json' });
    if (!jobData || !jobData.payload) {
      console.error(`[video-bg] Job ${jobId}: no payload in Blobs`);
      await store.setJSON(jobId, { status: "error", error: "Données du job introuvables." });
      return;
    }

    const { imageBase64, prompt, ratio, quality } = jobData.payload;

    // Update status (clear the payload to save memory)
    await store.setJSON(jobId, { status: "processing", progress: "Envoi à Veo..." });

    const model = quality === "pro" ? "veo-3.1-generate-preview" : "veo-3.1-fast-generate-preview";
    const aspectRatio = ratio === "9:16" ? "9:16" : "16:9";
    const videoPrompt = `Cinematic video. ACTION: ${prompt}. Photorealistic, smooth motion. Do not morph the main object.`;

    const instance: any = { prompt: videoPrompt };
    if (imageBase64) {
      instance.image = { bytesBase64Encoded: imageBase64, mimeType: "image/png" };
    }

    const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    console.log(`[video-bg] Job ${jobId}: Starting ${model}`);

    // Step 1: Start generation
    const startRes = await fetch(
      `${BASE_URL}/models/${model}:predictLongRunning?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instances: [instance], parameters: { aspectRatio, generateAudio: false } }),
      },
    );

    if (!startRes.ok) {
      const errorText = await startRes.text();
      let errorMsg = `Erreur Veo ${startRes.status}`;
      try { const e = JSON.parse(errorText); if (e.error?.message) errorMsg = e.error.message; } catch {}
      console.error(`[video-bg] Job ${jobId}: Start failed - ${errorMsg}`);
      await store.setJSON(jobId, { status: "error", error: errorMsg });
      return;
    }

    let operation = await startRes.json();
    const operationName = operation.name;
    console.log(`[video-bg] Job ${jobId}: Operation ${operationName}`);

    if (!operationName) {
      await store.setJSON(jobId, { status: "error", error: "Pas d'opération Veo retournée." });
      return;
    }

    // Step 2: Poll until done (max 10 min)
    const maxWait = 600000;
    const pollInterval = 10000;
    let elapsed = 0;

    while (!operation.done && elapsed < maxWait) {
      await new Promise(r => setTimeout(r, pollInterval));
      elapsed += pollInterval;

      await store.setJSON(jobId, {
        status: "processing",
        progress: `Génération Veo en cours... ${Math.round(elapsed / 1000)}s`,
      });

      const pollRes = await fetch(`${BASE_URL}/${operationName}?key=${apiKey}`);
      if (!pollRes.ok) {
        console.error(`[video-bg] Job ${jobId}: Poll error ${pollRes.status}`);
        await store.setJSON(jobId, { status: "error", error: "Erreur polling Veo." });
        return;
      }
      operation = await pollRes.json();
      console.log(`[video-bg] Job ${jobId}: ${elapsed/1000}s done=${operation.done}`);
    }

    if (!operation.done) {
      await store.setJSON(jobId, { status: "error", error: "Timeout Veo (10 min)." });
      return;
    }

    if (operation.error) {
      const errMsg = operation.error.message || JSON.stringify(operation.error);
      console.error(`[video-bg] Job ${jobId}: Veo error - ${errMsg}`);
      await store.setJSON(jobId, { status: "error", error: errMsg });
      return;
    }

    // Step 3: Download video
    await store.setJSON(jobId, { status: "processing", progress: "Téléchargement de la vidéo..." });

    // Log the full operation response for debugging
    const responseKeys = JSON.stringify(Object.keys(operation.response || {}));
    console.log(`[video-bg] Job ${jobId}: operation.response keys: ${responseKeys}`);
    console.log(`[video-bg] Job ${jobId}: full response (truncated): ${JSON.stringify(operation.response || {}).substring(0, 2000)}`);

    // Try multiple known paths for the video URI (API versions differ)
    let videoUri: string | undefined;

    // Path 1: Gemini API REST format (official docs)
    videoUri = operation.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

    // Path 2: SDK-style camelCase
    if (!videoUri) {
      videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    }

    // Path 3: Direct on response
    if (!videoUri) {
      videoUri = operation.response?.video?.uri;
    }

    // Path 4: Predictions format (some Vertex AI responses)
    if (!videoUri) {
      videoUri = operation.response?.predictions?.[0]?.video?.uri
        || operation.response?.predictions?.[0]?.videoUri;
    }

    // Path 5: Deep search - recursively find any "uri" key that looks like a video URL
    if (!videoUri) {
      const findUri = (obj: any, depth = 0): string | undefined => {
        if (!obj || depth > 6) return undefined;
        if (typeof obj === 'string' && (obj.includes('download') || obj.includes('video'))) return obj;
        if (typeof obj !== 'object') return undefined;
        for (const key of Object.keys(obj)) {
          if (key === 'uri' && typeof obj[key] === 'string') return obj[key];
          const found = findUri(obj[key], depth + 1);
          if (found) return found;
        }
        return undefined;
      };
      videoUri = findUri(operation.response);
    }

    if (!videoUri) {
      const fullResp = JSON.stringify(operation).substring(0, 3000);
      console.error(`[video-bg] Job ${jobId}: No video URI found. Full operation: ${fullResp}`);
      await store.setJSON(jobId, {
        status: "error",
        error: "Pas de vidéo dans la réponse Veo. Contenu peut-être filtré (safety). Essayez un autre prompt.",
        debug: fullResp.substring(0, 500),
      });
      return;
    }

    console.log(`[video-bg] Job ${jobId}: Video URI found: ${videoUri.substring(0, 100)}...`);

    // Download using x-goog-api-key header (official method per Gemini API docs)
    let videoRes = await fetch(videoUri, {
      headers: { "x-goog-api-key": apiKey },
      redirect: "follow",
    });
    if (!videoRes.ok) {
      // Fallback: try with ?key= param
      const sep = videoUri.includes("?") ? "&" : "?";
      videoRes = await fetch(`${videoUri}${sep}key=${apiKey}`, { redirect: "follow" });
    }
    if (!videoRes.ok) {
      console.error(`[video-bg] Job ${jobId}: Download failed ${videoRes.status}`);
      await store.setJSON(jobId, { status: "error", error: `Erreur téléchargement vidéo (${videoRes.status}).` });
      return;
    }

    const videoBuffer = await videoRes.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString("base64");
    console.log(`[video-bg] Job ${jobId}: Done! ${videoBuffer.byteLength} bytes`);

    await store.setJSON(jobId, { status: "done", videoBase64, mimeType: "video/mp4" });
  } catch (error: any) {
    console.error("[video-bg] Fatal:", error);
    if (jobId && store) {
      try { await store.setJSON(jobId, { status: "error", error: error.message || "Erreur interne." }); } catch {}
    }
  }
};
