import { create } from 'zustand';
import type { TypingSession, TypingMode, ProgrammingLanguage } from '../types/index';

interface TypingStore {
  // 현재 세션 상태
  currentSession: TypingSession | null;
  
  // 액션들
  startSession: (mode: TypingMode, language: ProgrammingLanguage, text: string) => void;
  updateUserInput: (input: string) => void;
  endSession: () => void;
  resetSession: () => void;
  
  // 계산 메서드
  calculateWpm: () => number;
  calculateAccuracy: () => number;
}

export const useTypingStore = create<TypingStore>((set, get) => ({
  currentSession: null,
  
  startSession: (mode, language, text) => {
    const session: TypingSession = {
      id: Date.now().toString(),
      mode,
      language,
      text,
      userInput: '',
      startTime: new Date(),
      endTime: null,
      errors: 0,
      currentPosition: 0,
      isCompleted: false,
      wpm: 0,
      accuracy: 100,
    };
    set({ currentSession: session });
  },
  
  updateUserInput: (input) => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    const errors = calculateErrors(currentSession.text, input);
    const accuracy = get().calculateAccuracy();
    const wpm = get().calculateWpm();
    // 텍스트 길이에 도달하면 완료 (정확도 상관없이)
    const isCompleted = input.length >= currentSession.text.length;
    
    set({
      currentSession: {
        ...currentSession,
        userInput: input,
        currentPosition: input.length,
        errors,
        accuracy,
        wpm,
        isCompleted,
        endTime: isCompleted ? new Date() : null,
      },
    });
  },
  
  endSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    set({
      currentSession: {
        ...currentSession,
        endTime: new Date(),
        isCompleted: true,
      },
    });
  },
  
  resetSession: () => {
    set({ currentSession: null });
  },
  
  calculateWpm: () => {
    const { currentSession } = get();
    if (!currentSession || !currentSession.startTime) return 0;
    
    const timeElapsed = (Date.now() - currentSession.startTime.getTime()) / 1000 / 60;
    if (timeElapsed === 0) return 0;
    
    return Math.round(currentSession.userInput.length / 5 / timeElapsed);
  },
  
  calculateAccuracy: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.userInput.length === 0) return 100;
    
    const correctChars = currentSession.userInput.length - currentSession.errors;
    return Math.round((correctChars / currentSession.userInput.length) * 100);
  },
}));

// 에러 계산 헬퍼 함수
function calculateErrors(originalText: string, userInput: string): number {
  let errors = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] !== originalText[i]) {
      errors++;
    }
  }
  return errors;
}
