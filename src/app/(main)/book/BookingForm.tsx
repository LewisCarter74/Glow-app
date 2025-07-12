"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { services, stylists } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { add, format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock, Scissors, User, Wallet } from "lucide-react";

type BookingFormValues = {
  services: string[];
  stylistId: string;
  date: Date;
  time: string;
};

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<BookingFormValues>({
    defaultValues: {
      services: [],
      stylistId: "any",
      date: new Date(),
      time: "",
    },
  });

  const selectedServices = watch("services");
  const selectedStylistId = watch("stylistId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");

  const totalCost = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.price, 0);

  const totalDuration = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.duration, 0);

  const onSubmit = (data: BookingFormValues) => {
    console.log(data);
    setStep(4);
  };
  
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-headline">Create Your Appointment</CardTitle>
        <CardDescription className="text-center">
            Step {step} of 4: {
                step === 1 ? "Select Services" : 
                step === 2 ? "Choose a Stylist" :
                step === 3 ? "Pick a Date & Time" : "Confirm & Pay"
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Scissors/> Select Services</h3>
              {services.map((service) => (
                <Controller
                  key={service.id}
                  name="services"
                  control={control}
                  rules={{ required: "Please select at least one service" }}
                  render={({ field }) => (
                    <div className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={service.id}
                        checked={field.value?.includes(service.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), service.id])
                            : field.onChange(
                                field.value?.filter((value) => value !== service.id)
                              );
                        }}
                      />
                      <label htmlFor={service.id} className="font-medium leading-none flex-1 cursor-pointer">
                        {service.name}
                      </label>
                      <div className="text-sm text-muted-foreground">${service.price}</div>
                    </div>
                  )}
                />
              ))}
              {errors.services && <p className="text-sm font-medium text-destructive">{errors.services.message}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><User /> Choose a Stylist</h3>
              <Controller
                name="stylistId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                )}
              />
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2"><CalendarIcon /> Pick a Date</h3>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date() || date > add(new Date(), {days: 60})}
                      className="rounded-md border"
                    />
                  )}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Clock /> Pick a Time</h3>
                 <Controller
                    name="time"
                    control={control}
                    rules={{ required: "Please select a time" }}
                    render={({ field }) => (
                        <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(time => (
                            <Button key={time} variant={field.value === time ? "default" : "outline"} onClick={() => field.onChange(time)}>
                            {time}
                            </Button>
                        ))}
                        </div>
                    )}
                 />
                 {errors.time && <p className="text-sm font-medium text-destructive">{errors.time.message}</p>}
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
                            <p>{format(selectedDate, "EEEE, MMMM do, yyyy")} at {selectedTime}</p>
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
                <Button type="submit" size="lg" className="w-full">Confirm & Proceed to Payment</Button>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            )}
            {step < 4 && (
              <Button type="button" onClick={nextStep} className="ml-auto" disabled={step === 1 && selectedServices.length === 0}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
