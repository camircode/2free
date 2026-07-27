import { NextResponse } from "next/server";

import { guestModeCookie } from "@/lib/guest-mode";

export function GET(request: Request): NextResponse {
  const requestUrl = new URL(request.url);
  const leaving = requestUrl.searchParams.get("exit") === "1";
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol === "https" ? "https:" : requestUrl.protocol;
  const response = new NextResponse(null, { headers: { location: "/" }, status: 307 });
  response.cookies.set(guestModeCookie, leaving ? "" : "1", {
    httpOnly: true,
    maxAge: leaving ? 0 : 60 * 60 * 4,
    path: "/",
    sameSite: "lax",
    secure: protocol === "https:",
  });
  return response;
}
