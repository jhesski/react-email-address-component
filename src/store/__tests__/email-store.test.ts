import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEmailStore } from '../email-store'
import type { EmailRecipient } from '@/types/email'

function createRecipient(
  id: number | undefined,
  emailValue: string,
): EmailRecipient {
  return {
    id,
    index: 0,
    email: {
      raw: emailValue,
      displayName: undefined,
      address: { value: emailValue, valid: emailValue.includes('@') },
    },
    message: undefined,
  }
}

beforeEach(() => {
  useEmailStore.setState({
    toEmails: [],
    contacts: [],
    subject: '',
    body: '',
    isLoading: true,
    isDropdownOpen: false,
    isSending: false,
    sentMessages: [],
  })
  localStorage.clear()
})

describe('useEmailStore', () => {
  describe('loadContacts', () => {
    it('loads contacts from localStorage into contacts list', () => {
      localStorage.setItem(
        'emails',
        JSON.stringify({
          '1': { id: 1, email: 'John <john@example.com>' },
          '2': { id: 2, email: 'jane@example.com' },
        }),
      )

      useEmailStore.getState().loadContacts()
      const state = useEmailStore.getState()

      expect(state.contacts).toHaveLength(2)
      expect(state.contacts[0].email.address.value).toBe('john@example.com')
      expect(state.contacts[1].email.address.value).toBe('jane@example.com')
      expect(state.isLoading).toBe(false)
    })

    it('leaves toEmails empty on load', () => {
      localStorage.setItem(
        'emails',
        JSON.stringify({
          '1': { id: 1, email: 'john@example.com' },
        }),
      )

      useEmailStore.getState().loadContacts()
      expect(useEmailStore.getState().toEmails).toHaveLength(0)
    })

    it('handles empty localStorage', () => {
      useEmailStore.getState().loadContacts()
      const state = useEmailStore.getState()
      expect(state.contacts).toHaveLength(0)
      expect(state.toEmails).toHaveLength(0)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('addRecipient', () => {
    it('adds a contact to the toEmails list', () => {
      useEmailStore.getState().loadContacts()
      const recipient = createRecipient(1, 'test@test.com')
      useEmailStore.getState().addRecipient(recipient)
      expect(useEmailStore.getState().toEmails).toHaveLength(1)
      expect(useEmailStore.getState().toEmails[0].id).toBe(1)
    })

    it('assigns the next available index', () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addRecipient(createRecipient(1, 'a@b.com'))
      useEmailStore.getState().addRecipient(createRecipient(2, 'c@d.com'))

      const emails = useEmailStore.getState().toEmails
      expect(emails[0].index).toBe(0)
      expect(emails[1].index).toBe(1)
    })

    it('closes the dropdown', () => {
      useEmailStore.setState({ isDropdownOpen: true, isLoading: false })
      useEmailStore.getState().addRecipient(createRecipient(1, 'a@b.com'))
      expect(useEmailStore.getState().isDropdownOpen).toBe(false)
    })
  })

  describe('addNewRecipient', () => {
    it('adds an empty recipient to toEmails', () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()

      const toEmails = useEmailStore.getState().toEmails
      expect(toEmails).toHaveLength(1)
      expect(toEmails[0].email.raw).toBe('')
      expect(toEmails[0].email.address.value).toBe('')
      expect(toEmails[0].email.address.valid).toBe(false)
      expect(toEmails[0].id).toBeUndefined()
    })

    it('closes the dropdown', () => {
      useEmailStore.setState({ isDropdownOpen: true, isLoading: false })
      useEmailStore.getState().addNewRecipient()
      expect(useEmailStore.getState().isDropdownOpen).toBe(false)
    })

    it('assigns sequential indices', () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().addNewRecipient()

      const emails = useEmailStore.getState().toEmails
      expect(emails[0].index).toBe(0)
      expect(emails[1].index).toBe(1)
    })
  })

  describe('removeRecipient', () => {
    it('removes a recipient by index', () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addRecipient(createRecipient(1, 'test@test.com'))
      const added = useEmailStore.getState().toEmails[0]
      useEmailStore.getState().removeRecipient(added.index)
      expect(useEmailStore.getState().toEmails).toHaveLength(0)
    })

    it('does NOT remove from localStorage or contacts', () => {
      localStorage.setItem(
        'emails',
        JSON.stringify({
          '100': { id: 100, email: 'keep@test.com' },
        }),
      )
      useEmailStore.getState().loadContacts()

      // Add the contact to To field, then remove it
      const contact = useEmailStore.getState().contacts[0]
      useEmailStore.getState().addRecipient(contact)
      useEmailStore.getState().removeRecipient(
        useEmailStore.getState().toEmails[0].index,
      )

      // Contact should still exist in contacts and localStorage
      expect(useEmailStore.getState().contacts).toHaveLength(1)
      const stored = JSON.parse(localStorage.getItem('emails') || '{}')
      expect(stored['100']).toBeDefined()
    })
  })

  describe('updateRecipientEmail', () => {
    it('updates recipient email with parsed value', () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      const recipient = useEmailStore.getState().toEmails[0]

      useEmailStore.getState().updateRecipientEmail(recipient.index, 'new@test.com')

      const updated = useEmailStore.getState().toEmails[0]
      expect(updated.email.address.value).toBe('new@test.com')
      expect(updated.email.address.valid).toBe(true)
    })

    it('allows duplicate email addresses in toEmails', () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addRecipient(createRecipient(1, 'same@test.com'))
      useEmailStore.getState().addNewRecipient()

      const newRecipient = useEmailStore.getState().toEmails[1]
      useEmailStore
        .getState()
        .updateRecipientEmail(newRecipient.index, 'same@test.com')

      // Both should exist without error messages
      expect(useEmailStore.getState().toEmails).toHaveLength(2)
      expect(useEmailStore.getState().toEmails[1].message).toBeUndefined()
    })

    it('detaches from contact when email is edited to a different address', () => {
      localStorage.setItem(
        'emails',
        JSON.stringify({
          '1': { id: 1, email: 'original@test.com' },
        }),
      )
      useEmailStore.getState().loadContacts()

      // Pick the contact from dropdown
      const contact = useEmailStore.getState().contacts[0]
      useEmailStore.getState().addRecipient(contact)
      expect(useEmailStore.getState().toEmails[0].id).toBe(1)

      // Edit the pill to a different email
      useEmailStore.getState().updateRecipientEmail(
        useEmailStore.getState().toEmails[0].index,
        'edited@test.com',
      )

      // id should be cleared (detached from contact)
      expect(useEmailStore.getState().toEmails[0].id).toBeUndefined()
      expect(useEmailStore.getState().toEmails[0].email.address.value).toBe('edited@test.com')
    })

    it('preserves contact id when email is not changed', () => {
      localStorage.setItem(
        'emails',
        JSON.stringify({
          '1': { id: 1, email: 'same@test.com' },
        }),
      )
      useEmailStore.getState().loadContacts()

      const contact = useEmailStore.getState().contacts[0]
      useEmailStore.getState().addRecipient(contact)

      // "Update" with the same email (e.g., blur without editing)
      useEmailStore.getState().updateRecipientEmail(
        useEmailStore.getState().toEmails[0].index,
        'same@test.com',
      )

      // id should be preserved
      expect(useEmailStore.getState().toEmails[0].id).toBe(1)
    })

    it('saves edited contact as new address on send', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(2000)
      localStorage.setItem(
        'emails',
        JSON.stringify({
          '1': { id: 1, email: 'original@test.com' },
        }),
      )
      useEmailStore.getState().loadContacts()

      // Pick contact, edit it
      const contact = useEmailStore.getState().contacts[0]
      useEmailStore.getState().addRecipient(contact)
      useEmailStore.getState().updateRecipientEmail(
        useEmailStore.getState().toEmails[0].index,
        'edited@test.com',
      )

      await useEmailStore.getState().send()

      // Original contact should still exist in localStorage
      const stored = JSON.parse(localStorage.getItem('emails') || '{}')
      expect(stored['1'].email).toBe('original@test.com')

      // Edited address should be saved as a new contact
      const keys = Object.keys(stored)
      expect(keys).toHaveLength(2)
      const newKey = keys.find((k) => k !== '1')!
      expect(stored[newKey].email).toBe('edited@test.com')

      vi.restoreAllMocks()
    })
  })

  describe('setSubject / setBody', () => {
    it('updates subject', () => {
      useEmailStore.getState().setSubject('Test Subject')
      expect(useEmailStore.getState().subject).toBe('Test Subject')
    })

    it('updates body', () => {
      useEmailStore.getState().setBody('Test Body')
      expect(useEmailStore.getState().body).toBe('Test Body')
    })
  })

  describe('setDropdownOpen', () => {
    it('toggles dropdown state', () => {
      useEmailStore.getState().setDropdownOpen(true)
      expect(useEmailStore.getState().isDropdownOpen).toBe(true)
      useEmailStore.getState().setDropdownOpen(false)
      expect(useEmailStore.getState().isDropdownOpen).toBe(false)
    })
  })

  describe('composeSendPayload', () => {
    it('includes contact IDs for known contacts', () => {
      localStorage.setItem(
        'emails',
        JSON.stringify({
          '1': { id: 1, email: 'to@test.com' },
        }),
      )
      useEmailStore.getState().loadContacts()

      const contact = useEmailStore.getState().contacts[0]
      useEmailStore.getState().addRecipient(contact)
      useEmailStore.getState().setSubject('Hello')
      useEmailStore.getState().setBody('World')

      const payload = useEmailStore.getState().composeSendPayload()
      expect(payload.toLocationContacts).toEqual(['1'])
      expect(payload.messageSubject).toBe('Hello')
      expect(payload.messageBody).toBe('World')
    })

    it('includes email address for new recipients', () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'new@test.com')

      const payload = useEmailStore.getState().composeSendPayload()
      expect(payload.toLocationContacts).toEqual(['new@test.com'])
    })
  })

  describe('send', () => {
    it('sets isSending during send and resets after', async () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'test@test.com')

      const sendPromise = useEmailStore.getState().send()
      expect(useEmailStore.getState().isSending).toBe(true)

      await sendPromise
      expect(useEmailStore.getState().isSending).toBe(false)
    })

    it('saves new valid addresses to localStorage on send', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(1000)
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'brand-new@test.com')

      await useEmailStore.getState().send()

      const stored = JSON.parse(localStorage.getItem('emails') || '{}')
      const keys = Object.keys(stored)
      expect(keys).toHaveLength(1)
      expect(stored[keys[0]].email).toBe('brand-new@test.com')

      // Also added to contacts in state
      expect(useEmailStore.getState().contacts).toHaveLength(1)
      expect(useEmailStore.getState().contacts[0].email.address.value).toBe('brand-new@test.com')

      vi.restoreAllMocks()
    })

    it('does not save invalid addresses to localStorage on send', async () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'not-an-email')

      await useEmailStore.getState().send()

      const stored = JSON.parse(localStorage.getItem('emails') || '{}')
      expect(Object.keys(stored)).toHaveLength(0)
      expect(useEmailStore.getState().contacts).toHaveLength(0)
    })

    it('does not duplicate existing contacts in localStorage on send', async () => {
      localStorage.setItem(
        'emails',
        JSON.stringify({
          '1': { id: 1, email: 'existing@test.com' },
        }),
      )
      useEmailStore.getState().loadContacts()

      // Add the existing contact to To
      const contact = useEmailStore.getState().contacts[0]
      useEmailStore.getState().addRecipient(contact)

      await useEmailStore.getState().send()

      const stored = JSON.parse(localStorage.getItem('emails') || '{}')
      expect(Object.keys(stored)).toHaveLength(1) // Still just 1
    })

    it('does not save a new address that already exists in contacts', async () => {
      // First send saves the address
      vi.spyOn(Date, 'now').mockReturnValue(5000)
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'once@test.com')
      await useEmailStore.getState().send()

      const storedAfterFirst = JSON.parse(localStorage.getItem('emails') || '{}')
      expect(Object.keys(storedAfterFirst)).toHaveLength(1)

      // Second send with the same address typed fresh
      useEmailStore.getState().resetComposer()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'once@test.com')
      await useEmailStore.getState().send()

      // Should still be just 1 contact in localStorage
      const storedAfterSecond = JSON.parse(localStorage.getItem('emails') || '{}')
      expect(Object.keys(storedAfterSecond)).toHaveLength(1)

      vi.restoreAllMocks()
    })

    it('dedupes recipients on send — payload has unique addresses only', async () => {
      useEmailStore.getState().loadContacts()

      // Add the same email twice
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'dupe@test.com')
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(1, 'dupe@test.com')

      expect(useEmailStore.getState().toEmails).toHaveLength(2)

      const payload = useEmailStore.getState().composeSendPayload()
      expect(payload.toLocationContacts).toEqual(['dupe@test.com'])
    })

    it('dedupes recipients on send — saves only one new contact', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(3000)
      useEmailStore.getState().loadContacts()

      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'dupe@test.com')
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(1, 'dupe@test.com')

      await useEmailStore.getState().send()

      const stored = JSON.parse(localStorage.getItem('emails') || '{}')
      expect(Object.keys(stored)).toHaveLength(1)

      // Sent message record should also have one recipient
      const sent = useEmailStore.getState().sentMessages
      expect(sent[0].recipients).toEqual(['dupe@test.com'])

      vi.restoreAllMocks()
    })

    it('records a sent message after send()', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'test@example.com')
      useEmailStore.getState().setSubject('Hello')
      useEmailStore.getState().setBody('World')

      await useEmailStore.getState().send()

      const sent = useEmailStore.getState().sentMessages
      expect(sent).toHaveLength(1)
      expect(sent[0].recipients).toEqual(['test@example.com'])
      expect(sent[0].subject).toBe('Hello')
      expect(sent[0].body).toBe('World')
      expect(sent[0].sentAt).toBe(1700000000000)

      vi.restoreAllMocks()
    })

    it('accumulates multiple sent messages', async () => {
      useEmailStore.getState().loadContacts()

      // Send first message
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'a@b.com')
      useEmailStore.getState().setSubject('First')
      await useEmailStore.getState().send()

      // Reset and send second
      useEmailStore.getState().resetComposer()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'c@d.com')
      useEmailStore.getState().setSubject('Second')
      await useEmailStore.getState().send()

      expect(useEmailStore.getState().sentMessages).toHaveLength(2)
      expect(useEmailStore.getState().sentMessages[0].subject).toBe('First')
      expect(useEmailStore.getState().sentMessages[1].subject).toBe('Second')
    })

    it('only includes valid recipients in sent message record', async () => {
      useEmailStore.getState().loadContacts()
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(0, 'valid@test.com')
      useEmailStore.getState().addNewRecipient()
      useEmailStore.getState().updateRecipientEmail(1, 'not-valid')

      await useEmailStore.getState().send()

      const sent = useEmailStore.getState().sentMessages
      expect(sent[0].recipients).toEqual(['valid@test.com'])
    })
  })

  describe('resetComposer', () => {
    it('clears toEmails, subject, body, and isDropdownOpen', () => {
      useEmailStore.setState({
        toEmails: [createRecipient(1, 'a@b.com')],
        subject: 'Test',
        body: 'Content',
        isDropdownOpen: true,
        isLoading: false,
      })

      useEmailStore.getState().resetComposer()

      const state = useEmailStore.getState()
      expect(state.toEmails).toEqual([])
      expect(state.subject).toBe('')
      expect(state.body).toBe('')
      expect(state.isDropdownOpen).toBe(false)
    })

    it('preserves contacts and sentMessages', () => {
      useEmailStore.setState({
        contacts: [createRecipient(1, 'contact@test.com')],
        sentMessages: [{
          id: '1',
          recipients: ['r@t.com'],
          subject: 'S',
          body: 'B',
          sentAt: 1000,
        }],
        toEmails: [createRecipient(2, 'x@y.com')],
        subject: 'Old',
        body: 'Old body',
        isLoading: false,
      })

      useEmailStore.getState().resetComposer()

      expect(useEmailStore.getState().contacts).toHaveLength(1)
      expect(useEmailStore.getState().sentMessages).toHaveLength(1)
    })
  })
})
