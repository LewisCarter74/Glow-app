
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-headline">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This is the Privacy Policy page for GlowApp. We are committed to
              protecting your privacy. This policy outlines how we collect, use,
              disclose, and safeguard your information when you use our
              application.
            </p>
            <p>
              [Placeholder: Detailed information about data collection, usage,
              user rights, and contact information for privacy concerns will be
              added here.]
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
