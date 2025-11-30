export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface CourseModule {
  title: string;
  topics: string[];
  duration: string;
}

export interface CoursePlan {
  title: string;
  description: string;
  targetAudience: string[];
  level: 'Moktade' | 'Motawasset' | 'Motaqaddem' | string; // Beginner, Intermediate, Advanced
  learningOutcomes: string[];
  duration: string;
  methodology: string[];
  modules: CourseModule[];
  assessmentMethods: string[];
  requirements: string[];
}

export enum AppState {
  Chatting,
  GeneratingPlan,
  ViewingPlan,
}
