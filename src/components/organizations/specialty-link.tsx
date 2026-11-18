import Link from "next/link";
import {
  findMatchingSpecialty,
  type OrgSpecialtyRow,
  specialtyHasPage,
  specialtyPageHref,
} from "@/lib/organization-specialties";

export function SpecialtyLink({
  orgSlug,
  label,
  specialties,
}: {
  orgSlug: string;
  label: string;
  specialties: OrgSpecialtyRow[];
}) {
  const match = findMatchingSpecialty(specialties, label);
  if (match && specialtyHasPage(match)) {
    return (
      <Link
        href={specialtyPageHref(orgSlug, match.name)}
        className="text-blue-700 hover:underline"
      >
        {label}
      </Link>
    );
  }
  return <span>{label}</span>;
}