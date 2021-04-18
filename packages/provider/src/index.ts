import type { IProvider } from "@portals/core";
import { combineProvider } from "@portals/core";

import { LocaleProvider } from "./LocaleProvider";
import { MessagesProvider } from "./MessagesProvider";
import { GlobalLoadingProvider } from "./GlobalLoadingProvider";
import { ViewProvider } from "./ViewProvider";

import { ConfigProvider } from "./ConfigProvider";
import { I18nProvider } from "./I18nProvider";

export const AppProvider: IProvider = combineProvider([
  LocaleProvider,
  MessagesProvider,
  GlobalLoadingProvider,
  ViewProvider
]);

export const ModuleProvider: IProvider = combineProvider([
  ConfigProvider,
  I18nProvider
]);
