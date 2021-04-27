import { lazy } from 'react'
import { Text } from './Text'

export default {
  // Some components could be lazy others could be directly included.
  // This way a waterfall loading based on React renders could be
  // avoided of the most common components without having to load
  // all components at once.
  Button: lazy(() =>
    import('./Button').then(({ Button }) => ({ default: Button })),
  ),
  Text,
}
