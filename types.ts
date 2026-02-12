
export interface Topic {
  id: number;
  title: string;
  opening: string;
  followUps: string[];
}

export enum AppMode {
  SELECTION = 'SELECTION',
  CONVERSATION = 'CONVERSATION',
  FEEDBACK = 'FEEDBACK'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FeedbackCriteria {
  label: string;
  status: 'Met' | 'Partly Met' | 'Not Yet Met';
  explanation: string;
  evidence: string;
}

export interface FeedbackReport {
  criteria: FeedbackCriteria[];
  strengths: string[];
  improvements: string[];
  spokenScript: string;
}
