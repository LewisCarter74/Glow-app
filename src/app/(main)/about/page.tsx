
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Sparkles, Target } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">About GlowApp</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
          Discover the story, mission, and heart behind the ultimate salon experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
           <Image
              src="https://placehold.co/800x600"
              alt="Interior of GlowApp salon"
              data-ai-hint="salon interior"
              layout="fill"
              objectFit="cover"
              className="hover:scale-105 transition-transform duration-300"
            />
        </div>
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-headline mb-2">Our Story</h2>
                    <p className="text-muted-foreground">
                    GlowApp was born from a simple idea: to create a sanctuary where beauty, comfort, and personalized attention combine to create a genuinely transformative experience. We envisioned a salon that was more than just a place to get a haircut or a manicure—it's a destination where you can relax, rejuvenate, and rediscover your radiance.
                    </p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                 <div className="bg-accent/10 p-3 rounded-full">
                    <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-headline mb-2">Our Mission</h2>
                    <p className="text-muted-foreground">
                    Our mission is to empower every client to look and feel their absolute best. We are committed to using the highest quality products, staying ahead of the latest trends, and providing exceptional, personalized service to every person who walks through our doors.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold font-headline mb-8">Visit Our Salon</h2>
        <Card className="max-w-3xl mx-auto overflow-hidden">
            <div className="relative h-64 w-full">
                 <Image
                    src="https://placehold.co/1000x400"
                    alt="Map showing salon location"
                    data-ai-hint="street map"
                    layout="fill"
                    objectFit="cover"
                    />
            </div>
            <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="font-semibold text-lg">123 Beauty Lane, Glamour City, 10101</p>
                </div>
                <p className="text-muted-foreground mb-4">We are conveniently located in the heart of the city. Walk-ins are welcome, but appointments are recommended.</p>
                <Button asChild size="lg">
                    <Link href="/book">Book Your Visit</Link>
                </Button>
            </CardContent>
        </Card>
      </div>

       <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold font-headline mb-4">Meet Our Experts</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Our talented team of stylists and artists are the best in the business, dedicated to their craft and to making you happy.
        </p>
        <Button asChild variant="outline">
            <Link href="/stylists">
                <Users className="mr-2 h-4 w-4" />
                View Our Team
            </Link>
        </Button>
      </div>
    </div>
  );
}
