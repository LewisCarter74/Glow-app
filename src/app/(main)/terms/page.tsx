
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-headline">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Welcome to GlowApp. These terms and conditions outline the rules
              and regulations for the use of our application. By accessing this
              app, we assume you accept these terms and conditions. Do not
              continue to use GlowApp if you do not agree to all of the terms
              and conditions stated on this page.
            </p>
            <p>
              [Placeholder: Detailed terms regarding user responsibilities,
              booking policies, payment terms, limitation of liability, and
              governing law will be added here.]
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
