import { ModuleHostElement } from './ModuleHostElement'
import { getAttribute, isNull } from './utils'

export class RouteElement extends ModuleHostElement {
  public path: string

  constructor() {
    super()

    const path = getAttribute(this, 'path')

    if (isNull(path)) {
      throw new Error(
        'Missins path on RouteElement. A RouteElement has to define the path it relates to.',
      )
    }

    this.path = path
  }
}
