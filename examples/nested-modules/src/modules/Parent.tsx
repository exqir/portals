import type { ReactNode } from "react";
import React, { useState } from "react";
import { Outlet } from "@portals/core";

import { ModuleBox } from '../components/ModuleBox'

interface IParentProps {
  children: ReactNode;
}

export default function Parent({ children }: IParentProps) {
  return (
    <ModuleBox>
      <p>
       The parent module rendering the child module.
      </p>
      <Outlet>{children}</Outlet>
    </ModuleBox>
  );
}
