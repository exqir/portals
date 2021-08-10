import type { ReactElement, ReactNode } from 'react'

export function NoopProvider({
  children,
}: {
  children: ReactNode
}): ReactElement | null {
  return (children as ReactElement) ?? null
}

export function NoopComponent() {
  return null
}
