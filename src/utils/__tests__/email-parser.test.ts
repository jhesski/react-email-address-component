import { describe, it, expect } from 'vitest'
import { parseFormattedEmailAddress } from '../email-parser'

describe('parseFormattedEmailAddress', () => {
  it('parses a bare valid email address', () => {
    const result = parseFormattedEmailAddress('user@example.com')
    expect(result.raw).toBe('user@example.com')
    expect(result.displayName).toBeUndefined()
    expect(result.address.value).toBe('user@example.com')
    expect(result.address.valid).toBe(true)
  })

  it('parses "Display Name <email>" format', () => {
    const result = parseFormattedEmailAddress('John Smith <john@example.com>')
    expect(result.displayName).toBe('John Smith')
    expect(result.address.value).toBe('john@example.com')
    expect(result.address.valid).toBe(true)
  })

  it('parses "<email>" format with empty display name as bare email', () => {
    const result = parseFormattedEmailAddress('<john@example.com>')
    expect(result.raw).toBe('john@example.com')
    expect(result.displayName).toBeUndefined()
    expect(result.address.value).toBe('john@example.com')
  })

  it('marks invalid email addresses', () => {
    const result = parseFormattedEmailAddress('not-an-email')
    expect(result.address.valid).toBe(false)
    expect(result.address.value).toBe('not-an-email')
  })

  it('marks invalid email inside brackets', () => {
    const result = parseFormattedEmailAddress('Name <invalid>')
    expect(result.address.valid).toBe(false)
    expect(result.address.value).toBe('invalid')
  })

  it('strips spaces before < when allowSpaces is false', () => {
    const result = parseFormattedEmailAddress('Name   <user@example.com>', false)
    expect(result.raw).toBe('Name<user@example.com>')
  })

  it('preserves spaces before < when allowSpaces is true', () => {
    const result = parseFormattedEmailAddress('Name   <user@example.com>', true)
    expect(result.raw).toBe('Name   <user@example.com>')
  })

  it('handles "New Email Address" placeholder text', () => {
    const result = parseFormattedEmailAddress('New Email Address')
    expect(result.address.valid).toBe(false)
    expect(result.address.value).toBe('New Email Address')
    expect(result.displayName).toBeUndefined()
  })

  it('handles "+ Add Contact" text', () => {
    const result = parseFormattedEmailAddress('+ Add Contact')
    expect(result.address.valid).toBe(false)
  })
})
