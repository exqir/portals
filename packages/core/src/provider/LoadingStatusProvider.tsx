import type { ReactNode, Dispatch } from 'react'
import React, {
  useReducer,
  useCallback,
} from 'react'

import type { IRegistry } from '../types/definitions'
import type { ModuleHostElement } from '../internal/ModuleHostElement'
import { MODULE_STATUS } from '../internal/ModuleHostElement'
import { createContext } from '../createProvider'
import { isUndefined } from '../internal/utils'

export enum LOADING_STATUS {
  INIT = 'INIT',
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

enum ACTIONS {
  MODULE_LOADING = 'MODULE_LOADING',
  MODULE_RENDERED = 'MODULE_RENDERED',
  MODULE_ERRORED = 'MODULE_ERRORED',
  MODULE_HIDDEN = 'MODULE_HIDDEN',
}

interface INode {
  nodeStatus: MODULE_STATUS
  treeStatus: MODULE_STATUS
  module: ModuleHostElement
  parent: string | null
  children: string[]
}

interface IModules {
  [id: string]: INode
}
interface ILoadingState {
  status: LOADING_STATUS
  modules: IModules
}

type ILoadingAction = {
  type: ACTIONS
  payload: { module: ModuleHostElement, status: MODULE_STATUS }
}

function getNodeTreeStatus(modules: IModules, node: INode): MODULE_STATUS {
  // If the node itself is not rendered then the whole tree
  // can not be considered as rendered.
  if (node.nodeStatus !== MODULE_STATUS.RENDERED) {
    return node.nodeStatus
  }

  let status: MODULE_STATUS = node.nodeStatus
  for (const childId of node.children) {
    // If one of the childrens trees is in a dirty state
    // then the parents tree is in the same dirty state
    switch (modules[childId].treeStatus) {
      case MODULE_STATUS.ERROR: {
        return MODULE_STATUS.ERROR
      }
      // Treat Registered modules as still loading
      case MODULE_STATUS.REGISTERED:
      case MODULE_STATUS.LOADING: {
        status = MODULE_STATUS.LOADING
        break
      }
      // Ignore hidden children
      // case MODULE_STATUS.HIDDEN: {
      //   // Loading takes presedence over hidden
      //   if (status !== MODULE_STATUS.LOADING) {
      //     status = MODULE_STATUS.HIDDEN
      //   }
      //   break;
      // }
    }
  }

  return status
}

function getLoadingStatus(modules: IModules): LOADING_STATUS {
  const topLevelModules = Object.values(modules).filter(
    node => node.parent === null,
  )

  let status = LOADING_STATUS.INIT
  for (const module of topLevelModules) {
    switch (module.treeStatus) {
      case MODULE_STATUS.ERROR:
        return LOADING_STATUS.ERROR
      case MODULE_STATUS.LOADING: {
        status = LOADING_STATUS.LOADING
        break
      }
      case MODULE_STATUS.RENDERED: {
        if (status === LOADING_STATUS.INIT) {
          status = LOADING_STATUS.IDLE
        }
        break
      }
    }
  }

  return status
}

function getAllElements(
  registry: IRegistry,
  parent: string | null = null,
): IModules {
  let modules: IModules = {}

  registry.getElements().forEach(element => {
    const id = element.moduleId
    let children: IModules = {}

    const childrenRegistry = registry.getRegistry(element)
    if (childrenRegistry?.getElements().length) {
      children = getAllElements(childrenRegistry, id)
      modules = { ...modules, ...children }
    }

    const node: INode = {
      module: element,
      parent,
      children: Object.values(children)
      // TODO: Only add direct children as children in a better way
        .filter(c => c.parent === id)
        .map(c => c.module.moduleId),
      nodeStatus: MODULE_STATUS.REGISTERED,
      treeStatus: MODULE_STATUS.REGISTERED,
    }

    modules[id] = node
  })

  return modules
}

function initState(registry: IRegistry): ILoadingState {
  return {
    status: LOADING_STATUS.INIT,
    modules: getAllElements(registry),
  }
}

function updateAffectedParents(modules: IModules, node: INode): IModules {
  let updatedModules = { ...modules }

  let parentId = node.parent
  while (parentId) {
    const parent = updatedModules[parentId]
    const treeStatus = getNodeTreeStatus(updatedModules, parent)

    if (treeStatus === parent.treeStatus) {
      // The treeStatus has not changed, therefore the parents further
      // up the tree will also not change.
      break
    }

    updatedModules[parentId] = { ...parent, treeStatus }

    parentId = parent.parent
  }

  return updatedModules
}

function loadingReducer(state: ILoadingState, action: ILoadingAction) {
  console.log(state, action)
  switch (action.type) {
    case ACTIONS.MODULE_ERRORED:
    case ACTIONS.MODULE_LOADING:
    case ACTIONS.MODULE_HIDDEN:
    case ACTIONS.MODULE_RENDERED: {
      const { module, status } = action.payload
      const id = module.moduleId

      const changedModule = {
        ...state.modules[id],
        nodeStatus: status,
      }
      const modulesCopy = {
        ...state.modules,
        [id]: {
          ...changedModule,
          treeStatus: getNodeTreeStatus(state.modules, changedModule),
        },
      }
      const updatedModules = updateAffectedParents(modulesCopy, changedModule)

      const newState = {
        ...state,
        status: getLoadingStatus(updatedModules),
        modules: updatedModules,
      }

      return newState
    }
    default:
      throw Error(`Unsupported action ${action.type}.`)
  }
}

interface ILoadingContext {
  state: ILoadingState
  dispatch: Dispatch<ILoadingAction>
}

const [LoadingContext, useLoadingContext] = createContext<ILoadingContext>('LoadingContext')

interface ILoadingStatusProviderProps {
  registry: IRegistry
  children: ReactNode
}

export function LoadingStatusProvider({
  registry,
  children,
}: ILoadingStatusProviderProps) {
  const [state, dispatch] = useReducer(loadingReducer, registry, initState)

  return (
    <LoadingContext state={state} dispatch={dispatch}>
      {children}
    </LoadingContext>
  )
}

export function useLoadingStatus(element?: ModuleHostElement): { loadingStatus: MODULE_STATUS | LOADING_STATUS} {
  const { state } = useLoadingContext();

  if (isUndefined(element)) {
    return { loadingStatus: state.status }
  }

  const id = element.moduleId
  const node = state.modules[id]

  if (isUndefined(node)) {
    throw new Error(`Failed to find loading status: Element with id ${id} does not exist in loading state.`)
  }

  return { loadingStatus: node.treeStatus}
}

export function useModuleStatus(_element: ModuleHostElement) {
  const { dispatch } = useLoadingContext()

  const setError = useCallback(
    (element: ModuleHostElement = _element) => {
      element.setStatus(MODULE_STATUS.ERROR)
      dispatch({
        type: ACTIONS.MODULE_ERRORED,
        payload: { module: element, status: MODULE_STATUS.ERROR },
      })
    },
    [dispatch, _element],
  )

  const setLoading = useCallback(
    (element: ModuleHostElement = _element) => {
      element.setStatus(MODULE_STATUS.LOADING)
      dispatch({
        type: ACTIONS.MODULE_LOADING,
        payload: { module: element, status: MODULE_STATUS.LOADING },
      })
    },
    [dispatch, _element],
  )

  const setLoaded = useCallback(
    (element: ModuleHostElement = _element) => {
      element.setStatus(MODULE_STATUS.RENDERED)
      dispatch({
        type: ACTIONS.MODULE_RENDERED,
        payload: { module: element, status: MODULE_STATUS.RENDERED },
      })
    },
    [dispatch, _element],
  )

  const setHidden = useCallback(
    (element: ModuleHostElement = _element) => {
      element.setStatus(MODULE_STATUS.HIDDEN)
      dispatch({
        type: ACTIONS.MODULE_HIDDEN,
        payload: { module: element, status: MODULE_STATUS.HIDDEN },
      })
    },
    [dispatch, _element],
  )

  return { setError, setLoading, setLoaded, setHidden }
}
