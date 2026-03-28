from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
import asyncio
import json
import random
from datetime import datetime
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models import Case, Relation, Evidence, AnalysisResult, CaseTrajectory, Report, ChatRequest, ChatMessage, RelatedCaseInfo, DetectedObject, Anomaly
from mock_data import CASES, RELATIONS, EVIDENCES, TRAJECTORIES, REPORTS

# Initialize OpenAI client
# In production, use environment variables!
API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL", "https://api.deepseek.com")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

app = FastAPI(title="琥珀计划 - 辅助查案系统 API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Amber Project API v3.0 (AI Enhanced)"}

@app.get("/cases", response_model=List[Case])
def get_cases():
    return CASES

@app.get("/cases/{case_id}", response_model=Case)
def get_case(case_id: str):
    case = next((c for c in CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.get("/relations", response_model=List[Relation])
def get_relations():
    return RELATIONS

@app.get("/evidence/{case_id}", response_model=List[Evidence])
def get_evidence(case_id: str):
    return [e for e in EVIDENCES if e["case_id"] == case_id]

@app.post("/analyze/scene", response_model=AnalysisResult)
async def analyze_scene(scene_id: str):
    await asyncio.sleep(7)  # Simulate async processing
    return AnalysisResult(
        summary="现场扫描分析完成。AI视觉模型识别出3处关键物证：1. VOIP网关设备(型号: Cisco VG310)；2. 疑似加密货币硬件钱包；3. 墙面隐藏式保险箱痕迹。",
        risk_score=0.92,
        suspects=["Unknown Male 1 (Facial Match: 87%)", "Unknown Male 2"],
        timeline=[
            {"time": "2023-10-15 14:00", "event": "Entry detected via thermal sensor"},
            {"time": "2023-10-15 14:30", "event": "Device activation sequence initiated"}
        ],
        objects=[
            DetectedObject(id="obj-001", name="Cisco VG310 VoIP Gateway", confidence=0.98, coordinates=[1.2, 0.5, -0.8], type="device"),
            DetectedObject(id="obj-002", name="Ledger Nano X", confidence=0.85, coordinates=[-0.5, 0.8, 0.2], type="evidence"),
            DetectedObject(id="obj-003", name="Hidden Safe Panel", confidence=0.76, coordinates=[2.0, 1.5, 2.0], type="structure"),
            DetectedObject(id="obj-004", name="Burned Document Fragment", confidence=0.92, coordinates=[-1.0, 0.0, 1.5], type="evidence")
        ],
        anomalies=[
            Anomaly(id="anom-001", description="Thermal Signature Residue", severity="high", coordinates=[0.5, 0.0, 0.5]),
            Anomaly(id="anom-002", description="RF Signal Interference", severity="medium", coordinates=[-1.5, 1.0, -1.5])
        ]
    )

@app.get("/trajectory/{case_id}", response_model=CaseTrajectory)
def get_trajectory(case_id: str):
    traj = next((t for t in TRAJECTORIES if t["case_id"] == case_id), None)
    if not traj:
        return CaseTrajectory(case_id=case_id, points=[])
    return traj

@app.get("/cases/{case_id}/analysis/spatiotemporal", response_model=List[RelatedCaseInfo])
async def get_spatiotemporal_analysis(case_id: str):
    # Mock analysis logic
    await asyncio.sleep(1.5) # Simulate calculation
    
    current_case = next((c for c in CASES if c["id"] == case_id), None)
    if not current_case:
        raise HTTPException(status_code=404, detail="Case not found")

    related_cases = []
    
    # Simple logic: Find cases connected in RELATIONS
    for rel in RELATIONS:
        target_id = None
        if rel["source"] == case_id:
            target_id = rel["target"]
        elif rel["target"] == case_id:
            target_id = rel["source"]
            
        if target_id:
            target_case = next((c for c in CASES if c["id"] == target_id), None)
            if target_case:
                # Calculate time gap
                time_diff = target_case["date"] - current_case["date"]
                days = abs(time_diff.days)
                
                reason = "Data correlation detected"
                if rel["type"] == "modus_operandi":
                    reason = "作案手法高度相似 (Modus Operandi Match)"
                elif rel["type"] == "suspect_link":
                    reason = "嫌疑人轨迹重合 (Suspect Overlap)"
                elif rel["type"] == "financial":
                    reason = "资金流向关联 (Financial Flow)"
                elif rel["type"] == "communication":
                    reason = "通讯记录频次异常 (Communication Spike)"
                elif rel["type"] == "data_leak":
                    reason = "数据泄露源头关联 (Data Leak Source)"
                
                related_cases.append(RelatedCaseInfo(
                    case_id=target_case["id"],
                    title=target_case["title"],
                    relation_type=rel["type"],
                    similarity_score=rel["weight"],
                    reason=reason,
                    time_gap=f"{days} days {'later' if time_diff.days > 0 else 'earlier'}"
                ))
    
    return sorted(related_cases, key=lambda x: x.similarity_score, reverse=True)

@app.get("/reports", response_model=List[Report])
def get_reports():
    return REPORTS

@app.post("/reports/generate", response_model=Report)
async def generate_report(case_id: str):
    await asyncio.sleep(1)
    case = next((c for c in CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Simple prompt for report generation using AI could be added here too
    new_report = {
        "id": f"REP-{len(REPORTS)+1:03d}",
        "title": f"Investigation Report: {case['title']}",
        "created_at": datetime.now(),
        "content": f"Full analysis of case {case_id}. Including trajectory analysis, financial flow, and suspect list. AI Confidence Score: 98.5%.",
        "case_id": case_id,
        "status": "Generated"
    }
    REPORTS.append(new_report)
    return new_report

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        system_prompt = """
        You are 'Amber' (琥珀), a highly advanced AI Assistant for Criminal Investigation. 
        Your persona is professional, concise, and analytical. You are assisting detectives in solving complex transnational crimes.
        
        Style guidelines:
        - Use professional terminology (e.g., "correlate", "anomaly detection", "geospatial analysis").
        - Be direct and data-driven.
        - If context is provided about cases, use it to answer.
        - Maintain a slightly futuristic/cyberpunk tone ("System online", "Analyzing data stream...").
        - Always respond in Chinese unless requested otherwise.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        
        if request.context:
            messages.append({"role": "system", "content": f"Current Case Context Data: {request.context}"})
            
        messages.extend([{"role": m.role, "content": m.content} for m in request.messages])

        response = client.chat.completions.create(
            model="deepseek-chat", # Trying DeepSeek model name, fallback to gpt-3.5-turbo if using OpenAI endpoint
            messages=messages,
            stream=False
        )
        
        return {"role": "assistant", "content": response.choices[0].message.content}
    except Exception as e:
        print(f"AI Error: {e}")
        # Fallback response for demo purposes if API fails (e.g. quota, network)
        return {
            "role": "assistant", 
            "content": f"**SYSTEM ALERT**: Neural Link Unstable. Accessing local backup database.\n\nError: {str(e)}\n\n(Fallback Mode) Based on the available data, I recommend focusing on the financial transaction logs from the suspect's known accounts. There is a high probability of money laundering activities linked to the offshore shell companies."
        }

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(random.randint(3, 8)) # Faster alerts for "busy" feel
            alert_type = random.choice(["CRITICAL", "WARNING", "INFO", "SYSTEM"])
            
            messages = {
                "CRITICAL": [
                    "Unauthorized access attempt detected on Server Node 4",
                    "High-risk suspect facial match: 98.2% confidence",
                    "Geofence breach: Target moving outside surveillance zone",
                    "Encrypted data packet interception successful"
                ],
                "WARNING": [
                    "New suspicious transaction pattern identified",
                    "Latency spike in neural network processing",
                    "Drone surveillance battery low: Return to base advised",
                    "Signal interference detected in Sector 7"
                ],
                "INFO": [
                    "Data synchronization complete",
                    "New case file indexed: CASE-2024-X99",
                    "Satellite imagery updated for Region: SE-Asia",
                    "Analyst 'Agent Smith' logged in"
                ],
                "SYSTEM": [
                    "Running heuristic analysis...",
                    "Updating threat signature database...",
                    "Optimizing memory allocation...",
                    "Neural link stable. Latency: 12ms"
                ]
            }
            
            await websocket.send_json({
                "type": alert_type,
                "message": random.choice(messages[alert_type]),
                "timestamp": datetime.now().isoformat(),
                "id": f"ALT-{random.randint(1000, 9999)}"
            })
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
