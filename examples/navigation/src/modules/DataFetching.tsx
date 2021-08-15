import type { IOnInitHook } from "@portals/react";
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

export const useInit: IOnInitHook<string> = function useDataFetching() {
  const [state, setState] = useState<string>('');

  // Simulate API loading
  useEffect(() => {
    console.log("ModuleOne mounted");
    setTimeout(() => {
      setState('data loaded');
    }, 1000);
  }, []);

  return {
    data: state,
    error: undefined,
    loading: !state
  };
};
