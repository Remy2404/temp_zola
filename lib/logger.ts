const isDev = process.env.NODE_ENV === "development"

export function debug(...args: unknown[]) {
  if (isDev) console.debug(...args)
}

export function info(...args: unknown[]) {
  if (isDev) console.info(...args)
}

export function warn(...args: unknown[]) {
  if (isDev) console.warn(...args)
}

export function error(...args: unknown[]) {
  if (isDev) console.error(...args)
}

export default { debug, info, warn, error }
