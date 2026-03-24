// ============================================================
// Background Function: generate-video-background
// - Client POST ici → reçoit 202 immédiatement
// - La function tourne en arrière-plan (15 min max)
// - Appelle Veo predictLongRunning, poll, stocke dans Blobs
// - Client poll video-status pour récupérer le résultat
// ============================================================
import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  let jobId = '';
  try {
    const body = await request.json();
    const { imageBase64, prompt, ratio, quality } = body;
    jobId = body.jobId || `vid_${Date.now()}`;
    
    const apiKey = Netlify.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) {
      console.error("[video-bg] No API key");
      return;
    }

    const store = getStore({ name: "video-jobs", consistency: "strong" });
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
        body: JSON.stringify({ instances: [instance], parameters: { aspectRatio } }),
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
      console.log(`[video-bg] Job ${jobId}: Poll ${elapsed/1000}s done=${operation.done}`);
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

    const videoUri = operation.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (!videoUri) {
      console.error(`[video-bg] Job ${jobId}: No video URI`, JSON.stringify(operation.response).substring(0, 200));
      await store.setJSON(jobId, { status: "error", error: "Pas de vidéo dans la réponse Veo." });
      return;
    }

    const sep = videoUri.includes("?") ? "&" : "?";
    let videoRes = await fetch(`${videoUri}${sep}key=${apiKey}`);
    if (!videoRes.ok) {
      videoRes = await fetch(videoUri, { headers: { "x-goog-api-key": apiKey } });
    }
    if (!videoRes.ok) {
      await store.setJSON(jobId, { status: "error", error: "Erreur téléchargement vidéo." });
      return;
    }

    const videoBuffer = await videoRes.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString("base64");

    console.log(`[video-bg] Job ${jobId}: Done! ${videoBuffer.byteLength} bytes`);

    // Step 4: Store result
    await store.setJSON(jobId, {
      status: "done",
      videoBase64,
      mimeType: "video/mp4",
    });
  } catch (error: any) {
    console.error("[video-bg] Fatal error:", error);
    if (jobId) {
      try {
        const store = getStore({ name: "video-jobs", consistency: "strong" });
        await store.setJSON(jobId, { status: "error", error: error.message || "Erreur interne." });
      } catch {}
    }
  }
};
