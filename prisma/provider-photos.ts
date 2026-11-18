/** Stable demo portrait URLs (randomuser.me) keyed by fictional provider name. */
const PORTRAIT_BASE = "https://randomuser.me/api/portraits";

export const PROVIDER_PHOTO_BY_NAME: Record<string, string> = {
  "Dr. Morgan Ellis": `${PORTRAIT_BASE}/men/32.jpg`,
  "Dr. Priya Nair": `${PORTRAIT_BASE}/women/44.jpg`,
  "Dr. James Okonkwo": `${PORTRAIT_BASE}/men/75.jpg`,
  "Dr. Elena Vasquez": `${PORTRAIT_BASE}/women/65.jpg`,
  "Dr. Avery Chen": `${PORTRAIT_BASE}/men/52.jpg`,
  "Jordan Lee, PA-C": `${PORTRAIT_BASE}/women/28.jpg`,
  "Dr. Samuel Reed": `${PORTRAIT_BASE}/men/41.jpg`,
  "Dr. Amira Hassan": `${PORTRAIT_BASE}/women/79.jpg`,
  "Dr. Rachel Kim": `${PORTRAIT_BASE}/women/47.jpg`,
  "Dr. Elaine Hartman": `${PORTRAIT_BASE}/women/31.jpg`,
  "Dr. Omar Velasquez": `${PORTRAIT_BASE}/men/67.jpg`,
  "Dr. Nina Kaufman": `${PORTRAIT_BASE}/women/55.jpg`,
  "Dr. Hannah Wu": `${PORTRAIT_BASE}/women/33.jpg`,
  "Dr. Marcus Lee": `${PORTRAIT_BASE}/men/22.jpg`,
  "Dr. Sofia Barros": `${PORTRAIT_BASE}/women/56.jpg`,
  "Dr. Kevin Okafor": `${PORTRAIT_BASE}/men/88.jpg`,
  "Dr. Lila Romano": `${PORTRAIT_BASE}/women/62.jpg`,
  "Dr. Rachel Stein": `${PORTRAIT_BASE}/women/40.jpg`,
  "Dr. Daniel Cho": `${PORTRAIT_BASE}/men/48.jpg`,
  "Dr. Carmen Iglesias": `${PORTRAIT_BASE}/women/71.jpg`,
  "Dr. Philip Adjei": `${PORTRAIT_BASE}/men/83.jpg`,
  "Dr. Amira Shah": `${PORTRAIT_BASE}/women/38.jpg`,
  "Dr. Grace O'Neill": `${PORTRAIT_BASE}/women/26.jpg`,
  "Dr. Jonas Park": `${PORTRAIT_BASE}/men/35.jpg`,
  "Dr. Mei Lin": `${PORTRAIT_BASE}/women/59.jpg`,
};

export function photoUrlForProvider(name: string): string {
  const mapped = PROVIDER_PHOTO_BY_NAME[name];
  if (mapped) return mapped;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const bucket = (hash % 70) + 1;
  const female =
    /\b(Dr\.\s+)?(Priya|Nina|Elaine|Hannah|Sofia|Lila|Rachel|Carmen|Amira|Grace|Mei|Kim|Wu|Romano|Stein|Iglesias|Shah|Nair|Vasquez|Hassan|Barros|Jordan)\b/i.test(
      name,
    );
  return `${PORTRAIT_BASE}/${female ? "women" : "men"}/${bucket}.jpg`;
}