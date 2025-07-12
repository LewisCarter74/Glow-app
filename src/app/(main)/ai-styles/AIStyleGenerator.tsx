
"use client";

import { useState } from "react";
import { Sparkles, Upload, Wand2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getStyleRecommendation,
  StyleRecommendationOutput,
} from "@/ai/flows/style-recommendation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function AIStyleGenerator() {
  const [preferences, setPreferences] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [recommendations, setRecommendations] =
    useState<StyleRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences && !photo) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please describe your preferences or upload a photo.",
      });
      return;
    }
    setIsLoading(true);
    setRecommendations(null);

    let photoDataUri: string | undefined;
    if (photo) {
      const reader = new FileReader();
      photoDataUri = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(photo);
      });
    }

    try {
      const result = await getStyleRecommendation({
        preferences,
        photoDataUri,
      });
      setRecommendations(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get style recommendations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wand2 className="text-primary" />
              Describe Your Perfect Look
            </CardTitle>
            <CardDescription>
              Tell us what you're looking for or upload a photo to get
              AI-powered style recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="preferences">Your Preferences</Label>
              <Textarea
                id="preferences"
                placeholder="e.g., 'I want a short, low-maintenance haircut', 'looking for a bold new hair color like electric blue', 'something elegant for a wedding'"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Upload a Photo (optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button asChild variant="outline">
                  <Label htmlFor="photo" className="cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Choose File
                  </Label>
                </Button>
                {photoPreview && (
                  <Image
                    src={photoPreview}
                    alt="Photo preview"
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                "Generating..."
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Get Recommendations
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="max-w-7xl mx-auto">
        {isLoading && (
          <div className="text-center p-8">
            <Sparkles className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">
              Our AI is crafting your new look...
            </p>
          </div>
        )}
        {!isLoading && recommendations && (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-center">Your Style Recommendations</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.recommendations.map((rec, index) => (
                  <Card key={index} className="flex flex-col overflow-hidden">
                    <div className="aspect-[4/3] relative">
                        <Image
                            src={rec.imageUrl}
                            alt={rec.description}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                    <CardContent className="p-4 flex-grow">
                      <p className="text-sm text-foreground/90">
                        {rec.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
          </div>
        )}
         {!isLoading && !recommendations && (
           <div className="text-center p-8 border-2 border-dashed rounded-lg max-w-2xl mx-auto">
            <Wand2 className="w-12 h-12 mx-auto text-muted-foreground/50"/>
             <p className="mt-4 text-muted-foreground">Your recommendations will appear here.</p>
           </div>
         )}
      </div>
    </div>
  );
}
