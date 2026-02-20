import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
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

describe('App', () => {
  it('shows composer by default', () => {
    render(<App />)
    expect(screen.getByText('Composer')).toBeInTheDocument()
  })

  it('shows IntroCard alongside composer by default', () => {
    render(<App />)
    expect(screen.getByText('Composer')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /email composer/i })).toBeInTheDocument()
  })

  it('switches to message history after sending', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Add recipient to enable send
    act(() => {
      useEmailStore.setState({
        toEmails: [
          {
            id: 1,
            index: 0,
            email: {
              raw: 'test@test.com',
              displayName: undefined,
              address: { value: 'test@test.com', valid: true },
            },
            message: undefined,
          },
        ],
        isLoading: false,
      })
    })

    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(screen.getByRole('heading', { name: /sent messages/i })).toBeInTheDocument()
    expect(screen.queryByText('Composer')).not.toBeInTheDocument()
  })

  it('returns to fresh composer when "Compose New Message" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Send a message
    act(() => {
      useEmailStore.setState({
        toEmails: [
          {
            id: 1,
            index: 0,
            email: {
              raw: 'test@test.com',
              displayName: undefined,
              address: { value: 'test@test.com', valid: true },
            },
            message: undefined,
          },
        ],
        subject: 'Old Subject',
        body: 'Old Body',
        isLoading: false,
      })
    })

    await user.click(screen.getByRole('button', { name: /send/i }))
    await user.click(screen.getByRole('button', { name: /compose new message/i }))

    // Back to composer with cleared form
    expect(screen.getByText('Composer')).toBeInTheDocument()
    expect(useEmailStore.getState().toEmails).toEqual([])
    expect(useEmailStore.getState().subject).toBe('')
    expect(useEmailStore.getState().body).toBe('')
  })

  it('renders null when closed from composer', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(container.innerHTML).toBe('')
  })
})
