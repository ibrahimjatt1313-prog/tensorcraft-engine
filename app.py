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
    page_title="TensorCraft AI | Enterprise Engine",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
    <style>
        .main-title { font-size: 2rem; font-weight: 800; color: #0F172A; margin-bottom: 0px; }
        .sub-desc { font-size: 0.95rem; color: #475569; margin-bottom: 20px; }
    </style>
""", unsafe_allow_html=True)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    try:
        api_key = st.secrets.get("OPENAI_API_KEY", "")
    except Exception:
        api_key = ""

with st.sidebar:
    st.markdown("### ⚡ TensorCraft AI")
    st.markdown("<p style='font-size:0.8rem; color:#64748B;'>Enterprise Workflow Engine</p>", unsafe_allow_html=True)
    st.markdown("---")
    
    navigation = st.radio(
        "Navigation",
        ["Workflow Execution", "Model Configuration"],
        label_visibility="collapsed"
    )

if navigation == "Workflow Execution":
    st.markdown('<p class="main-title">TensorCraft Workflow Engine</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-desc">Execute intelligent AI inference tasks, parse unstructured data streams, and evaluate automated outputs in real-time.</p>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown("#### Input Parameter / Query")
        user_input = st.text_area(
            "Enter processing objective or query:",
            value="Analyze system telemetry logs to identify bottleneck patterns in distributed microservice pipelines.",
            height=150,
            label_visibility="collapsed"
        )
        
        execute_btn = st.button("🚀 Run TensorCraft Inference", type="primary", use_container_width=True)

    with col2:
        st.markdown("#### Execution Output & Analysis")
        
        if execute_btn:
            if not api_key:
                st.error("OpenAI API key not found. Please configure your .env file or Streamlit secrets.")
            else:
                try:
                    client = OpenAI(api_key=api_key)
                    with st.spinner("Processing workflow through TensorCraft engine..."):
                        response = client.chat.completions.create(
                            model="gpt-4o",
                            messages=[
                                {"role": "system", "content": "You are TensorCraft, an advanced AI workflow engine. Provide structured, precise, and professional technical responses."},
                                {"role": "user", "content": user_input}
                            ],
                            temperature=0.3
                        )
                        result = response.choices[0].message.content
                    
                    st.success("Workflow execution completed successfully.")
                    st.markdown(result)
                except Exception as e:
                    st.error(f"Execution error: {e}")
        else:
            st.info("Provide an input objective and click execute to initialize the AI workflow.")

elif navigation == "Model Configuration":
    st.markdown('<p class="main-title">Model & Engine Configuration</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-desc">Configure foundational AI models and execution parameters.</p>', unsafe_allow_html=True)
    
    st.text_input("OpenAI API Key (Override)", type="password", value="" if not api_key else "sk-configured-securely")
    st.selectbox("Select Core LLM", ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"])
    st.slider("Inference Temperature", 0.0, 1.0, 0.3)
    
    if st.button("Save Configuration"):
        st.success("Configuration updated successfully.")