import axios from 'axios';

// ─── Типы данных (зеркало Django моделей) ───

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  choices: string[];
  correct_answer: string;
  order: number;
  is_final: boolean;
}

export interface ModuleSummary {
  id: number;
  title: string;
  summary: string;
  key_points: string[];
  order: number;
  flashcard_count: number;
  quiz_count: number;
}

export interface ModuleDetail {
  id: number;
  title: string;
  summary: string;
  key_points: string[];
  order: number;
  flashcards: Flashcard[];
  quiz_questions: QuizQuestion[];
}

export interface CourseSummary {
  id: number;
  title: string;
  source_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  module_count: number;
}

export interface CourseDetail {
  id: number;
  title: string;
  source_url: string | null;
  source_text: string;
  status: string;
  created_at: string;
  updated_at: string;
  modules: ModuleDetail[];
}

// Paginated response from DRF
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── API клиент ───

const api = axios.create({
  baseURL: '/api',
});

// ─── Courses ───

export const getCourses = async (): Promise<CourseSummary[]> => {
  const response = await api.get<PaginatedResponse<CourseSummary>>('/courses/');
  return response.data.results;
};

export const getCourse = async (id: number): Promise<CourseDetail> => {
  const response = await api.get<CourseDetail>(`/courses/${id}/`);
  return response.data;
};

export const createCourse = async (data: {
  title: string;
  source_url?: string;
  source_text?: string;
}): Promise<CourseSummary> => {
  const response = await api.post<CourseSummary>('/courses/', data);
  return response.data;
};

export const createAIAidedCourse = async (prompt: string): Promise<CourseSummary> => {
  const response = await api.post<CourseSummary>('/courses/generate/', { prompt });
  return response.data;
};

// ─── Modules ───

export const getModuleFlashcards = async (moduleId: number): Promise<Flashcard[]> => {
  const response = await api.get<Flashcard[]>(`/modules/${moduleId}/flashcards/`);
  return response.data;
};

export const getModuleQuiz = async (moduleId: number): Promise<QuizQuestion[]> => {
  const response = await api.get<QuizQuestion[]>(`/modules/${moduleId}/quiz/`);
  return response.data;
};

// ─── Final Boss ───

export const getFinalQuiz = async (courseId: number): Promise<QuizQuestion[]> => {
  const response = await api.get<QuizQuestion[]>(`/courses/${courseId}/final-quiz/`);
  return response.data;
};