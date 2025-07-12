"use client";

import Link from "next/link";
import { Sparkles, User, LogOut, LayoutDashboard, Calendar } from "lucide-react";
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
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/stylists", label: "Stylists" },
  { href: "/services", label: "Services" },
  { href: "/ai-styles", label: "AI Styles" },
  { href: "/promotions", label: "Promotions" },
];

const mobileNavLinks = [...navLinks, { href: "/book", label: "Book Now" }];

// Mock auth hook
const useMockAuth = () => {
    const [user, setUser] = useState<{displayName: string} | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        // Simulate checking for a user session
        const noAuthRoutes = ['/login', '/signup', '/password-reset'];
        if (noAuthRoutes.includes(pathname)) {
            setUser(null);
        } else {
            // In all other cases, assume user is logged in for UI demonstration
            setUser({ displayName: 'Ada Lovelace' });
        }
        setLoading(false);
    }, [pathname]);

    const signOut = () => {
        // This would typically handle sign-out logic
        window.location.href = '/login';
    };

    return { user, loading, signOut };
};


export function Header() {
  const { user, loading, signOut } = useMockAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">GlowApp</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
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
             <Link href="/book">Book Now</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {loading ? (
                 <DropdownMenuLabel>Loading...</DropdownMenuLabel>
              ) : user ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account"><LayoutDashboard className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/account"><Calendar className="mr-2 h-4 w-4" /> Appointments</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/signup">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="md:hidden">
            <MobileNav navLinks={mobileNavLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
