import type { IOnInitHook } from "@portals/react";
import React, { useState } from "react";

import { Children } from "@portals/react";
import { useConfig, useView, useLocalize } from "@portals/provider";

interface IModuleTwoProps {
  data: string;
}

export default function ModuleTwo({ data }: IModuleTwoProps) {
  const { config } = useConfig();
  const { localize } = useLocalize();
  const { navigate, pendingNavigation } = useView();

  return (
    <div>
      <p>
        Module Two: {data}. Config: {config.value}. Messages{" "}
        {localize("message")}
      </p>
      <button
        type="button"
        onClick={() => navigate((view) => (view === "one" ? "two" : "one"))}
      >
        Change view{pendingNavigation ? " Loading" : null}
      </button>
      <Children />
    </div>
  );
}

export const useInit: IOnInitHook<string> = function useInitModuleTwo() {
  const [state] = useState("bar");
  return { data: state, error: undefined, loading: false };
};

export const tag = "module-two";
