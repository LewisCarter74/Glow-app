import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Heart, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StylistCard from "@/components/StylistCard";
import { stylists } from "@/lib/placeholder-data";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">My Account</h1>
        <p className="text-lg text-muted-foreground mt-4">Manage your appointments and personal details.</p>
      </div>
      
      <Tabs defaultValue="appointments" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appointments"><Calendar className="w-4 h-4 mr-2" />Appointments</TabsTrigger>
          <TabsTrigger value="favorites"><Heart className="w-4 h-4 mr-2" />Favorites</TabsTrigger>
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>View your upcoming and past appointments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Upcoming</h3>
                <div className="p-4 border rounded-lg bg-secondary/30">
                  <p className="font-bold">Full Balayage with Amina Diallo</p>
                  <p className="text-sm text-muted-foreground">Tuesday, October 26th at 2:00 PM</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="mr-2">Reschedule</Button>
                    <Button variant="destructive" size="sm">Cancel</Button>
                  </div>
                </div>
              </div>
              <Separator />
               <div className="space-y-2">
                <h3 className="font-semibold text-lg">Past</h3>
                <div className="p-4 border rounded-lg">
                  <p>Signature Haircut with Chidi Okoro</p>
                  <p className="text-sm text-muted-foreground">Completed on September 15th</p>
                  <div className="mt-2">
                    <Button variant="secondary" size="sm" className="mr-2">Leave a Review</Button>
                    <Button variant="default" size="sm">Book Again</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>My Favorites</CardTitle>
              <CardDescription>Your favorite stylists for quick re-booking.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <StylistCard stylist={stylists[0]} />
                <StylistCard stylist={stylists[1]} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Aisha Bello" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="aisha.b@example.com" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
