import type { ReactNode, ReactElement } from 'react'
import React from 'react'
import { useLocation, useHref, useResolvedPath, To } from 'react-router-dom'
import { isFunction } from '@portals/core'

import { useRouting, useActivePath, usePendingPath } from './Pending'

// Mostly taken over from react-router-dom
// https://github.com/remix-run/react-router/blob/1becc3135c9330f21b8b3c8bd0b8926e6ad8670a/packages/react-router-dom/index.tsx
// The main reason to copy the implementation is to support pending navigation
// by using our own navigate function instead of the one from react-router.

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: To
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef({ onClick, to, target, ...rest }, ref) {
    let href = useHref(to)
    let internalOnClick = useLinkClickHandler(to, { target })
    function handleClick(
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    ) {
      if (onClick) onClick(event)
      if (!event.defaultPrevented) {
        internalOnClick(event)
      }
    }

    return (
      <a
        {...rest}
        href={href}
        onClick={handleClick}
        ref={ref}
        target={target}
      />
    )
  },
)

export interface NavLinkProps extends Omit<LinkProps, 'className' | 'style'> {
  children:
    | ReactNode
    | ((props: { isActive: boolean; isPending: boolean }) => ReactElement)
  caseSensitive?: boolean
  className?:
    | string
    | ((props: { isActive: boolean; isPending: boolean }) => string)
  end?: boolean
  style?:
    | React.CSSProperties
    | ((props: {
        isActive: boolean
        isPending: boolean
      }) => React.CSSProperties)
}

/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLinkWithRef(
    {
      'aria-current': ariaCurrentProp = 'page',
      caseSensitive = false,
      className: classNameProp = '',
      end = false,
      style: styleProp,
      to,
      children,
      ...rest
    },
    ref,
  ) {
    const isActive = useActivePath(to, end)
    const isPending = usePendingPath(to)

    let ariaCurrent = isActive ? ariaCurrentProp : undefined

    let className: string
    if (isFunction(classNameProp)) {
      className = classNameProp({ isActive, isPending })
    } else {
      // If the className prop is not a function, we use a default `active`
      // class for <NavLink />s that are active. In v5 `active` was the default
      // value for `activeClassName`, but we are removing that API and can still
      // use the old default behavior for a cleaner upgrade path and keep the
      // simple styling rules working as they currently do.
      className = [
        classNameProp,
        isActive ? 'active' : null,
        isPending ? 'pending' : null,
      ]
        .filter(Boolean)
        .join(' ')
    }

    let style = isFunction(styleProp)
      ? styleProp({ isActive, isPending })
      : styleProp

    return (
      <Link
        {...rest}
        aria-current={ariaCurrent}
        className={className}
        ref={ref}
        style={style}
        to={to}
        children={
          isFunction(children) ? children({ isActive, isPending }) : children
        }
      />
    )
  },
)

export function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
  to: To,
  {
    target,
  }: {
    target?: string
  } = {},
): (event: React.MouseEvent<E, MouseEvent>) => void {
  const { navigate } = useRouting()
  const location = useLocation()
  const path = useResolvedPath(to)

  return React.useCallback(
    (event: React.MouseEvent<E, MouseEvent>) => {
      if (
        event.button === 0 && // Ignore everything but left clicks
        (!target || target === '_self') && // Let browser handle "target=_blank" etc.
        !isModifiedEvent(event) // Ignore clicks with modifier keys
      ) {
        event.preventDefault()

        navigate(to)
      }
    },
    [location, navigate, path, target, to],
  )
}

function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}
