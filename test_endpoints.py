#!/usr/bin/env python3
"""Test script to verify analysis endpoints are returning data correctly"""

import requests
import json

# Hardcoded test values
UPLOAD_ID = "dab3505d-13b5-4592-b6ba-cdcab6e3455e"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci0wMDEiLCJlbWFpbCI6ImRlbW9AY2hhaW5zaWdodC5haSIsIm5hbWUiOiJEZW1vIFVzZXIiLCJpc19kZW1vIjp0cnVlLCJleHAiOjE3NzQ4NTE0MTcsImlhdCI6MTc3NDg0NzgxNywidHlwZSI6ImFjY2VzcyJ9.Xnb_ZOiGxaz3iy1NJ3hNinYpF7jGpgGvcqxrtpW7P2M"
BASE_URL = "http://127.0.0.1:8000"
API_PREFIX = "/api/v1"

headers = {"Authorization": f"Bearer {TOKEN}"}

print("Testing Analysis Endpoints")
print("=" * 60)

# Test 1: Get patterns
print("\n1. Testing /analysis/patterns endpoint...")
try:
    url = f"{BASE_URL}{API_PREFIX}/analysis/patterns?upload_id={UPLOAD_ID}"
    response = requests.get(url, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Got patterns: {data.get('total', 0)} patterns found")
        if data.get('patterns'):
            print(f"   First pattern type: {data['patterns'][0].get('type')}")
    else:
        print(f"   ✗ Error: {response.text}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

# Test 2: Get suspicious addresses
print("\n2. Testing /analysis/suspicious-addresses endpoint...")
try:
    url = f"{BASE_URL}{API_PREFIX}/analysis/suspicious-addresses/{UPLOAD_ID}?page=1&limit=5"
    response = requests.get(url, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Got addresses: {len(data.get('addresses', []))} addresses found")
        if data.get('addresses'):
            print(f"   First address: {data['addresses'][0].get('address')}")
    else:
        print(f"   ✗ Error: {response.text}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

# Test 3: Get suspicious subgraph
print("\n3. Testing /graph/suspicious endpoint...")
try:
    url = f"{BASE_URL}{API_PREFIX}/graph/suspicious/{UPLOAD_ID}?top_k=50&hop=2"
    response = requests.get(url, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Got subgraph")
        print(f"   Nodes: {len(data.get('nodes', []))}")
        print(f"   Edges: {len(data.get('edges', []))}")
    else:
        print(f"   ✗ Error: {response.text}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

# Test 4: Get all patterns (no upload_id, should aggregate)
print("\n4. Testing /analysis/patterns (all uploads)...")
try:
    url = f"{BASE_URL}{API_PREFIX}/analysis/patterns"
    response = requests.get(url, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Got patterns: {data.get('total', 0)} total patterns")
    else:
        print(f"   ✗ Error: {response.text}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

print("\n" + "=" * 60)
print("Testing complete!")
