from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for local development and Vercel testing

# Mock state for pods and telemetry
pods_store = [
    {"id": "pod-auth-7b8f9", "name": "auth-service", "status": "Running", "cpu": "14%", "memory": "256MB", "restarts": 0},
    {"id": "pod-payment-5c2d1", "name": "payment-gateway", "status": "Running", "cpu": "42%", "memory": "512MB", "restarts": 1},
    {"id": "pod-sync-3a4b5", "name": "data-sync-worker", "status": "Degraded", "cpu": "89%", "memory": "1.2GB", "restarts": 3},
    {"id": "pod-api-9f8e7", "name": "api-gateway", "status": "Running", "cpu": "28%", "memory": "410MB", "restarts": 0}
]

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for frontend connection status."""
    return jsonify({"status": "healthy", "timestamp": time.time()})

@app.route('/api/pods', methods=['GET'])
def get_pods():
    """Return current cluster pod metrics and status."""
    # Simulate slight fluctuation for real-time dashboard feel
    for pod in pods_store:
        if pod["status"] != "Degraded":
            pod["cpu"] = f"{random.randint(10, 45)}%"
    return jsonify(pods_store)

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Return system-wide telemetry metrics."""
    return jsonify({
        "cpu_usage": random.randint(30, 65),
        "memory_usage": random.randint(60, 85),
        "active_incidents": 1,
        "cluster_health": "Warning"
    })

@app.route('/api/diagnose', methods=['POST'])
def diagnose_incident():
    """AI-powered root cause analysis endpoint."""
    data = request.json or {}
    pod_name = data.get('pod_name', 'data-sync-worker')
    
    # Simulated SRE Diagnostic Result
    diagnosis = {
        "target": pod_name,
        "root_cause": "Memory leak detected in worker thread pool due to unreleased cursor objects.",
        "confidence": "94.2%",
        "recommended_action": "Scale replica count to 3 and apply patch #SRE-9921",
        "auto_fix_available": True
    }
    return jsonify(diagnosis)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
