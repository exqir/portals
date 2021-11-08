import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { useRuntimeOptions, createContext } from '@portals/react'

import { useLocale } from './LocaleProvider'

function getLanguage(locale: string) {
  const [language] = locale.split('-')
  return language
}

type Messages = Record<string, string>

interface IMessagesContext {
  messages: Record<string, Messages>
}

const [Provider, useMessages] = createContext<IMessagesContext>('Messages')

interface MessagesProviderProps {
  children: ReactNode
}

export function MessagesProvider({ children }: MessagesProviderProps) {
  const { baseUrl } = useRuntimeOptions()
  const [messages, setMessages] = useState({})
  const { locale } = useLocale()
  const language = getLanguage(locale)

  useEffect(() => {
    fetch(`${baseUrl}/${language}.json`)
      .then((m) => m.json())
      .then((m) => setMessages(m))
  }, [language, baseUrl])

  return <Provider messages={messages}>{children}</Provider>
}

export { useMessages }
