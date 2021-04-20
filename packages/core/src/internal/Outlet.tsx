import type { ReactNode } from 'react'
import React, {
  Fragment,
  useState,
  createContext,
  useContext,
} from 'react'
import { useHost } from '../provider/HostProvider'

interface IOutletContext {
  outlet: HTMLDivElement | null
}

const OutletContext = createContext<IOutletContext>({ outlet: null })

interface IOutletProps {
  children: ReactNode
}

export function Outlet({ children }: IOutletProps) {
  const { moduleId } = useHost()
  const [outlet, setOutlet] = useState(null)

  return (
    <Fragment>
      <OutletContext.Provider value={{ outlet }}>
        {children}
      </OutletContext.Provider>
      {/* @ts-ignore */}
      <div ref={setOutlet} data-module-outlet={moduleId} />
    </Fragment>
  )
}

export function useOutlet() {
  return useContext(OutletContext)
}
