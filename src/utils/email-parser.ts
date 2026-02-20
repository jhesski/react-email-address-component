import type { ParsedEmail } from '@/types/email'
import { validateEmail } from './email-validation'

export function parseFormattedEmailAddress(
  email: string,
  allowSpaces = false,
): ParsedEmail {
  let raw = email
  if (!allowSpaces) {
    raw = raw.replace(/ {0,}</g, '<')
  }

  const emailInBrackets = email.substring(
    email.lastIndexOf('<') + 1,
    email.lastIndexOf('>'),
  )
  const formattedEmail = emailInBrackets !== ''
  let displayName: string | undefined
  let address: { value: string; valid: boolean }

  if (formattedEmail) {
    address = { value: emailInBrackets, valid: validateEmail(emailInBrackets) }
    const beforeBracket = raw.split('<')[0]
    displayName = beforeBracket === '' ? undefined : beforeBracket
    if (!displayName) {
      raw = emailInBrackets
    }
  } else {
    address = { value: raw, valid: validateEmail(raw) }
  }

  return { raw, displayName, address }
}
