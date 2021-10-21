import type { ReactNode, Dispatch } from 'react'
import type {
  ModuleHostElement,
  IModulesRoot,
  IModulesNode,
} from '@portals/core'
import React, { useReducer, useMemo } from 'react'
import { isUndefined, isNull } from '@portals/core'

import { createContext } from '../createProvider'

enum LOADING_STATE {
  IDLE,
  LOADING,
  ERROR,
}

interface LoadingNode {
  nodeState: LOADING_STATE
  subTreeState: LOADING_STATE
  element: ModuleHostElement
  parent: string | null
  children: string[] | null
  isVisible: boolean
}
interface ILoadingState {
  state: Record<string, LoadingNode>
  topLevelElements: string[]
  globalLoadingState: LOADING_STATE
}

interface ILoadingContext {
  state: ILoadingState
  dispatch: Dispatch<LoadingAction>
}

const [LoadingContextProvider, useLoadingContext] =
  createContext<ILoadingContext>('LoadingStatus')

export { useLoadingContext }

interface ILoadingStatusProviderProps {
  modulesTree: IModulesRoot
  children: ReactNode
}

interface LoadingAction {
  element: ModuleHostElement
  update: Partial<LoadingNode>
}

function reducer(
  { state: prevState, topLevelElements }: ILoadingState,
  { element, update }: LoadingAction,
) {
  const state = updateLoadingState(prevState, element, update)

  // console.log('Updating loading state', element, update, prevState, state)

  return {
    state,
    topLevelElements,
    globalLoadingState: getCombinedLoadingState(state, topLevelElements),
  }
}

export function LoadingStatusProvider({
  modulesTree,
  children,
}: ILoadingStatusProviderProps) {
  const [state, dispatch] = useReducer(reducer, modulesTree, getInitialState)

  return (
    <LoadingContextProvider state={state} dispatch={dispatch}>
      {children}
    </LoadingContextProvider>
  )
}

export function useGlobalLoadingStatus(): {
  isLoading: boolean
  hasError: boolean
} {
  const { state } = useLoadingContext()

  return {
    isLoading: state.globalLoadingState === LOADING_STATE.LOADING,
    hasError: state.globalLoadingState === LOADING_STATE.ERROR,
  }
}

export function useChildrenLoadingStatus(element: ModuleHostElement): {
  isLoading: boolean
  hasError: boolean
  isRendered: boolean
} {
  const { state } = useLoadingContext()

  const node = state.state[element.moduleId]

  if (isUndefined(node)) {
    throw new Error(
      `Failed to find loading status: Element ${element.id} does not exist in loading state.`,
    )
  }

  const childrenLoadingState = getChildrenLoadingState(state.state, node)

  return {
    isLoading: childrenLoadingState === LOADING_STATE.LOADING,
    hasError: childrenLoadingState === LOADING_STATE.ERROR,
    isRendered: childrenLoadingState === LOADING_STATE.IDLE,
  }
}

export function useModuleStatus(_element: ModuleHostElement) {
  const { dispatch } = useLoadingContext()

  return useMemo(
    () => ({
      setError: (element: ModuleHostElement = _element) =>
        dispatch({
          element,
          update: { nodeState: LOADING_STATE.ERROR },
        }),
      setLoading: (element: ModuleHostElement = _element) =>
        dispatch({
          element,
          update: { nodeState: LOADING_STATE.LOADING },
        }),
      setLoaded: (element: ModuleHostElement = _element) =>
        dispatch({
          element,
          update: { nodeState: LOADING_STATE.IDLE },
        }),
      setHidden: (element: ModuleHostElement = _element) =>
        dispatch({
          element,
          update: { isVisible: false },
        }),
      setVisibile: (element: ModuleHostElement = _element) =>
        dispatch({
          element,
          update: { isVisible: true },
        }),
    }),
    [dispatch, _element],
  )
}

function createNode(
  treeNode: IModulesNode,
  parent: IModulesNode | null,
): LoadingNode {
  const hasChildren = treeNode.children.length > 0
  return {
    element: treeNode.element,
    children: hasChildren
      ? treeNode.children.map((child) => child.element.moduleId)
      : null,
    parent: parent?.element.moduleId ?? null,
    nodeState: LOADING_STATE.LOADING,
    subTreeState: hasChildren ? LOADING_STATE.LOADING : LOADING_STATE.IDLE,
    isVisible: true,
  }
}

function createNodes(
  state: ILoadingState['state'],
  node: IModulesNode,
  parent: IModulesNode | null,
): void {
  const { element, children } = node
  state[element.moduleId] = createNode(node, parent)

  if (node.children.length < 1) return
  children.forEach((childElement) => createNodes(state, childElement, node))
}

function getInitialState(modulesTree: IModulesRoot): ILoadingState {
  const state: ILoadingState['state'] = {}

  modulesTree.children.forEach((child) => {
    createNodes(state, child, modulesTree.element)
  })

  const topLevelElements = modulesTree.children.map(
    (node) => node.element.moduleId,
  )

  return {
    state,
    topLevelElements,
    globalLoadingState: getCombinedLoadingState(state, topLevelElements),
  }
}

function getCombinedLoadingState(
  state: ILoadingState['state'],
  ids: string[],
): LOADING_STATE {
  return ids.reduce((combinedState, id) => {
    const node = state[id]
    if (!node.isVisible) return combinedState
    return Math.max(
      combinedState,
      isNull(node.children) ? node.nodeState : node.subTreeState,
    )
  }, LOADING_STATE.IDLE)
}

function getSubTreeLoadingState(
  state: ILoadingState['state'],
  node: LoadingNode,
): LOADING_STATE {
  if (isNull(node.children)) return node.nodeState
  if (node.nodeState !== LOADING_STATE.IDLE) return node.nodeState

  return Math.max(node.nodeState, getCombinedLoadingState(state, node.children))
}

function updateLoadingState(
  state: ILoadingState['state'],
  element: ModuleHostElement,
  nodeUpdate: Partial<LoadingNode>,
): ILoadingState['state'] {
  const id = element.moduleId
  const maybeNode = state[id]
  if (isUndefined(maybeNode)) {
    throw new Error(
      `Trying to update LoadingState of an unkown element. Element ${element.moduleId} does not exist in the modules tree.`,
    )
  }

  const node = { ...maybeNode, ...nodeUpdate }

  const newState = { ...state }
  node.subTreeState = getSubTreeLoadingState(state, node)

  newState[id] = node

  let parent = node.parent

  while (parent) {
    const parentNode = newState[parent]
    const newSubTreeState = getSubTreeLoadingState(newState, parentNode)
    if (newSubTreeState === parentNode.subTreeState) break
    parentNode.subTreeState = newSubTreeState
    parent = parentNode.parent
  }

  return newState
}

function getChildrenLoadingState(
  state: ILoadingState['state'],
  node: LoadingNode,
) {
  const children = node.children
  if (isNull(children)) return LOADING_STATE.IDLE
  if (children.every((id) => !state[id].isVisible)) return LOADING_STATE.LOADING

  return getCombinedLoadingState(state, children)
}
