# ⚡ TensorCraft AI
### Enterprise SRE & Autonomous Incident Remediation Engine

TensorCraft AI is an enterprise-grade Site Reliability Engineering (SRE) platform powered by Google Gemini. It monitors distributed microservice topologies in real-time, predicts cascading bottlenecks before they cause downtime, performs deep AI root-cause diagnostics, and triggers automated remediation playbooks.

---

## 🚀 Key Features

* **🧠 AI-Driven Diagnostics & Inference:** Leverages `gemini-3.6-flash` and `gemini-2.5-pro` to analyze telemetry logs, detect root causes, and generate comprehensive incident reports.
* **🌐 Multi-Region SRE Control Plane:** Supports real-time monitoring across multiple cloud regions (`us-east-1`, `us-west-2`, `eu-central-1`).
* **📊 Obsidian Service Topology & Recharts:** Interactive real-time dependency graph tracking QPS, latency, load, and predictive failure risk metrics.
* **📡 Live Telemetry Stream:** Ingests live vector telemetry packets and log streams across microservices with instant pause/resume controls.
* **🛠️ AI Auto-Remediation Sandbox:** Instantly tests and executes automated playbooks to resolve database connection saturations and gateway timeouts.

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Visualization & Icons:** Recharts, Lucide React
* **AI & Inference:** Google Gemini API (`gemini-3.6-flash`, `gemini-2.5-pro`)
* **Build Tool:** Vite

---

## ⚙️ Getting Started Locally

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/tensorcraft-project.git](https://github.com/YOUR_USERNAME/tensorcraft-project.git)
   cd tensorcraft-project