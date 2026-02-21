
'use server';

import { diagnosePlantDisease } from '@/ai/flows/diagnose-plant-disease';
import { suggestTreatmentsForDisease } from '@/ai/flows/suggest-treatments-for-disease';
import { answerPlantHealthQuestion } from '@/ai/flows/answer-plant-health-questions';
import { generateCropTimeline } from '@/ai/flows/generate-crop-timeline';
import type { Diagnosis, Treatment, ChatMessage, TimelineData } from '@/lib/types';

export async function diagnosePlant(
  prevState: any,
  formData: FormData
): Promise<{ error?: string; diagnosis?: Diagnosis }> {
  const photoDataUri = formData.get('photoDataUri') as string;
  // We still get the plantName from the form, but it will be overridden by the AI's identification.
  // It can be used as a fallback if needed.
  const userPlantName = formData.get('plantName') as string;

  if (!photoDataUri) {
    return { error: 'No image data provided.' };
  }

  try {
    const result = await diagnosePlantDisease({ photoDataUri });
    // The plantName from the AI (result.plantName) is now the source of truth.
    return { diagnosis: { ...result, plantName: result.plantName || userPlantName } };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to diagnose plant.' };
  }
}

export async function getTreatments(
  diagnosis: Diagnosis,
  plantName: string
): Promise<{ error?: string; treatments?: Treatment[] }> {
  if (!diagnosis.disease || diagnosis.disease.toLowerCase() === 'no disease detected') {
    return { treatments: [] };
  }

  try {
    const result = await suggestTreatmentsForDisease({
      diseaseName: diagnosis.disease,
      plantName: plantName || 'the plant',
      infectionLevelPercentage: diagnosis.infectionLevel,
    });
    return { treatments: result.treatments };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to get treatments.' };
  }
}

export async function askQuestion(
  question: string
): Promise<{ error?: string; answer?: string }> {
  if (!question) {
    return { error: 'No question provided.' };
  }

  try {
    const result = await answerPlantHealthQuestion({ question });
    return { answer: result.answer };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to get an answer.' };
  }
}

export async function getTimeline(
  prevState: any,
  formData: FormData
): Promise<{ error?: string; timelineData?: TimelineData }> {
  const cropName = formData.get('cropName') as string;

  if (!cropName) {
    return { error: 'No crop name provided.' };
  }

  try {
    const result = await generateCropTimeline({ cropName });
    return { timelineData: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to generate timeline.' };
  }
}
