import { type RefObject, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollContext } from '../../context/ScrollContext'
import ProjectCard from '../ui/ProjectCard'
import type { Project } from '../../types'

// ─── Project Registry ─────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: 'hiresphere',
    codename: 'PROJ::001',
    title: 'HireSphere',
    description:
      'Flagship AI career intelligence platform featuring automated voice interview systems, deep architectural vault state management, and real-time candidate-to-role matching via multi-agent reasoning pipelines and dynamic scoring rubrics.',
    category: 'AI Platform',
    techStack: [
      { name: 'React Native', category: 'mobile' },
      { name: 'FastAPI',      category: 'backend' },
      { name: 'OpenAI GPT-4', category: 'ai' },
      { name: 'WebRTC',       category: 'frontend' },
      { name: 'PostgreSQL',   category: 'infra' },
      { name: 'Redis',        category: 'infra' },
    ],
    metrics: [
      { label: 'AI Processing', value: 94, unit: '%' },
      { label: 'Response Time', value: 87, unit: 'ms avg' },
      { label: 'Match Accuracy', value: 91, unit: '%' },
    ],
    status: 'ACTIVE',
  },
  {
    id: 'virasat-nama',
    codename: 'PROJ::002',
    title: 'Virasat Nama Guide',
    description:
      'Comprehensive, highly scalable educational intelligence system designed for optimised IELTS examination workflows, adaptive learning pathways, granular performance analytics with spaced-repetition algorithms, and offline-first architecture via Hive local storage.',
    category: 'EdTech System',
    techStack: [
      { name: 'Flutter',          category: 'mobile' },
      { name: 'Firebase',         category: 'infra' },
      { name: 'Python',           category: 'backend' },
      { name: 'TensorFlow Lite',  category: 'ai' },
      { name: 'Hive DB',          category: 'infra' },
    ],
    metrics: [
      { label: 'Load Speed',  value: 96, unit: 'ms' },
      { label: 'Retention',   value: 88, unit: '%' },
      { label: 'Uptime',      value: 99, unit: '%' },
    ],
    status: 'DEPLOYED',
  },
  {
    id: 'aegis',
    codename: 'PROJ::003',
    title: 'AEGIS',
    description:
      'Advanced interactive evaluation framework built to streamline specialised assessment metric computation, rubric-driven scoring engines, and batch report generation with configurable pipeline nodes, real-time result streaming, and Docker-based deployment isolation.',
    category: 'Evaluation Engine',
    techStack: [
      { name: 'React',         category: 'frontend' },
      { name: 'TypeScript',    category: 'frontend' },
      { name: 'Python',        category: 'backend' },
      { name: 'scikit-learn',  category: 'ai' },
      { name: 'Docker',        category: 'infra' },
    ],
    metrics: [
      { label: 'Throughput', value: 89, unit: 'req/s' },
      { label: 'Precision',  value: 93, unit: '%' },
      { label: 'Coverage',   value: 78, unit: '%' },
    ],
    status: 'OPERATIONAL',
  },
  {
    id: 'jarvis',
    codename: 'PROJ::004',
    title: 'Jarvis System Agent',
    description:
      'Automated system-level orchestrator built to manage local voice streams, interpret natural language commands, execute OS-level operations across subprocess, and run autonomous background loops with self-healing retry logic and configurable wake-word detection.',
    category: 'AI Agent System',
    techStack: [
      { name: 'Python',   category: 'backend' },
      { name: 'Whisper',  category: 'ai' },
      { name: 'OpenAI',   category: 'ai' },
      { name: 'pyttsx3',  category: 'ai' },
      { name: 'PyAudio',  category: 'backend' },
    ],
    metrics: [
      { label: 'Voice Accuracy', value: 95, unit: '%' },
      { label: 'Latency',        value: 82, unit: 'ms' },
      { label: 'Reliability',    value: 97, unit: '%' },
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
              Flagship systems registry. Four operational architectures demonstrating high-fidelity engineering across AI, mobile, and agent domains.
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
