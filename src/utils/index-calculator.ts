export function calculateNextIndex(array: number[] | undefined): number {
  if (!array || array.length === 0) {
    return 0
  }
  return Math.max(...array) + 1
}
