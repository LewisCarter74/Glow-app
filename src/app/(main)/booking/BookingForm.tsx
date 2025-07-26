"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { add, format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock, Scissors, User, Wallet, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createAppointment, getServices, getStylists, getCategories, getAvailability } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Service, Stylist, Category } from "@/lib/types";

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          variant: "destructive",
          description: "Failed to load categories."
        });
      }
    };
    fetchCategories();
  }, [toast]);

  useEffect(() => {
    const fetchServicesAndStylists = async () => {
      if (!selectedCategory) {
          setServices([]);
          setStylists([]);
          return;
      };
      try {
        const fetchedServices = await getServices();
        setServices(fetchedServices.filter((s: Service) => s.category_name === selectedCategory && s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())));

        if (debouncedSearchTerm.length === 0) {
            const fetchedStylists = await getStylists();
            setStylists(fetchedStylists);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          description: "Failed to load services or stylists."
        });
      }
    };

    fetchServicesAndStylists();
  }, [selectedCategory, debouncedSearchTerm, toast]);

  useEffect(() => {
      const fetchAvailableTimes = async () => {
          if (selectedDate && selectedServices.length > 0) {
              setIsLoadingTimes(true);
              setAvailableTimes([]); // Clear previous times
              try {
                  const params = {
                    date: format(selectedDate, "yyyy-MM-dd"),
                    service_ids: selectedServices.join(','),
                    stylist_id: selectedStylistId !== 'any' ? selectedStylistId : undefined
                  };
                  const times = await getAvailability(params);
                  setAvailableTimes(Object.values(times).flatMap((stylist: any) => stylist.slots));
              } catch (error) {
                  console.error("Error fetching available times:", error);
                  toast({
                      variant: "destructive",
                      description: "Could not load available times. Please try again."
                  });
              } finally {
                  setIsLoadingTimes(false);
              }
          } else {
              setAvailableTimes([]);
          }
      };

      fetchAvailableTimes();
  }, [selectedDate, selectedServices, toast, selectedStylistId]);


  const availableStylists = useMemo(() => {
    return stylists;
  }, [stylists]);

  const totalCost = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + Number(s.price), 0);

  const totalDuration = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.duration_minutes, 0);

  const handleBookingConfirmation = async () => {
    if (!user) {
        router.push('/login');
        return;
    }
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
        toast({ variant: "destructive", description: "Please fill out all fields." });
        return;
    }
    try {
        await createAppointment({
            service_ids: selectedServices,
            stylist_id: selectedStylistId === 'any' ? null : Number(selectedStylistId),
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
    if (step === 1 && !selectedCategory) {
        toast({ variant: "destructive", description: "Please select a category."});
        return;
    }
    if (step === 2 && selectedServices.length === 0) {
        toast({ variant: "destructive", description: "Please select at least one service."});
        return;
    }
    if (step === 4 && (!selectedDate || !selectedTime)) {
        toast({ variant: "destructive", description: "Please select a date and time."});
        return;
    }
    if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      handleBookingConfirmation();
    }
  };
  const prevStep = () => setStep((prev) => prev - 1);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedServices([]);
    setSelectedStylistId("any");
    setSelectedTime("");
  };

  const handleServiceChange = (serviceId: number) => {
    setSelectedServices(prev => 
        prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
    setSelectedTime(""); // Reset time when services change
  }
  
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-headline">Create Your Appointment</CardTitle>
        <CardDescription className="text-center">
            Step {step} of 5: {
                step === 1 ? "Select a Category" :
                step === 2 ? "Select Services" : 
                step === 3 ? "Choose a Stylist" :
                step === 4 ? "Pick a Date & Time" : "Confirm Your Booking"
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Sparkles/> Select a Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <Button key={category.id} variant={selectedCategory === category.name ? "default" : "outline"} onClick={() => handleCategoryChange(category.name)} className="p-8 text-lg">
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Scissors/> Select Services</h3>
                <Input 
                    placeholder="Search for a service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
              </div>
              {services.length > 0 ? (
                services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={String(service.id)}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceChange(service.id)}
                      />
                      <label htmlFor={String(service.id)} className="font-medium leading-none flex-1 cursor-pointer">
                        {service.name}
                      </label>
                      <div className="text-sm text-muted-foreground">${service.price}</div>
                    </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground pt-4">No services found. Try a different search or category.</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><User /> Choose a Stylist</h3>
                <Select onValueChange={setSelectedStylistId} defaultValue={selectedStylistId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stylist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Available</SelectItem>
                      {availableStylists.map((stylist) => (
                        <SelectItem key={stylist.id} value={String(stylist.id)}>{stylist.user.first_name} {stylist.user.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableStylists.length === 0 && selectedServices.length > 0 && (
                    <p className="text-sm text-destructive text-center mt-4">No available stylists for this category. Please try another category.</p>
                  )}
            </div>
          )}

          {step === 4 && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2"><CalendarIcon /> Pick a Date</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || date > add(new Date(), {days: 60})}
                      className="rounded-md border"
                    />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Clock /> Pick a Time</h3>
                {selectedServices.length === 0 ? (
                    <p className="text-muted-foreground">Please select a service first.</p>
                ) : isLoadingTimes ? (
                  <p className="text-muted-foreground">Loading available times...</p>
                ) : availableTimes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map(time => (
                        <Button key={time} type="button" variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)}>
                        {time}
                        </Button>
                    ))}
                    </div>
                ): (
                    <p className="text-muted-foreground">No available times for the selected date. Please try another day.</p>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Wallet /> Confirmation</h3>
                <Card className="bg-secondary/50">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h4 className="font-semibold">Services</h4>
                            <ul className="list-disc list-inside">
                            {services.filter(s => selectedServices.includes(s.id)).map(s => <li key={s.id}>{s.name}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold">Stylist</h4>
                            <p>{stylists.find(s => s.id === Number(selectedStylistId))?.user.first_name || 'Any Available'}</p>
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
            
            <Button 
                type="button" 
                onClick={nextStep} 
                className="ml-auto" 
                disabled={
                    (step === 2 && selectedServices.length === 0) || 
                    (step === 4 && !selectedTime) || 
                    (isLoadingTimes)
                }
            >
              {step < 5 ? 'Next' : user ? 'Confirm Booking' : 'Login to Book'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
