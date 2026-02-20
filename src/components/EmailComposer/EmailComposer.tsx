import { useEffect } from 'react'
import { X, Paperclip, FileText } from 'lucide-react'
import { useEmailStore } from '@/store/email-store'
import { EmailInput } from '@/components/EmailInput/EmailInput'
import styles from './EmailComposer.module.scss'

interface EmailComposerProps {
  onClose: () => void
  onSendComplete: () => void
}

export function EmailComposer({ onClose, onSendComplete }: EmailComposerProps) {
  const {
    toEmails,
    subject,
    body,
    isLoading,
    isSending,
    loadContacts,
    setSubject,
    setBody,
    send,
  } = useEmailStore()

  const hasRecipients = toEmails.length > 0
  const canSend = !isLoading && hasRecipients && !isSending

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!canSend) return
    await send()
    onSendComplete()
  }

  return (
    <section className={styles.modalWindow} role="dialog" aria-labelledby="composer-title">
      <div className={styles.modalContent}>
        <header className={styles.header}>
          <h2 id="composer-title" className={styles.title}>Composer</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form className={styles.body} onSubmit={handleSend}>
          <fieldset className={styles.fieldContainer}>
            <div className={styles.fieldRow}>
              <span id="to-label" className={styles.label}>To</span>
              <div className={styles.fieldContent}>
                <EmailInput />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <label className={styles.label} htmlFor="email-subject">
                Subject
              </label>
              <div className={styles.fieldContent}>
                <input
                  id="email-subject"
                  className={styles.textInput}
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-label="Subject"
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.label}>
                <Paperclip size={14} />
              </span>
              <div className={styles.fieldContent}>
                <div className={styles.attachment}>
                  <FileText size={18} />
                  <span> Attachment.pdf</span>
                </div>
              </div>
            </div>
          </fieldset>

          <div className={styles.bodyField}>
            <textarea
              className={styles.textarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Message body"
            />
          </div>

          <footer className={styles.footer}>
            <button
              type="submit"
              disabled={!canSend}
              className={styles.sendButton}
              aria-label={isSending ? 'Sending' : 'Send'}
            >
              {isSending ? 'Sending...' : 'Send It!'}
            </button>
          </footer>
        </form>
      </div>
    </section>
  )
}
