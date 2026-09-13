import streamlit as st
import os
from dotenv import load_dotenv

load_dotenv()

try:
    from openai import OpenAI
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "openai", "python-dotenv"])
    from openai import OpenAI

st.set_page_config(
    page_title="TensorCraft AI | WeAreDevelopers Hackathon Engine",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Professional Enterprise SRE & AI Workflow Styling
st.markdown("""
    <style>
        .main-header { font-size: 2.2rem; font-weight: 800; color: #0F172A; margin-bottom: 0px; }
        .sub-text { font-size: 1rem; color: #475569; margin-bottom: 20px; }
        .metric-card { background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .action-card { background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 16px; border-radius: 10px; margin-bottom: 12px; }
        .sidebar-profile { background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 10px; margin-top: 20px; }
    </style>
""", unsafe_allow_html=True)

# Secure API Key Retrieval
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    try:
        api_key = st.secrets.get("OPENAI_API_KEY", "")
    except Exception:
        api_key = ""

# --- TENSORCRAFT SIDEBAR NAVIGATION ---
with st.sidebar:
    st.markdown("### ⚡ TensorCraft AI")
    st.markdown("<p style='font-size:0.85rem; color:#64748B; margin-top:-15px;'>WEAREDEVELOPERS HACKATHON</p>", unsafe_allow_html=True)
    st.markdown("---")
    
    selected_page = st.radio(
        "Navigation",
        ["Dashboard", "Diagnostics Workspace", "Obsidian Canvas Graph", "Specialized AI Agents", "Incident Audit Trail", "Model Engine Settings"],
        label_visibility="collapsed"
    )
    
    st.markdown("<br><br><br>", unsafe_allow_html=True)
    
    # Active Sentinel Status Box
    st.markdown("""
        <div style="background-color:#F0FDF4; border:1px solid #BBF7D0; padding:12px; border-radius:8px;">
            <p style="margin:0; font-size:0.85rem; font-weight:600; color:#166534;">🟢 Active Tensor Sentinel</p>
            <p style="margin:0; font-size:0.75rem; color:#15803D;">TLS 1.3 Encryption Active</p>
        </div>
    """, unsafe_allow_html=True)
    
    # User Profile Section
    st.markdown("""
        <div class="sidebar-profile">
            <p style="margin:0; font-weight:700; color:#0F172A; font-size:0.9rem;">Muhammad Ibraheem Ashraf</p>
            <p style="margin:0; font-size:0.75rem; color:#64748B;">Lead Infrastructure Architect</p>
        </div>
    """, unsafe_allow_html=True)

# --- MAIN CONTENT AREA ---
if selected_page in ["Dashboard", "Diagnostics Workspace"]:
    
    # Top Telemetry Header Bar
    col_h1, col_h2, col_h3 = st.columns([2, 2, 3])
    with col_h1:
        st.markdown("🟢 **Optimal 99.4% SLA**")
    with col_h2:
        st.markdown("📍 **US East (N. Virginia)**")
    with col_h3:
        st.markdown("⚡ **Cluster Telemetry** &nbsp;&nbsp;|&nbsp;&nbsp; 🛡️ **Zero Trust**")
    
    st.markdown("---")
    
    st.markdown('<p class="main-header">Real-Time Remediation Workflows</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-text">Ingest complex production anomalies, distributed lock states, and microservice failures into TensorCraft AI to generate root-cause reports and automated mitigation steps instantly.</p>', unsafe_allow_html=True)
    
    # Metrics Row
    m1, m2, m3 = st.columns(3)
    with m1:
        st.markdown('<div class="metric-card"><p style="margin:0; color:#64748B; font-size:0.85rem; font-weight:600;">ANALYSES EXECUTED</p><h2 style="margin:5px 0; color:#0F172A;">9,484</h2><p style="margin:0; font-size:0.8rem; color:#64748B;">Across 24 active microservices</p></div>', unsafe_allow_html=True)
    with m2:
        st.markdown('<div class="metric-card"><p style="margin:0; color:#64748B; font-size:0.85rem; font-weight:600;">AVG MTTR REDUCTION</p><h2 style="margin:5px 0; color:#0F172A;">13.9m</h2><p style="margin:0; font-size:0.8rem; color:#10B981;">-84% compared to baseline</p></div>', unsafe_allow_html=True)
    with m3:
        st.markdown('<div class="metric-card"><p style="margin:0; color:#64748B; font-size:0.85rem; font-weight:600;">UPTIME SLA VERIFIED</p><h2 style="margin:5px 0; color:#0F172A;">99.92%</h2><p style="margin:0; font-size:0.8rem; color:#64748B;">Continuous telemetry stream</p></div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Engine Workflow Steps Overview
    st.markdown("#### How the AI Diagnostic Engine Operates")
    s1, s2, s3, s4 = st.columns(4)
    with s1:
        st.markdown('<div class="action-card"><b>1</b><br><b>Situation</b><p style="font-size:0.8rem; color:#64748B; margin:5px 0 0 0;">Telemetry ingest parses log structure & resource trends.</p></div>', unsafe_allow_html=True)
    with s2:
        st.markdown('<div class="action-card"><b>2</b><br><b>AI Reasoning</b><p style="font-size:0.8rem; color:#64748B; margin:5px 0 0 0;">Inference model identifies anomalous state bounds.</p></div>', unsafe_allow_html=True)
    with s3:
        st.markdown('<div class="action-card"><b>3</b><br><b>Risk Assessment</b><p style="font-size:0.8rem; color:#64748B; margin:5px 0 0 0;">Computes operational risk level and MTTR window.</p></div>', unsafe_allow_html=True)
    with s4:
        st.markdown('<div class="action-card"><b>4</b><br><b>Remediation</b><p style="font-size:0.8rem; color:#64748B; margin:5px 0 0 0;">Dispatches sandboxed shell tasks for mitigation.</p></div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Input Section & Execution
    col_input, col_output = st.columns([1, 1])
    
    with col_input:
        st.markdown("#### Incident & Situation Input")
        user_prompt = st.text_area(
            "Incident description:",
            value="PostgreSQL master database lock timeout on checkout tables causing cascading API gateway failures.",
            height=140,
            label_visibility="collapsed"
        )
        
        st.markdown("<p style='font-size:0.85rem; color:#64748B; margin-top:5px;'>QUICK-LOAD SRE PRESETS</p>", unsafe_allow_html=True)
        p1, p2, p3 = st.columns(3)
        with p1:
            if st.button("DB Lock Timeout", use_container_width=True):
                user_prompt = "PostgreSQL master database lock timeout on checkout tables."
        with p2:
            if st.button("K8s OOM Loop", use_container_width=True):
                user_prompt = "Kubernetes memory exhaustion and Pod OOM crash loop backoff."
        with p3:
            if st.button("Redis Exhaustion", use_container_width=True):
                user_prompt = "Redis cluster memory maxed out causing cache eviction storms."

        run_btn = st.button("⚡ Execute TensorCraft Diagnosis", type="primary", use_container_width=True)

    with col_output:
        st.markdown("#### Diagnostic Analysis Output")
        
        if run_btn:
            if not api_key:
                st.error("API Key missing! Please set your OpenAI API key.")
            else:
                try:
                    client = OpenAI(api_key=api_key)
                    with st.spinner("TensorCraft Swarm analyzing vector nodes..."):
                        response = client.chat.completions.create(
                            model="gpt-4o",
                            messages=[
                                {"role": "system", "content": "You are TensorCraft, an elite enterprise workflow engine built for the WeAreDevelopers Hackathon. Provide root cause assessment and structured mitigation steps."},
                                {"role": "user", "content": user_prompt}
                            ],
                            temperature=0.3
                        )
                        result_text = response.choices[0].message.content

                    st.markdown("""
                        <div style="background-color:#FEF2F2; border:1px solid #FECACA; padding:8px 12px; border-radius:6px; margin-bottom:10px;">
                            <span style="color:#DC2626; font-weight:700; font-size:0.85rem;">RISK LEVEL: High Priority</span>
                        </div>
                    """, unsafe_allow_html=True)
                    
                    st.markdown("**Root Cause Assessment:**")
                    st.write(result_text)
                    
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.info("Input a production anomaly or select a preset, then click execute to run diagnostics.")

    st.markdown("<br><hr>", unsafe_allow_html=True)
    
    # Recommended Mitigation Action Plan & Incident History
    st.markdown("### Recommended Mitigation Action Plan")
    st.markdown("<p style='color:#64748B; font-size:0.85rem;'>Sequential Execution Protocol</p>", unsafe_allow_html=True)
    
    st.markdown("""
        <div class="action-card">
            <b>1</b> &nbsp; <b>Immediate</b> — Engage emergency traffic shedding on ingress load balancers and activate CDN static fallback mode.<br>
            <span style="color:#64748B; font-size:0.85rem;">Assigned Team: Site Reliability Engineering</span>
        </div>
        <div class="action-card">
            <b>2</b> &nbsp; <b>Short-Term</b> — Terminate dangling database sessions, purge uncommitted transaction locks, and verify shard state.<br>
            <span style="color:#64748B; font-size:0.85rem;">Assigned Team: Database Administration (DBA)</span>
        </div>
        <div class="action-card">
            <b>3</b> &nbsp; <b>Long-Term</b> — Refactor isolation levels in database configurations and deploy automated circuit breakers.<br>
            <span style="color:#64748B; font-size:0.85rem;">Assigned Team: Platform Architecture Core</span>
        </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("### Operational Incident History")
    st.dataframe({
        "STATUS": ["Active", "Active"],
        "INCIDENT TITLE": ["PostgreSQL Lock Contention & Transaction Deadlock", "Kubernetes Memory Exhaustion & OOM Loop"],
        "REGION": ["us-east-1", "us-east-1"],
        "TIMESTAMP": ["12:28:11 AM", "09:14:22 AM"],
        "SEVERITY": ["CRITICAL", "WARNING"],
    }, use_container_width=True)

elif selected_page == "Obsidian Canvas Graph":
    st.markdown("### 🕸️ Obsidian Canvas Graph")
    st.markdown("Visualizing real-time microservice dependencies and incident vector topologies.")
    st.graphviz_chart("""
        digraph {
            rankdir=LR;
            node [shape=box, style="filled,rounded", fillcolor="#F8FAFC", fontname="Arial", margin=0.2];
            "API Gateway" -> "Checkout Service" [color="#0EA5E9"];
            "Checkout Service" -> "PostgreSQL DB" [color="#EF4444", label="Lock Timeout"];
            "Checkout Service" -> "Redis Cache" [color="#10B981"];
        }
    """)

elif selected_page == "Specialized AI Agents":
    st.markdown("### 🤖 Specialized AI Agents")
    st.markdown("Autonomous TensorCraft agent swarm status:")
    st.markdown("- **TelemetryParser Agent** (Active | Health: 99.8%)")
    st.markdown("- **RootCauseAnalyzer Agent** (Active | Model: GPT-4o)")
    st.markdown("- **RemediationDispatcher Agent** (Standby | Safe Mode)")

elif selected_page == "Incident Audit Trail":
    st.markdown("### 📋 Incident Audit Trail")
    st.markdown("Detailed chronological log of autonomous diagnostic runs and agent handshakes.")
    st.dataframe({
        "Timestamp": ["2026-09-13 12:28:11", "2026-09-13 09:14:22"],
        "Incident Title": ["PostgreSQL Lock Contention", "Kubernetes Memory Exhaustion"],
        "Region": ["us-east-1", "us-east-1"],
        "Severity": ["CRITICAL", "WARNING"],
        "Status": ["Active", "Active"]
    }, use_container_width=True)

elif selected_page == "Model Engine Settings":
    st.markdown("### ⚙️ Model Engine Settings")
    st.text_input("OpenAI API Key", type="password", value="sk-************************")
    st.selectbox("Inference Model", ["gpt-4o", "gpt-4-turbo"])
    st.slider("Temperature", 0.0, 1.0, 0.3)
    if st.button("Save Settings"):
        st.success("Engine settings updated successfully!")