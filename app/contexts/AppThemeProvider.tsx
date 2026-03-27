"use client";

import {
  MantineProvider,
  createTheme,
  localStorageColorSchemeManager,
} from "@mantine/core";

const theme = createTheme({
  fontFamily: "var(--font-geist-sans), sans-serif",
  primaryColor: "sakura",
  defaultRadius: "xl",
  colors: {
    sakura: [
      "#fff2f7",
      "#ffe4ef",
      "#ffc9de",
      "#ffadc9",
      "#ff90b5",
      "#fb77a4",
      "#eb5d8f",
      "#cd4677",
      "#a93761",
      "#872c4d",
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
