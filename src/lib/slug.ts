export function slugify(input: string): string {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Slugify + guarantee uniqueness against an existing set. */
export function uniqueSlug(base: string, existing: Set<string>): string {
  const root = slugify(base) || "item";
  if (!existing.has(root)) return root;
  let i = 2;
  while (existing.has(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}
