// ============================================================
// Background Function: generate-video-background
// Launches Veo generation, polls until done, stores in Blobs
// Background = 15 min timeout, returns 202 immediately
// ============================================================
import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  try {
    const { jobId, imageBase64, prompt, ratio, quality } = await request.json();
    const apiKey = Netlify.env.get("GOOGLE_AI_API_KEY");

    if (!apiKey || !jobId) return;

    const store = getStore("video-jobs");

    // Mark job as processing
    await store.setJSON(jobId, { status: "processing", progress: "Lancement de la génération vidéo..." });

    const model = quality === "pro" ? "veo-3.1-generate-preview" : "veo-3.1-fast-generate-preview";
    const aspectRatio = ratio === "9:16" ? "9:16" : "16:9";
    const videoPrompt = `Cinematic video. ACTION: ${prompt}. Photorealistic, smooth motion. Do not morph the main object.`;

    const instance: any = { prompt: videoPrompt };
    if (imageBase64) {
      instance.image = { bytesBase64Encoded: imageBase64, mimeType: "image/png" };
    }

    const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    // Step 1: Start generation
    await store.setJSON(jobId, { status: "processing", progress: "Envoi à Veo..." });

    const startRes = await fetch(
      `${BASE_URL}/models/${model}:predictLongRunning?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [instance],
          parameters: { aspectRatio },
        }),
      },
    );

    if (!startRes.ok) {
      const errorText = await startRes.text();
      let errorMsg = `Erreur Veo ${startRes.status}`;
      try { const e = JSON.parse(errorText); if (e.error?.message) errorMsg = e.error.message; } catch {}
      await store.setJSON(jobId, { status: "error", error: errorMsg });
      return;
    }

    let operation = await startRes.json();
    const operationName = operation.name;

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
        progress: `Génération en cours... ${Math.round(elapsed / 1000)}s`,
      });

      const pollRes = await fetch(`${BASE_URL}/${operationName}?key=${apiKey}`);
      if (!pollRes.ok) {
        await store.setJSON(jobId, { status: "error", error: "Erreur polling Veo." });
        return;
      }
      operation = await pollRes.json();
    }

    if (!operation.done) {
      await store.setJSON(jobId, { status: "error", error: "Timeout Veo (10 min)." });
      return;
    }

    if (operation.error) {
      await store.setJSON(jobId, {
        status: "error",
        error: operation.error.message || JSON.stringify(operation.error),
      });
      return;
    }

    // Step 3: Download video
    await store.setJSON(jobId, { status: "processing", progress: "Téléchargement de la vidéo..." });

    const videoUri = operation.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (!videoUri) {
      await store.setJSON(jobId, { status: "error", error: "Pas de vidéo dans la réponse Veo." });
      return;
    }

    const separator = videoUri.includes("?") ? "&" : "?";
    let videoRes = await fetch(`${videoUri}${separator}key=${apiKey}`);
    if (!videoRes.ok) {
      videoRes = await fetch(videoUri, { headers: { "x-goog-api-key": apiKey } });
    }
    if (!videoRes.ok) {
      await store.setJSON(jobId, { status: "error", error: "Erreur téléchargement vidéo." });
      return;
    }

    const videoBuffer = await videoRes.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString("base64");

    // Step 4: Store result
    await store.setJSON(jobId, {
      status: "done",
      videoBase64,
      mimeType: "video/mp4",
    });

    console.log(`[video-bg] Job ${jobId} done, ${videoBuffer.byteLength} bytes`);
  } catch (error: any) {
    console.error("[video-bg] Error:", error);
    try {
      const { jobId } = await request.clone().json();
      if (jobId) {
        const store = getStore("video-jobs");
        await store.setJSON(jobId, { status: "error", error: error.message || "Erreur interne." });
      }
    } catch {}
  }
};
