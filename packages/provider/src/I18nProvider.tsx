import type { ReactNode } from "react";
import React, { useMemo, useCallback } from "react";
import { useHost, createContext } from "@portals/react";

import { useMessages } from "./MessagesProvider";

type Messages = Record<string, string>;

function extractModuleMessages(
  messages: Record<string, Messages>,
  moduleTag: string
) {
  const { [moduleTag]: moduleMessages = {} } = messages;
  return moduleMessages as Record<string, string>;
}

interface II18nContext {
  localize: (key: string) => string;
}

interface II18nProviderProps {
  children: ReactNode;
}

const [Provider, useLocalize] = createContext<II18nContext>("I18n");

export function I18nProvider({ children }: II18nProviderProps) {
  const { moduleTag } = useHost();
  const { messages } = useMessages();

  const moduleMessages = useMemo(
    () => extractModuleMessages(messages, moduleTag),
    [messages, moduleTag]
  );

  const localize = useCallback(
    (key: string) => {
      return moduleMessages[key];
    },
    [moduleMessages]
  );

  return <Provider localize={localize}>{children}</Provider>;
}

export { useLocalize };
