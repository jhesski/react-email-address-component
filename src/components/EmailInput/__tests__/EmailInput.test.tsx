import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailInput } from '../EmailInput'
import { useEmailStore } from '@/store/email-store'

beforeEach(() => {
  useEmailStore.setState({
    toEmails: [],
    contacts: [],
    subject: '',
    body: '',
    isLoading: true,
    isDropdownOpen: false,
    isSending: false,
  })
  localStorage.clear()
})

describe('EmailInput', () => {
  it('shows loading state', () => {
    useEmailStore.setState({ isLoading: true })
    render(<EmailInput />)
    expect(screen.getByText(/loading contacts/i)).toBeInTheDocument()
  })

  it('shows placeholder when no emails and not loading', () => {
    useEmailStore.setState({ isLoading: false, toEmails: [] })
    render(<EmailInput />)
    expect(screen.getByText(/click \+ to add people/i)).toBeInTheDocument()
  })

  it('renders pills for each toEmail', () => {
    useEmailStore.setState({
      isLoading: false,
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
        {
          id: 2,
          index: 1,
          email: {
            raw: 'c@d.com',
            displayName: undefined,
            address: { value: 'c@d.com', valid: true },
          },
          message: undefined,
        },
      ],
    })
    render(<EmailInput />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
  })

  it('toggles dropdown when + button is clicked', async () => {
    const user = userEvent.setup()
    useEmailStore.setState({ isLoading: false, toEmails: [], contacts: [] })
    render(<EmailInput />)
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByText('Choose a contact')).toBeInTheDocument()
  })
})
