'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering user questions about plant health using an AI chatbot.
 *
 * - answerPlantHealthQuestion - A function that takes a user's question as input and returns an answer.
 * - AnswerPlantHealthQuestionInput - The input type for the answerPlantHealthQuestion function.
 * - AnswerPlantHealthQuestionOutput - The return type for the answerPlantHealthQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerPlantHealthQuestionInputSchema = z.object({
  question: z.string().describe('The question about plant health.'),
});
export type AnswerPlantHealthQuestionInput = z.infer<typeof AnswerPlantHealthQuestionInputSchema>;

const AnswerPlantHealthQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the plant health question.'),
});
export type AnswerPlantHealthQuestionOutput = z.infer<typeof AnswerPlantHealthQuestionOutputSchema>;

export async function answerPlantHealthQuestion(input: AnswerPlantHealthQuestionInput): Promise<AnswerPlantHealthQuestionOutput> {
  return answerPlantHealthQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerPlantHealthQuestionPrompt',
  input: {schema: AnswerPlantHealthQuestionInputSchema},
  output: {schema: AnswerPlantHealthQuestionOutputSchema},
  prompt: `You are a helpful AI chatbot assistant specialized in providing information and guidance on plant health.

  You will answer questions to the best of your ability. Your answer should be concise and easy to understand.

  Question: {{{question}}}`,
});

const answerPlantHealthQuestionFlow = ai.defineFlow(
  {
    name: 'answerPlantHealthQuestionFlow',
    inputSchema: AnswerPlantHealthQuestionInputSchema,
    outputSchema: AnswerPlantHealthQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
