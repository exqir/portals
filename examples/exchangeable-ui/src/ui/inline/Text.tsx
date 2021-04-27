import type { ITextProps } from "../definitions";
import React from 'react'

export function Text({ children }: ITextProps) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: "1rem"
      }}
    >
      {children}
    </p>
  );
}
