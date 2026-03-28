import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export interface Case {
  id: string;
  title: string;
  description: string;
  date: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: string;
  severity: string;
}

export interface Relation {
  source: string;
  target: string;
  type: string;
  weight: number;
}

export interface Evidence {
  id: string;
  case_id: string;
  type: string;
  url: string;
  description: string;
  metadata: any;
}

export interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  coordinates: number[];
  type: string;
}

export interface Anomaly {
  id: string;
  description: string;
  severity: string;
  coordinates: number[];
}

export interface AnalysisResult {
  summary: string;
  risk_score: number;
  suspects: string[];
  timeline: { time: string; event: string }[];
  objects: DetectedObject[];
  anomalies: Anomaly[];
}

export interface TrajectoryPoint {
  lat: number;
  lng: number;
  timestamp: string;
  activity: string;
}

export interface CaseTrajectory {
  case_id: string;
  points: TrajectoryPoint[];
}

export interface Report {
  id: string;
  title: string;
  created_at: string;
  content: string;
  case_id: string;
  status: string;
}

export const getCases = async () => {
  const response = await api.get<Case[]>('/cases');
  return response.data;
};

export const getRelations = async () => {
  const response = await api.get<Relation[]>('/relations');
  return response.data;
};

export const getEvidence = async (caseId: string) => {
  const response = await api.get<Evidence[]>(`/evidence/${caseId}`);
  return response.data;
};

export const analyzeScene = async (sceneId: string) => {
  const response = await api.post<AnalysisResult>(`/analyze/scene?scene_id=${sceneId}`);
  return response.data;
};

export const getTrajectory = async (caseId: string) => {
  const response = await api.get<CaseTrajectory>(`/trajectory/${caseId}`);
  return response.data;
};

export const getReports = async () => {
  const response = await api.get<Report[]>('/reports');
  return response.data;
};

export const generateReport = async (caseId: string) => {
  const response = await api.post<Report>(`/reports/generate?case_id=${caseId}`);
  return response.data;
};
