import { describe, it, expect } from 'vitest'
import { validateEmail } from '../email-validation'

describe('validateEmail', () => {
  it('returns true for a standard email', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('returns true for email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })

  it('returns true for email with dots in local part', () => {
    expect(validateEmail('first.last@example.com')).toBe(true)
  })

  it('returns true for email with plus tag', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true)
  })

  it('returns false for missing @', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('returns false for missing domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('returns false for missing local part', () => {
    expect(validateEmail('@example.com')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('returns false for plain text', () => {
    expect(validateEmail('not an email')).toBe(false)
  })

  it('returns false for email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })

  it('returns true for IP address domain in brackets', () => {
    expect(validateEmail('user@[192.168.1.1]')).toBe(true)
  })
})
