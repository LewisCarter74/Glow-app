"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, LogOut, Menu, Sparkles, User, Heart, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";

type MobileNavProps = {
  navLinks: { href: string; label: string }[];
};

export function MobileNav({ navLinks }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
    router.push('/');
  }
  
  const handleNavigation = (path: string) => {
      router.push(path);
      setIsOpen(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold">GlowApp</span>
          </Link>
          <nav className="grid gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Separator />
          
           <div className="grid gap-4">
            {user ? (
              <>
                <button onClick={() => handleNavigation('/account/profile')} className="flex items-center text-lg font-medium transition-colors hover:text-primary">
                  <User className="mr-2 h-5 w-5" /> Profile
                </button>
                 <button onClick={() => handleNavigation('/account/appointments')} className="flex items-center text-lg font-medium transition-colors hover:text-primary">
                  <Calendar className="mr-2 h-5 w-5" /> Appointments
                </button>
                <button onClick={() => handleNavigation('/account/favourites')} className="flex items-center text-lg font-medium transition-colors hover:text-primary">
                  <Heart className="mr-2 h-5 w-5" /> Favourites
                </button>
                <button onClick={handleSignOut} className="flex items-center text-lg font-medium transition-colors hover:text-primary">
                    <LogOut className="mr-2 h-5 w-5" />
                    <span>Log out</span>
                </button>
              </>
            ) : (
                <button onClick={() => handleNavigation('/login')} className="flex items-center text-lg font-medium transition-colors hover:text-primary">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                </button>
            )}
           </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
