import type { ReactNode } from "react";
import React from "react";

import { ModuleBox } from '../components/ModuleBox'

interface IChildProps {
  children: ReactNode;
}

export default function Child(props: IChildProps) {
  return (
    <ModuleBox>
      <p>
       The child module.
      </p>
    </ModuleBox>
  );
}
