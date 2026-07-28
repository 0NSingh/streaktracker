import { createId } from "@paralleldrive/cuid2";

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const suffix = createId().slice(0, 8);
  return `${base}-${suffix}`;
}
