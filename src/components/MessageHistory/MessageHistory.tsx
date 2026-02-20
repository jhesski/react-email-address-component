import { Clock, Mail, PenLine, X } from 'lucide-react'
import { useEmailStore } from '@/store/email-store'
import styles from './MessageHistory.module.scss'

interface MessageHistoryProps {
  onComposeNew: () => void
  onClose: () => void
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageHistory({ onComposeNew, onClose }: MessageHistoryProps) {
  const sentMessages = useEmailStore((s) => s.sentMessages)

  return (
    <section className={styles.card} role="region" aria-labelledby="history-title">
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 id="history-title" className={styles.title}>Sent Messages</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          {sentMessages.length === 0 ? (
            <p className={styles.emptyState}>No messages sent yet.</p>
          ) : (
            <ul className={styles.messageList}>
              {[...sentMessages].reverse().map((msg) => (
                <li key={msg.id} className={styles.messageItem}>
                  <div className={styles.messageHeader}>
                    <Mail size={14} className={styles.messageIcon} />
                    <span className={styles.recipients}>
                      {msg.recipients.join(', ')}
                    </span>
                  </div>
                  <div className={styles.subject}>
                    {msg.subject || '(no subject)'}
                  </div>
                  <div className={styles.timestamp}>
                    <Clock size={12} />
                    <time dateTime={new Date(msg.sentAt).toISOString()}>
                      {formatTime(msg.sentAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.composeButton}
            onClick={onComposeNew}
          >
            <PenLine size={16} />
            Compose New Message
          </button>
        </footer>
      </div>
    </section>
  )
}
