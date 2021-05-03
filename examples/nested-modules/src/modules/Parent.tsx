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
      <div className="inline">
        <Outlet slot="left" />
        <p className="inline">
        <Portal/> The parent module rendering the child module.
        </p>
        <Outlet />
      </div>
    </ModuleBox>
  );
}
