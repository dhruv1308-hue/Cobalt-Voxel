export const WORKSPACE_SHORTCUTS = {
  "1": "calendar",
  "2": "inbox",
  "3": "chat",
  "4": "overview",
} as const;

export type WorkspaceShortcutSection = (typeof WORKSPACE_SHORTCUTS)[keyof typeof WORKSPACE_SHORTCUTS];

export function getWorkspaceShortcutSection(key: string): WorkspaceShortcutSection | undefined {
  return WORKSPACE_SHORTCUTS[key as keyof typeof WORKSPACE_SHORTCUTS];
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  const tagName = element?.tagName;
  return Boolean(element?.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT");
}
