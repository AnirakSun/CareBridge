export function specialtyToSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function specialtyPageHref(orgSlug: string, specialtyName: string) {
  return `/organizations/${encodeURIComponent(orgSlug)}/specialties/${specialtyToSlug(specialtyName)}`;
}

export type OrgSpecialtyRow = {
  id: string;
  name: string;
  description: string;
};

export function specialtyHasPage(specialty: OrgSpecialtyRow) {
  return specialty.description.trim().length > 0;
}

export function findMatchingSpecialty(
  specialties: OrgSpecialtyRow[],
  providerSpecialty: string,
): OrgSpecialtyRow | undefined {
  const needle = providerSpecialty.toLowerCase().trim();
  return specialties.find((s) => {
    const hay = s.name.toLowerCase();
    if (hay === needle) return true;
    if (hay.includes(needle) || needle.includes(hay)) return true;
    if (needle.includes("cardio") && hay.includes("cardio")) return true;
    if (needle.includes("oncol") && hay.includes("oncol")) return true;
    if (needle.includes("family") && hay.includes("primary")) return true;
    if (needle.includes("internal") && hay.includes("internal")) return true;
    return false;
  });
}

export function findSpecialtyBySlug(specialties: OrgSpecialtyRow[], specialtySlug: string) {
  const normalized = decodeURIComponent(specialtySlug).trim().toLowerCase();
  return specialties.find((s) => specialtyToSlug(s.name) === normalized);
}