import "server-only";

import { createPublicServerClient } from "@/lib/supabase/public-server";

export interface PublicRpcError {
  code?: string;
  message?: string;
}

interface PublicRpcResult {
  data: unknown;
  error: PublicRpcError | null;
}

interface PublicRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<PublicRpcResult>;
}

export function createPublicRpcClient(): PublicRpcClient | null {
  return createPublicServerClient() as unknown as PublicRpcClient | null;
}

export function firstRpcRow(data: unknown): Record<string, unknown> | null {
  const candidate = Array.isArray(data) ? data[0] : data;
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? (candidate as Record<string, unknown>)
    : null;
}
