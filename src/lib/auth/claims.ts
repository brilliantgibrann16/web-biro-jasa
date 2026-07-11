export interface AdminClaims {
  sub: string;
  app_metadata: {
    role: "admin";
  };
}

export function isAdminClaims(claims: unknown): claims is AdminClaims {
  if (!claims || typeof claims !== "object" || Array.isArray(claims)) {
    return false;
  }

  const record = claims as Record<string, unknown>;
  const appMetadata = record.app_metadata;

  return (
    typeof record.sub === "string" &&
    record.sub.length > 0 &&
    Boolean(appMetadata) &&
    typeof appMetadata === "object" &&
    !Array.isArray(appMetadata) &&
    (appMetadata as Record<string, unknown>).role === "admin"
  );
}
