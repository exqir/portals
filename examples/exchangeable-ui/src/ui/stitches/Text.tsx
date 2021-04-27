import React from 'react'
import { styled } from '@stitches/react'

import { ITextProps } from '../definitions'

const P = styled('p', {
  margin: 0,
  fontSize: '1rem',
  fontStyle: 'italic',
})

export function Text({ children }: ITextProps) {
  return <P>{children}</P>
}
