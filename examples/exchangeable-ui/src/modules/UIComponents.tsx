import React from 'react'

import { ModuleBox } from '../components/ModuleBox'
import { Button, Text } from '../ui'

export default function UIComponents() {
  return (
    <ModuleBox>
      <Text>Text component</Text>
      <Button
        onClick={() => {
          alert('Button clicked!')
        }}
      >
        Button component
      </Button>
    </ModuleBox>
  )
}
