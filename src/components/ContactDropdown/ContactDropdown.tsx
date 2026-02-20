import { useEffect, useRef, useMemo } from 'react'
import { UserPlus, Check } from 'lucide-react'
import type { EmailRecipient } from '@/types/email'
import styles from './ContactDropdown.module.scss'

interface ContactDropdownProps {
  contacts: EmailRecipient[]
  toEmails: EmailRecipient[]
  onSelect: (recipient: EmailRecipient) => void
  onAddNew: () => void
  onClose: () => void
}

export function ContactDropdown({
  contacts,
  toEmails,
  onSelect,
  onAddNew,
  onClose,
}: ContactDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toIds = useMemo(
    () => new Set(toEmails.map((e) => e.id).filter((id): id is number => id !== undefined)),
    [toEmails],
  )

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [onClose])

  const handleContactClick = (contact: EmailRecipient) => {
    if (toIds.has(contact.id!)) return // Already in To — disabled
    onSelect({
      ...contact,
      message: undefined,
    })
  }

  return (
    <div ref={dropdownRef} className={styles.dropdown} role="listbox">
      <span className={styles.header}>Choose a contact</span>
      <ul className={styles.list}>
        {contacts.map((contact) => {
          const isInTo = contact.id !== undefined && toIds.has(contact.id)
          return (
            <li
              key={contact.id ?? contact.index}
              className={`${styles.item} ${isInTo ? styles.disabled : ''}`}
              onClick={() => handleContactClick(contact)}
              role="option"
              aria-selected={isInTo}
              aria-disabled={isInTo}
            >
              {isInTo && <Check size={12} className={styles.checkIcon} />}
              <span>{contact.email.displayName ?? contact.email.address.value}</span>
            </li>
          )
        })}
        <li className={styles.addNewItem} onClick={onAddNew} role="option" aria-selected={false}>
          <UserPlus size={12} />
          <span>Add new address</span>
        </li>
      </ul>
    </div>
  )
}
