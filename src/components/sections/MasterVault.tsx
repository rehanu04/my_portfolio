import { type RefObject, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import ProjectCard from '../ui/ProjectCard'
import type { Project } from '../../types'

// ─── Ground-Truth Project Registry ───────────────────────────────────────
// No hallucinated percentages. Metrics surface factual architectural signals
// only — no artificial benchmark scores or invented processing times.

const PROJECTS: Project[] = [
  {
    id: 'hiresphere',
    codename: 'PROJ::001',
    title: 'HireSphere',
    description:
      'Flagship native Android AI career platform. Features a Master Vault architecture with dual-source data synchronisation: offline local cache vs. Supabase real-time streams via SharedFlow and WhileSubscribed lifecycle collectors. Integrates an automated real-time voice interview system backed by an agentic reasoning pipeline.',
    category: 'Native Android · AI Platform',
    techStack: [
      { name: 'Kotlin',     category: 'mobile'   },
      { name: 'Jetpack Compose', category: 'mobile' },
      { name: 'Supabase',   category: 'infra'    },
      { name: 'SharedFlow', category: 'mobile'   },
      { name: 'Gemini AI',  category: 'ai'       },
      { name: 'Room DB',    category: 'infra'    },
    ],
    metrics: [
      { label: 'Architecture',  value: 'Master Vault', unit: '' },
      { label: 'Sync Sources',  value: 'Dual',         unit: '' },
      { label: 'Interview Mode', value: 'Real-Time Voice', unit: '' },
    ],
    status: 'ACTIVE',
  },
  {
    id: 'virasat-nama',
    codename: 'PROJ::002',
    title: 'Virasat Nama Guide',
    description:
      'Extensive, highly scalable education ecosystem and interactive tool built to streamline IELTS examination workflows. Delivers adaptive learning pathways, granular performance analytics, and an offline-first architecture that keeps students productive without a network connection.',
    category: 'EdTech · Education Ecosystem',
    techStack: [
      { name: 'Flutter',        category: 'mobile'  },
      { name: 'Dart',           category: 'mobile'  },
      { name: 'Firebase',       category: 'infra'   },
      { name: 'Hive DB',        category: 'infra'   },
      { name: 'Provider',       category: 'mobile'  },
    ],
    metrics: [
      { label: 'Target Exam',   value: 'IELTS',       unit: '' },
      { label: 'Architecture',  value: 'Offline-First', unit: '' },
      { label: 'Scale',         value: 'Ecosystem',   unit: '' },
    ],
    status: 'DEPLOYED',
  },
  {
    id: 'aegis',
    codename: 'PROJ::003',
    title: 'AEGIS',
    description:
      'Advanced interactive diagnostic utility built to evaluate specialised system performance frameworks. Features configurable assessment pipeline nodes, real-time result streaming, and a rubric-driven scoring engine designed for structured diagnostic workflows.',
    category: 'Diagnostic · Evaluation Engine',
    techStack: [
      { name: 'Python',      category: 'backend'  },
      { name: 'FastAPI',     category: 'backend'  },
      { name: 'React',       category: 'frontend' },
      { name: 'TypeScript',  category: 'frontend' },
      { name: 'Docker',      category: 'infra'    },
    ],
    metrics: [
      { label: 'Type',         value: 'Diagnostic',   unit: '' },
      { label: 'Pipeline',     value: 'Configurable', unit: '' },
      { label: 'Results',      value: 'Real-Time',    unit: '' },
    ],
    status: 'OPERATIONAL',
  },
  {
    id: 'jarvis',
    codename: 'PROJ::004',
    title: 'Jarvis System Agent',
    description:
      'Automated system-level orchestrator built to manage local voice streams, background loops, and system-level task flows. Interprets natural language commands, dispatches OS-level operations across subprocess layers, and maintains autonomous retry logic with configurable wake-word detection.',
    category: 'AI Agent · System Orchestrator',
    techStack: [
      { name: 'Python',   category: 'backend' },
      { name: 'Whisper',  category: 'ai'      },
      { name: 'Ollama',   category: 'ai'      },
      { name: 'PyAudio',  category: 'backend' },
      { name: 'pyttsx3',  category: 'ai'      },
    ],
    metrics: [
      { label: 'Interface',   value: 'Voice',        unit: '' },
      { label: 'Execution',   value: 'OS-Level',     unit: '' },
      { label: 'Loop Mode',   value: 'Autonomous',   unit: '' },
    ],
    status: 'OPERATIONAL',
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

export default function MasterVault() {
  const sectionRef = useRef<HTMLElement>(null)
  const { registerSection } = useScrollContext()

  useEffect(() => {
    registerSection('projects', sectionRef as RefObject<HTMLElement>)
  }, [registerSection])

  return (
    <section
      id="master-vault"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-24"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="mb-16 flex items-start gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center gap-2 pt-2 shrink-0">
            <div className="h-px w-10 bg-cyan-galactic" />
            <div className="w-px h-14 bg-gradient-to-b from-cyan-galactic to-transparent" />
          </div>
          <div>
            <p className="font-mono text-xs tracking-[0.32em] text-cyan-galactic uppercase mb-3">
              sys::vault — SECTION_03
            </p>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-text-primary leading-tight">
              THE MASTER
              <br />
              <span className="font-light text-text-muted">VAULT</span>
            </h2>
            <p className="mt-4 text-text-muted font-display text-lg max-w-xl leading-relaxed">
              Four operational systems. Native Android, education ecosystems, diagnostic utilities, and autonomous agent orchestrators — all built for production.
            </p>
          </div>
        </motion.div>

        {/* 2-column project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          className="mt-10 text-center font-mono text-xs text-text-muted tracking-widest"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          HOVER EACH CARD → TELEMETRY PANEL ACTIVATES
        </motion.p>
      </div>
    </section>
  )
}
