import { config } from 'dotenv';
config();

import '@/ai/flows/answer-plant-health-questions.ts';
import '@/ai/flows/diagnose-plant-disease.ts';
import '@/ai/flows/suggest-treatments-for-disease.ts';
import '@/ai/flows/generate-crop-timeline.ts';
