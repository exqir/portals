import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useHost } from '../provider/HostProvider'

interface HostProps {
  children: ReactNode
}

export function Host({ children }: HostProps) {
  const { host, moduleId } = useHost()

  return createPortal(children, host, moduleId)
}
