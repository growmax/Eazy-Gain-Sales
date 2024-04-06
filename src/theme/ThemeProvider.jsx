import React, { useMemo } from "react";
import { palette } from "./palette";
import { shadows } from "./shadows";
import { customShadows } from "./custom-shadows";
import { typography } from "./typography";
import { merge } from "lodash";
import { CssBaseline } from "@mui/material";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { componentsOverrides } from "./overrides";
export default function ThemeProvider({ children }) {
  const isBrowserDefaultDark =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
  const baseOption = useMemo(
    () => ({
      palette: palette(isBrowserDefaultDark ? "dark" : "light"),
      shadows: shadows(isBrowserDefaultDark ? "dark" : "light"),
      customShadows: customShadows(isBrowserDefaultDark ? "dark" : "light"),
      typography,
      shape: { borderRadius: 8 },
    }),

    [isBrowserDefaultDark]
  );
  const memoizedValue = useMemo(() => merge(baseOption), [baseOption]);
  const theme = createTheme(memoizedValue);
  theme.components = merge(componentsOverrides(theme));
  const themeWithLocale = useMemo(() => createTheme(theme), [theme]);
  return (
    <>
      <MuiThemeProvider theme={themeWithLocale}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </>
  );
}
