import { auth } from "@/lib/auth";

export default auth(() => {
  // Dashboard is publicly accessible; auth-gated actions
  // (save, share) redirect to sign-in from the client side.
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
