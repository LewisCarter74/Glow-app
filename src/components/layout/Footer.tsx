import { Instagram, Phone, Sparkles } from 'lucide-react';
import Link from 'next/link';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);
  
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.04C6.5 2.04 2.04 6.5 2.04 12c0 1.8.48 3.48 1.32 4.92L2 22l5.25-1.38c1.38.78 3 .96 4.75.96h.02c5.5 0 9.96-4.48 9.96-9.98s-4.46-10-9.96-10zm0 18.24c-1.56 0-3.06-.42-4.38-1.2L4.8 20.1l1.02-2.82c-.9-1.38-1.44-3-1.44-4.74 0-4.62 3.75-8.37 8.37-8.37s8.37 3.75 8.37 8.37-3.75 8.37-8.37 8.37zm4.5-6.12c-.24-.12-1.44-.72-1.68-.84-.24-.06-.42-.12-.6.12s-.66.84-.84 1.02c-.12.12-.24.18-.48.06-.24-.06-1.02-.36-1.92-1.2-1.02-.9-1.5-2.04-1.68-2.4-.18-.36-.06-.54.06-.66s.24-.3.36-.42c.12-.12.18-.24.24-.42s.06-.18-.06-.3c-.06-.12-.6-1.44-.84-1.92-.18-.48-.42-.42-.6-.42h-.42c-.24 0-.6.12-.9.6s-1.2 1.14-1.2 2.76c0 1.62 1.2 3.18 1.38 3.42.18.18 2.4 3.66 5.82 5.16.84.36 1.5.6 2.04.72.72.18 1.38.12 1.86-.06.54-.24 1.44-.6 1.62-1.2s.18-.96.12-1.02c-.06-.12-.24-.18-.48-.3z"/>
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
