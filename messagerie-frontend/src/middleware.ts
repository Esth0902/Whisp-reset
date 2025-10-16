export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/", "/about", "/sign-in(.*)", "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = await auth();
    const url = req.nextUrl.pathname;

    console.log(`➡️ [Middleware] Requête sur ${url}`);

    if (isPublicRoute(req)) {
        console.log(`🟢 [Middleware] ${url} est publique.`);
        return;
    }

    if (!userId) {
        console.log(`⛔ [Middleware] Non connecté → redirection vers /sign-in`);
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    console.log(`✅ [Middleware] Utilisateur connecté (${userId}) autorisé sur ${url}`);
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

