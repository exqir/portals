import type { IButtonProps } from '../definitions'
import React from "react"

export function Button({ type, onClick, children }: IButtonProps) {
  return (
    <button
      style={{
        borderRadius: '5px',
        backgroundColor: 'coral',
        color: 'white',
      }}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
