// ─────────────────────────────────────────────────────────────
//  Edit this file to change what the portfolio shows.
//  Everything else reads from here.
// ─────────────────────────────────────────────────────────────

window.SITE = {
  name: ["ANSHUL", "PANIGRAHI"],
  role: "AI engineer building LLM products and tool-using agents.",
  resume: "https://github.com/burntcookiedough/burntcookiedough/blob/main/Anshul_Panigrahi.pdf",
  email: "anshulpanigrahi3678@gmail.com",
  linkedin: "https://linkedin.com/in/anshul-panigrahi22",
  github: "https://github.com/burntcookiedough",
  nowBuilding: "Hermes Agent + custom tool harness",
};

// Order = order on the street. height: 0–1, how tall the tower stands.
// crown: "spire" | "step" | "flat" | "antenna" | "dome"
window.PROJECTS = [
  {
    name: "EVE",
    full: "Eve — Windows Dictation",
    track: "AI PRODUCT / SPEECH",
    blurb:
      "Hold a hotkey, speak, and your words land wherever you were typing. A shipped desktop app with offline speech recognition, a live overlay, searchable history and CPU/GPU fallback.",
    why: "Getting the model, the desktop runtime, session state and release packaging to behave as one product.",
    stack: ["Faster-Whisper", "Electron", "TypeScript", "Python", "WebSocket"],
    stat: "★ 11",
    links: [
      { label: "Repo", href: "https://github.com/burntcookiedough/eve-windows-dictation" },
      { label: "Site", href: "https://burntcookiedough.github.io/eve-windows-dictation/" },
    ],
    height: 1,
    crown: "spire",
  },
  {
    name: "SUPPORT",
    full: "Customer Support Agents",
    track: "AGENTS / LANGGRAPH",
    blurb:
      "A LangGraph system that classifies tickets, routes them to specialist agents, retrieves from a RAG store, remembers customers in SQLite and gates risky actions behind human approval.",
    why: "A supervisor node checks every answer, and refunds or cancellations wait for a human.",
    stack: ["LangGraph", "RAG", "SQLite", "Python"],
    stat: "5 agents",
    links: [{ label: "Repo", href: "https://github.com/burntcookiedough/abc-customer-support-langgraph" }],
    height: 0.88,
    crown: "antenna",
  },
  {
    name: "STELLA",
    full: "Stella — Health Analytics",
    track: "LLM PRODUCT",
    blurb:
      "Health analytics over wearable exports: FastAPI, React + Vite, DuckDB, and an Ollama-backed LLM layer for chat and reports that degrades cleanly to metrics-only.",
    why: "The LLM is a feature, not a dependency. The product still works when the model isn't there.",
    stack: ["FastAPI", "React", "DuckDB", "Ollama"],
    stat: "★ 1",
    links: [{ label: "Repo", href: "https://github.com/burntcookiedough/Stella" }],
    height: 0.78,
    crown: "step",
  },
  {
    name: "CLADS",
    full: "Cognitive Load-Aware Scheduler",
    track: "HUMAN-AWARE SYSTEMS",
    blurb:
      "Routes work using both machine state and a live Cognitive Load Score from typing variance, idle time and context switches, with flow-state protection and a baseline comparison.",
    why: "Optimises the human + machine system, not just the infrastructure. Patented.",
    stack: ["Python", "Telemetry", "Scheduling", "Analytics"],
    stat: "Patent",
    links: [{ label: "Repo", href: "https://github.com/burntcookiedough/Cognitive-Load-Aware-Distributed-Task-Scheduler" }],
    height: 0.84,
    crown: "dome",
  },
  {
    name: "PREDICT",
    full: "Real-Time Predictive Maintenance",
    track: "ML SYSTEMS / STREAMING",
    blurb:
      "Kafka, Spark, Cassandra, PyTorch and graph analytics across 5,000 simulated machines: streaming anomaly detection plus cascade-failure analysis and constrained mitigation.",
    why: "Model output is wired into a live data path and downstream decisions, not left in a notebook.",
    stack: ["Kafka", "Spark", "Cassandra", "PyTorch"],
    stat: "5,000 machines",
    links: [],
    note: "Private repo · available on request",
    height: 0.9,
    crown: "step",
  },
  {
    name: "MODES",
    full: "Physically-Bounded Mode Discovery",
    track: "UNSUPERVISED ML / RESEARCH",
    blurb:
      "HDBSCAN proposes operating regimes on NASA CMAPSS and CWRU while physics constraints reject implausible clusters.",
    why: "A cluster isn't accepted because a metric likes it. It also has to make physical sense.",
    stack: ["HDBSCAN", "scikit-learn", "Python"],
    stat: "0 labels",
    links: [{ label: "Repo", href: "https://github.com/burntcookiedough/Physical-Bounded-Multimodal-Mode-Discovery" }],
    height: 0.66,
    crown: "flat",
  },
  {
    name: "VERI·DOSE",
    full: "Veri-Dose",
    track: "APPLIED ML / PATENTED",
    blurb:
      "Medication verification with a quantized MobileNetV2 that knows when it's unsure: low-confidence predictions go to a human instead of pretending certainty.",
    why: "Calibrated confidence and a fallback path, built into the product. Patent IN202641027860 A1.",
    stack: ["MobileNetV2", "TFLite", "Calibration", "Python"],
    stat: "Patent",
    links: [
      { label: "App", href: "https://github.com/burntcookiedough/Veridose" },
      { label: "ML pipeline", href: "https://github.com/burntcookiedough/veridose-Ml" },
    ],
    height: 0.72,
    crown: "antenna",
  },
  {
    name: "SECURE",
    full: "SecureTorrent",
    track: "SECURITY / ML",
    blurb:
      "Malware-aware torrent security: YARA rules, a hybrid ML detector, qBittorrent integration and an API test suite.",
    why: "Signatures catch the known threats and the model covers the rest.",
    stack: ["YARA", "scikit-learn", "FastAPI"],
    stat: "hybrid",
    links: [{ label: "Repo", href: "https://github.com/burntcookiedough/SecureTorrent" }],
    height: 0.6,
    crown: "flat",
  },
];

window.SIGNALS = [
  { big: "03", label: "Published patents", sub: "Medication verification · cognitive-load scheduling · secure sensing" },
  { big: "WIN", label: "IEEE CS Hackathon 2025", sub: "Also a Yantra Central Hackathon finalist" },
  { big: "26,419", label: "Images · Brandworks", sub: "AI/ML intern: built a 9-stage data pipeline and trained YOLOv8s across 8 categories" },
  { big: "11★", label: "Stars on Eve", sub: "A shipped desktop AI product, released and maintained in the open" },
];

window.CREDENTIALS = ["IBM Agentic AI", "NVIDIA DLI Deep Learning", "Oracle OCI AI Foundations"];
