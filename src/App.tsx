import { useState } from 'react'
import { IntroCard } from '@/components/IntroCard/IntroCard'
import { EmailComposer } from '@/components/EmailComposer/EmailComposer'
import { MessageHistory } from '@/components/MessageHistory/MessageHistory'
import { useEmailStore } from '@/store/email-store'
import styles from './App.module.scss'

type AppView = 'composer' | 'history' | 'closed'

export default function App() {
  const [view, setView] = useState<AppView>('composer')
  const [showIntro, setShowIntro] = useState(true)
  const resetComposer = useEmailStore((s) => s.resetComposer)

  if (view === 'closed') return null

  const handleSendComplete = () => {
    setView('history')
  }

  const handleComposeNew = () => {
    resetComposer()
    setView('composer')
  }

  const handleClose = () => {
    setView('closed')
  }

  const mainContent =
    view === 'composer' ? (
      <EmailComposer onClose={handleClose} onSendComplete={handleSendComplete} />
    ) : (
      <MessageHistory onComposeNew={handleComposeNew} onClose={handleClose} />
    )

  if (!showIntro) {
    return (
      <main className={styles.layoutSolo}>
        <div className={styles.composerPaneSolo}>{mainContent}</div>
      </main>
    )
  }

  return (
    <main className={styles.layout}>
      <div className={styles.composerPane}>{mainContent}</div>
      <div className={styles.introPane}>
        <IntroCard onDismiss={() => setShowIntro(false)} />
      </div>
    </main>
  )
}
