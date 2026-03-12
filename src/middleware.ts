import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return Response.redirect(new URL("/sign-in", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
