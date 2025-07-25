import StylistCard from "@/components/StylistCard";
import { getStylists } from "@/lib/api";

export default async function StylistsPage() {
  const stylists = await getStylists();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Talented Team</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Meet the artists who will bring your vision to life. Each of our stylists is a master of their craft, dedicated to creating a look you'll love.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stylists.map((stylist: any) => (
          <StylistCard key={stylist.id} stylist={stylist} />
        ))}
      </div>
    </div>
  );
}
