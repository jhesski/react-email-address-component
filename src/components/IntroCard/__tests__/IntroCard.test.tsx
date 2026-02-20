import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntroCard } from '../IntroCard'

describe('IntroCard', () => {
  it('renders the title', () => {
    render(<IntroCard onDismiss={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /email composer/i })).toBeInTheDocument()
  })

  it('renders an intro description', () => {
    render(<IntroCard onDismiss={vi.fn()} />)
    expect(
      screen.getByText(/modern react/i),
    ).toBeInTheDocument()
  })

  it('renders feature descriptions', () => {
    render(<IntroCard onDismiss={vi.fn()} />)
    expect(screen.getByText(/pill input/i)).toBeInTheDocument()
    expect(screen.getByText(/validation/i)).toBeInTheDocument()
    expect(screen.getByText(/contact/i)).toBeInTheDocument()
    expect(screen.getByText(/localStorage/i)).toBeInTheDocument()
  })

  it('renders tech stack badges', () => {
    render(<IntroCard onDismiss={vi.fn()} />)
    expect(screen.getByText('React 19')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Zustand')).toBeInTheDocument()
    expect(screen.getByText('Vite')).toBeInTheDocument()
    expect(screen.getByText('Vitest')).toBeInTheDocument()
  })

  it('calls onDismiss when X button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<IntroCard onDismiss={onDismiss} />)
    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
