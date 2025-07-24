
"use client";

import Link from "next/link";
import { Sparkles, User, LogOut, LayoutDashboard, Calendar, LogIn, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/stylists", label: "Stylists" },
  { href: "/services", label: "Services" },
  { href: "/ai-styles", label: "AI Styles" },
  { href: "/promotions", label: "Promotions" },
  { href: "/about", label: "About Us" },
];

const mobileNavLinks = [...navLinks, { href: "/booking", label: "Book Now" }];

export function Header() {
  const { user, logout } = useAuth(); // Changed signOut to logout
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    window.location.href = '/'; // Redirect to homepage and force full reload
  }

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    router.push('/login');
  }

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false); // Close menu on navigation
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">GlowApp</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 ml-auto">
          <Button asChild size="lg" className="hidden sm:flex">
             <Link href="/booking">Book Now</Link>
          </Button>
          
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>Hi, {user.first_name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigation('/account')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> My Account
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleNavigation('/account/appointments')}>
                    <Calendar className="mr-2 h-4 w-4" /> Appointments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation('/account/favourites')}>
                    <Heart className="mr-2 h-4 w-4" /> Favourites
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleLoginClick}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="lg:hidden">
            <MobileNav navLinks={mobileNavLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
