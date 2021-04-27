import { MouseEventHandler, ReactNode } from 'react'

export interface IButtonProps {
  type?: 'button' | 'submit'
  onClick?: MouseEventHandler
  children: ReactNode
}

export interface ITextProps {
  children: ReactNode
}
