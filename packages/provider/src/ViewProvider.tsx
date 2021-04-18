import type { Dispatch, SetStateAction, ReactNode } from "react";
import type { Location, History } from "history";
import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef
} from "react";
import { createBrowserHistory } from "history";
import { useRegistry, useHost, LoadingStatusProvider, STATUS, useLoadingStatus, useDispatchStatusChange } from "@portals/core";

// Should we move core utils to its own package so that they can be shared?
function noop() {}

function initHistory() {
  return createBrowserHistory();
}

function getActiveView(location: Location) {
  const { search } = location;
  const params = new URLSearchParams(search);
  return params.get("view");
}

function setActiveLocationView(history: History, newView: string) {
  if (newView === getActiveView(history.location)) {
    return newView;
  }

  const { search } = history.location;
  const params = new URLSearchParams(search);

  params.set("view", newView);
  history.push({ search: `?${params.toString().replace(/%2C/g, ",")}` });

  return newView;
}

enum NAVIGATION_STATUS {
  ERROR = "ERROR",
  SUCCESS = "SUCCESS"
}

interface IViewContext {
  activeView: string;
  nextView: string | null;
  setView: Dispatch<SetStateAction<string>>;
  onNavigationStatusChange: (status: NAVIGATION_STATUS) => void;
}

type ISetViewFunction = (newState: string) => string;

const ViewContext = createContext<IViewContext>({
  activeView: "",
  nextView: null,
  setView: noop,
  onNavigationStatusChange: noop
});

interface IViewState {
  active: string;
  next: string | null;
}

interface ViewProviderProps {
  children: ReactNode
}

export function ViewProvider({ children }: ViewProviderProps) {
  const [history] = useState(initHistory);
  const [viewState, setViewState] = useState<IViewState>({
    // TODO: Handle null case instead of type cast
    active: getActiveView(history.location) as string,
    next: null
  });

  const setView = useCallback((view: string | ISetViewFunction): void => {
    setViewState((vs) => ({
      active: vs.active,
      next: typeof view === "function" ? view(vs.active) : view
    }));
  }, []);

  const onNavigationStatusChange = useCallback(
    (status: NAVIGATION_STATUS) => {
      if (status === NAVIGATION_STATUS.ERROR) {
        setViewState((vs) => ({ active: vs.active, next: null }));
      } else {
        if (status === NAVIGATION_STATUS.SUCCESS) {
          // @ts-ignore
          setViewState((vs) => {
            // @ts-ignore
            setActiveLocationView(history, vs.next);
            return { active: vs.next, next: null };
          });
        }
      }
    },
    [history, setViewState]
  );

  return (
    <ViewContext.Provider
      value={{
        activeView: viewState.active,
        nextView: viewState.next,
        setView,
        onNavigationStatusChange
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export function useView(name?: string) {
  const {
    activeView,
    nextView,
    setView,
    onNavigationStatusChange
  } = useContext(ViewContext);

  return {
    isActive: name === activeView,
    isPreloading: name === nextView,
    navigate: setView,
    pendingNavigation: nextView !== null,
    onNavigationStatusChange
  };
}

interface ViewProps {
  children: ReactNode;
}

function getAttribute(element: Element, attribute: string) {
  return element.attributes.getNamedItem(attribute)?.value;
}

export function View({ children }: ViewProps) {
  const { host } = useHost();
  const { registry } = useRegistry();
  const name = getAttribute(host, "name");
  const { isActive, isPreloading, onNavigationStatusChange } = useView(name);
  const { dispatchStatusChange } = useDispatchStatusChange();
  const initialDisplayStyle = useRef(host.style.display);
  const id = host.moduleId;
  const { setLoaded } = useLoadingStatus(id);

  useEffect(() => {
    if (!isActive) {
      registry.getElements().forEach((e) => {
        setLoaded(e.moduleId);
      });
    }
  }, [isActive, setLoaded, registry]);

  useLayoutEffect(() => {
    if (isActive) {
      host.style.display = initialDisplayStyle.current;
    } else {
      host.style.display = "none";
    }
  }, [isActive, name, host, initialDisplayStyle]);

  const onNavigationPreloadStatusChange = useCallback(
    onNavigation(onNavigationStatusChange),
    [onNavigationStatusChange]
  );

  return isActive || isPreloading ? (
    <div style={isPreloading ? { display: "none", visibility: "hidden" } : {}}>
      <LoadingStatusProvider
        registry={registry}
        onStatusChanged={
          // When preloading a view we don't want to report the loading
          // state to a LoadingManager higher in the tree because it is
          // hidden from the user and should not count as loading.
          // Once a preloaded View becomes active it is already loaded and
          // therefore the state can stay "loading: false", as it is the case
          // for a none-active View.
          isPreloading ? onNavigationPreloadStatusChange : undefined
        }
        onDispatch={dispatchStatusChange}
      >
        {children}
      </LoadingStatusProvider>
    </div>
  ) : null;
}

function onNavigation(
  onNavigationStatusChange: IViewContext["onNavigationStatusChange"]
) {
  return (status: STATUS) => {
    if (status === STATUS.ERROR) {
      return onNavigationStatusChange(NAVIGATION_STATUS.ERROR);
    }
    if (status === STATUS.IDLE) {
      return onNavigationStatusChange(NAVIGATION_STATUS.SUCCESS);
    }
  };
}
