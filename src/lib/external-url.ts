/** Ensures website values from seed/DB open correctly in the browser. */
export function externalWebsiteUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function websiteDisplayLabel(url: string, maxLength?: number) {
  const label = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (maxLength === undefined || label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
}