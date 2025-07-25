
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import LeaveReviewDialog from '@/components/LeaveReviewDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAppointments, cancelAppointment } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Appointment } from '@/lib/types';

export default function AppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (user) {
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (err) {
        toast({ title: "Error", description: "Could not fetch appointments.", variant: "destructive" });
      }
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleLeaveReviewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsReviewDialogOpen(true);
  };
  
  const handleReviewSubmit = () => {
    // This function will be called on successful submission to refetch appointments
    fetchAppointments();
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await cancelAppointment(selectedAppointment.id);
      setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id));
      toast({
        title: 'Appointment Canceled',
        description: 'Your appointment has been successfully canceled.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelAlertOpen(false);
    }
  }

  const upcomingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'approved');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

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
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(appt => (
                  <div key={appt.id} className="p-4 border rounded-lg bg-secondary/30">
                    <p className="font-bold">{appt.services.map(s => s.name).join(', ')} with {appt.stylist.user.first_name}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(appt.appointment_date), 'EEEE, MMMM do, yyyy')} at {appt.appointment_time}</p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => router.push('/booking')}>
                        Reschedule
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => {
                        setSelectedAppointment(appt);
                        setIsCancelAlertOpen(true);
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">No upcoming appointments.</p>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Past</h3>
              {pastAppointments.length > 0 ? (
                pastAppointments.map(appt => (
                  <div key={appt.id} className="p-4 border rounded-lg">
                    <p>{appt.services.map(s => s.name).join(', ')} with {appt.stylist.user.first_name}</p>
                    <p className="text-sm text-muted-foreground">Completed on {format(new Date(appt.appointment_date), 'MMMM do, yyyy')}</p>
                    <div className="mt-2">
                      {appt.can_review && (
                        <Button variant="secondary" size="sm" className="mr-2" onClick={() => handleLeaveReviewClick(appt)}>
                          Leave a Review
                        </Button>
                      )}
                      <Button variant="default" size="sm" onClick={() => router.push('/booking')}>
                        Book Again
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">No past appointments.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedAppointment && (
        <LeaveReviewDialog
            isOpen={isReviewDialogOpen}
            onClose={() => setIsReviewDialogOpen(false)}
            onSubmit={handleReviewSubmit}
            appointmentId={selectedAppointment.id.toString()}
            serviceName={selectedAppointment.services.map(s => s.name).join(', ')}
            stylistName={`${selectedAppointment.stylist.user.first_name} ${selectedAppointment.stylist.user.last_name}`}
        />
      )}
      
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your appointment
              and you will need to re-book if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAppointment}>Confirm Cancellation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
