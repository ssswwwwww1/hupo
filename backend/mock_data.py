from datetime import datetime, timedelta

CASES = [
    {
        "id": "CASE-2023-001",
        "title": "跨国电信诈骗案 A",
        "description": "涉及东南亚某国的电信诈骗团伙，利用虚假投资平台诈骗。",
        "date": datetime(2023, 10, 15, 14, 30),
        "location": {"lat": 13.7563, "lng": 100.5018, "address": "Bangkok, Thailand"},
        "status": "Open",
        "severity": "high"
    },
    {
        "id": "CASE-2023-002",
        "title": "非法VOIP线路搭建",
        "description": "在境内搭建非法VOIP网关，协助境外团伙拨打诈骗电话。",
        "date": datetime(2023, 11, 2, 9, 15),
        "location": {"lat": 31.2304, "lng": 121.4737, "address": "Shanghai, China"},
        "status": "Investigating",
        "severity": "medium"
    },
    {
        "id": "CASE-2023-003",
        "title": "洗钱网络 B",
        "description": "通过加密货币洗钱，资金流向追踪困难。",
        "date": datetime(2023, 12, 5, 11, 0),
        "location": {"lat": 22.3193, "lng": 114.1694, "address": "Hong Kong"},
        "status": "Open",
        "severity": "high"
    },
    {
        "id": "CASE-2024-004",
        "title": "暗网数据交易",
        "description": "大量公民个人信息在暗网出售，源头疑似某电商平台。",
        "date": datetime(2024, 1, 10, 3, 20),
        "location": {"lat": 1.3521, "lng": 103.8198, "address": "Singapore"},
        "status": "New",
        "severity": "high"
    },
    # Historical Cases for Analysis
    {
        "id": "CASE-2021-089",
        "title": "虚拟货币庞氏骗局",
        "description": "早期的加密货币诈骗，与 CASE-2023-001 具有相似的资金清洗路径。",
        "date": datetime(2021, 5, 20, 10, 0),
        "location": {"lat": 11.5564, "lng": 104.9282, "address": "Phnom Penh, Cambodia"},
        "status": "Closed",
        "severity": "high"
    },
    {
        "id": "CASE-2022-015",
        "title": "非法 SIM 卡走私",
        "description": "为诈骗团伙提供通讯工具，嫌疑人与 CASE-2023-002 重合。",
        "date": datetime(2022, 3, 15, 16, 45),
        "location": {"lat": 22.5431, "lng": 114.0579, "address": "Shenzhen, China"},
        "status": "Closed",
        "severity": "medium"
    },
    # New Cases
    {
        "id": "CASE-2024-005",
        "title": "地下钱庄非法汇兑",
        "description": "发现一处位于边境的非法货币兑换点，疑似为诈骗资金提供洗白服务。",
        "date": datetime(2024, 1, 15, 10, 30),
        "location": {"lat": 21.9162, "lng": 100.7620, "address": "Xishuangbanna, China"},
        "status": "Investigating",
        "severity": "medium"
    },
    {
        "id": "CASE-2024-006",
        "title": "AI换脸诈骗案",
        "description": "利用深度伪造技术冒充熟人进行视频通话诈骗。",
        "date": datetime(2024, 2, 1, 15, 20),
        "location": {"lat": 39.9042, "lng": 116.4074, "address": "Beijing, China"},
        "status": "New",
        "severity": "high"
    },
    {
        "id": "CASE-2024-007",
        "title": "钓鱼网站攻击",
        "description": "伪造政府服务网站窃取用户信息。",
        "date": datetime(2024, 2, 5, 9, 0),
        "location": {"lat": 14.5995, "lng": 120.9842, "address": "Manila, Philippines"},
        "status": "Open",
        "severity": "medium"
    },
    {
        "id": "CASE-2024-008",
        "title": "跨境赌博平台",
        "description": "服务器架设在境外的非法赌博网站，涉案金额巨大。",
        "date": datetime(2024, 2, 10, 20, 0),
        "location": {"lat": 16.8409, "lng": 96.1735, "address": "Yangon, Myanmar"},
        "status": "Open",
        "severity": "high"
    }
]

RELATIONS = [
    {"source": "CASE-2023-001", "target": "CASE-2023-002", "type": "communication", "weight": 0.8},
    {"source": "CASE-2023-001", "target": "CASE-2023-003", "type": "financial", "weight": 0.9},
    {"source": "CASE-2023-003", "target": "CASE-2024-004", "type": "data_leak", "weight": 0.6},
    # Historical relations
    {"source": "CASE-2021-089", "target": "CASE-2023-001", "type": "modus_operandi", "weight": 0.75},
    {"source": "CASE-2022-015", "target": "CASE-2023-002", "type": "suspect_link", "weight": 0.85},
    # New relations
    {"source": "CASE-2024-005", "target": "CASE-2023-003", "type": "financial", "weight": 0.88},
    {"source": "CASE-2024-006", "target": "CASE-2024-004", "type": "data_leak", "weight": 0.7},
    {"source": "CASE-2024-007", "target": "CASE-2024-006", "type": "technical_support", "weight": 0.65},
    {"source": "CASE-2024-008", "target": "CASE-2023-001", "type": "organization_link", "weight": 0.95},
]

EVIDENCES = [
    {
        "id": "EV-001",
        "case_id": "CASE-2023-001",
        "type": "3d_scan",
        "url": "/assets/scene_scan.glb",
        "description": "窝点现场3D扫描数据",
        "metadata": {"scan_date": "2023-10-16", "device": "Lidar Scanner"}
    }
]

# Generate mock trajectory for CASE-2023-001
base_time = datetime(2023, 10, 15, 10, 0)
TRAJECTORIES = [
    {
        "case_id": "CASE-2023-001",
        "points": [
            {"lat": 13.7563, "lng": 100.5018, "timestamp": base_time, "activity": "Signal Detected"},
            {"lat": 13.7600, "lng": 100.5100, "timestamp": base_time + timedelta(hours=2), "activity": "Movement"},
            {"lat": 13.7650, "lng": 100.5200, "timestamp": base_time + timedelta(hours=4), "activity": "Stay"},
            {"lat": 13.7200, "lng": 100.5500, "timestamp": base_time + timedelta(hours=8), "activity": "Transaction"},
        ]
    }
]

REPORTS = []
