"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { add, format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock, Scissors, User, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createAppointment, fetchServices, fetchStylists } from "@/lib/api";

interface Service {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
    category: string; // Added category field
}

interface Stylist {
    id: string;
    user: {
        first_name: string;
        last_name: string;
    };
    specialties: string[]; // Now expected to hold categories, e.g., ["Hair", "Nails"]
}

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all"); // New state for category filter

  // Fetch services and stylists based on selected category
  useEffect(() => {
    const getServicesAndStylists = async () => {
      try {
        const serviceFilters = selectedCategory !== "all" ? { category: selectedCategory } : {};
        const fetchedServices = await fetchServices(serviceFilters);
        setServices(fetchedServices);
        console.log("Fetched Services:", fetchedServices);

        const stylistCategory = selectedCategory !== "all" ? selectedCategory : undefined;
        const fetchedStylists = await fetchStylists(stylistCategory);
        setStylists(fetchedStylists);
        console.log("Fetched Stylists:", fetchedStylists);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          description: "Failed to load services or stylists."
        });
      }
    };

    getServicesAndStylists();
  }, [selectedCategory, toast]); // Re-fetch when category changes

  useEffect(() => {
    console.log("Selected Services:", selectedServices);
  }, [selectedServices]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    services.forEach(service => categories.add(service.category));
    stylists.forEach(stylist => stylist.specialties.forEach(spec => categories.add(spec)));
    return ["all", ...Array.from(categories).sort()];
  }, [services, stylists]);

  const availableStylists = useMemo(() => {
    console.log("Recalculating available stylists...");
    console.log("Current stylists state:", stylists);
    console.log("Current services state:", services);

    if (selectedServices.length === 0) {
      console.log("No services selected, returning all stylists (or filtered by general category).");
      // If a category is selected, return only stylists in that category
      if (selectedCategory !== "all") {
        return stylists.filter(stylist => 
          stylist.specialties.map(spec => spec.toLowerCase().trim()).includes(selectedCategory.toLowerCase().trim())
        );
      }
      return stylists;
    }

    // Get categories of selected services
    const selectedServiceCategories = new Set(services
      .filter(s => selectedServices.includes(s.id))
      .map(s => s.category.toLowerCase().trim())
    );

    console.log("Selected Service Categories (normalized):", Array.from(selectedServiceCategories));

    // Filter stylists who specialize in ALL categories of the selected services
    const filteredStylists = stylists.filter(stylist => {
      const normalizedStylistSpecialties = stylist.specialties.map(spec => spec.toLowerCase().trim());
      return Array.from(selectedServiceCategories).every(serviceCat => {
        const includesCategory = normalizedStylistSpecialties.includes(serviceCat);
        console.log(`Stylist ${stylist.user.first_name} ${stylist.user.last_name} has category '${serviceCat}': ${includesCategory}`);
        return includesCategory;
      });
    });
    console.log("Filtered Available Stylists:", filteredStylists);
    return filteredStylists;
  }, [selectedServices, stylists, services, selectedCategory]);

  const totalCost = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.price, 0);

  const totalDuration = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.duration_minutes, 0);

  const handleBookingConfirmation = async () => {
    if (!user) {
        router.push('/login');
        return;
    }

    if (!selectedDate || !selectedTime || selectedServices.length === 0 || !selectedStylistId) {
        toast({ variant: "destructive", description: "Please fill out all fields." });
        return;
    }
    
    try {
        await createAppointment({
            service_ids: selectedServices, // Pass the array of selected service IDs
            stylist_id: selectedStylistId,
            appointment_date: format(selectedDate, "yyyy-MM-dd"),
            appointment_time: selectedTime,
        });

        toast({
            title: "Booking Confirmed!",
            description: "Your appointment has been successfully booked.",
        })
        router.push('/account/appointments');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast({
            title: "Booking Failed",
            description: `There was an error booking your appointment: ${errorMessage}`,
            variant: "destructive"
        })
    }
  }

  const nextStep = () => {
    if (step === 1 && selectedServices.length === 0) {
        toast({ variant: "destructive", description: "Please select at least one service."});
        return;
    }
    if (step === 2 && availableStylists.length > 0 && selectedStylistId === 'any') {
      // If there are available stylists, but the user hasn't picked one, prompt them.
      // This is optional, as 'any' is a valid choice.
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
        toast({ variant: "destructive", description: "Please select a date and time."});
        return;
    }
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      handleBookingConfirmation();
    }
  };
  const prevStep = () => setStep((prev) => prev - 1);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServices(prev => 
        prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
    // Reset stylist selection when services change or category changes
    setSelectedStylistId("any");
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-headline">Create Your Appointment</CardTitle>
        <CardDescription className="text-center">
            Step {step} of 4: {
                step === 1 ? "Select Services" : 
                step === 2 ? "Choose a Stylist" :
                step === 3 ? "Pick a Date & Time" : "Confirm Your Booking"
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Scissors/> Select Services</h3>

              {/* Category Filter for Services */}
              <div className="mb-4">
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category:</label>
                <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {services.length > 0 ? (
                services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceChange(service.id)}
                      />
                      <label htmlFor={service.id} className="font-medium leading-none flex-1 cursor-pointer">
                        {service.name} <span className="text-muted-foreground text-xs">({service.category})</span>
                      </label>
                      <div className="text-sm text-muted-foreground">${service.price}</div>
                    </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No services available for this category.</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><User /> Choose a Stylist</h3>
                <Select onValueChange={setSelectedStylistId} defaultValue={selectedStylistId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stylist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Available</SelectItem>
                      {availableStylists.map((stylist) => (
                        <SelectItem key={stylist.id} value={stylist.id}>{stylist.user.first_name} {stylist.user.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableStylists.length === 0 && selectedServices.length > 0 && (
                    <p className="text-sm text-destructive text-center mt-4">No single stylist offers all selected services. Please adjust your selection.</p>
                  )}
                   {availableStylists.length === 0 && selectedServices.length === 0 && selectedCategory !== "all" && (
                    <p className="text-sm text-muted-foreground text-center mt-4">No stylists found for the selected category.</p>
                  )}
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2"><CalendarIcon /> Pick a Date</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date > add(new Date(), {days: 60})}
                      className="rounded-md border"
                    />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Clock /> Pick a Time</h3>
                <div className="grid grid-cols-3 gap-2">
                {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                    <Button key={time} type="button" variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)}>
                    {time}
                    </Button>
                ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Wallet /> Confirmation</h3>
                <Card className="bg-secondary/50">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h4 className="font-semibold">Services</h4>
                            <ul className="list-disc list-inside">
                            {services.filter(s => selectedServices.includes(s.id)).map(s => <li key={s.id}>{s.name} <span className="text-muted-foreground text-xs">({s.category})</span></li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold">Stylist</h4>
                            <p>{stylists.find(s => s.id === selectedStylistId)?.user.first_name || 'Any Available'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Date & Time</h4>
                            <p>{selectedDate && selectedTime ? format(selectedDate, "EEEE, MMMM do, yyyy") + " at " + selectedTime : 'Not selected'}</p>
                        </div>
                        <div className="border-t pt-4 mt-4 text-lg font-bold flex justify-between">
                            <span>Total Cost:</span>
                            <span>${totalCost}</span>
                        </div>
                         <div className="text-sm text-muted-foreground">
                            Estimated duration: {totalDuration} minutes.
                        </div>
                    </CardContent>
                </Card>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            )}
            
            <Button type="button" onClick={nextStep} className="ml-auto" disabled={(step === 1 && selectedServices.length === 0) || (step === 3 && !selectedTime) || (step === 2 && availableStylists.length === 0 && selectedServices.length > 0)}>
              {step < 4 ? 'Next' : user ? 'Confirm Booking' : 'Login to Book'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
