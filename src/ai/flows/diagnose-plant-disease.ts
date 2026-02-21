
// diagnose-plant-disease.ts
'use server';

/**
 * @fileOverview A plant disease diagnosis AI agent.
 *
 * - diagnosePlantDisease - A function that handles the plant disease diagnosis process.
 * - DiagnosePlantDiseaseInput - The input type for the diagnosePlantDisease function.
 * - DiagnosePlantDiseaseOutput - The return type for the diagnosePlantDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnosePlantDiseaseInput = z.infer<typeof DiagnosePlantDiseaseInputSchema>;

const DiagnosePlantDiseaseOutputSchema = z.object({
  plantName: z.string().describe('The common name of the identified plant.'),
  disease: z.string().describe('The diagnosis of the plant disease, if any.'),
  infectionLevel: z.number().describe('The percentage of infection level (0-100).'),
});
export type DiagnosePlantDiseaseOutput = z.infer<typeof DiagnosePlantDiseaseOutputSchema>;

export async function diagnosePlantDisease(input: DiagnosePlantDiseaseInput): Promise<DiagnosePlantDiseaseOutput> {
  return diagnosePlantDiseaseFlow(input);
}

const diagnosePlantDiseasePrompt = ai.definePrompt({
  name: 'diagnosePlantDiseasePrompt',
  input: {schema: DiagnosePlantDiseaseInputSchema},
  output: {schema: DiagnosePlantDiseaseOutputSchema},
  prompt: `You are an expert in plant pathology. Your task is to analyze the provided image of a plant.

First, identify the plant in the image.

Then, diagnose any potential diseases. To ensure high accuracy, you must cross-reference the visual information from the image with your extensive knowledge base, which includes data from the internet and agricultural websites. Consider symptoms, patterns, and common diseases for the type of plant you identified.

Based on your comprehensive analysis, provide the following:
1.  **Plant Name**: The common name of the plant identified from the image.
2.  **Disease Diagnosis**: Identify the specific disease. If no disease is detected, state that clearly.
3.  **Infection Level**: Estimate the infection level as a percentage from 0 to 100.

Plant Image: {{media url=photoDataUri}}

Provide the plantName, disease, and infectionLevel in the output. Return 0 for infectionLevel if no disease is detected.`,
});

const diagnosePlantDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnosePlantDiseaseFlow',
    inputSchema: DiagnosePlantDiseaseInputSchema,
    outputSchema: DiagnosePlantDiseaseOutputSchema,
  },
  async input => {
    const {output} = await diagnosePlantDiseasePrompt(input);
    return output!;
  }
);
