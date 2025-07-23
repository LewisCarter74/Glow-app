
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
          Welcome to GlowApp
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Your one-stop solution for booking salon appointments.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/booking">
            <Button>Book an Appointment</Button>
          </Link>
          <Link href="/services">
            <Button variant="outline">View Services</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
