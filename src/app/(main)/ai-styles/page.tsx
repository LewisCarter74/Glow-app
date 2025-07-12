import AIStyleGenerator from "./AIStyleGenerator";

export default function AiStylesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">AI-Powered Style Finder</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Not sure what you want? Let our AI stylist help you discover the perfect new look based on your preferences or photo.
        </p>
      </div>
      <AIStyleGenerator />
    </div>
  );
}
