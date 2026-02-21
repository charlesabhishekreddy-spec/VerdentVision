'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a crop growth timeline.
 *
 * - generateCropTimeline - A function that takes a crop name and returns a structured timeline.
 * - GenerateCropTimelineInput - The input type for the generateCropTimeline function.
 * - GenerateCropTimelineOutput - The return type for the generateCropTimeline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCropTimelineInputSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
});
export type GenerateCropTimelineInput = z.infer<typeof GenerateCropTimelineInputSchema>;

const TimelineStageSchema = z.object({
  stage: z.string().describe('The time frame for this stage (e.g., "Week 1-2").'),
  title: z.string().describe('The title of this stage (e.g., "Sowing & Germination").'),
  description: z.string().describe('A detailed description of the tasks and expectations for this stage.'),
});

const GenerateCropTimelineOutputSchema = z.object({
  cropName: z.string().describe('The name of the crop the timeline is for.'),
  timeline: z.array(TimelineStageSchema).describe('An array of timeline stages.'),
});
export type GenerateCropTimelineOutput = z.infer<typeof GenerateCropTimelineOutputSchema>;

export async function generateCropTimeline(input: GenerateCropTimelineInput): Promise<GenerateCropTimelineOutput> {
  return generateCropTimelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCropTimelinePrompt',
  input: {schema: GenerateCropTimelineInputSchema},
  output: {schema: GenerateCropTimelineOutputSchema},
  prompt: `You are an agricultural expert. Generate a detailed week-by-week growth timeline for the specified crop.

The timeline should cover all major stages from seed to harvest, including but not limited to:
- Sowing/Planting
- Germination
- Seedling care
- Transplanting
- Growth and maintenance (watering, fertilizing, staking/support)
- Flowering and pollination
- Fruiting/Development
- Harvesting
- Pest and disease management tips relevant to the stages.

For each stage, provide a "stage" (e.g., "Week 1-2"), a "title", and a "description".

Crop Name: {{{cropName}}}
`,
});

const generateCropTimelineFlow = ai.defineFlow(
  {
    name: 'generateCropTimelineFlow',
    inputSchema: GenerateCropTimelineInputSchema,
    outputSchema: GenerateCropTimelineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
