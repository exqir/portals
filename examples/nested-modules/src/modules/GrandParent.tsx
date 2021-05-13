import type { ReactNode } from "react";
import React from "react";
import { Outlet } from "@portals/core";

import { ModuleBox } from '../components/ModuleBox'
import { Portal } from '../components/Portal'
interface IParentProps {
  children: ReactNode;
}

export default function Parent({ children }: IParentProps) {
  return (
    <ModuleBox>
      <Outlet slot="top" fallback={<p>Top slot fallback</p>} />
      <div className="inline">
        <Portal/> The grand parent module rendering the parent module.
      </div>
      <Outlet />
    </ModuleBox>
  );
}
