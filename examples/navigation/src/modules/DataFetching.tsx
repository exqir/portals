import type { IOnInitHook } from "@portals/core";
import React, { useState, useEffect } from "react";

import { ModuleBox } from '../components/ModuleBox'

interface IDataFetchingrops {
  data: string;
}

export default function DataFetching({ data }: IDataFetchingrops) {
  return (
    <ModuleBox>
      <p>
        Module loading data for 1000ms.
      </p>
    </ModuleBox>
  );
}

export const useInit: IOnInitHook<Record<string, unknown> | null> = function useDataFetching() {
  const [state, setState] = useState<Record<string, unknown> | null>(null);

  // Simulate API loading
  useEffect(() => {
    console.log("ModuleOne mounted");
    setTimeout(() => {
      setState({});
    }, 1000);
  }, []);

  return {
    data: state,
    error: undefined,
    loading: state === null
  };
};
