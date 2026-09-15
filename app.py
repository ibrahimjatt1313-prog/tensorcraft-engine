from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import psutil

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    try:
        # Real system CPU aur Memory
        cpu_val = psutil.cpu_percent(interval=None)
        mem_val = psutil.virtual_memory().percent
        
        # Fallback agar 0 ho toh random optimal value de dein
        if cpu_val == 0.0:
            cpu_val = random.randint(35, 55)
            
        return jsonify({
            "cpu": cpu_val,
            "memory": mem_val,
            "latency": random.randint(12, 28)
        })
    except Exception as e:
        return jsonify({"cpu": 45, "memory": 65, "latency": 15})

@app.route('/api/pods', methods=['GET'])
def get_pods():
    pods = [
        {"name": "auth-pod-1", "status": "Running", "ip": "10.244.0.12", "uptime": "4d 12h", "cpu": "12%", "memory": "250MB"},
        {"name": "auth-pod-2", "status": "Running", "ip": "10.244.0.15", "uptime": "2d 08h", "cpu": "18%", "memory": "310MB"},
        {"name": "payment-pod-1", "status": "Running", "ip": "10.244.1.04", "uptime": "6d 01h", "cpu": "8%", "memory": "180MB"},
        {"name": "gateway-pod-1", "status": "Running", "ip": "10.244.1.22", "uptime": "1d 19h", "cpu": "24%", "memory": "420MB"}
    ]
    return jsonify(pods)

@app.route('/api/heal', methods=['POST'])
def heal_cluster():
    # Simulate self healing action
    return jsonify({"status": "success", "message": "Cluster successfully rebalanced and healed."})

@app.route('/api/pods/restart', methods=['POST'])
def restart_pod():
    data = request.json
    pod_name = data.get("name", "unknown")
    return jsonify({"status": "success", "message": f"Pod {pod_name} restarted successfully."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)