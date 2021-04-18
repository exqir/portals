import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { useBootstrapOptions, createContext } from '@portals/core'

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
  const { options } = useBootstrapOptions()
  const [messages, setMessages] = useState({})
  const { locale } = useLocale()
  const language = getLanguage(locale)

  useEffect(() => {
    fetch(`${options.baseUrl}/${language}.json`)
      .then(m => m.json())
      .then(m => setMessages(m))
  }, [language, options])

  return <Provider messages={messages}>{children}</Provider>
}

export { useMessages }
