import type { PrismaClient } from "@prisma/client";
import { photoUrlForProvider } from "./provider-photos";

export type OrgProfileInput = {
  slug: string;
  streetAddress?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  hoursOverview?: string;
  accreditations?: string;
  patientPopulation?: string;
  facilities: Array<{
    name: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
    description: string;
    sortOrder: number;
  }>;
  specialties: Array<{ name: string; description: string; sortOrder: number }>;
  providers: Array<{
    name: string;
    title: string;
    specialty: string;
    credentials: string;
    bio: string;
    email?: string;
    phone?: string;
    department?: string;
    isPrimaryCare: boolean;
    sortOrder: number;
  }>;
};

export const ORGANIZATION_PROFILES: OrgProfileInput[] = [
  {
    slug: "riverside-general",
    streetAddress: "1200 Maple Avenue",
    zipCode: "94102",
    phone: "(555) 010-2000",
    website: "https://www.riversideuniversityhealth.org/",
    hoursOverview: "Emergency: 24/7. Outpatient clinics: Mon–Fri 7am–7pm, Sat 8am–2pm.",
    accreditations: "Demo Joint Commission equivalent · Magnet-designated nursing (fictional)",
    patientPopulation: "Adults, pediatrics, and maternity patients in Riverton and surrounding counties.",
    facilities: [
      {
        name: "Riverside General — Main Hospital",
        address: "1200 Maple Avenue",
        city: "Riverton",
        state: "CA",
        phone: "(555) 010-2000",
        description:
          "402-bed acute care hospital with emergency department, surgical suites, and inpatient medical units.",
        sortOrder: 0,
      },
      {
        name: "Riverside North Outpatient Center",
        address: "88 Cedar Lane",
        city: "Riverton",
        state: "CA",
        phone: "(555) 010-2010",
        description: "Ambulatory surgery, imaging, and same-day infusion services.",
        sortOrder: 1,
      },
    ],
    specialties: [
      {
        name: "Internal Medicine",
        description: "Complex chronic disease management and hospitalist coordination.",
        sortOrder: 0,
      },
      {
        name: "Cardiology",
        description: "Non-invasive cardiology, stress testing, and heart failure clinics.",
        sortOrder: 1,
      },
      {
        name: "Laboratory Services",
        description: "High-volume chemistry, hematology, and microbiology for CareBridge demo uploads.",
        sortOrder: 2,
      },
    ],
    providers: [
      {
        name: "Dr. Morgan Ellis",
        title: "Medical Director, Primary Care",
        specialty: "Family Medicine",
        credentials: "MD",
        bio: "Fictional PCP leading Riverside’s primary care network and CareBridge document intake pilots.",
        isPrimaryCare: true,
        sortOrder: 0,
      },
      {
        name: "Dr. Priya Nair",
        title: "Primary Care Physician",
        specialty: "Internal Medicine",
        credentials: "MD",
        bio: "Demo provider focused on preventive care and chronic condition follow-up.",
        isPrimaryCare: true,
        sortOrder: 1,
      },
      {
        name: "Dr. James Okonkwo",
        title: "Chief of Cardiology",
        specialty: "Cardiology",
        credentials: "MD, FACC",
        bio: "Fictional specialist overseeing echocardiography and outpatient cardiology referrals.",
        isPrimaryCare: false,
        sortOrder: 2,
      },
    ],
  },
  {
    slug: "northlake-diagnostics",
    streetAddress: "500 Northlake Boulevard",
    zipCode: "98101",
    phone: "(555) 010-3100",
    website: "https://www.labcorp.com/",
    hoursOverview: "Specimen receiving: Mon–Sat 6am–10pm. Client services: Mon–Fri 8am–6pm.",
    accreditations: "Demo CAP accreditation · CLIA-certified high-complexity lab (fictional)",
    patientPopulation: "Hospital systems, clinics, and direct-to-lab demo submitters across the Pacific Northwest.",
    facilities: [
      {
        name: "Northlake Core Laboratory",
        address: "500 Northlake Boulevard",
        city: "Northlake",
        state: "WA",
        description: "Central processing for chemistry, immunology, and molecular demo panels.",
        sortOrder: 0,
      },
      {
        name: "Northlake Patient Service Center — Capitol",
        address: "14 Capitol Street",
        city: "Northlake",
        state: "WA",
        phone: "(555) 010-3115",
        description: "Walk-in phlebotomy and synthetic specimen collection for demonstrations.",
        sortOrder: 1,
      },
    ],
    specialties: [
      {
        name: "Clinical Chemistry",
        description: "Routine and specialty chemistry panels with rapid turnaround for demos.",
        sortOrder: 0,
      },
      {
        name: "Hematology",
        description: "CBC, coagulation, and flow cytometry referral studies (synthetic).",
        sortOrder: 1,
      },
    ],
    providers: [
      {
        name: "Dr. Elena Vasquez",
        title: "Laboratory Medical Director",
        specialty: "Clinical Pathology",
        credentials: "MD",
        bio: "Fictional pathologist reviewing abnormal demo results and add-on test requests.",
        isPrimaryCare: false,
        sortOrder: 0,
      },
    ],
  },
  {
    slug: "summit-care",
    streetAddress: "2200 Summit Park Drive",
    zipCode: "80202",
    phone: "(555) 010-4200",
    website: "https://www.summitmedicalgroup.com/",
    hoursOverview: "Mon–Thu 8am–6pm, Fri 8am–5pm, Sat 9am–12pm (urgent care until 8pm daily).",
    patientPopulation: "Families and working adults seeking outpatient primary and urgent care (demo).",
    facilities: [
      {
        name: "Summit Care — Main Clinic",
        address: "2200 Summit Park Drive",
        city: "Denver",
        state: "CO",
        description: "Multi-specialty outpatient clinic with on-site imaging and lab draw station.",
        sortOrder: 0,
      },
    ],
    specialties: [
      { name: "Primary Care", description: "Well visits, chronic care, and care coordination.", sortOrder: 0 },
      { name: "Urgent Care", description: "Same-day illness and injury visits without appointment.", sortOrder: 1 },
    ],
    providers: [
      {
        name: "Dr. Avery Chen",
        title: "Lead Primary Care Provider",
        specialty: "Family Medicine",
        credentials: "MD",
        bio: "Fictional PCP accepting CareBridge document submissions for referrals and prior auth.",
        isPrimaryCare: true,
        sortOrder: 0,
      },
      {
        name: "Jordan Lee, PA-C",
        title: "Physician Assistant",
        specialty: "Urgent Care",
        credentials: "PA-C",
        bio: "Demo clinician supporting extended-hours urgent care visits.",
        isPrimaryCare: true,
        sortOrder: 1,
      },
    ],
  },
  {
    slug: "harborview-medical",
    streetAddress: "325 Harborview Plaza",
    zipCode: "98104",
    phone: "(555) 010-5000",
    website: "https://www.uwmedicine.org/locations/harborview",
    hoursOverview: "Trauma and emergency: 24/7. Specialty clinics: Mon–Fri 7:30am–5:30pm.",
    accreditations: "Demo Level I trauma center designation (fictional)",
    patientPopulation: "Regional referral center for complex surgical and neurological care.",
    facilities: [
      {
        name: "Harborview Medical Center",
        address: "325 Harborview Plaza",
        city: "Seattle",
        state: "WA",
        description: "Tertiary hospital with neurosciences tower and transplant demo program.",
        sortOrder: 0,
      },
      {
        name: "Harborview Rehabilitation Institute",
        address: "90 Lakeview Road",
        city: "Seattle",
        state: "WA",
        description: "Inpatient and outpatient rehab for stroke and orthopedic recovery (synthetic programs).",
        sortOrder: 1,
      },
    ],
    specialties: [
      { name: "Neurosurgery", description: "Brain and spine surgical consults and second opinions.", sortOrder: 0 },
      { name: "Oncology", description: "Multidisciplinary tumor board and infusion center (demo).", sortOrder: 1 },
      { name: "Transplant Coordination", description: "Pre-transplant evaluation document intake.", sortOrder: 2 },
    ],
    providers: [
      {
        name: "Dr. Samuel Reed",
        title: "Primary Care Liaison",
        specialty: "Internal Medicine",
        credentials: "MD",
        bio: "Fictional PCP gateway for specialist referrals into Harborview programs.",
        isPrimaryCare: true,
        sortOrder: 0,
      },
      {
        name: "Dr. Amira Hassan",
        title: "Director, Neurosciences",
        specialty: "Neurology",
        credentials: "MD, PhD",
        bio: "Demo specialist lead for neurosurgery and neurology collaboration.",
        isPrimaryCare: false,
        sortOrder: 1,
      },
    ],
  },
  {
    slug: "clearpath-imaging",
    streetAddress: "901 ClearPath Way",
    zipCode: "78701",
    phone: "(555) 010-6100",
    website: "https://www.radiologyinfo.org/",
    hoursOverview: "Imaging appointments Mon–Fri 7am–9pm, Sat 8am–4pm.",
    patientPopulation: "Imaging referrals from hospitals and independent physicians (demo network).",
    facilities: [
      {
        name: "ClearPath Imaging — Central",
        address: "901 ClearPath Way",
        city: "Austin",
        state: "TX",
        description: "MRI, CT, ultrasound, and mammography suites with teleradiology reading pool.",
        sortOrder: 0,
      },
    ],
    specialties: [
      { name: "Diagnostic Imaging", description: "Cross-sectional and ultrasound interpretation.", sortOrder: 0 },
      { name: "Women's Imaging", description: "Screening mammography and breast MRI (demo).", sortOrder: 1 },
    ],
    providers: [
      {
        name: "Dr. Rachel Kim",
        title: "Radiology Medical Director",
        specialty: "Diagnostic Radiology",
        credentials: "MD",
        bio: "Fictional radiologist overseeing imaging report delivery via CareBridge demo workflow.",
        isPrimaryCare: false,
        sortOrder: 0,
      },
    ],
  },
];

export async function applyOrganizationProfiles(prisma: PrismaClient) {
  for (const profile of ORGANIZATION_PROFILES) {
    const org = await prisma.organization.findUnique({ where: { slug: profile.slug } });
    if (!org) continue;

    await prisma.organization.update({
      where: { id: org.id },
      data: {
        streetAddress: profile.streetAddress,
        zipCode: profile.zipCode,
        phone: profile.phone,
        website: profile.website,
        hoursOverview: profile.hoursOverview,
        accreditations: profile.accreditations,
        patientPopulation: profile.patientPopulation,
      },
    });

    await prisma.organizationFacility.createMany({
      data: profile.facilities.map((f) => ({ ...f, organizationId: org.id })),
    });
    await prisma.organizationSpecialty.createMany({
      data: profile.specialties.map((s) => ({ ...s, organizationId: org.id })),
    });
    await prisma.careProvider.createMany({
      data: profile.providers.map((p) => ({
        ...p,
        organizationId: org.id,
        photoUrl: photoUrlForProvider(p.name),
      })),
    });
  }
}
