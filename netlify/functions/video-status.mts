// ============================================================
// Netlify Function: video-status
// Poll le statut d'un job vidéo depuis Netlify Blobs
// Strips the payload from responses (no need to send the
// imageBase64 back to the client on every poll)
// ============================================================
import { getStore } from "@netlify/blobs";

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('', { headers: CORS });
  }

  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return new Response(JSON.stringify({ error: 'jobId manquant.' }), {
        status: 400, headers: CORS,
      });
    }

    const store = getStore({ name: "video-jobs", consistency: "strong" });
    const job = await store.get(jobId, { type: 'json' }) as any;

    if (!job) {
      return new Response(JSON.stringify({ status: 'pending', progress: 'Initialisation...' }), {
        headers: CORS,
      });
    }

    // Strip the payload (imageBase64 etc) — no need to send it back on polls
    // Only send: status, progress, videoBase64 (when done), error, mimeType
    const response: Record<string, any> = {
      status: job.status,
    };

    if (job.progress) response.progress = job.progress;
    if (job.error) response.error = job.error;
    if (job.mimeType) response.mimeType = job.mimeType;
    if (job.debug) response.debug = job.debug;

    // Only include videoBase64 when status is done
    if (job.status === 'done' && job.videoBase64) {
      response.videoBase64 = job.videoBase64;
    }

    return new Response(JSON.stringify(response), { headers: CORS });
  } catch (error: any) {
    console.error('[video-status] Error:', error);
    return new Response(JSON.stringify({ status: 'pending', progress: 'Chargement...' }), {
      headers: CORS,
    });
  }
};

export const config = {
  path: '/.netlify/functions/video-status',
};
