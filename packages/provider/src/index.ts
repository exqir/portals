import type { IProvider } from "@portals/core";
import { combineProvider } from "@portals/core";

import { LocaleProvider, useLocale } from "./LocaleProvider";
import { MessagesProvider, useMessages } from "./MessagesProvider";
import { GlobalLoadingProvider } from "./GlobalLoadingProvider";
import { ViewProvider, View, useView } from "./ViewProvider";

import { ConfigProvider, useConfig } from "./ConfigProvider";
import { I18nProvider, useLocalize } from "./I18nProvider";

export {
  LocaleProvider,
  MessagesProvider,
  GlobalLoadingProvider,
  ViewProvider,
  ConfigProvider,
  I18nProvider,
}

export { View }

export {
  useLocale,
  useMessages,
  useView,
  useConfig,
  useLocalize,
}

export const AppProvider: IProvider = combineProvider([
  LocaleProvider,
  MessagesProvider,
  GlobalLoadingProvider,
  ViewProvider
]);

export const ModuleProvider: IProvider = combineProvider([
  // @ts-ignore
  ConfigProvider,
  I18nProvider
]);
