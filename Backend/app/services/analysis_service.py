"""
Analysis Service - ML analysis and pattern detection
Patched for local storage (no Supabase required)
"""
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import uuid
import pandas as pd

from app.services.ml_service import ml_service
from app.config import settings

# ── Local storage helpers (shared with upload_service) ──────────────────────
META_DIR = Path(settings.UPLOAD_DIR) / "meta"
META_DIR.mkdir(parents=True, exist_ok=True)


def _load_meta(upload_id: str) -> Optional[Dict]:
    path = META_DIR / f"{upload_id}.json"
    if not path.exists():
        return None
    import json
    with open(path) as f:
        return json.load(f)


def _save_meta(data: Dict) -> None:
    import json
    path = META_DIR / f"{data['id']}.json"
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)


def _update_meta(upload_id: str, updates: Dict) -> None:
    data = _load_meta(upload_id)
    if data:
        data.update(updates)
        _save_meta(data)


def _list_all_meta(user_id: str) -> List[Dict]:
    import json
    records = []
    for path in sorted(META_DIR.glob("*.json"), reverse=True):
        try:
            with open(path) as f:
                data = json.load(f)
            if data.get("user_id") == user_id or user_id == "demo-user-id":
                records.append(data)
        except Exception:
            continue
    return records

# ────────────────────────────────────────────────────────────────────────────


class AnalysisService:

    def _load_upload_file(self, upload_id: str, filename: str = "") -> pd.DataFrame:
        upload_dir = Path(settings.UPLOAD_DIR)
        for ext in ['.csv', '.xlsx', '.xls', '.json']:
            file_path = upload_dir / f"{upload_id}{ext}"
            if file_path.exists():
                if ext == '.csv':
                    return pd.read_csv(file_path)
                elif ext in ['.xlsx', '.xls']:
                    return pd.read_excel(file_path)
                elif ext == '.json':
                    return pd.read_json(file_path)
        raise ValueError(f"Upload file not found for {upload_id}")

    async def run_ml_analysis(self, upload_id: str, user_id: str) -> Dict:
        upload = _load_meta(upload_id)
        if not upload or (upload.get("user_id") != user_id and user_id != "demo-user-id"):
            raise ValueError("Upload not found or access denied")

        df = self._load_upload_file(upload_id, upload.get("filename", ""))
        if df.empty:
            raise ValueError("No transactions found in uploaded file")

        results = ml_service.analyze_transactions(df)

        summary = results.get("summary", {})
        suspicious_addresses = results.get("suspicious_addresses", [])
        patterns = results.get("patterns", [])

        suspicious_node_count = len([
            a for a in suspicious_addresses if a.get("suspiciousScore", 0) > 0.5
        ])
        max_risk_score = summary.get("maxSuspiciousScore", 0.0)
        if not max_risk_score and suspicious_addresses:
            max_risk_score = max(
                (a.get("suspiciousScore", 0) for a in suspicious_addresses), default=0.0
            )

        _update_meta(upload_id, {
            "analysis_summary": {
                **summary,
                "suspicious_node_count": suspicious_node_count,
                "max_risk_score": max_risk_score,
            },
            "patterns": patterns,
            "suspicious_addresses": suspicious_addresses,
            "subgraph": results.get("subgraph", {}),
            "predictions": results.get("predictions", []),
            "status": "completed"
        })

        return results

    async def get_analysis_results(self, upload_id: str, user_id: str) -> Optional[Dict]:
        upload = _load_meta(upload_id)
        if not upload or (upload.get("user_id") != user_id and user_id != "demo-user-id"):
            return None

        analysis_summary = upload.get("analysis_summary", {})
        summary = {
            "totalTransactions": upload.get("row_count", 0),
            "suspiciousTransactions": analysis_summary.get("suspicious_node_count", 0),
            "riskScore": analysis_summary.get("max_risk_score", 0.0),
            "patternsDetected": len(upload.get("patterns", [])),
            "high_risk": analysis_summary.get("suspicious_node_count", 0),
            "medium_risk": 0,
            "low_risk": 0,
            "confidence": analysis_summary.get("max_risk_score", 0.0) * 100,
            "processing_time": 2.4
        }

        return {
            "uploadId": upload_id,
            "summary": summary,
            "patterns": upload.get("patterns", []),
            "suspiciousAddresses": upload.get("suspicious_addresses", [])
        }

    async def get_patterns(
        self,
        user_id: str,
        upload_id: Optional[str] = None,
        pattern_type: Optional[str] = None,
        severity: Optional[str] = None
    ) -> List[Dict]:
        if upload_id:
            upload = _load_meta(upload_id)
            if not upload or (upload.get("user_id") != user_id and user_id != "demo-user-id"):
                return []
            patterns = upload.get("patterns", [])
        else:
            all_uploads = _list_all_meta(user_id)
            patterns = []
            for u in all_uploads:
                patterns.extend(u.get("patterns", []))

        if pattern_type:
            patterns = [p for p in patterns if p.get("type", "").lower() == pattern_type.lower()]
        if severity:
            patterns = [p for p in patterns if p.get("severity", "").lower() == severity.lower()]

        return [
            {
                "id": f"{upload_id}_{p.get('id', str(uuid.uuid4()))}" if upload_id else p.get("id", str(uuid.uuid4())),
                "type": p.get("type", "Unknown"),
                "severity": p.get("severity", "medium"),
                "confidence": p.get("confidence", 0.5),
                "transactions": p.get("transactions", 0),
                "description": p.get("description", ""),
                "addresses": p.get("addresses", []),
                "detectedAt": p.get("created_at")
            }
            for p in patterns
        ]

    async def get_suspicious_addresses(
        self,
        user_id: str,
        upload_id: Optional[str] = None,
        risk_level: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[Dict], Dict]:
        if upload_id and upload_id != "all":
            upload = _load_meta(upload_id)
            if not upload or (upload.get("user_id") != user_id and user_id != "demo-user-id"):
                return [], {"page": page, "limit": limit, "total": 0}
            addresses = upload.get("suspicious_addresses", [])
        else:
            all_uploads = _list_all_meta(user_id)
            addresses = []
            for u in all_uploads:
                addresses.extend(u.get("suspicious_addresses", []))

        if risk_level:
            addresses = [a for a in addresses if a.get("riskLevel", "").lower() == risk_level.lower()]

        total = len(addresses)
        start = (page - 1) * limit
        paginated = addresses[start:start + limit]

        def safe_float(val, default=0.0):
            if val is None:
                return default
            try:
                f = float(val)
                return default if f != f else f
            except (TypeError, ValueError):
                return default

        formatted = [
            {
                "address": a.get("address", ""),
                "suspiciousScore": safe_float(a.get("suspiciousScore"), 0.5),
                "riskLevel": a.get("riskLevel") or "medium",
                "transactionCount": int(a.get("transactionCount") or 0),
                "totalAmount": safe_float(a.get("totalAmount"), 0.0),
                "flags": a.get("flags") or [],
                "firstSeen": a.get("firstSeen"),
                "lastSeen": a.get("lastSeen")
            }
            for a in paginated
        ]

        return formatted, {"page": page, "limit": limit, "total": total}

    async def run_analysis(self, upload_id: str, user_id: str) -> Dict:
        return await self.run_ml_analysis(upload_id, user_id)

    async def get_subgraph_for_visualization(
        self,
        upload_id: str,
        user_id: str,
        top_k: int = 20,
        hop: int = 2
    ) -> Dict:
        upload = _load_meta(upload_id)
        if not upload or (upload.get("user_id") != user_id and user_id != "demo-user-id"):
            raise ValueError("Upload not found")

        # Return cached subgraph if available
        cached = upload.get("subgraph")
        if cached and cached.get("nodes"):
            return cached

        df = self._load_upload_file(upload_id)
        features, tx_ids, edge_index = ml_service._prepare_graph_data(df, None)

        if features is None:
            return {"nodes": [], "edges": [], "metadata": {"error": "No features"}}

        return ml_service.extract_suspicious_subgraph(
            features=features,
            edge_index=edge_index,
            tx_ids=tx_ids,
            top_k=top_k,
            hop=hop
        )


analysis_service = AnalysisService()