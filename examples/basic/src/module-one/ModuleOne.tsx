import type { IOnInitHook } from "@portals/core";
import React, { useState, useEffect } from "react";

import { useLocale, useLocalize } from "@portals/provider";

interface IModuleOneProps {
  data: string;
}

export default function ModuleOne({ data }: IModuleOneProps) {
  const { locale, setLocale } = useLocale();
  const { localize } = useLocalize();

  return (
    <div>
      <p>
        Module One: {data}. Locale {locale}. Message {localize("message")}.
      </p>
      <button
        type="button"
        onClick={() => setLocale((l) => (l === "en-US" ? "de-DE" : "en-US"))}
      >
        Change Locale
      </button>
    </div>
  );
}

export const useInit: IOnInitHook<string | null> = function useInitModuleOne() {
  const [state, setState] = useState<string | null>(null);

  // Simulate API loading
  useEffect(() => {
    console.log("ModuleOne mounted");
    setTimeout(() => {
      setState("foo");
    }, 1000);
  }, []);

  return {
    data: state,
    error: undefined,
    loading: state === null
  };
};

export const tag = "module-one";
