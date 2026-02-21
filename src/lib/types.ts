
export interface Treatment {
  treatmentType: 'organic' | 'chemical';
  treatmentName: string;
  proportions: string;
  description: string;
}

export interface Diagnosis {
  disease: string;
  infectionLevel: number;
  plantName?: string;
}

export interface DiagnosisHistoryItem extends Diagnosis {
  id: string;
  date: string;
  imageUrl: string;
  plantName: string; // Assuming we'll ask for plant name
}

export interface WishlistItem extends Treatment {
  id: string;
  savedAt: string;
  diagnosis?: Diagnosis; // Optional context for why it was saved
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  notes?: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export interface TimelineStage {
  stage: string;
  title: string;
  description: string;
}

export interface TimelineData {
  cropName: string;
  timeline: TimelineStage[];
}
