
// 'use server';
/**
 * @fileOverview AI-powered style recommendations for hairstyles or beauty treatments.
 *
 * - getStyleRecommendation - A function that handles the style recommendation process.
 * - StyleRecommendationInput - The input type for the getStyleRecommendation function.
 * - StyleRecommendationOutput - The return type for the getStyleRecommendation function.
 */

'use server';

import {ai} from '@/ai/genkit';
import { stylists } from '@/lib/placeholder-data';
import {z} from 'genkit';

const StyleRecommendationInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  preferences: z
    .string()
    .optional()
    .describe('The user preferences for hair length, color, style, etc.'),
});

export type StyleRecommendationInput = z.infer<typeof StyleRecommendationInputSchema>;

const StyleRecommendationOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        description: z.string().describe('The detailed description of the recommended hairstyle or beauty treatment.'),
        imageUrl: z
          .string()
          .describe('The data URI of the image generated for this recommendation.'),
        specialistId: z.string().describe('The ID of the specialist recommended for this style.'),
      })
    )
    .length(3)
    .describe('An array of exactly 3 style recommendations, each with a description, a generated image, and a recommended specialist.'),
});

export type StyleRecommendationOutput = z.infer<typeof StyleRecommendationOutputSchema>;

export async function getStyleRecommendation(input: StyleRecommendationInput): Promise<StyleRecommendationOutput> {
  return styleRecommendationFlow(input);
}

const recommendationsPrompt = ai.definePrompt({
    name: 'styleRecommendationsPrompt',
    input: {schema: StyleRecommendationInputSchema},
    output: {schema: z.object({
        recommendations: z.array(z.string()).length(3).describe('An array of 3 style recommendations for hairstyles or beauty treatments.'),
    })},
    prompt: `You are an expert stylist at GlowApp, an elite salon.

  Based on the user's photo and/or preferences, recommend 3 distinct hairstyles or beauty treatments offered at the salon.

  Consider the user's preferences if provided.

  User Preferences: {{{preferences}}}

  Consider the user's photo if provided.

  User Photo: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}No photo provided.{{/if}}

  Return an array of 3 style recommendations.
  `,
});


const styleRecommendationFlow = ai.defineFlow(
  {
    name: 'styleRecommendationFlow',
    inputSchema: StyleRecommendationInputSchema,
    outputSchema: StyleRecommendationOutputSchema,
  },
  async input => {
    const { output } = await recommendationsPrompt(input);
    if (!output?.recommendations) {
        throw new Error("Could not generate style recommendations");
    }

    const imageGenerationPromises = output.recommendations.map(async (rec, index) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `A high-fashion, photorealistic image of the following hairstyle or beauty treatment: ${rec}`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        
        // Assign a stylist to each recommendation in a round-robin fashion
        const specialist = stylists[index % stylists.length];

        return {
            description: rec,
            imageUrl: media!.url,
            specialistId: specialist.id,
        };
    });
    
    const recommendationsWithImages = await Promise.all(imageGenerationPromises);

    return { recommendations: recommendationsWithImages };
  }
);
