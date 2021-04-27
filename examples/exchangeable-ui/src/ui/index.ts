import type { IButtonProps, ITextProps } from "./definitions";
import { createUIComponent } from "../provider/UIProvider";

export const Button = createUIComponent<IButtonProps>("Button");
export const Text = createUIComponent<ITextProps>("Text");
