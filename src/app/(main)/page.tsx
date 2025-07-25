
"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Scissors, Sparkles, ArrowRight, Star } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { getInspiredWork } from "@/lib/api";
import { InspiredWork as InspiredWorkType } from "@/lib/types";

export default function HomePage() {
  const [inspiredWork, setInspiredWork] = useState<InspiredWorkType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspiredWork = async () => {
      try {
        const work = await getInspiredWork();
        setInspiredWork(work);
      } catch (error) {
        console.error("Failed to fetch inspired work:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInspiredWork();
  }, []);


  const heroContentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 12, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Luxurious salon interior"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black bg-opacity-60 z-10" />
          <motion.div
            variants={heroContentVariants}
            initial="hidden"
            animate="visible"
            className="relative z-20 text-center text-white px-4 md:px-6"
          >
            <motion.h1
              variants={heroItemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg leading-tight"
            >
              Experience Beauty, Redefined.
            </motion.h1>
            <motion.p
              variants={heroItemVariants}
              className="max-w-3xl mx-auto mt-6 text-lg md:text-xl lg:text-2xl opacity-90"
            >
              Your exclusive escape for world-class hair, nail, and beauty treatments.
            </motion.p>
            <motion.div
              variants={heroItemVariants}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="font-semibold text-lg py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105">
                <Link href="/booking">
                  Book Your Appointment <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="font-semibold text-lg py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105 bg-white text-primary hover:bg-gray-100 dark:bg-gray-800 dark:text-primary dark:hover:bg-gray-700">
                <Link href="/promotions">
                  Current Promotions <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Meet Our Experts Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold font-headline">Meet Our Experts</h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                Our team of experienced and talented stylists are dedicated to providing you with the highest quality service and personalized care.
              </p>
            </div>
            <div className="flex justify-center">
              <Link href="/stylists">
                <Button size="lg" className="font-semibold text-lg py-3 px-8 rounded-full shadow-md transition-all hover:scale-105">
                  View All Stylists
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Get Inspired Section - Teaser */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold font-headline">Get Inspired</h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                Browse our captivating gallery of beautiful hairstyles and exquisite nail art to discover your next signature look.
              </p>
            </div>
            <Carousel className="w-full max-w-6xl mx-auto">
              <CarouselContent className="-ml-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card className="flex flex-col h-full">
                          <div className="w-full h-64 bg-gray-200 animate-pulse" />
                          <CardContent className="p-6 flex-grow">
                            <div className="h-6 bg-gray-200 rounded animate-pulse" />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  inspiredWork.map((work) => (
                    <CarouselItem key={work.id} className="pl-4 md:basis-1/2 lg:basis-1/3 group">
                      <Card className="overflow-hidden rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] flex flex-col h-full">
                        <Image src={work.imageUrl} alt={work.title} width={400} height={400} className="w-full h-64 object-cover transition-transform group-hover:scale-105" />
                        <CardContent className="p-6 flex-grow flex items-center justify-center">
                          <h3 className="text-xl font-semibold text-center">{work.title}</h3>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))
                )}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 hidden md:flex" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 hidden md:flex" />
            </Carousel>
          </div>
        </section>

        {/* AI Style Finder Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold font-headline">Can't Decide on a Look?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mt-4">
              Let our AI stylist find the perfect new look for you. Get personalized recommendations in seconds.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <Button asChild size="lg" className="font-semibold text-lg py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105">
                <Link href="/ai-styles">Try the AI Style Finder</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
