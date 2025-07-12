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
    .array(z.string())
    .describe('An array of style recommendations for hairstyles or beauty treatments.'),
});

export type StyleRecommendationOutput = z.infer<typeof StyleRecommendationOutputSchema>;

export async function getStyleRecommendation(input: StyleRecommendationInput): Promise<StyleRecommendationOutput> {
  return styleRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleRecommendationPrompt',
  input: {schema: StyleRecommendationInputSchema},
  output: {schema: StyleRecommendationOutputSchema},
  prompt: `You are an expert stylist at GlowApp, an elite salon.

  Based on the user's photo and/or preferences, recommend hairstyles or beauty treatments offered at the salon.

  Consider the user's preferences if provided.

  User Preferences: {{{preferences}}}

  Consider the user's photo if provided.

  User Photo: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}No photo provided.{{/if}}

  Return an array of style recommendations.
  `,
});

const styleRecommendationFlow = ai.defineFlow(
  {
    name: 'styleRecommendationFlow',
    inputSchema: StyleRecommendationInputSchema,
    outputSchema: StyleRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
