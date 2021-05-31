import React, { useState } from 'react'
import { Slot, Children } from '@portals/core'

import { ModuleBox } from '../components/ModuleBox'
import { Portal } from '../components/Portal'

export default function Parent() {
  const [show, setShow] = useState(false)
  return (
    <ModuleBox>
      <div className="inline">
        <div>
          Left slot
          <Slot name="left" />
        </div>
        <p className="inline">
          <Portal /> The parent module rendering the child module.
        </p>
        <div>
          <button onClick={() => setShow(v => !v)}>
            {show ? 'Hide' : 'Show'}
          </button>{' '}
          Children
          <Children condition={show} />
        </div>
      </div>
    </ModuleBox>
  )
}
