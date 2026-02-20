import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailPill } from '../EmailPill'
import type { EmailRecipient } from '@/types/email'

function createRecipient(overrides: Partial<EmailRecipient> = {}): EmailRecipient {
  return {
    id: 1,
    index: 0,
    email: {
      raw: 'John <john@example.com>',
      displayName: 'John',
      address: { value: 'john@example.com', valid: true },
    },
    message: undefined,
    ...overrides,
  }
}

describe('EmailPill', () => {
  it('renders the display name when not focused', () => {
    render(
      <EmailPill
        recipient={createRecipient()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        disabled={false}
      />,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('John')
  })

  it('renders email address when no display name', () => {
    render(
      <EmailPill
        recipient={createRecipient({
          email: {
            raw: 'john@example.com',
            displayName: undefined,
            address: { value: 'john@example.com', valid: true },
          },
        })}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        disabled={false}
      />,
    )
    expect(screen.getByRole('textbox')).toHaveValue('john@example.com')
  })

  it('shows raw email on focus', async () => {
    const user = userEvent.setup()
    render(
      <EmailPill
        recipient={createRecipient()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        disabled={false}
      />,
    )
    const input = screen.getByRole('textbox')
    await user.click(input)
    expect(input).toHaveValue('John <john@example.com>')
  })

  it('calls onUpdate when blurred after editing', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(
      <EmailPill
        recipient={createRecipient()}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
        disabled={false}
      />,
    )
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.clear(input)
    await user.type(input, 'new@email.com')
    await user.tab()
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ index: 0 }),
      'new@email.com',
    )
  })

  it('calls onUpdate on Enter key', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(
      <EmailPill
        recipient={createRecipient()}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
        disabled={false}
      />,
    )
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.clear(input)
    await user.type(input, 'new@email.com{Enter}')
    expect(onUpdate).toHaveBeenCalled()
  })

  it('calls onRemove when X button clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <EmailPill
        recipient={createRecipient()}
        onUpdate={vi.fn()}
        onRemove={onRemove}
        disabled={false}
      />,
    )
    await user.click(screen.getByRole('button', { name: /remove/i }))
    expect(onRemove).toHaveBeenCalled()
  })

  it('calls onRemove when blurred with empty value', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <EmailPill
        recipient={createRecipient()}
        onUpdate={vi.fn()}
        onRemove={onRemove}
        disabled={false}
      />,
    )
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.clear(input)
    await user.tab()
    expect(onRemove).toHaveBeenCalled()
  })

  it('applies invalid styling when email is not valid', () => {
    render(
      <EmailPill
        recipient={createRecipient({
          email: {
            raw: 'bad',
            displayName: undefined,
            address: { value: 'bad', valid: false },
          },
        })}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        disabled={false}
      />,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('notValid')
  })

  it('does not apply invalid styling for empty new pills', () => {
    render(
      <EmailPill
        recipient={createRecipient({
          id: undefined,
          email: {
            raw: '',
            displayName: undefined,
            address: { value: '', valid: false },
          },
        })}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        disabled={false}
      />,
    )
    const input = screen.getByRole('textbox')
    expect(input).not.toHaveClass('notValid')
  })

  it('shows message when present', () => {
    render(
      <EmailPill
        recipient={createRecipient({ message: 'Something went wrong.' })}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        disabled={false}
      />,
    )
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })

  it('disables input when disabled prop is true', () => {
    render(
      <EmailPill
        recipient={createRecipient()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        disabled={true}
      />,
    )
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
