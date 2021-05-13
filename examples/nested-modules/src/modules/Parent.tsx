import type { ReactNode } from 'react'
import React, { useState } from 'react'
import { Outlet } from '@portals/core'

import { ModuleBox } from '../components/ModuleBox'
import { Portal } from '../components/Portal'
interface IParentProps {
  children: ReactNode
}

export default function Parent({ children }: IParentProps) {
  const [show, setShow] = useState(false)
  return (
    <ModuleBox>
      <div className="inline">
        <div>
          Left slot
          <Outlet slot="left" />
        </div>
        <p className="inline">
          <Portal /> The parent module rendering the child module.
        </p>
        <div>
          <button onClick={() => setShow(v => !v)}>{show ? 'Hide' : 'Show'}</button> Children
          <Outlet condition={show} />
        </div>
      </div>
    </ModuleBox>
  )
}
