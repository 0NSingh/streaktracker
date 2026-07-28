import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "@/packages/lib/auth";

describe("auth utilities", () => {
  it("hashes and verifies password", async () => {
    const hash = await hashPassword("hello123");
    expect(hash).not.toBe("hello123");
    expect(await verifyPassword("hello123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("signs and verifies JWT tokens", () => {
    const user = { id: "abc", email: "test@test.com", name: "Test" };
    const token = signToken(user);
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.id).toBe("abc");
    expect(decoded!.email).toBe("test@test.com");
  });

  it("returns null for invalid tokens", () => {
    expect(verifyToken("invalid-token")).toBeNull();
    expect(verifyToken("")).toBeNull();
  });
});
