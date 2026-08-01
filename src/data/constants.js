// Dummy data & constants for Buysell Project
export const MAIN_BRANCH = {
  id: "BSL",
  name: "BSL Main Branch",
  code: "BSL",
  description: "Root repository branch for Buysell Project SDLC",
};

export const EPICS = [
  {
    id: "BSL-EPIC-1",
    key: "BSL-EPIC-1",
    title: "Trade Order Matching Engine",
    description: "Core high-frequency price-time limit & market order execution service",
    color: "#7C3AED",
    bg: "bg-purple-100",
    border: "border-purple-200",
    text: "text-purple-700",
    badgeBg: "#FAF5FF",
  },
  {
    id: "BSL-EPIC-2",
    key: "BSL-EPIC-2",
    title: "Trader UI & Candlestick Charts",
    description: "Frontend interactive trading dashboard, order book, and real-time chart widgets",
    color: "#EC4899",
    bg: "bg-pink-100",
    border: "border-pink-200",
    text: "text-pink-700",
    badgeBg: "#FDF2F8",
  },
  {
    id: "BSL-EPIC-3",
    key: "BSL-EPIC-3",
    title: "Wallet & Fiat Onramp Gateway",
    description: "Trader wallet balance management, deposit/withdrawal integrations, and KYC",
    color: "#059669",
    bg: "bg-emerald-100",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badgeBg: "#F0FDF4",
  },
  {
    id: "BSL-EPIC-4",
    key: "BSL-EPIC-4",
    title: "Security Audit & Compliance",
    description: "QA automated testing, vulnerability scan, and regulatory audit compliance",
    color: "#2563EB",
    bg: "bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-700",
    badgeBg: "#EFF6FF",
  },
];

export const TEAM_MEMBERS = [
  { id: "u1", name: "Haroshin", role: "Lead Developer & UI/UX", avatar: "HK", color: "#7C3AED" },
  { id: "u2", name: "Arjun PK", role: "BA & Lead DevOps",       avatar: "AP", color: "#EC4899" },
];

export const COLUMNS = [
  { id: "ba_requirements", title: "1. BA Specs",        emoji: "💡", color: "#7C3AED", bgColor: "#FAF5FF", borderColor: "#E9D5FF" },
  { id: "ui_ux_design",   title: "2. UI/UX Design",    emoji: "🎨", color: "#EC4899", bgColor: "#FDF2F8", borderColor: "#FBCFE8" },
  { id: "in_development", title: "3. Developer (Dev)", emoji: "⚙️", color: "#D97706", bgColor: "#FFFBEB", borderColor: "#FDE68A" },
  { id: "qa_testing",     title: "4. QA & Testing",    emoji: "🧪", color: "#2563EB", bgColor: "#EFF6FF", borderColor: "#BFDBFE" },
  { id: "deployed_live",  title: "5. Live / Released", emoji: "🚀", color: "#059669", bgColor: "#F0FDF4", borderColor: "#A7F3D0" },
];

export const CYCLES = [
  { id: "all",     name: "All Cycles",      range: "All Time",              status: "all" },
  { id: "cycle-1", name: "Cycle 1",         range: "Jul 01 – Jul 14, 2026", status: "completed", goal: "Auth & Core Wallet Architecture" },
  { id: "cycle-2", name: "Cycle 2 (Active)",range: "Jul 15 – Jul 29, 2026", status: "active",    goal: "Order Matching Engine & Trading UI" },
  { id: "cycle-3", name: "Cycle 3",         range: "Jul 30 – Aug 12, 2026", status: "upcoming",  goal: "Realtime WebSockets & Slippage QA" },
  { id: "cycle-4", name: "Cycle 4",         range: "Aug 13 – Aug 27, 2026", status: "upcoming",  goal: "Fiat Onramp & KYC Verification" },
];

export const ALL_LABELS = [
  "Requirements","Design","Backend","Trading Engine","API","Database",
  "QA Testing","Compliance","Mobile","Security","Performance","Bug","Feature",
];

export const LABEL_COLORS = {
  Requirements:    "bg-purple-100 text-purple-700",
  Design:          "bg-pink-100 text-pink-700",
  Backend:         "bg-slate-100 text-slate-700",
  "Trading Engine":"bg-amber-100 text-amber-800",
  API:             "bg-cyan-100 text-cyan-700",
  Database:        "bg-orange-100 text-orange-700",
  "QA Testing":    "bg-blue-100 text-blue-700",
  Compliance:      "bg-emerald-100 text-emerald-700",
  Mobile:          "bg-teal-100 text-teal-700",
  Security:        "bg-red-100 text-red-700",
  Performance:     "bg-yellow-100 text-yellow-700",
  Bug:             "bg-rose-100 text-rose-700",
  Feature:         "bg-indigo-100 text-indigo-700",
};

export const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500"    },
  high:     { label: "High",     color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  medium:   { label: "Medium",   color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500" },
  low:      { label: "Low",      color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-400"   },
};

export const LOB_OPTIONS = [
  "Spot Trading",
  "Margin & Futures",
  "Fiat Wallet & Onramp",
  "Market Data WebSockets",
  "Security & Compliance",
  "Risk Management Engine",
];

export const PI_OPTIONS = [
  "PI 2026-Q3 (Active)",
  "PI 2026-Q4",
  "PI 2027-Q1",
];

export const FIX_VERSIONS = [
  "BSL-v1.2-MVP2A",
  "BSL-v1.5-Release",
  "BSL-v2.0-Prod",
];

export const INITIAL_TASKS = [];
