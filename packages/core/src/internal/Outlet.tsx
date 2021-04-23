import type { ReactNode } from 'react'
import React, { Fragment, useState, createContext, useContext, useEffect } from 'react'
import { useHost } from '../provider/HostProvider'

interface IOutletContext {
  outlet: HTMLDivElement | null
}

const OutletContext = createContext<IOutletContext>({ outlet: null })

interface IOutletProps {
  children: ReactNode
}

// Suppport named outlets so that a Module can support multiple
// places to mount children two.
// Potentially duplicate web-components API for slots.
export function Outlet({ children }: IOutletProps) {
  const { moduleId } = useHost()
  const [outlet, setOutlet] = useState(null)

  return (
    <Fragment>
      <OutletContext.Provider value={{ outlet }}>
        {children}
      </OutletContext.Provider>
      {/* @ts-ignore */}
      <div ref={setOutlet} data-module-outlet-owner={moduleId} />
    </Fragment>
  )
}

export function useOutlet() {
  const { host } = useHost()
  const { outlet } = useContext(OutletContext)

  useEffect(() => {
    if (outlet) {
      // Hide the original host as the content will not be rendered into it,
      // it only serves to define what should be rendered inside the outlet.
      host.hide()
      outlet.setAttribute('data-module-outlet-content', host.moduleId)
    }
  }, [outlet])

  return { outlet }
}
