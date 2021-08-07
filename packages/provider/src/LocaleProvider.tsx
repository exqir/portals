import type { Dispatch, SetStateAction, ReactNode } from "react";
import React, { useState } from "react";
import { createContext } from "@portals/react";

function initLocale() {
  return navigator.language;
}

interface ILocaleContext {
  locale: string;
  setLocale: Dispatch<SetStateAction<string>>;
}

const [Provider, useLocale] = createContext<ILocaleContext>("Locale");

interface LocaleProviderProps {
  children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = useState(initLocale);

  return (
    <Provider locale={locale} setLocale={setLocale}>
      {children}
    </Provider>
  );
}

export { useLocale };
