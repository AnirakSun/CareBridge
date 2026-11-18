import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQ_ITEMS = [
  {
    question: "What is CareBridge?",
    answer:
      "CareBridge is a demonstration app that shows how patients can upload clinical documents to participating organizations, track review status, and message their care team. All data in this environment is synthetic.",
  },
  {
    question: "Why CareBridge?",
    answer:
      "Most people juggle separate patient portals, lab apps, imaging sites, and messaging tools—each tied to one hospital or service. CareBridge is built to bring those workflows into one place: upload and track documents, browse organizations and specialists, link your physicians, and chat from a single account. Instead of logging into many health document apps, you get one hub for reaching the organizations and doctors already on your care team.",
  },
  {
    question: "How do I connect health devices?",
    answer:
      "Open Profile from your name menu and scroll to Connected health devices. Pick a supported wearable (for example Apple Health, Fitbit, or Garmin in the demo), follow the vendor setup guide if you want real-device steps on your phone, then use Connect to simulate linking in CareBridge. Connected devices can attach wellness context to submissions so your linked physicians and organizations see a fuller picture. This prototype does not send live data to vendors or real clinicians.",
  },
  {
    question: "Is my information real or secure in this demo?",
    answer:
      "No. Do not upload real protected health information. The demo uses fictional organizations, providers, and sample accounts. File storage is local to this prototype and is not production-grade.",
  },
  {
    question: "How do I send documents to a hospital or clinic?",
    answer:
      "Sign in as a patient, open Dashboard from your name menu, and create a new submission. Choose an organization, add details, and upload files. Admins at that organization see the item in their queue.",
  },
  {
    question: "How do I find and link my physicians?",
    answer:
      "Use My organizations (under your name menu) to browse facilities and add physicians to your care team. Those physicians appear in Chat when you start a direct conversation.",
  },
  {
    question: "Can I message my doctor in the app?",
    answer:
      "Patients can chat on submission threads and send direct messages to linked physicians. Organization staff reply through their admin tools. Names and portraits in the directory are fictional demo data.",
  },
  {
    question: "What are the demo login accounts?",
    answer:
      "See the home page or project README for sample patient and admin emails. The default demo password for seeded users is Password123! unless your deployment uses different credentials.",
  },
  {
    question: "Who can use the admin side?",
    answer:
      "Admin accounts belong to specific organizations. After signing in, open Admin from the name menu to review submissions, update status, message patients, and chat with colleagues.",
  },
];

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">FAQs</h1>
      <p className="mt-4 text-slate-600">
        Common questions about using the CareBridge prototype. For anything not covered here, see{" "}
        <Link href="/contact" className="text-blue-700 hover:underline">
          Contact Us
        </Link>
        .
      </p>

      <FaqList />

      <Button asChild className="mt-8" variant="outline">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}

function FaqList() {
  return (
    <ul className="mt-10 space-y-4">
      {FAQ_ITEMS.map((item) => (
        <li key={item.question}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">{item.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-700">{item.answer}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}