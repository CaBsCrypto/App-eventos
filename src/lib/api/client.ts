/**
 * Cliente HTTP base — capa de datos de EventProtocol.
 *
 * Envuelve `fetch` con manejo de errores tipado y JSON automático. Los módulos
 * de dominio (events, attendees, ...) se construyen sobre esta base. Mantener
 * aquí toda la lógica de red (headers, base URL, parseo, errores) para que las
 * pantallas nunca llamen a `fetch` directamente.
 */

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Base configurable (útil para tests / entornos). El backend sirve `/api/*`. */
const BASE = '';

type Body = unknown;

async function request<T>(
  method: string,
  path: string,
  body?: Body,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      parsed = await res.text().catch(() => undefined);
    }
    const message =
      (parsed && typeof parsed === 'object' && 'error' in parsed
        ? String((parsed as Record<string, unknown>).error)
        : undefined) ?? `${method} ${path} → ${res.status}`;
    throw new ApiError(res.status, message, parsed);
  }

  // 204 / respuestas vacías
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const http = {
  get: <T>(path: string, init?: RequestInit) => request<T>('GET', path, undefined, init),
  post: <T>(path: string, body?: Body, init?: RequestInit) => request<T>('POST', path, body, init),
  put: <T>(path: string, body?: Body, init?: RequestInit) => request<T>('PUT', path, body, init),
  patch: <T>(path: string, body?: Body, init?: RequestInit) => request<T>('PATCH', path, body, init),
  delete: <T>(path: string, init?: RequestInit) => request<T>('DELETE', path, undefined, init),
};
