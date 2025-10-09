// DOMPurify and JSDOM dependencies removed
// Simple sanitization - in production, consider adding proper sanitization library

export function sanitizeUserInput(input: string): string {
  // Basic sanitization - remove script tags
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
}
