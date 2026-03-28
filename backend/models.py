from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class Location(BaseModel):
    lat: float
    lng: float
    address: str

class Case(BaseModel):
    id: str
    title: str
    description: str
    date: datetime
    location: Location
    status: str
    severity: str  # high, medium, low

class Evidence(BaseModel):
    id: str
    case_id: str
    type: str  # image, audio, document, 3d_scan
    url: str
    description: str
    metadata: Dict

class Relation(BaseModel):
    source: str
    target: str
    type: str
    weight: float

class DetectedObject(BaseModel):
    id: str
    name: str
    confidence: float
    coordinates: List[float]
    type: str # e.g., "evidence", "device", "furniture"

class Anomaly(BaseModel):
    id: str
    description: str
    severity: str # high, medium, low
    coordinates: List[float]

class AnalysisResult(BaseModel):
    summary: str
    risk_score: float
    suspects: List[str]
    timeline: List[Dict]
    objects: List[DetectedObject]
    anomalies: List[Anomaly]

class TrajectoryPoint(BaseModel):
    lat: float
    lng: float
    timestamp: datetime
    activity: str

class CaseTrajectory(BaseModel):
    case_id: str
    points: List[TrajectoryPoint]

class Report(BaseModel):
    id: str
    title: str
    created_at: datetime
    content: str
    case_id: str
    status: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[str] = None

class RelatedCaseInfo(BaseModel):
    case_id: str
    title: str
    relation_type: str
    similarity_score: float
    reason: str
    time_gap: str
