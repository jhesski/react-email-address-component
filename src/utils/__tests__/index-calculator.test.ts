import { describe, it, expect } from 'vitest'
import { calculateNextIndex } from '../index-calculator'

describe('calculateNextIndex', () => {
  it('returns 0 for undefined input', () => {
    expect(calculateNextIndex(undefined)).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(calculateNextIndex([])).toBe(0)
  })

  it('returns max + 1 for a simple array', () => {
    expect(calculateNextIndex([0, 1, 2])).toBe(3)
  })

  it('returns max + 1 for non-sequential array', () => {
    expect(calculateNextIndex([0, 5, 3])).toBe(6)
  })

  it('handles single element array', () => {
    expect(calculateNextIndex([0])).toBe(1)
  })

  it('handles array with gaps', () => {
    expect(calculateNextIndex([10, 20, 15])).toBe(21)
  })
})
