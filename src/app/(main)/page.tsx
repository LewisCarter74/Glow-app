
import Image from "next/image";
import Link from "next/link";
import { portfolioImages } from "@/lib/placeholder-data"; // Keep portfolioImages for now
import { Button } from "@/components/ui/button";
import StylistCard from "@/components/StylistCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Wand2 } from "lucide-react";
import { fetchStylists, fetchPromotions } from "@/lib/api"; // Import API functions

export default async function HomePage() {
  const stylists = await fetchStylists();
  const promotions = await fetchPromotions();

  // Filter for featured stylists if 'is_featured' property exists
  const featuredStylists = stylists.filter((stylist: any) => stylist.is_featured).slice(0, 3);
  // Fallback to first 3 if no featured stylists or 'is_featured' doesn't exist
  const displayStylists = featuredStylists.length > 0 ? featuredStylists : stylists.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full flex items-center justify-center text-center text-white">
        <Image
          src="https://placehold.co/1200x800"
          alt="Woman with beautiful hairstyle"
          data-ai-hint="beautiful hairstyle"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 p-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
            Experience Beauty, Redefined.
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Your exclusive escape for world-class hair, nail, and beauty treatments.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/book">Book Your Appointment</Link>
          </Button>
        </div>
      </section>
      
      {/* Promotions Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">
            Current Promotions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {promotions.map((promo: any, index: number) => (
              <Card key={promo.id || index} className="bg-card shadow-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="text-accent">{promo.name || promo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{promo.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="default">
              <Link href="/promotions">View All Promotions <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Stylists Section */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">
            Meet Our Experts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayStylists.map((stylist: any) => (
              <StylistCard key={stylist.id} stylist={stylist} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/stylists">View All Stylists <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Get Inspired Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">
            Get Inspired
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {portfolioImages.map((image, index) => (
              <div key={index} className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  data-ai-hint={image.hint}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Suggester Teaser */}
      <section className="py-16 md:py-24 bg-accent/10">
        <div className="container mx-auto px-4 text-center">
          <Wand2 className="w-12 h-12 mx-auto text-accent" />
          <h2 className="text-3xl md:text-4xl font-bold text-center mt-6 mb-4 font-headline">
            Can't Decide on a Look?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Let our AI stylist find the perfect new look for you. Get personalized recommendations in seconds.
          </p>
          <Button asChild size="lg">
            <Link href="/ai-styles">Try the AI Style Finder <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
