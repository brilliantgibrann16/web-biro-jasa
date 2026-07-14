import "server-only";

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("payload-too-large");
    this.name = "RequestBodyTooLargeError";
  }
}

function assertDeclaredLengthWithinLimit(request: Request, maxBytes: number) {
  const rawLength = request.headers.get("content-length");
  if (rawLength === null) return;

  const declaredLength = Number(rawLength);
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > maxBytes
  ) {
    throw new RequestBodyTooLargeError();
  }
}

export async function readBodyBytesWithLimit(
  request: Request,
  maxBytes: number,
): Promise<Uint8Array> {
  try {
    assertDeclaredLengthWithinLimit(request, maxBytes);
  } catch (error) {
    await request.body?.cancel().catch(() => undefined);
    throw error;
  }
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new RequestBodyTooLargeError();
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

export async function readTextBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<string> {
  const bytes = await readBodyBytesWithLimit(request, maxBytes);
  return new TextDecoder().decode(bytes);
}
