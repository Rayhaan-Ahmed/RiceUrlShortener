import { GoogleAuth } from 'google-auth-library';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

let cachedToken: { value: string; expiresAt: number } | null = null;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const backendUrl = process.env.CLOUD_RUN_BACKEND_URL;
  const serviceAccountJson = process.env.GCP_SERVICE_ACCOUNT_JSON;

  if (!backendUrl || !serviceAccountJson) {
    response.status(500).json({ message: 'Proxy is missing Cloud Run configuration' });
    return;
  }

  const targetUrl = buildTargetUrl(backendUrl, request);
  const headers = await buildHeaders(request, backendUrl, serviceAccountJson);

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: shouldForwardBody(request.method) ? JSON.stringify(request.body ?? {}) : undefined,
    redirect: 'manual',
  });

  backendResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      response.setHeader(key, value);
    }
  });

  response.status(backendResponse.status);
  const buffer = Buffer.from(await backendResponse.arrayBuffer());
  response.send(buffer);
}

function buildTargetUrl(backendUrl: string, request: VercelRequest): string {
  const rawPath = request.query.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath ?? '';
  const target = new URL(`/${path}`, backendUrl);

  for (const [key, value] of Object.entries(request.query)) {
    if (key === 'path') {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(key, item));
    } else if (value !== undefined) {
      target.searchParams.set(key, value);
    }
  }

  return target.toString();
}

async function buildHeaders(
  request: VercelRequest,
  backendUrl: string,
  serviceAccountJson: string,
): Promise<Headers> {
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${await cloudRunToken(backendUrl, serviceAccountJson)}`);
  headers.set('X-AtLink-Proxy', 'vercel');

  const appAuthorization = request.headers.authorization;
  if (appAuthorization) {
    headers.set('X-AtLink-Authorization', Array.isArray(appAuthorization) ? appAuthorization[0] : appAuthorization);
  }

  const contentType = request.headers['content-type'];
  if (contentType) {
    headers.set('Content-Type', Array.isArray(contentType) ? contentType[0] : contentType);
  }

  return headers;
}

async function cloudRunToken(backendUrl: string, serviceAccountJson: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.value;
  }

  const credentials = JSON.parse(serviceAccountJson);
  const auth = new GoogleAuth({ credentials });
  const client = await auth.getIdTokenClient(backendUrl);
  const headers = await client.getRequestHeaders(backendUrl);
  const authorization = headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unable to generate Cloud Run identity token');
  }

  const value = authorization.substring(7);
  cachedToken = { value, expiresAt: now + 50 * 60 * 1000 };
  return value;
}

function shouldForwardBody(method?: string): boolean {
  return !['GET', 'HEAD'].includes(method?.toUpperCase() ?? 'GET');
}
