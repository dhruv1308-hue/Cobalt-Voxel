import { describe, expect, it } from "vitest";
import { getWorkspaceShortcutSection, isEditableShortcutTarget } from "./workspaceShortcuts";

describe("workspace keyboard shortcuts", () => {
  it("maps number keys to workspace tools", () => {
    expect(getWorkspaceShortcutSection("1")).toBe("calendar");
    expect(getWorkspaceShortcutSection("2")).toBe("inbox");
    expect(getWorkspaceShortcutSection("3")).toBe("chat");
    expect(getWorkspaceShortcutSection("4")).toBe("overview");
    expect(getWorkspaceShortcutSection("9")).toBeUndefined();
  });

  it("protects editable fields from global shortcuts", () => {
    const input = { tagName: "INPUT", isContentEditable: false } as unknown as HTMLElement;
    const textarea = { tagName: "TEXTAREA", isContentEditable: false } as unknown as HTMLElement;
    const button = { tagName: "BUTTON", isContentEditable: false } as unknown as HTMLElement;
    expect(isEditableShortcutTarget(input)).toBe(true);
    expect(isEditableShortcutTarget(textarea)).toBe(true);
    expect(isEditableShortcutTarget(button)).toBe(false);
  });
});
