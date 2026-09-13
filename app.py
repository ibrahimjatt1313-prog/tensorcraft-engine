import streamlit as st
import requests

st.set_page_config(
    page_title="TensorCraft AI Workflow Engine",
    page_icon="⚡",
    layout="wide"
)

# Custom Styling
st.markdown("""
    <style>
    .main-title { font-size: 32px; font-weight: 700; color: #2E4053; }
    .sub-title { font-size: 16px; color: #566573; }
    </style>
""", unsafe_allow_html=True)

st.markdown('<p class="main-title">⚡ TensorCraft: Enterprise AI Workflow Automation</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-title">Automate complex enterprise pipelines using intelligent multi-agent orchestration.</p>', unsafe_allow_html=True)
st.markdown("---")

# Sidebar
st.sidebar.header("Workflow Settings")
connector_type = st.sidebar.selectbox("Select Data Connector", ["PostgreSQL DB", "Salesforce CRM", "Internal Notion Docs", "REST API"])
execution_mode = st.sidebar.radio("Execution Mode", ["Autonomous Agent", "Step-by-Step Manual Review"])

# Main Input Section
user_prompt = st.text_area(
    "Enter your workflow objective:",
    placeholder="e.g., Extract weekly sales data, analyze growth anomalies, and generate an executive report."
)

if st.button("🚀 Run Workflow", type="primary"):
    if not user_prompt.strip():
        st.warning("Please enter a valid workflow objective.")
    else:
        with st.spinner("TensorCraft AI is orchestrating your workflow..."):
            try:
                # Call FastAPI backend
                response = requests.post(
                    "http://127.0.0.1:8000/run-workflow",
                    json={"prompt": user_prompt}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    st.success("Workflow executed successfully!")
                    
                    st.subheader("📊 Execution Trace & Steps")
                    for step in data["workflow_steps"]:
                        with st.expander(f"Step {step['step']}: {step['action']} [{step['status']}]"):
                            st.write(step["details"])
                            
                    st.markdown("---")
                    st.subheader("📝 Final Generated Output")
                    st.markdown(data["final_output"])
                else:
                    st.error(f"Server Error: {response.text}")
            except requests.exceptions.ConnectionError:
                st.error("Could not connect to the backend server. Make sure FastAPI (`main.py`) is running on port 8000!")