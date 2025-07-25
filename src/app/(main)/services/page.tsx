'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getServices } from '@/lib/api';
import { Service } from '@/lib/types';

const serviceCategories = ['Hair', 'Nails', 'Beauty'];
const FALLBACK_IMAGE_URL = 'https://placehold.co/150x100';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Fetch all services
    getServices()
      .then((data: Service[]) => {
        setServices(data);
      })
      .catch((error) => {
        console.error('Failed to fetch services:', error);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">
          Our Services
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Discover our curated selection of premium services, designed to make
          you look and feel your absolute best.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Accordion
          type="single"
          collapsible
          defaultValue="Hair"
          className="w-full"
        >
          {serviceCategories.map((category) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-2xl font-headline hover:no-underline text-accent">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  {services
                    .filter((service) => service.category_name === category) // Filter by category_name
                    .map((service) => (
                      <div
                        key={service.id}
                        className="flex flex-col md:flex-row gap-6 p-4 rounded-lg bg-card border"
                      >
                        <Image
                          src={service.imageUrl || FALLBACK_IMAGE_URL}
                          alt={service.name}
                          data-ai-hint="beauty service"
                          width={150}
                          height={100}
                          className="rounded-md object-cover w-full md:w-[150px]"
                        />
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm font-medium text-primary">
                            <span>
                              ${service.price}
                              {service.name.includes('Starting') ? '+' : ''}
                            </span>
                            <span>&bull;</span>
                            <span>{service.duration_minutes} min</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 self-center">
                          <Button asChild>
                            <Link href="/booking">Book Now</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
