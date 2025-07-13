
import { Instagram, Phone, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);
  
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor" {...props}>
        <path fill="#fff" d="M34.6,12.4c-2.8-2.8-6.5-4.3-10.6-4.3C16.1,8.1,8.3,15.9,8.3,23.9c0,2.8,0.8,5.5,2.3,7.8 l-2.5,9.2l9.4-2.5c2.2,1.3,4.8,2,7.4,2h0c8,0,15.8-7.8,15.8-15.8C40.7,18.9,37.4,15.2,34.6,12.4z"></path><path fill="#4CAF50" d="M24,4_a_20,20_0_1,0_20,20A20,20_0_0,0_24,4Z"></path><path fill="#FFF" d="M35.2,30.3c-0.3-0.5-1-0.9-2.1-1.5c-1-0.5-2.2-1-2.3-1.1c-0.2-0.1-0.3-0.1-0.5,0.1 c-0.2,0.2-0.8,1-1,1.2c-0.2,0.2-0.3,0.2-0.6,0.1c-0.3-0.1-1.2-0.4-2.3-1.4c-0.9-0.8-1.5-1.8-1.7-2.1c-0.2-0.3,0-0.5,0.1-0.6 c0.1-0.1,0.2-0.2,0.4-0.4c0.1-0.1,0.2-0.2,0.2-0.4c0.1-0.1,0-0.3,0-0.4c-0.1-0.1-1-2.3-1.3-3.2c-0.4-0.9-0.8-0.8-1-0.8 c-0.2,0-0.5,0-0.7,0c-0.2,0-0.6,0.1-0.9,0.4c-0.3,0.3-1.2,1.2-1.2,2.9c0,1.7,1.2,3.4,1.4,3.6c0.2,0.2,2.4,3.8,5.9,5.2 c0.8,0.3,1.5,0.5,2,0.7c0.8,0.2,1.5,0.2,2.1,0.1c0.6-0.1,2-0.8,2.3-1.6C35.5,31.1,35.4,30.8,35.2,30.3z"></path>
    </svg>
);

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 py-6 text-sm">
        <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <p className="font-bold leading-loose">
                GlowApp
                </p>
            </Link>
            <p className="text-muted-foreground">
            © {new Date().getFullYear()} GlowApp. All rights reserved.
            </p>
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
    </footer>
  );
}

    