import { clerkMiddleware } from "@clerk/nextjs/server";

// Bina kisi condition ke, sab public kar diya. 
// Ab na koi protect() hai, na koi error aayega! Webhook direct hit karega.
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.[0-9a-z]+$|$).*)',
    '/(api|trpc)(.*)',
  ],
};
