import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
      <p className="mt-4 text-slate-600">
        Questions about the CareBridge demo, partnerships, or technical support? Reach out using
        the fictional contact details below (for demonstration only).
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>CareBridge demo support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden />
            <span>
              <span className="font-medium text-slate-900">Email:</span>{" "}
              <a href="mailto:support@carebridge.demo" className="text-blue-700 hover:underline">
                support@carebridge.demo
              </a>
            </span>
          </p>
          <p className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden />
            <span>
              <span className="font-medium text-slate-900">Phone:</span> (555) 010-9000 (demo line)
            </span>
          </p>
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden />
            <span>
              <span className="font-medium text-slate-900">Office:</span> 100 Demo Plaza, Suite 400,
              New York, NY 10001 (fictional)
            </span>
          </p>
          <p className="text-slate-500">
            Hours: Monday–Friday, 9:00 AM – 5:00 PM Eastern (demo). We respond to demo inquiries
            within 1–2 business days in a production deployment; this prototype does not send real
            email.
          </p>
        </CardContent>
      </Card>

      <Button asChild className="mt-6" variant="outline">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}