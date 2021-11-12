import type { ReactNode } from 'react'
import React from 'react'
import { NavLink } from '@portals/react'

interface INavButtonProps {
  path: string
  children: ReactNode
}

export function NavButton({ path, children }: INavButtonProps) {
  return (
    <NavLink className="button" to={path}>
      {({ isPending }) => (isPending ? 'Waiting' : children)}
    </NavLink>
  )
}
