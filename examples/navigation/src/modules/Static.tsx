import React from 'react'

import { ModuleBox } from '../components/ModuleBox'

interface IStaticPops {
  data: string
}

export default function Static(props: IStaticPops) {
  return (
    <ModuleBox>
      <p>Module with static content, not loading any data.</p>
    </ModuleBox>
  )
}
