export interface EmailAddress {
  value: string
  valid: boolean
}

export interface ParsedEmail {
  raw: string
  displayName: string | undefined
  address: EmailAddress
}

export interface EmailRecipient {
  id: number | undefined
  index: number
  email: ParsedEmail
  message: string | undefined
}

export interface StoredContact {
  id: number
  email: string
}

export type StoredEmailMap = Record<string, StoredContact>

export interface ComposedEmail {
  toLocationContacts: string[]
  messageBody: string
  messageSubject: string
  bccEmailLists: string[]
  ccEmailLists: string[]
}

export interface SentMessage {
  id: string
  recipients: string[]
  subject: string
  body: string
  sentAt: number
}
