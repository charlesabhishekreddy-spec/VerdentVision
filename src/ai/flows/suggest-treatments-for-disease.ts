'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting treatments for plant diseases.
 *
 * The flow takes a disease diagnosis as input and returns a list of suggested treatments,
 * including both organic and chemical solutions, along with precise proportions.
 *
 * @exports {
 *   suggestTreatmentsForDisease: (input: SuggestTreatmentsForDiseaseInput) => Promise<SuggestTreatmentsForDiseaseOutput>;
 *   SuggestTreatmentsForDiseaseInput: z.infer<typeof SuggestTreatmentsForDiseaseInputSchema>;
 *   SuggestTreatmentsForDiseaseOutput: z.infer<typeof SuggestTreatmentsForDiseaseOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTreatmentsForDiseaseInputSchema = z.object({
  diseaseName: z.string().describe('The name of the plant disease.'),
  plantName: z.string().describe('The common name of the plant.'),
  infectionLevelPercentage: z
    .number()
    .describe('The estimated percentage of the plant that is infected.'),
});
export type SuggestTreatmentsForDiseaseInput = z.infer<typeof SuggestTreatmentsForDiseaseInputSchema>;

const TreatmentSchema = z.object({
  treatmentType: z.enum(['organic', 'chemical']).describe('The type of treatment.'),
  treatmentName: z.string().describe('The name of the treatment.'),
  proportions: z.string().describe('Precise proportions for the treatment.'),
  description: z.string().describe('A description of the treatment and its effects.'),
});

const SuggestTreatmentsForDiseaseOutputSchema = z.object({
  treatments: z.array(TreatmentSchema).describe('A list of suggested treatments.'),
});
export type SuggestTreatmentsForDiseaseOutput = z.infer<typeof SuggestTreatmentsForDiseaseOutputSchema>;

export async function suggestTreatmentsForDisease(input: SuggestTreatmentsForDiseaseInput): Promise<SuggestTreatmentsForDiseaseOutput> {
  return suggestTreatmentsForDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTreatmentsForDiseasePrompt',
  input: {schema: SuggestTreatmentsForDiseaseInputSchema},
  output: {schema: SuggestTreatmentsForDiseaseOutputSchema},
  prompt: `You are an expert in plant pathology and treatment.

  Based on the identified disease, suggest relevant treatments, including both organic and chemical solutions. Provide precise chemical proportions for each treatment. Consider the infection level percentage when suggesting treatments; prioritize treatments that are most effective for the given level of infection. Give a description of the treatments, including their effects and how to apply them.

  Disease Name: {{{diseaseName}}}
  Plant Name: {{{plantName}}}
  Infection Level Percentage: {{{infectionLevelPercentage}}}%

  Format your response as a JSON object with a "treatments" array. Each treatment object should have the following fields:
  - treatmentType (string, either "organic" or "chemical")
  - treatmentName (string)
  - proportions (string, precise proportions for the treatment)
  - description (string, a description of the treatment and its effects)
  `,
});

const suggestTreatmentsForDiseaseFlow = ai.defineFlow(
  {
    name: 'suggestTreatmentsForDiseaseFlow',
    inputSchema: SuggestTreatmentsForDiseaseInputSchema,
    outputSchema: SuggestTreatmentsForDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
