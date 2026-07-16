import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let mockUser: { id: string } | null = null;
let refreshedCookies: Array<{
  name: string;
  value: string;
  options: Record<string, unknown>;
}> = [];
let mockIsSuperAdmin = false;
let passedCookieName: string | undefined = undefined;

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    opts: {
      cookieOptions?: { name?: string };
      cookies: { setAll: (c: typeof refreshedCookies) => void };
    },
  ) => {
    passedCookieName = opts.cookieOptions?.name;
    return {
      auth: {
        getUser: async () => {
          if (refreshedCookies.length) opts.cookies.setAll(refreshedCookies);
          return { data: { user: mockUser } };
        },
      },
      from: (_table: string) => ({
        select: (_cols: string) => ({
          eq: (_col: string, _val: string) => ({
            maybeSingle: async () => ({
              data: mockUser ? { is_super_admin: mockIsSuperAdmin } : null,
              error: null,
            }),
          }),
        }),
      }),
    };
  },
}));

const { proxy } = await import("./proxy");

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  mockUser = null;
  refreshedCookies = [];
  mockIsSuperAdmin = false;
  passedCookieName = undefined;
});

afterEach(() => vi.clearAllMocks());

const ROTATED = {
  name: "sb-test-auth-token",
  value: "rotated-refresh-token",
  options: { path: "/", httpOnly: true },
};

describe("proxy — cookie separation", () => {
  it("uses sb-admin-auth-token for /admin routes", async () => {
    mockUser = null;
    await proxy(new NextRequest("https://app.test/admin/dashboard"));
    expect(passedCookieName).toBe("sb-admin-auth-token");
  });

  it("uses sb-admin-auth-token for /api/admin routes", async () => {
    mockUser = null;
    await proxy(new NextRequest("https://app.test/api/admin/super-admin"));
    expect(passedCookieName).toBe("sb-admin-auth-token");
  });

  it("uses default cookie for customer routes", async () => {
    mockUser = null;
    await proxy(new NextRequest("https://app.test/dashboard"));
    expect(passedCookieName).toBeUndefined();
  });
});

describe("proxy — refreshed auth cookies survive redirects", () => {
  it("carries the rotated token when redirecting a signed-in user off /login", async () => {
    mockUser = { id: "user-1" };
    refreshedCookies = [ROTATED];
    const res = await proxy(new NextRequest("https://app.test/login"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
    expect(res.cookies.get(ROTATED.name)?.value).toBe(ROTATED.value);
  });
});

describe("proxy — super admin isolation", () => {
  it("redirects super admin from /login to /admin", async () => {
    mockUser = { id: "admin-1" };
    mockIsSuperAdmin = true;
    const res = await proxy(new NextRequest("https://app.test/login"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin");
  });

  it("blocks non-super-admin from accessing /admin routes -> /admin/login", async () => {
    mockUser = { id: "customer-1" };
    mockIsSuperAdmin = false;
    const res = await proxy(new NextRequest("https://app.test/admin/workspaces"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("redirects unauthenticated visitor from /admin/* to /admin/login", async () => {
    mockUser = null;
    const res = await proxy(new NextRequest("https://app.test/admin/users"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("skips /admin/login redirect for unauthenticated", async () => {
    mockUser = null;
    const res = await proxy(new NextRequest("https://app.test/admin/login"));
    expect(res.headers.get("location")).toBeNull();
  });
});
