
"use client";

import { useState } from "react";
import { services, stylists } from "@/lib/placeholder-data";
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

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const totalCost = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.price, 0);

  const totalDuration = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.duration, 0);

  const handleBookingConfirmation = () => {
    if (!user) {
        router.push('/login');
        return;
    }
    
    console.log({
        services: selectedServices,
        stylist: selectedStylistId,
        date: selectedDate,
        time: selectedTime,
    });
    toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully booked.",
    })
    router.push('/account/appointments');
  }

  const nextStep = () => {
    if (step === 1 && selectedServices.length === 0) {
        toast({ variant: "destructive", description: "Please select at least one service."});
        return;
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
              {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceChange(service.id)}
                      />
                      <label htmlFor={service.id} className="font-medium leading-none flex-1 cursor-pointer">
                        {service.name}
                      </label>
                      <div className="text-sm text-muted-foreground">${service.price}</div>
                    </div>
              ))}
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
                      {stylists.map((stylist) => (
                        <SelectItem key={stylist.id} value={stylist.id}>{stylist.name} - {stylist.specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                            {services.filter(s => selectedServices.includes(s.id)).map(s => <li key={s.id}>{s.name}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold">Stylist</h4>
                            <p>{stylists.find(s => s.id === selectedStylistId)?.name || 'Any Available'}</p>
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
            
            <Button type="button" onClick={nextStep} className="ml-auto" disabled={(step === 1 && selectedServices.length === 0) || (step === 3 && !selectedTime)}>
              {step < 4 ? 'Next' : user ? 'Confirm Booking' : 'Login to Book'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
