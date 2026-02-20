import {
  X,
  Mail,
  CheckCircle,
  Users,
  HardDrive,
  Send,
} from 'lucide-react'
import styles from './IntroCard.module.scss'

interface IntroCardProps {
  onDismiss: () => void
}

const features = [
  {
    icon: Mail,
    text: 'Smart pill input with inline editing & display name parsing',
  },
  {
    icon: CheckCircle,
    text: 'Real-time email validation with visual feedback',
  },
  {
    icon: Users,
    text: 'Contact dropdown with duplicate detection & auto-resolve',
  },
  {
    icon: HardDrive,
    text: 'Persistent localStorage storage with full CRUD',
  },
  {
    icon: Send,
    text: 'This is a demonstration only, no emails will actually be sent',
  },
]

const techStack = ['React 19', 'TypeScript', 'Zustand', 'Vite', 'Vitest']

export function IntroCard({ onDismiss }: IntroCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 className={styles.title}>Email Composer</h2>
          <button
            type="button"
            className={styles.dismissButton}
            onClick={onDismiss}
            aria-label="Dismiss intro"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          <p className={styles.intro}>
            A modern React email composer component. Give it a spin!
          </p>

          <ul className={styles.featureList}>
            {features.map((feature) => (
              <li key={feature.text} className={styles.featureItem}>
                <feature.icon size={16} className={styles.featureIcon} />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>

          <div className={styles.techRow}>
            {techStack.map((tech) => (
              <span key={tech} className={styles.badge}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
