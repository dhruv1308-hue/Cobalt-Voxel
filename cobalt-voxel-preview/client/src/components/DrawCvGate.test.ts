import { describe, expect, it } from "vitest";
import { isDrawCvBypassKey } from "./DrawCvGate";

describe("Draw CV keyboard bypass", () => {
  it("accepts Enter and Space as accessible bypass keys", () => {
    expect(isDrawCvBypassKey("Enter")).toBe(true);
    expect(isDrawCvBypassKey(" ")).toBe(true);
  });

  it("does not treat unrelated keys as a bypass", () => {
    expect(isDrawCvBypassKey("Escape")).toBe(false);
    expect(isDrawCvBypassKey("Tab")).toBe(false);
    expect(isDrawCvBypassKey("c")).toBe(false);
  });
});
