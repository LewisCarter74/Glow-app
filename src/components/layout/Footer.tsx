import { Instagram, Phone, Sparkles } from 'lucide-react';
import Link from 'next/link';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);
  
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16.75 13.96c.25.13.41.2.46.3.05.1.04.62-.12 1.28-.13.55-.77 1.12-1.32 1.35-.41.17-1.08.2-3.23-.55-2.93-.98-5.2-2.32-6.49-4.88-.5-1-1.01-2.12-.87-3.12.12-.81.67-1.43 1.25-1.85.34-.25.71-.35 1.01-.35.29 0 .58.07.82.38.2.25.64 1.52.69 1.63.05.11.1.24.01.38-.09.13-.23.23-..35.35-.12.11-.25.25-.37.36-.12.13-.24.27-.12.51.12.24.63 1.1 1.29 1.75.92.91 1.75 1.26 2.06 1.41.31.15.49.12.68-.07.2-.19 1.03-1.2 1.29-1.62.26-.42.51-.35.82-.23.31.12 1.95.93 2.22 1.08.28.15.47.23.54.36zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z" />
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
