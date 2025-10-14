
module.exports = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
    files: ["src/middleware.ts"],
};