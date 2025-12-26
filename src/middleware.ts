import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "session";
const JWT_SECRET = process.env.JWT_SECRET;

// Public routes that don't require authentication
const publicRoutes = ["/login", "/api/auth/login"];

// RBAC Configuration: Path prefix to required role(s)
const roleRoutes: Array<{ prefix: string; roles: string[] }> = [
    { prefix: "/api/admin", roles: ["ADMIN"] },
    { prefix: "/admin", roles: ["ADMIN"] },
    { prefix: "/api/manager", roles: ["MANAGER", "ADMIN"] },
    { prefix: "/manager", roles: ["MANAGER", "ADMIN"] },
    { prefix: "/api/transport", roles: ["TRANSPORT", "ADMIN"] },
    { prefix: "/transport", roles: ["TRANSPORT", "ADMIN"] },
    { prefix: "/api/employees", roles: ["EMPLOYEE", "ADMIN"] },
    { prefix: "/employee", roles: ["EMPLOYEE", "ADMIN"] },
];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Allow public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // 2. Allow static files and next internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.includes(".") // Simple way to ignore images, icons, etc.
    ) {
        return NextResponse.next();
    }

    // 3. Get session cookie
    const token = req.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json(
                { error: { code: "UNAUTHORIZED", message: "Section required" } },
                { status: 401 }
            );
        }
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 4. Verify JWT and RBAC
    try {
        if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userRole = payload.role as string;

        // Check RBAC
        const routeConfig = roleRoutes.find((r) => pathname.startsWith(r.prefix));
        if (routeConfig && !routeConfig.roles.includes(userRole)) {
            if (pathname.startsWith("/api")) {
                return NextResponse.json(
                    { error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                    { status: 403 }
                );
            }
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Middleware Auth Error:", error);
        if (pathname.startsWith("/api")) {
            return NextResponse.json(
                { error: { code: "UNAUTHORIZED", message: "Invalid session" } },
                { status: 401 }
            );
        }
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth/login (public)
         * - login (public)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
