import React from 'react'
import { styled } from '@stitches/react'

import { IButtonProps } from '../definitions'

const Btn = styled('button', {
  backgroundColor: 'gainsboro',
  borderRadius: '9999px',
  fontSize: '13px',
  border: '0',
})

export function Button({ type, onClick, children }: IButtonProps) {
  return (
    <Btn type={type} onClick={onClick}>
      {children}
    </Btn>
  )
}
