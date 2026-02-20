import { create } from 'zustand'
import type {
  EmailRecipient,
  StoredContact,
  StoredEmailMap,
  ComposedEmail,
  ParsedEmail,
  SentMessage,
} from '@/types/email'
import { parseFormattedEmailAddress, calculateNextIndex } from '@/utils'

const STORAGE_KEY = 'emails'

function readStorage(): StoredEmailMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeStorage(map: StoredEmailMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function storedContactToRecipient(
  contact: StoredContact,
  index: number,
): EmailRecipient {
  return {
    id: contact.id,
    index,
    email: parseFormattedEmailAddress(contact.email),
    message: undefined,
  }
}

function recipientToFullAddress(email: ParsedEmail): string {
  if (email.displayName) {
    return `${email.displayName}<${email.address.value}>`
  }
  return email.address.value
}

function dedupeRecipients(recipients: EmailRecipient[]): EmailRecipient[] {
  const seen = new Set<string>()
  return recipients.filter((r) => {
    const key = r.email.address.value.toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

interface EmailStoreActions {
  loadContacts: () => void
  addRecipient: (recipient: EmailRecipient) => void
  addNewRecipient: () => void
  removeRecipient: (index: number) => void
  updateRecipientEmail: (index: number, rawEmail: string) => void
  setSubject: (subject: string) => void
  setBody: (body: string) => void
  setDropdownOpen: (open: boolean) => void
  composeSendPayload: () => ComposedEmail
  send: () => Promise<void>
  resetComposer: () => void
}

interface EmailStoreState {
  toEmails: EmailRecipient[]
  contacts: EmailRecipient[]
  subject: string
  body: string
  isLoading: boolean
  isDropdownOpen: boolean
  isSending: boolean
  sentMessages: SentMessage[]
}

export type EmailStore = EmailStoreState & EmailStoreActions

export const useEmailStore = create<EmailStore>((set, get) => ({
  toEmails: [],
  contacts: [],
  subject: '',
  body: '',
  isLoading: true,
  isDropdownOpen: false,
  isSending: false,
  sentMessages: [],

  loadContacts: () => {
    const stored = readStorage()
    const contacts = Object.values(stored).map((contact, i) =>
      storedContactToRecipient(contact, i),
    )
    set({ contacts, toEmails: [], isLoading: false })
  },

  addRecipient: (recipient) => {
    const { toEmails } = get()
    const nextIndex = calculateNextIndex(toEmails.map((e) => e.index))
    set({
      toEmails: [...toEmails, { ...recipient, index: nextIndex }],
      isDropdownOpen: false,
    })
  },

  addNewRecipient: () => {
    const { toEmails } = get()
    const nextIndex = calculateNextIndex(toEmails.map((e) => e.index))
    const emptyRecipient: EmailRecipient = {
      id: undefined,
      index: nextIndex,
      email: { raw: '', displayName: undefined, address: { value: '', valid: false } },
      message: undefined,
    }
    set({
      toEmails: [...toEmails, emptyRecipient],
      isDropdownOpen: false,
    })
  },

  removeRecipient: (index) => {
    const { toEmails } = get()
    set({ toEmails: toEmails.filter((e) => e.index !== index) })
  },

  updateRecipientEmail: (index, rawEmail) => {
    const { toEmails } = get()
    const parsed = parseFormattedEmailAddress(rawEmail)
    const address = parsed.address.value.toLowerCase()

    // Update — detach from contact if the email address changed
    const updated = toEmails.map((e) => {
      if (e.index !== index) return e
      const originalAddress = e.email.address.value.toLowerCase()
      const changed = e.id !== undefined && originalAddress !== address
      return {
        ...e,
        id: changed ? undefined : e.id,
        email: parsed,
        message: undefined,
      }
    })
    set({ toEmails: updated })
  },

  setSubject: (subject) => set({ subject }),
  setBody: (body) => set({ body }),
  setDropdownOpen: (open) => set({ isDropdownOpen: open }),

  composeSendPayload: () => {
    const { toEmails, subject, body } = get()
    const unique = dedupeRecipients(toEmails).filter((e) => e.email.address.valid)
    return {
      toLocationContacts: unique
        .map((e) => e.id !== undefined ? String(e.id) : recipientToFullAddress(e.email)),
      messageBody: body,
      messageSubject: subject,
      bccEmailLists: [],
      ccEmailLists: [],
    }
  },

  send: async () => {
    set({ isSending: true })
    try {
      const { toEmails, contacts, subject, body } = get()
      const uniqueRecipients = dedupeRecipients(toEmails)

      // Stub: replace with actual API call
      get().composeSendPayload()
      await Promise.resolve()

      // Record the sent message (deduped)
      const recipients = uniqueRecipients
        .filter((e) => e.email.address.valid)
        .map((e) => recipientToFullAddress(e.email))

      const sentMessage: SentMessage = {
        id: String(Date.now()),
        recipients,
        subject,
        body,
        sentAt: Date.now(),
      }

      // Save new valid addresses to contacts (deduped, skip already-saved)
      const stored = readStorage()
      const existingAddresses = new Set(
        Object.values(stored).map((c) =>
          parseFormattedEmailAddress(c.email).address.value.toLowerCase(),
        ),
      )
      const newContacts: EmailRecipient[] = []
      let nextContactIndex = calculateNextIndex(contacts.map((c) => c.index))

      for (const recipient of uniqueRecipients) {
        const addr = recipient.email.address.value.toLowerCase()
        if (
          recipient.id === undefined &&
          recipient.email.address.valid &&
          !existingAddresses.has(addr)
        ) {
          const id = Date.now() + nextContactIndex
          const fullAddress = recipientToFullAddress(recipient.email)
          stored[String(id)] = { id, email: fullAddress }
          existingAddresses.add(addr)
          newContacts.push({
            ...recipient,
            id,
            index: nextContactIndex,
          })
          nextContactIndex++
        }
      }

      if (newContacts.length > 0) {
        writeStorage(stored)
        set({ contacts: [...contacts, ...newContacts] })
      }

      // Append to sentMessages
      set({ sentMessages: [...get().sentMessages, sentMessage] })
    } finally {
      set({ isSending: false })
    }
  },

  resetComposer: () => {
    set({
      toEmails: [],
      subject: '',
      body: '',
      isDropdownOpen: false,
    })
  },
}))
