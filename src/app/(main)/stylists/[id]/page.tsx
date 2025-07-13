
import Image from "next/image";
import { Star } from "lucide-react";
import { stylists, reviews } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ReviewCard from "@/components/ReviewCard";
import { notFound } from "next/navigation";
import Link from "next/link";

export default function StylistDetailPage({ params }: { params: { id: string } }) {
  const stylist = stylists.find((s) => s.id === params.id);

  if (!stylist) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        {/* Left Column: Avatar and Details */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="items-center text-center">
              <Image
                src={stylist.avatarUrl}
                alt={`Portrait of ${stylist.name}`}
                data-ai-hint="professional headshot"
                width={120}
                height={120}
                className="rounded-full border-4 border-primary mb-4"
              />
              <CardTitle className="text-3xl font-headline">{stylist.name}</CardTitle>
              <p className="text-accent font-semibold text-lg">{stylist.specialty}</p>
              <div className="flex items-center gap-2 pt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{stylist.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({stylist.reviewCount} reviews)</span>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">{stylist.bio}</p>
              <Button size="lg" className="w-full" asChild>
                <Link href="/book">Book with {stylist.name}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Portfolio and Reviews */}
        <div className="md:col-span-2">
          {/* Portfolio Section */}
          <section>
            <h2 className="text-3xl font-bold font-headline mb-6">Portfolio</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {stylist.portfolio.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="overflow-hidden">
                        <CardContent className="flex aspect-[4/3] items-center justify-center p-0">
                          <Image
                            src={img}
                            alt={`${stylist.name}'s work ${index + 1}`}
                            data-ai-hint="hairstyle"
                            width={800}
                            height={600}
                            className="object-cover w-full h-full"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-16" />
              <CarouselNext className="mr-16" />
            </Carousel>
          </section>

          {/* Reviews Section */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold font-headline mb-6">What Clients Are Saying</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
