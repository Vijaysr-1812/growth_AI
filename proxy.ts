import nextAuthMiddleware from "next-auth/middleware";

export default nextAuthMiddleware;

// This configuration tells the proxy exactly which routes to protect
export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};