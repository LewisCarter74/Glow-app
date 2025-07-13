
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import LeaveReviewDialog from '@/components/LeaveReviewDialog';

// Mock appointment type
type Appointment = {
  id: string;
  service: string;
  stylist: string;
  date: string;
};

const pastAppointment: Appointment = {
  id: 'appt1',
  service: 'Signature Haircut',
  stylist: 'Chidi Okoro',
  date: 'September 15th',
};


export default function AppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleLeaveReviewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsReviewDialogOpen(true);
  };
  
  const handleReviewSubmit = ({ rating, comment }: { rating: number; comment: string }) => {
    console.log('Review Submitted:', { appointmentId: selectedAppointment?.id, rating, comment });
    toast({
      title: 'Thank you for your feedback!',
      description: 'Your review has been submitted.',
    });
    setIsReviewDialogOpen(false);
  }

  return (
    <>
      <div className="container mx-auto px-4 py-16">
         <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">My Appointments</h1>
          <p className="text-lg text-muted-foreground mt-4">View your upcoming and past appointments.</p>
        </div>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Appointment History</CardTitle>
            <CardDescription>A record of your scheduled services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Upcoming</h3>
              <div className="p-4 border rounded-lg bg-secondary/30">
                <p className="font-bold">Full Balayage with Amina Diallo</p>
                <p className="text-sm text-muted-foreground">Tuesday, October 26th at 2:00 PM</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => router.push('/book')}>
                    Reschedule
                  </Button>
                  <Button variant="destructive" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Past</h3>
              <div className="p-4 border rounded-lg">
                <p>{pastAppointment.service} with {pastAppointment.stylist}</p>
                <p className="text-sm text-muted-foreground">Completed on {pastAppointment.date}</p>
                <div className="mt-2">
                  <Button variant="secondary" size="sm" className="mr-2" onClick={() => handleLeaveReviewClick(pastAppointment)}>
                    Leave a Review
                  </Button>
                  <Button variant="default" size="sm" onClick={() => router.push('/book')}>
                    Book Again
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedAppointment && (
        <LeaveReviewDialog
            isOpen={isReviewDialogOpen}
            onClose={() => setIsReviewDialogOpen(false)}
            onSubmit={handleReviewSubmit}
            appointment={selectedAppointment}
        />
      )}
    </>
  );
}
