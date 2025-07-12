import { services } from "@/lib/placeholder-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const serviceCategories = ["Hair", "Nails", "Beauty"];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Services</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Discover our curated selection of premium services, designed to make you look and feel your absolute best.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible defaultValue="Hair" className="w-full">
          {serviceCategories.map((category) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-2xl font-headline hover:no-underline text-accent">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  {services
                    .filter((service) => service.category === category)
                    .map((service) => (
                      <div key={service.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-lg bg-card border">
                        <Image
                          src={service.imageUrl}
                          alt={service.name}
                          data-ai-hint="beauty service"
                          width={150}
                          height={100}
                          className="rounded-md object-cover w-full md:w-[150px]"
                        />
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 mb-2">{service.description}</p>
                           <div className="flex items-center gap-4 text-sm font-medium text-primary">
                            <span>${service.price}{service.name.includes("Starting") ? "+" : ""}</span>
                            <span>&bull;</span>
                            <span>{service.duration} min</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 self-center">
                          <Button asChild>
                            <Link href="/book">Book Now</Link>
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
