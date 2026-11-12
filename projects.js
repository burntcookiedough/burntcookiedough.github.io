// ─────────────────────────────────────────────────────────────
//  Edit this file to change what the portfolio shows.
//  Everything else reads from here.
// ─────────────────────────────────────────────────────────────

window.SITE = {
  name: ["ANSHUL", "PANIGRAHI"],
  role: "AI engineer building LLM products and tool-using agents.",
  resume: "https://drive.google.com/file/d/19As7v83n54BxIKbTP4S1Tt3fajsoTIfs/view?usp=sharing",
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
    stack: ["YARA", "scikit-learn", "Flask"],
    stat: "hybrid",
    links: [{ label: "Repo", href: "https://github.com/burntcookiedough/SecureTorrent" }],
    height: 0.6,
    crown: "flat",
  },
];

window.SIGNALS = [
  { big: "03", label: "Published patents", docs: true, sub: "Medication verification · cognitive-load scheduling · zero-trust enclave" },
  { big: "MERGED", label: "Open source · Repowise, 8.1k★", sub: "Fixed incremental updates that silently read no stored data under a configured database, with regression tests" },
  { big: "2ND", label: "IEEE CS Hackathon 2025", sub: "Second place with SpineGuard. Also a Yantra Central Hackathon finalist" },
  { big: "26,419", label: "Images · Brandworks", sub: "AI/ML intern: built a 9-stage data pipeline and trained YOLOv8s across 8 categories" },
  { big: "11★", label: "Stars on Eve", sub: "A shipped desktop AI product, released and maintained in the open" },
];

window.CREDENTIALS = ["IBM Agentic AI", "NVIDIA DLI Deep Learning", "Oracle OCI AI Foundations"];

// The plain-text profile that search engines, AI agents and recruiter tools read
// (llms.txt, profile.md, resume.json, structured data). Not shown in the scenes.
// After editing anything in this file, run: node tools/agent-files.mjs
window.PROFILE = {
  url: "https://burntcookiedough.github.io/",
  title: "Anshul Panigrahi | AI Engineer, LLM products and agents",
  headline: "AI engineer building LLM products and tool-using agents",
  summary:
    "Information Technology undergraduate at VIT who ships AI products end to end: on-device speech, LLM analytics that still work without the model, multi-agent support systems with human approval gates. Co-inventor on three published Indian patent applications. Looking for AI engineering internships with product teams shipping LLM features, agents and tool use.",
  location: "Vellore, India",
  // an MCP server any AI assistant can add to ask about this profile
  mcp: { repo: "https://github.com/burntcookiedough/anshul-portfolio-mcp", add: "claude mcp add anshul -- npx -y github:burntcookiedough/anshul-portfolio-mcp" },
  seeking: "AI engineering internships: LLM features, agents and tool use, and the systems that keep them reliable",
  education: [
    { school: "Vellore Institute of Technology", place: "Vellore, India", degree: "B.Tech in Information Technology", start: "2023", end: "2027 (expected)", note: "CGPA 8.74/10" },
  ],
  experience: [
    {
      org: "Brandworks Technologies Private Limited",
      role: "AI/ML Intern",
      start: "2026-05",
      end: "2026-07",
      points: [
        "Engineered a nine-stage data-quality pipeline for 26,419 images across 8 fruit classes: label normalization, perceptual-hash leakage checks, annotation filtering and training-set balancing.",
        "Trained YOLOv8s for 120 epochs; 80.4% precision and 66.2% mAP@50 on 4,728 holdout images; diagnosed domain-shift failures on a separate 155-image synthetic webcam stress set.",
      ],
    },
  ],
  skills: {
    Languages: ["Python", "C++", "SQL", "TypeScript"],
    "Applied AI": ["Context engineering", "Prompt engineering", "Structured outputs", "LLM APIs", "Ollama"],
    "Agent tooling": ["Claude Code", "Codex", "OpenCode", "Hermes Agent", "LangGraph"],
    "Machine learning": ["PyTorch", "YOLO", "OpenCV", "Faster-Whisper", "CUDA"],
    "Backend and delivery": ["FastAPI", "DuckDB", "SQLite", "Docker", "GitHub Actions", "Pytest"],
  },
  openSource: [
    {
      repo: "repowise-dev/repowise",
      about: "codebase intelligence for AI agents and humans over MCP, 8.1k stars",
      title: "fix(update): read stored health data from a configured database",
      url: "https://github.com/repowise-dev/repowise/pull/5399",
      merged: "2026-11-12",
      summary: "With the database configured through REPOWISE_DB_URL, four incremental loaders still checked for a repo-local .repowise/wiki.db that is absent by design, so every incremental update read no stored git metadata, callers or coverage. Gated them on the configured store instead; one regression test per loader fails on main and passes with the fix, and the 738 tests touching these loaders still pass. Fixes issue #2406.",
    },
  ],
  achievements: [
    { what: "2nd place, IEEE CS Hackathon", when: "2025-09", note: "Co-developed SpineGuard in a 5-member team" },
    { what: "Finalist, Yantra Central Hackathon", when: "2025-02", note: "Fingerprint spoofing detection" },
  ],
  certifications: [
    { name: "Building Agents with Agentic AI", by: "IBM Career Education", when: "2026-07" },
    { name: "Getting Started with Deep Learning", by: "NVIDIA Deep Learning Institute", when: "2026-03" },
    { name: "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate", by: "Oracle", when: "2026-03" },
  ],
};

// Patent filings shown as a paper stack in the hallway. A filing without `pages`
// shows as a blank sheet until its document is added (run the render script, set pages).
window.PATENTS = [
  {
    title: "Medication dispenser with on-device user authentication and medication verification",
    short: "Medication verification",
    number: "IN202641027860 A1",
    application: "202641027860",
    filed: "10.03.2026",
    published: "20.03.2026",
    journal: "12/2026",
    office: "Intellectual Property Office, India",
    applicant: "Vellore Institute of Technology",
    inventors: ["Chemmalar Selvi G", "Anshul Panigrahi", "Parth Surendra Sharma"],
    plain: "A pill dispenser that recognises the patient's face, releases only their dose, then checks the pill with an on-device classifier before it is taken. Nothing leaves the device.",
    facts: ["627 KB INT8 MobileNetV2", "2.97 ms inference on CPU", "Face to verified dose in under 5 s on a Raspberry Pi 4"],
    dir: "patents/01",
    pdf: "patents/01/IN202641027860A1.pdf",
    pages: 30,
  },
  {
    title: "Cognitive load-aware distributed task scheduling using hardware-bound processing control and predictive task migration",
    short: "Cognitive-load scheduling",
    number: "IN202641088096 A1",
    application: "202641088096",
    filed: "19.07.2026",
    published: "24.07.2026",
    journal: "30/2026",
    office: "Intellectual Property Office, India",
    applicant: "Vellore Institute of Technology",
    inventors: ["Senthil Kumar T", "Shagun Khandelwal", "Sarthak Singhal", "Advika Pundir", "Anshul Panigrahi"],
    plain: "A scheduler that reads how hard you are concentrating from keyboard, mouse and app-switching patterns, then holds back, slows or moves disruptive work to other machines until you surface.",
    facts: ["Cognitive Load Score with no wearables or sensors", "Defers, throttles or migrates tasks across nodes", "Predicts focus breaches and moves work ahead of time"],
    dir: "patents/02",
    pdf: "patents/02/IN202641088096A1.pdf",
    pages: 25,
  },
  {
    title: "Zero-trust physical enclave security using continuous biometric entropy and RF-based perimeter monitoring",
    short: "Zero-trust enclave",
    number: "IN202641067209 A1",
    application: "202641067209",
    filed: "29.05.2026",
    published: "05.06.2026",
    journal: "23/2026",
    office: "Intellectual Property Office, India",
    applicant: "Vellore Institute of Technology",
    inventors: ["Thanga Mariappan L", "Anshul Panigrahi", "Aryan Saxena", "Yash Bajpai"],
    plain: "A workstation that stays unlocked only while a live pulse is present and no unknown radio is nearby. Lose either, and the session keys are destroyed on the spot.",
    facts: ["Session keys from live PPG pulse entropy, SHA-3", "Keys wiped when presence drops or an RF emitter appears", "Screen falls to static the moment a session ends"],
    dir: "patents/03",
    pdf: "patents/03/IN202641067209A1.pdf",
    pages: 16,
  },
];
