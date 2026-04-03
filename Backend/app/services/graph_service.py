"""
Graph Service - Transaction graph operations with ML integration
Patched for local storage (no Supabase required)
"""
from typing import Dict, List, Optional
from pathlib import Path
import json
import numpy as np
import pandas as pd
import networkx as nx

from app.services.ml_service import ml_service
from app.config import settings

# ── Local storage helpers ────────────────────────────────────────────────────
META_DIR = Path(settings.UPLOAD_DIR) / "meta"
META_DIR.mkdir(parents=True, exist_ok=True)


def _load_meta(upload_id: str) -> Optional[Dict]:
    path = META_DIR / f"{upload_id}.json"
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


def _update_meta(upload_id: str, updates: Dict) -> None:
    path = META_DIR / f"{upload_id}.json"
    if not path.exists():
        return
    with open(path) as f:
        data = json.load(f)
    data.update(updates)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)

# ────────────────────────────────────────────────────────────────────────────


class GraphService:

    def _load_upload_file(self, upload_id: str) -> pd.DataFrame:
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
        return pd.DataFrame()

    def _verify_upload(self, upload_id: str, user_id: str) -> Optional[Dict]:
        upload = _load_meta(upload_id)
        if not upload:
            return None
        if upload.get("user_id") != user_id and user_id != "demo-user-id":
            return None
        return upload

    async def get_graph_data(
        self,
        upload_id: str,
        user_id: str,
        depth: int = 2,
        min_amount: Optional[float] = None
    ) -> Optional[Dict]:
        if not self._verify_upload(upload_id, user_id):
            return None

        df = self._load_upload_file(upload_id)
        if df.empty:
            return {"nodes": [], "edges": []}

        transactions = df.to_dict('records')

        G = nx.DiGraph()
        edge_list = []

        for tx in transactions:
            source = (tx.get("Source_Wallet_ID") or tx.get("source_wallet_id") or
                      tx.get("from_address") or tx.get("source") or tx.get("txId1"))
            target = (tx.get("Dest_Wallet_ID") or tx.get("dest_wallet_id") or
                      tx.get("to_address") or tx.get("target") or tx.get("txId2"))
            amount = tx.get("Amount") or tx.get("amount") or tx.get("value") or 0
            timestamp = tx.get("Timestamp") or tx.get("timestamp") or tx.get("created_at")

            if not source or not target:
                continue

            source, target = str(source), str(target)
            G.add_edge(source, target)
            edge_list.append({
                "source": source,
                "target": target,
                "amount": float(amount) if amount else 0,
                "timestamp": timestamp,
                "suspicious": False,
                "transactionId": tx.get("id")
            })

        nodes = {}
        for tx in transactions:
            source = (tx.get("Source_Wallet_ID") or tx.get("source_wallet_id") or
                      tx.get("from_address") or tx.get("source") or tx.get("txId1"))
            target = (tx.get("Dest_Wallet_ID") or tx.get("dest_wallet_id") or
                      tx.get("to_address") or tx.get("target") or tx.get("txId2"))
            amount = tx.get("Amount") or tx.get("amount") or tx.get("value") or 0

            if not source or not target:
                continue

            source, target = str(source), str(target)

            for addr in [source, target]:
                if addr not in nodes:
                    in_deg = G.in_degree(addr)
                    out_deg = G.out_degree(addr)
                    risk_score = self._compute_wallet_risk(in_deg, out_deg)
                    risk_level = self._get_risk_level(risk_score)
                    nodes[addr] = {
                        "id": addr,
                        "address": addr,
                        "type": self._infer_node_type(addr, transactions),
                        "riskLevel": risk_level,
                        "risk_level": risk_level,
                        "degree": {"in": in_deg, "out": out_deg},
                        "transactionCount": 0,
                        "totalAmount": 0,
                        "suspiciousScore": risk_score
                    }
                nodes[addr]["transactionCount"] += 1
                nodes[addr]["totalAmount"] += float(amount) if amount else 0

        result = {"nodes": list(nodes.values()), "edges": edge_list}

        # Cache graph stats locally
        nodes_list = list(nodes.values())
        suspicious_count = sum(1 for n in nodes_list if n.get("suspiciousScore", 0) >= 0.35)
        smurfing_patterns = sum(
            1 for n in nodes_list
            if n.get("degree", {}).get("in", 0) >= 3 and n.get("degree", {}).get("out", 0) >= 3
        )
        max_risk = max((n.get("suspiciousScore", 0) for n in nodes_list), default=0.0)

        _update_meta(upload_id, {
            "graph_stats": {
                "suspicious_node_count": suspicious_count,
                "smurfing_patterns": smurfing_patterns,
                "max_risk_score": max_risk,
                "total_nodes": len(nodes_list),
                "total_edges": len(edge_list)
            }
        })

        return self._format_graph_response(result, min_amount)

    async def get_suspicious_subgraph(
        self,
        upload_id: str,
        user_id: str,
        top_k: int = 20,
        hop: int = 2,
        min_score: float = 0.0
    ) -> Optional[Dict]:
        upload = self._verify_upload(upload_id, user_id)
        if not upload:
            return None

        # Return cached subgraph if available
        cached = upload.get("subgraph")
        if cached and cached.get("nodes"):
            return cached

        df = self._load_upload_file(upload_id)
        if df.empty:
            return {"nodes": [], "edges": [], "metadata": {"error": "No transactions found"}}

        features, tx_ids, edge_index = ml_service._prepare_graph_data(df, None)
        if features is None:
            return {"nodes": [], "edges": [], "metadata": {"error": "Could not extract features"}}

        subgraph = ml_service.get_suspicious_subgraph_from_upload(
            features=features,
            edge_index=edge_index,
            tx_ids=tx_ids,
            top_k=top_k,
            hop=hop,
            min_score=min_score
        )

        # Cache it
        _update_meta(upload_id, {"subgraph": subgraph})

        return subgraph

    def _format_graph_response(self, data: Dict, min_amount: Optional[float] = None) -> Dict:
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])

        if min_amount is not None:
            edges = [e for e in edges if e.get("amount", 0) >= min_amount]
            node_ids = {e["source"] for e in edges} | {e["target"] for e in edges}
            nodes = [n for n in nodes if n["id"] in node_ids]

        return {"nodes": nodes, "edges": edges}

    def _infer_node_type(self, address: str, transactions: List) -> str:
        send_count = sum(
            1 for tx in transactions
            if str(tx.get("Source_Wallet_ID") or tx.get("source_wallet_id") or
                   tx.get("from_address") or tx.get("source") or "") == address
        )
        recv_count = sum(
            1 for tx in transactions
            if str(tx.get("Dest_Wallet_ID") or tx.get("dest_wallet_id") or
                   tx.get("to_address") or tx.get("target") or "") == address
        )

        if send_count > recv_count * 2:
            return "sender"
        elif recv_count > send_count * 2:
            return "receiver"
        elif send_count > 10 and recv_count > 10:
            return "exchange"
        return "unknown"

    def _compute_wallet_risk(self, in_deg: int, out_deg: int, ml_score: float = 0.0) -> float:
        score = 0.0
        total_deg = in_deg + out_deg
        if out_deg >= 2:
            score += 0.25
        if out_deg >= 4:
            score += 0.15
        if in_deg >= 2:
            score += 0.25
        if in_deg >= 4:
            score += 0.15
        if in_deg >= 2 and out_deg >= 2:
            score += 0.20
        if total_deg >= 4:
            score += 0.10
        score += 0.10 * ml_score
        return min(score, 1.0)

    def _get_risk_level(self, score: float) -> str:
        if score >= 0.65:
            return "high"
        elif score >= 0.35:
            return "medium"
        return "low"

    async def get_network_statistics(self, upload_id: str, user_id: str) -> Optional[Dict]:
        if not self._verify_upload(upload_id, user_id):
            return None

        graph_data = await self.get_graph_data(upload_id, user_id)
        if not graph_data or not graph_data.get("edges"):
            return {
                "totalNodes": 0, "totalEdges": 0, "clusters": 0,
                "avgDegree": 0, "density": 0, "suspiciousClusters": []
            }

        G = nx.DiGraph()
        for node in graph_data["nodes"]:
            G.add_node(node["id"], **node)
        for edge in graph_data["edges"]:
            G.add_edge(edge["source"], edge["target"])

        total_nodes = G.number_of_nodes()
        total_edges = G.number_of_edges()
        undirected = G.to_undirected()
        components = list(nx.connected_components(undirected))
        avg_degree = sum(dict(G.degree()).values()) / total_nodes if total_nodes > 0 else 0
        density = nx.density(G) if total_nodes > 1 else 0

        suspicious_clusters = []
        for i, component in enumerate(components):
            if len(component) < 3:
                continue
            cluster_scores = [
                G.nodes[n].get("suspiciousScore", 0)
                for n in component if "suspiciousScore" in G.nodes[n]
            ]
            if cluster_scores:
                avg_risk = np.mean(cluster_scores)
                if avg_risk > 0.3:
                    suspicious_clusters.append({
                        "id": f"cluster_{i}",
                        "size": len(component),
                        "riskScore": float(avg_risk),
                        "addresses": list(component)[:20]
                    })

        suspicious_clusters.sort(key=lambda x: x["riskScore"], reverse=True)

        return {
            "totalNodes": total_nodes,
            "totalEdges": total_edges,
            "clusters": len(components),
            "avgDegree": round(avg_degree, 2),
            "density": round(density, 4),
            "suspiciousClusters": suspicious_clusters[:10]
        }


graph_service = GraphService()