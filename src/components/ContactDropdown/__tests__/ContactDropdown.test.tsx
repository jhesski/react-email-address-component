import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactDropdown } from '../ContactDropdown'
import type { EmailRecipient } from '@/types/email'

const mockContacts: EmailRecipient[] = [
  {
    id: 1,
    index: 0,
    email: {
      raw: 'Alice <alice@test.com>',
      displayName: 'Alice',
      address: { value: 'alice@test.com', valid: true },
    },
    message: undefined,
  },
  {
    id: 2,
    index: 1,
    email: {
      raw: 'bob@test.com',
      displayName: undefined,
      address: { value: 'bob@test.com', valid: true },
    },
    message: undefined,
  },
]

describe('ContactDropdown', () => {
  it('renders "Choose a contact" header', () => {
    render(
      <ContactDropdown
        contacts={mockContacts}
        toEmails={[]}
        onSelect={vi.fn()}
        onAddNew={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Choose a contact')).toBeInTheDocument()
  })

  it('renders "Add new address" option', () => {
    render(
      <ContactDropdown
        contacts={mockContacts}
        toEmails={[]}
        onSelect={vi.fn()}
        onAddNew={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Add new address')).toBeInTheDocument()
  })

  it('renders contact display names and email addresses', () => {
    render(
      <ContactDropdown
        contacts={mockContacts}
        toEmails={[]}
        onSelect={vi.fn()}
        onAddNew={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('shows already-added contacts as disabled (not hidden)', () => {
    render(
      <ContactDropdown
        contacts={mockContacts}
        toEmails={[mockContacts[0]]}
        onSelect={vi.fn()}
        onAddNew={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    // Alice is still visible but disabled
    expect(screen.getByText('Alice')).toBeInTheDocument()
    const aliceItem = screen.getByText('Alice').closest('li')
    expect(aliceItem).toHaveAttribute('aria-disabled', 'true')
    // Bob is still enabled
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('does not call onSelect for disabled contacts', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ContactDropdown
        contacts={mockContacts}
        toEmails={[mockContacts[0]]}
        onSelect={onSelect}
        onAddNew={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    await user.click(screen.getByText('Alice'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('calls onSelect when an available contact is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ContactDropdown
        contacts={mockContacts}
        toEmails={[]}
        onSelect={onSelect}
        onAddNew={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    await user.click(screen.getByText('Alice'))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
    )
  })

  it('calls onAddNew when "Add new address" is clicked', async () => {
    const user = userEvent.setup()
    const onAddNew = vi.fn()
    render(
      <ContactDropdown
        contacts={mockContacts}
        toEmails={[]}
        onSelect={vi.fn()}
        onAddNew={onAddNew}
        onClose={vi.fn()}
      />,
    )
    await user.click(screen.getByText('Add new address'))
    expect(onAddNew).toHaveBeenCalled()
  })

  it('calls onClose when clicking outside', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ContactDropdown
          contacts={mockContacts}
          toEmails={[]}
          onSelect={vi.fn()}
          onAddNew={vi.fn()}
          onClose={onClose}
        />
      </div>,
    )
    await user.click(screen.getByTestId('outside'))
    expect(onClose).toHaveBeenCalled()
  })
})
