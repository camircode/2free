export function browserApiBaseUrl(): string {
  if (typeof window !== "undefined") return `${window.location.origin}/api/`;
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) throw new Error("NEXT_PUBLIC_API_URL must be configured");
  return `${configured.replace(/\/$/u, "")}/`;
}
