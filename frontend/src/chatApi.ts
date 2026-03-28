import { api } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  context?: string;
}

export interface RelatedCaseInfo {
  case_id: string;
  title: string;
  relation_type: string;
  similarity_score: number;
  reason: string;
  time_gap: string;
}

export const sendChat = async (messages: ChatMessage[], context?: string) => {
  const response = await api.post<ChatMessage>('/chat', { messages, context });
  return response.data;
};

export const getRelatedCases = async (caseId: string) => {
  const response = await api.get<RelatedCaseInfo[]>(`/cases/${caseId}/analysis/spatiotemporal`);
  return response.data;
};
