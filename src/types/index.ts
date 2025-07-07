export interface TypingSession {
  id: string;
  mode: TypingMode;
  language: ProgrammingLanguage;
  text: string;
  userInput: string;
  startTime: Date | null;
  endTime: Date | null;
  errors: number;
  currentPosition: number;
  isCompleted: boolean;
  wpm: number;
  accuracy: number;
}

export type TypingMode = 'keyword' | 'line' | 'variable' | 'function' | 'method' | 'all';

export type ProgrammingLanguage = 'C' | 'Python' | 'Java';

export interface UserStats {
  totalSessions: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestAccuracy: number;
  totalTime: number;
}

export interface CodeTemplate {
  id: string;
  language: ProgrammingLanguage;
  mode: TypingMode;
  content: string;
  difficulty: number;
}
