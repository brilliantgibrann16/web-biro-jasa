const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
} as const;

export function isSameOriginMutation(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = request.headers.get("origin");
  if (!origin) return fetchSite === "same-origin";

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function jsonNoStore(
  body: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  for (const [name, value] of Object.entries(NO_STORE_HEADERS)) {
    headers.set(name, value);
  }

  return Response.json(body, {
    status: init.status ?? 200,
    headers,
  });
}
