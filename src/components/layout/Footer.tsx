
import { Instagram, Phone, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);
  
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16.6 14.2c-.2-.1-1.5-0.7-1.7-0.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.5-1.8-.2-.3-.1-.5 0-.6s.2-.2.4-.4c.1-.1.2-.2.3-.3.1-.1.2-.2.1-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.3c.1.1 1.5.7 3.5 2.6 2 1.9 2 1.3 2.4 1.2.4-.1 1.2-.5 1.4-1 .2-.5.2-1 .1-1s-.2-.2-.4-.3zM12.1 2.1c-5.5 0-9.9 4.4-9.9 9.9 0 1.8.5 3.5 1.4 5l-1.5 5.5 5.6-1.5c1.4.8 3.1 1.3 4.8 1.3h.1c5.5 0 9.9-4.4 9.9-9.9s-4.4-9.9-9.9-9.9zm0 18.2c-1.7 0-3.4-.4-4.9-1.3l-.4-.2-3.6.9.9-3.5-.2-.4c-.9-1.5-1.4-3.2-1.4-5.1 0-4.6 3.7-8.3 8.3-8.3 4.6 0 8.3 3.7 8.3 8.3s-3.7 8.3-8.3 8.3z"></path>
    </svg>
);

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto flex flex-col items-center gap-6 py-6 text-sm">
        <div className="w-full flex flex-col md:flex-row items-center md:justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <p className="font-bold leading-loose">
                    GlowApp
                    </p>
                </Link>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
                <div className="flex items-center gap-4">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <Instagram className="h-6 w-6" />
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <TikTokIcon className="h-6 w-6" />
                    </a>
                    <a href="https://wa.me/254757261329" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <WhatsAppIcon className="h-6 w-6" />
                    </a>
                </div>
                <Button asChild variant="outline">
                  <a href="tel:0757261329" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call Us
                  </a>
                </Button>
            </div>
        </div>
        <div className="w-full pt-6 border-t md:border-t-0 text-center">
            <p className="text-muted-foreground">
                © {new Date().getFullYear()} GlowApp. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
