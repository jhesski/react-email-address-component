import { useCallback } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useEmailStore } from '@/store/email-store'
import { EmailPill } from '@/components/EmailPill/EmailPill'
import { ContactDropdown } from '@/components/ContactDropdown/ContactDropdown'
import type { EmailRecipient } from '@/types/email'
import styles from './EmailInput.module.scss'

export function EmailInput() {
  const {
    toEmails,
    contacts,
    isLoading,
    isSending,
    isDropdownOpen,
    setDropdownOpen,
    addRecipient,
    addNewRecipient,
    removeRecipient,
    updateRecipientEmail,
  } = useEmailStore()

  const handleUpdate = useCallback(
    (recipient: EmailRecipient, rawEmail: string) => {
      updateRecipientEmail(recipient.index, rawEmail)
    },
    [updateRecipientEmail],
  )

  const handleSelect = useCallback(
    (recipient: EmailRecipient) => {
      addRecipient(recipient)
    },
    [addRecipient],
  )

  const handleAddNew = useCallback(() => {
    addNewRecipient()
  }, [addNewRecipient])

  const handleToggleDropdown = useCallback(() => {
    setDropdownOpen(!isDropdownOpen)
  }, [isDropdownOpen, setDropdownOpen])

  const handleCloseDropdown = useCallback(() => {
    setDropdownOpen(false)
  }, [setDropdownOpen])

  // Track the most recently added pill index to auto-focus it
  const lastPill = toEmails.length > 0 ? toEmails[toEmails.length - 1] : null
  const isLastPillNew = lastPill?.email.raw === '' && lastPill?.id === undefined

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Loader2 size={14} className={styles.spinner} />
        <span>&nbsp;&nbsp;loading contacts for this location...</span>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container} aria-labelledby="to-label">
        {toEmails.map((emailObj, i) => (
          <EmailPill
            key={emailObj.index}
            recipient={emailObj}
            onUpdate={handleUpdate}
            onRemove={() => removeRecipient(emailObj.index)}
            disabled={isSending}
            autoFocus={isLastPillNew && i === toEmails.length - 1}
          />
        ))}
        {toEmails.length === 0 && (
          <span className={styles.placeholder}>
            Click + to add people to this email.
          </span>
        )}
        <button
          className={styles.addButton}
          onClick={handleToggleDropdown}
          aria-label="Add recipient"
          type="button"
        >
          <Plus size={18} />
        </button>
      </div>
      {isDropdownOpen && (
        <ContactDropdown
          contacts={contacts}
          toEmails={toEmails}
          onSelect={handleSelect}
          onAddNew={handleAddNew}
          onClose={handleCloseDropdown}
        />
      )}
    </div>
  )
}
