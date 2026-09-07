"use client";

import {
  MantineProvider,
  createTheme,
  localStorageColorSchemeManager,
} from "@mantine/core";

const theme = createTheme({
  fontFamily: "var(--font-geist-sans), sans-serif",
  primaryColor: "graphite",
  defaultRadius: "xl",
  colors: {
    graphite: [
      "#f7f7f7",
      "#eeeeee",
      "#dedede",
      "#c7c7c7",
      "#adadad",
      "#8c8c8c",
      "#707070",
      "#5c5c5c",
      "#414141",
      "#252525",
    ],
    spectre: [
      "#eef1f5",
      "#d9dfe7",
      "#bcc7d3",
      "#9facc0",
      "#8595ae",
      "#6c7e99",
      "#56657b",
      "#404a5b",
      "#2b313d",
      "#171b22",
    ],
  },
});

const colorSchemeManager = localStorageColorSchemeManager({
  key: "portfolio-color-scheme",
});

type AppThemeProviderProps = {
  children: React.ReactNode;
};

export default function AppThemeProvider({
  children,
}: AppThemeProviderProps) {
  return (
    <MantineProvider
      theme={theme}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="light"
    >
      {children}
    </MantineProvider>
  );
}
