import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, verifyPassword } from "./credentials";

describe("credential helpers", () => {
  it("normalizes emails for stable account lookup", () => {
    expect(normalizeEmail("  Dhruv@Example.COM ")).toBe("dhruv@example.com");
  });

  it("hashes passwords without making the password recoverable", async () => {
    const password = "correct horse battery staple";
    const result = await hashPassword(password);

    expect(result.passwordHash).not.toBe(password);
    expect(result.passwordSalt).toHaveLength(32);
    expect(await verifyPassword(password, result.passwordHash, result.passwordSalt)).toBe(true);
    expect(await verifyPassword("wrong password", result.passwordHash, result.passwordSalt)).toBe(false);
  });
});
