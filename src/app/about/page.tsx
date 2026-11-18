import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">About CareBridge</h1>
      <p className="mt-4 text-lg text-slate-600">
        CareBridge is a healthcare document-sharing prototype built to simplify how patients and
        care coordinators send clinical records to participating organizations, track review status,
        and communicate with authorized administrators.
      </p>

      <MotionCards />

      <p className="mt-8 text-sm text-slate-500">
        This application uses synthetic patient data and fictional provider listings. It is not
        intended for production use with real protected health information.
      </p>

      <Button asChild className="mt-6" variant="outline">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}

function MotionCards() {
  const items = [
    {
      title: "Our mission",
      body: "Reduce friction between patients and health systems when sharing labs, referrals, imaging, and other documents that require timely review.",
    },
    {
      title: "What we demonstrate",
      body: "Secure uploads, organization-specific queues, status workflows, in-app messaging, notifications, and optional wearable device context on submissions.",
    },
    {
      title: "Who it is for",
      body: "Submitters managing their own or a family member’s documents, and hospital or clinic administrators reviewing inbound requests for their organization.",
    },
  ];

  return (
    <div className="mt-10 space-y-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader>
            <CardTitle className="text-lg">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-700">{item.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}