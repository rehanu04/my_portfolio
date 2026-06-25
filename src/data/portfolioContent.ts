// ─────────────────────────────────────────────────────────────────────────────
// src/data/portfolioContent.ts
//
// SINGLE SOURCE OF TRUTH for all textual content rendered by the portfolio.
// Edit this file freely — it has zero coupling to the WebGL runtime.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  TimelineEntry,
  Project,
  TechTag,
  SystemMetric,
  ProjectStatus,
} from '../types'

// ─── Identity ────────────────────────────────────────────────────────────────

export const IDENTITY = {
  displayName:  'MOHAMMED REHAN',
  labHandle:    'MASTER R LABS //',
  titleLine:    'Senior Principal Systems Architect & Agentic Orchestrator',
  shortTitle:   'AI / ML ENGINEER',
  systemTag:    'sys::portfolio_v3.0 — ONLINE',
  bio:
    'Architecting high-fidelity mobile systems, multi-agent orchestration networks, and resource-efficient edge-native AI applications.',
  bioHighlights: [
    'high-fidelity mobile systems',
    'multi-agent orchestration networks',
    'resource-efficient edge-native AI',
  ],
  heroMetrics: [
    { label: 'SYSTEMS',    value: '04' },
    { label: 'UPTIME',     value: '99.9%' },
    { label: 'STACK DEPTH', value: '12+' },
  ],
  profileTags: ['AI / ML ENGINEER', 'MOBILE ARCHITECT', 'EDGE AI', 'AGENT SYSTEMS'],
} as const

// ─── Navigation ──────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: 'command-deck',    label: 'COMMAND DECK', section: 'hero'       as const },
  { id: 'system-arch-log', label: 'ARCH LOG',     section: 'experience' as const },
  { id: 'master-vault',    label: 'VAULT',         section: 'projects'   as const },
  { id: 'secure-uplink',   label: 'UPLINK',        section: 'contact'    as const },
]

// ─── Experience Timeline ──────────────────────────────────────────────────────

export const TIMELINE: TimelineEntry[] = [
  {
    id: '01',
    period: '2023 — PRESENT',
    role: 'AI/ML Engineer & Software Architect',
    organization: 'Master R Labs',
    description:
      'Designing and shipping production-grade native Android systems with integrated agentic AI workflows. Specialisms include Kotlin/Jetpack Compose application architecture, multi-source real-time data synchronisation with Supabase and SharedFlow, autonomous voice-driven orchestration, and high-performance system optimisation across constrained hardware targets.',
    tags: ['Native Android', 'Agentic Workflows', 'System Optimisation', 'Kotlin', 'AI/ML'],
  },
  {
    id: '02',
    period: '2022 — 2023',
    role: 'Mobile & Full-Stack Engineer',
    organization: 'Independent Ventures',
    description:
      'Architected scalable Flutter education platforms and Android applications with advanced offline-first state management. Built backend services interfacing Firebase and Supabase with robust real-time listener patterns, lifecycle-aware coroutine scopes, and structured caching strategies for high-throughput workloads.',
    tags: ['Flutter', 'Kotlin', 'Firebase', 'Supabase', 'Offline-First'],
  },
  {
    id: '03',
    period: '2021 — 2022',
    role: 'Computer Science Engineer — AI/ML Track',
    organization: 'Academic Research Division',
    description:
      'Deep focus on machine learning model optimisation and on-device inference pipelines. Research into resource-efficient neural architectures for constrained edge hardware, TensorFlow Lite deployment patterns, and INT8 quantisation benchmarking for mobile targets.',
    tags: ['TensorFlow Lite', 'Edge Inference', 'Model Optimisation', 'Research'],
  },
  {
    id: '04',
    period: '2020 — 2021',
    role: 'Systems Engineering Foundation',
    organization: 'Engineering Foundation',
    description:
      'Built foundational competencies in data pipeline engineering, RESTful API design, Python ecosystem tooling, CI/CD integration, and containerised deployment workflows — the systems-engineering bedrock underlying all subsequent mobile and AI work.',
    tags: ['Python', 'Docker', 'CI/CD', 'API Design', 'Automation'],
  },
]

export const ACADEMIC_FOOTER = {
  label:  'ACADEMIC FOUNDATION',
  degree: 'B.S. Computer Science — AI / ML Specialisation',
  tracks: 'Core tracks: Machine Learning · Native Mobile Architecture · System Design · Agentic Workflow Engineering',
} as const

// ─── Project Registry ─────────────────────────────────────────────────────────

function ts(name: string, category: TechTag['category']): TechTag {
  return { name, category }
}
function m(label: string, value: string | number, unit = ''): SystemMetric {
  return { label, value, unit }
}

export const PROJECTS: Project[] = [
  {
    id:          'hiresphere',
    codename:    'PROJ::001',
    title:       'HireSphere',
    description:
      'Native Android AI career platform built on a dual-source data architecture: offline local caches (Room DB) vs. Supabase real-time streams via SharedFlow with WhileSubscribed lifecycle collectors. Features an automated, multi-turn voice interview engine backed by an agentic reasoning pipeline and integrated resume parsing.',
    category:    'Native Android · AI Platform',
    techStack:   [
      ts('Kotlin',          'mobile'),
      ts('Jetpack Compose', 'mobile'),
      ts('Supabase',        'infra'),
      ts('SharedFlow',      'mobile'),
      ts('Gemini AI',       'ai'),
      ts('Room DB',         'infra'),
    ],
    metrics: [
      m('Architecture',   'Master Vault'),
      m('Sync',           'Dual-Source'),
      m('Interviews',     'Real-Time Voice'),
    ],
    status: 'ACTIVE' as ProjectStatus,
  },
  {
    id:          'virasat-nama',
    codename:    'PROJ::002',
    title:       'Virasat Nama Guide',
    description:
      'Comprehensive, highly scalable education ecosystem optimised for complex IELTS examination workflows. Delivers adaptive learning pathways, granular performance analytics, and an offline-first architecture that keeps learners productive without network connectivity.',
    category:    'EdTech · Education Ecosystem',
    techStack:   [
      ts('Flutter',   'mobile'),
      ts('Dart',      'mobile'),
      ts('Firebase',  'infra'),
      ts('Hive DB',   'infra'),
      ts('Provider',  'mobile'),
    ],
    metrics: [
      m('Target',        'IELTS'),
      m('Architecture',  'Offline-First'),
      m('Scale',         'Ecosystem'),
    ],
    status: 'DEPLOYED' as ProjectStatus,
  },
  {
    id:          'aegis',
    codename:    'PROJ::003',
    title:       'AEGIS',
    description:
      'High-fidelity interactive diagnostic platform built for evaluating specialised system performance frameworks. Features configurable assessment pipeline nodes, real-time result streaming, and a rubric-driven scoring engine designed for structured diagnostic workflows at production scale.',
    category:    'Diagnostic · Evaluation Engine',
    techStack:   [
      ts('Python',     'backend'),
      ts('FastAPI',    'backend'),
      ts('React',      'frontend'),
      ts('TypeScript', 'frontend'),
      ts('Docker',     'infra'),
    ],
    metrics: [
      m('Type',      'Diagnostic'),
      m('Pipeline',  'Configurable'),
      m('Results',   'Real-Time'),
    ],
    status: 'OPERATIONAL' as ProjectStatus,
  },
  {
    id:          'jarvis',
    codename:    'PROJ::004',
    title:       'Jarvis System Agent',
    description:
      'Autonomous system-level orchestrator designed to manage local voice streams, system commands, and persistent state feedback loops. Interprets natural language instructions, dispatches OS-level subprocess operations, and maintains self-healing retry logic with configurable wake-word detection.',
    category:    'AI Agent · System Orchestrator',
    techStack:   [
      ts('Python',  'backend'),
      ts('Whisper', 'ai'),
      ts('Ollama',  'ai'),
      ts('PyAudio', 'backend'),
      ts('pyttsx3', 'ai'),
    ],
    metrics: [
      m('Interface',  'Voice'),
      m('Execution',  'OS-Level'),
      m('Loop Mode',  'Autonomous'),
    ],
    status: 'OPERATIONAL' as ProjectStatus,
  },
]

// ─── Contact / Uplink ─────────────────────────────────────────────────────────

export const UPLINK_META = {
  sectionTag: 'sys::uplink — SECTION_04',
  headline1:  'SECURE',
  headline2:  'UPLINK',
  subtext:    'Encrypted professional communications array. Direct channels for high-signal executive outreach.',
  footerLine: '© 2025 MOHAMMED REHAN — ALL SYSTEMS OPERATIONAL',
} as const

export const UPLINK_CHANNELS = [
  {
    id:       'linkedin',
    label:    'LINKEDIN',
    sublabel: 'Professional Network',
    href:     'https://www.linkedin.com/in/rehanu04/',
    external: true,
  },
  {
    id:       'email',
    label:    'DIRECT CHANNEL',
    sublabel: 'Corporate Email',
    href:     'mailto:contact@masterrlabs.com',
    external: false,
  },
  {
    id:       'github',
    label:    'GITHUB',
    sublabel: 'Source Repository',
    href:     'https://github.com/rehanu04',
    external: true,
  },
] as const
