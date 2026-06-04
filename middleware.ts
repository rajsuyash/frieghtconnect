import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public by default (landing, directory, profiles, inquiry — the shipper flow
// needs no account). Only these require a signed-in user.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/register/forwarder(.*)",
  "/api/forwarders/draft(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
