"""
Upload Service - File handling and processing
Patched for local storage (no Supabase required)
"""
import os
import uuid
import json
import pandas as pd
from datetime import datetime
from typing import Optional, Dict, List, Tuple
from pathlib import Path
import aiofiles

from fastapi import UploadFile

from app.config import settings
from app.core.websocket import ws_manager
from app.core.supabase import supabase_service
from app.services.ml_service import ml_service

# ─────────────────────────────────────────────────────────────
# LOCAL STORAGE HELPERS
# All data is stored as JSON files in uploads/meta/ directory
# ─────────────────────────────────────────────────────────────

META_DIR = Path(settings.UPLOAD_DIR) / "meta"
META_DIR.mkdir(parents=True, exist_ok=True)


def _meta_path(upload_id: str) -> Path:
    return META_DIR / f"{upload_id}.json"


def _save_meta(data: Dict) -> None:
    with open(_meta_path(data["id"]), "w") as f:
        json.dump(data, f, indent=2, default=str)


def _load_meta(upload_id: str) -> Optional[Dict]:
    path = _meta_path(upload_id)
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


def _list_all_meta(user_id: str) -> List[Dict]:
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


def _update_meta(upload_id: str, updates: Dict) -> None:
    data = _load_meta(upload_id)
    if data:
        data.update(updates)
        _save_meta(data)


class UploadService:
    """
    Service for handling file uploads and processing
    Uses local JSON storage instead of Supabase
    """

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def process_upload(
        self,
        file: UploadFile,
        user_id: str,
        description: Optional[str] = None
    ) -> Dict:
        """
        Process an uploaded file and automatically run ML analysis
        """
        upload_id = str(uuid.uuid4())

        filename = file.filename or "unknown"
        file_ext = Path(filename).suffix.lower()

        allowed = settings.allowed_extensions_list
        ext_without_dot = file_ext.lstrip('.')
        ext_with_dot = f'.{ext_without_dot}'

        if ext_without_dot not in [e.lstrip('.') for e in allowed] and ext_with_dot not in allowed:
            raise ValueError(f"Unsupported file type: {file_ext}")

        # Save file to disk
        file_path = self.upload_dir / f"{upload_id}{file_ext}"
        content = await file.read()
        file_size = len(content)

        if file_size > settings.MAX_UPLOAD_SIZE:
            raise ValueError(f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB")

        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)

        # Save upload record locally
        upload_record = {
            "id": upload_id,
            "user_id": user_id,
            "filename": filename,
            "file_path": str(file_path),
            "file_ext": file_ext,
            "uploaded_at": datetime.utcnow().isoformat(),
            "status": "processing",
            "row_count": 0,
            "size": file_size,
            "description": description,
            "patterns": [],
            "suspicious_addresses": [],
            "analysis_summary": {}
        }
        _save_meta(upload_record)
        
        # Save to Supabase for persistence across sessions and dashboard stats
        try:
            await supabase_service.create_upload(upload_record)
        except Exception as e:
            print(f"⚠️ Failed to save upload to Supabase: {e}")
            # Continue anyway as local storage is available

        # WebSocket progress
        await ws_manager.broadcast_upload_progress(
            user_id, upload_id, 10, "processing", "File uploaded, starting processing..."
        )

        try:
            records = await self._process_file(file_path, file_ext, upload_id, user_id)

            _update_meta(upload_id, {
                "status": "completed",
                "row_count": records
            })
            
            # Sync to Supabase
            try:
                await supabase_service.update_upload(upload_id, {
                    "status": "completed",
                    "row_count": records
                })
            except Exception as e:
                print(f"⚠️ Failed to update upload in Supabase: {e}")

            await ws_manager.broadcast_upload_progress(
                user_id, upload_id, 70, "processing", "Running ML analysis..."
            )

            await self._run_auto_analysis(file_path, file_ext, upload_id, user_id)

            await ws_manager.broadcast_upload_progress(
                user_id, upload_id, 100, "completed", "Processing and analysis complete!"
            )

        except Exception as e:
            _update_meta(upload_id, {"status": "failed"})
            await ws_manager.broadcast_upload_progress(
                user_id, upload_id, 0, "failed", f"Processing failed: {str(e)}"
            )
            raise

        return {
            "id": upload_id,
            "name": filename,
            "status": "processing",
            "uploadedAt": datetime.utcnow().isoformat()
        }

    async def _process_file(
        self,
        file_path: Path,
        file_ext: str,
        upload_id: str,
        user_id: str
    ) -> int:
        if file_ext == '.csv':
            df = pd.read_csv(file_path)
        elif file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
        elif file_ext == '.json':
            df = pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        await ws_manager.broadcast_upload_progress(
            user_id, upload_id, 30, "processing", f"Read {len(df)} records..."
        )
        await ws_manager.broadcast_upload_progress(
            user_id, upload_id, 50, "processing", "File parsed successfully..."
        )

        return len(df)

    async def _run_auto_analysis(
        self,
        file_path: Path,
        file_ext: str,
        upload_id: str,
        user_id: str
    ) -> None:
        try:
            if file_ext == '.csv':
                df = pd.read_csv(file_path)
            elif file_ext in ['.xlsx', '.xls']:
                df = pd.read_excel(file_path)
            elif file_ext == '.json':
                df = pd.read_json(file_path)
            else:
                return

            if df.empty:
                return

            # Run ML analysis
            results = ml_service.analyze_transactions(df)

            summary = results.get("summary", {})
            suspicious_addresses = results.get("suspicious_addresses", [])
            patterns = results.get("patterns", [])

            suspicious_node_count = len([
                addr for addr in suspicious_addresses
                if addr.get("suspiciousScore", 0) > 0.5
            ])

            max_risk_score = summary.get("maxSuspiciousScore", 0.0)
            if not max_risk_score and suspicious_addresses:
                max_risk_score = max(
                    (addr.get("suspiciousScore", 0) for addr in suspicious_addresses),
                    default=0.0
                )

            # Save everything locally
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

            # Sync results to Supabase for Dashboard stats
            try:
                await supabase_service.save_analysis_results(
                    upload_id=upload_id,
                    suspicious_node_count=suspicious_node_count,
                    smurfing_patterns_detected=len(patterns),
                    max_risk_score=max_risk_score
                )
                
                # Also update upload status in Supabase
                await supabase_service.update_upload(upload_id, {"status": "completed"})
            except Exception as e:
                print(f"⚠️ Failed to sync analysis results to Supabase: {e}")

            print(f"✓ Auto-analysis complete for {upload_id}: {len(patterns)} patterns, {len(suspicious_addresses)} addresses")

        except Exception as e:
            print(f"Auto-analysis failed for {upload_id}: {e}")
            import traceback
            traceback.print_exc()

    async def get_upload_history(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 10,
        status: Optional[str] = None
    ) -> Tuple[List[Dict], int]:
        all_uploads = _list_all_meta(user_id)

        if status:
            all_uploads = [u for u in all_uploads if u.get("status") == status]

        total = len(all_uploads)
        start = (page - 1) * limit
        end = start + limit
        return all_uploads[start:end], total

    async def get_upload_detail(
        self,
        upload_id: str,
        user_id: str
    ) -> Optional[Dict]:
        upload = _load_meta(upload_id)
        if upload and (upload.get("user_id") == user_id or user_id == "demo-user-id"):
            return upload
        return None

    async def delete_upload(
        self,
        upload_id: str,
        user_id: str
    ) -> bool:
        upload = _load_meta(upload_id)
        if not upload or (upload.get("user_id") != user_id and user_id != "demo-user-id"):
            return False

        # Delete actual file
        file_path = Path(upload.get("file_path", ""))
        if file_path.exists():
            file_path.unlink()

        # Delete meta file
        meta = _meta_path(upload_id)
        if meta.exists():
            meta.unlink()

        return True


# Global service instance
upload_service = UploadService()