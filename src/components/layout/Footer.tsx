import { Instagram, Phone, Sparkles } from 'lucide-react';
import Link from 'next/link';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);
  
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M20.52,3.48a11.9,11.9,0,0,0-17,17l-1.5,5.5,5.6-1.5A11.9,11.9,0,0,0,12,23.9a11.9,11.9,0,0,0,8.52-20.42ZM12,22.4a10.4,10.4,0,0,1-5.3-1.4l-.4-.2-3.9,1.1,1.1-3.8-.3-.4A10.4,10.4,0,1,1,12,22.4Zm5.4-7.2c-.3-.1-1.6-.8-1.9-.9s-.5-.1-.7.1-.7.9-.8,1.1-.3.2-.6.1-1.2-.4-2.3-1.4-1.7-1.8-1.9-2.1-.1-.3,0-.4,0-.1.2-.4.4-.5.5-.6.1-.2,0-.4-.1-.5-.7-.7-.9-1.3-.7-1.3s.6.6.6.6,1.2.6,1.4.6.3,0,.5-.7.5-1.7.4-1.9c0-.1-.2-.2-.4-.2h-.4s-.4,0-.7.3-1,1-1,2.4,1,2.8,1.1,3,.1.3,1.7,2.6,2.3,3.1,3.2,3.4.6.1,1,.1h.5c.2,0,.7-.1,1-.5s.7-1.1.8-1.4.1-.6,0-.7Z"/>
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
            <a href="tel:0757261329" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
                <Phone className="h-4 w-4" />
                0757261329
            </a>
        </div>
      </div>
    </footer>
  );
}
