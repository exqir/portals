import type { ReactNode } from "react";
import React from "react";

import { ModuleBox } from '../components/ModuleBox'
import { Portal } from '../components/Portal'

interface IChildProps {
  children: ReactNode;
}

export default function Child(props: IChildProps) {
  return (
    <ModuleBox>
      <p className="inline">
      <Portal/> The child module.
      </p>
    </ModuleBox>
  );
}
