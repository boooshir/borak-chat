export function mergeFieldErrors(
  ...errors: Array<Record<string, string[]>>
): Record<string, string[]> {
  const merged: Record<string, string[]> = {};

  for (const err of errors) {
    for (const [key, messages] of Object.entries(err)) {
      if (!merged[key]) {
        merged[key] = [];
      }
      merged[key].push(...messages);
    }
  }

  return merged;
}
