import { useState, useRef, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import type { EmailRecipient } from '@/types/email'
import styles from './EmailPill.module.scss'

interface EmailPillProps {
  recipient: EmailRecipient
  onUpdate: (recipient: EmailRecipient, rawEmail: string) => void
  onRemove: () => void
  disabled: boolean
  autoFocus?: boolean
}

export function EmailPill({ recipient, onUpdate, onRemove, disabled, autoFocus }: EmailPillProps) {
  const { email, message } = recipient
  const [isFocused, setIsFocused] = useState(false)
  const [editValue, setEditValue] = useState(email.raw)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputValue = isFocused ? editValue : (email.displayName ?? email.address.value)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleFocus = useCallback(() => {
    setEditValue(email.raw)
    setIsFocused(true)
  }, [email.raw])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    const trimmed = editValue.trim()

    // Auto-remove empty pills on blur
    if (trimmed === '') {
      onRemove()
      return
    }

    onUpdate(recipient, trimmed)
  }, [editValue, recipient, onUpdate, onRemove])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        inputRef.current?.blur()
      }
    },
    [],
  )

  const pillClassName = [styles.pill, isFocused ? styles.focused : '']
    .filter(Boolean)
    .join(' ')

  const inputClassName = [styles.input, !email.address.valid && email.raw !== '' ? styles.notValid : '']
    .filter(Boolean)
    .join(' ')

  return (
    <span className={pillClassName}>
      <input
        ref={inputRef}
        className={inputClassName}
        type="text"
        value={inputValue}
        onChange={(e) => setEditValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        size={inputValue.length || 20}
        aria-label="Email address"
        placeholder="email@example.com"
      />
      <button
        className={styles.removeButton}
        onClick={onRemove}
        aria-label="Remove email"
        type="button"
        tabIndex={-1}
      >
        <X size={12} />
      </button>
      {message && <span className={styles.message}>{message}</span>}
    </span>
  )
}
