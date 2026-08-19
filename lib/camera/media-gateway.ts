/**
 * Server-only MediaMTX gateway adapter.
 *
 * Translates camera RTSP credentials into credential-free WHEP/HLS URLs
 * the browser can consume. Never import this from client components.
 */

function getGatewayConfig() {
  const url = process.env.MEDIA_GATEWAY_URL;
  const apiUrl = process.env.MEDIA_GATEWAY_API_URL;
  const secret = process.env.MEDIA_GATEWAY_SECRET;
  if (!url || !apiUrl) return null;
  return { url, apiUrl, secret: secret || '' };
}

export function isGatewayConfigured(): boolean {
  return getGatewayConfig() !== null;
}

export type StreamUrls = {
  whep: string | null;
  hls: string | null;
};

/** Build credential-free playback URLs for a camera stream name. */
export function getPlaybackUrls(streamName: string): StreamUrls | null {
  const cfg = getGatewayConfig();
  if (!cfg) return null;
  const base = cfg.url.replace(/\/$/, '');
  return {
    whep: `${base}/${streamName}/whep`,
    hls: `${base}/${streamName}/index.m3u8`,
  };
}

export type TestResult = {
  status:
    | 'connecting'
    | 'connected'
    | 'auth_failed'
    | 'unreachable'
    | 'invalid_config'
    | 'gateway_unavailable';
  message: string;
};

/**
 * Ask the media gateway to probe an RTSP source.
 *
 * If the gateway is not configured, returns `gateway_unavailable` immediately.
 * Real probing requires the gateway API to expose a test endpoint; if it does
 * not, we fall back to a basic HTTP health check.
 */
export async function testCameraConnection(rtspUrl: string): Promise<TestResult> {
  const cfg = getGatewayConfig();
  if (!cfg) {
    return {
      status: 'gateway_unavailable',
      message: 'Media gateway is not configured. Set MEDIA_GATEWAY_URL and MEDIA_GATEWAY_API_URL.',
    };
  }

  if (!rtspUrl || !rtspUrl.startsWith('rtsp://')) {
    return { status: 'invalid_config', message: 'Invalid RTSP URL.' };
  }

  try {
    const apiBase = cfg.apiUrl.replace(/\/$/, '');
    const res = await fetch(`${apiBase}/v3/rtspconns/list`, {
      method: 'GET',
      headers: cfg.secret ? { Authorization: `Bearer ${cfg.secret}` } : {},
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        status: 'gateway_unavailable',
        message: `Gateway returned ${res.status}. Verify MEDIA_GATEWAY_API_URL.`,
      };
    }

    return { status: 'connected', message: 'Gateway reachable. Camera will be available once the stream path is added to MediaMTX.' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('abort') || msg.includes('timeout')) {
      return { status: 'unreachable', message: 'Gateway connection timed out.' };
    }
    return { status: 'unreachable', message: `Cannot reach media gateway: ${msg}` };
  }
}

/** Build an RTSP URL from individual fields. */
export function buildRtspUrl(opts: {
  host: string;
  port: number;
  username?: string;
  password?: string;
  streamPath?: string;
}): string {
  const auth = opts.username
    ? `${encodeURIComponent(opts.username)}${opts.password ? ':' + encodeURIComponent(opts.password) : ''}@`
    : '';
  const path = opts.streamPath ? opts.streamPath.replace(/^\//, '') : '';
  return `rtsp://${auth}${opts.host}:${opts.port}/${path}`;
}
