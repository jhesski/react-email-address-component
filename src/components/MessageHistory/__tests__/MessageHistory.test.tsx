import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageHistory } from '../MessageHistory'
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
})

describe('MessageHistory', () => {
  it('renders the "Sent Messages" heading', () => {
    render(<MessageHistory onComposeNew={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /sent messages/i })).toBeInTheDocument()
  })

  it('shows empty state when no messages have been sent', () => {
    render(<MessageHistory onComposeNew={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/no messages sent yet/i)).toBeInTheDocument()
  })

  it('renders sent message recipients and subject', () => {
    useEmailStore.setState({
      sentMessages: [
        {
          id: '1',
          recipients: ['alice@test.com'],
          subject: 'Test Subject',
          body: 'Body text',
          sentAt: new Date(2025, 0, 15, 14, 30).getTime(),
        },
      ],
    })

    render(<MessageHistory onComposeNew={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
  })

  it('shows "(no subject)" when subject is empty', () => {
    useEmailStore.setState({
      sentMessages: [
        {
          id: '1',
          recipients: ['bob@test.com'],
          subject: '',
          body: '',
          sentAt: Date.now(),
        },
      ],
    })

    render(<MessageHistory onComposeNew={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('(no subject)')).toBeInTheDocument()
  })

  it('renders multiple messages in reverse chronological order', () => {
    useEmailStore.setState({
      sentMessages: [
        { id: '1', recipients: ['first@t.com'], subject: 'First', body: '', sentAt: 1000 },
        { id: '2', recipients: ['second@t.com'], subject: 'Second', body: '', sentAt: 2000 },
      ],
    })

    render(<MessageHistory onComposeNew={vi.fn()} onClose={vi.fn()} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    // Second message should appear first (reverse chronological)
    expect(items[0]).toHaveTextContent('Second')
    expect(items[1]).toHaveTextContent('First')
  })

  it('displays multiple recipients separated by commas', () => {
    useEmailStore.setState({
      sentMessages: [
        {
          id: '1',
          recipients: ['alice@test.com', 'bob@test.com'],
          subject: 'Group email',
          body: '',
          sentAt: Date.now(),
        },
      ],
    })

    render(<MessageHistory onComposeNew={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('alice@test.com, bob@test.com')).toBeInTheDocument()
  })

  it('renders the "Compose New Message" button', () => {
    render(<MessageHistory onComposeNew={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /compose new message/i })).toBeInTheDocument()
  })

  it('calls onComposeNew when compose button is clicked', async () => {
    const user = userEvent.setup()
    const onComposeNew = vi.fn()
    render(<MessageHistory onComposeNew={onComposeNew} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /compose new message/i }))
    expect(onComposeNew).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<MessageHistory onComposeNew={vi.fn()} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
