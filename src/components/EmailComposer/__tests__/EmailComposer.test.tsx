import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailComposer } from '../EmailComposer'
import { useEmailStore } from '@/store/email-store'

beforeEach(() => {
  useEmailStore.setState({
    toEmails: [],
    contacts: [],
    subject: '',
    body: '',
    isLoading: false,
    isDropdownOpen: false,
    isSending: false,
    sentMessages: [],
  })
  localStorage.clear()
  document.body.style.overflow = ''
})

describe('EmailComposer', () => {
  it('renders the composer header', () => {
    render(<EmailComposer onClose={vi.fn()} onSendComplete={vi.fn()} />)
    expect(screen.getByText('Composer')).toBeInTheDocument()
  })

  it('renders To, Subject, attachment, and body fields', () => {
    render(<EmailComposer onClose={vi.fn()} onSendComplete={vi.fn()} />)
    expect(screen.getByText('To')).toBeInTheDocument()
    expect(screen.getByText('Subject')).toBeInTheDocument()
    expect(screen.getByText('Attachment.pdf')).toBeInTheDocument()
  })

  it('updates subject field', async () => {
    const user = userEvent.setup()
    render(<EmailComposer onClose={vi.fn()} onSendComplete={vi.fn()} />)
    const subjectInput = screen.getByLabelText('Subject')
    await user.type(subjectInput, 'Hello World')
    expect(useEmailStore.getState().subject).toBe('Hello World')
  })

  it('updates body field', async () => {
    const user = userEvent.setup()
    render(<EmailComposer onClose={vi.fn()} onSendComplete={vi.fn()} />)
    const bodyInput = screen.getByRole('textbox', { name: /body/i })
    await user.type(bodyInput, 'Message content')
    expect(useEmailStore.getState().body).toBe('Message content')
  })

  it('disables send button when no recipients', () => {
    render(<EmailComposer onClose={vi.fn()} onSendComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('enables send button when recipients exist', () => {
    render(<EmailComposer onClose={vi.fn()} onSendComplete={vi.fn()} />)
    // Set state after mount so loadContacts doesn't overwrite it
    act(() => {
      useEmailStore.setState({
        toEmails: [
          {
            id: 1,
            index: 0,
            email: {
              raw: 'a@b.com',
              displayName: undefined,
              address: { value: 'a@b.com', valid: true },
            },
            message: undefined,
          },
        ],
        isLoading: false,
      })
    })
    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<EmailComposer onClose={onClose} onSendComplete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSendComplete (not onClose) after successful send', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSendComplete = vi.fn()

    render(<EmailComposer onClose={onClose} onSendComplete={onSendComplete} />)

    act(() => {
      useEmailStore.setState({
        toEmails: [
          {
            id: 1,
            index: 0,
            email: {
              raw: 'a@b.com',
              displayName: undefined,
              address: { value: 'a@b.com', valid: true },
            },
            message: undefined,
          },
        ],
        isLoading: false,
      })
    })

    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(onSendComplete).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows "Sending..." while sending', () => {
    useEmailStore.setState({
      isSending: true,
      toEmails: [
        {
          id: 1,
          index: 0,
          email: {
            raw: 'a@b.com',
            displayName: undefined,
            address: { value: 'a@b.com', valid: true },
          },
          message: undefined,
        },
      ],
    })
    render(<EmailComposer onClose={vi.fn()} onSendComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument()
  })

  it('locks body scroll on mount and restores on unmount', () => {
    const { unmount } = render(<EmailComposer onClose={vi.fn()} onSendComplete={vi.fn()} />)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })
})
