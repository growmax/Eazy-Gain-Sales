import { useAuthContext } from "@/auth/hooks/use-auth-context";
import Logo from "@/components/Logo/logo";
import Iconify from "@/components/iconify/iconify";
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Toolbar,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

export default function Header({ setHeaderSearch, headerSearch }) {
  const { pathname, query } = useRouter();
  const { logout } = useAuthContext();
  return (
    <>
      <AppBar
        position={pathname.startsWith("/p") ? "static" : "sticky"}
        color="primary"
        elevation={0}
      >
        <Toolbar
          variant="dense"
          sx={{
            height: pathname.startsWith("/p") ? "10px" : "30px",
          }}
        >
          <Box
            justifyContent="space-between"
            alignItems="center"
            display="flex"
            my={1}
            width="100%"
          >
            <Logo light sx={{ width: 100 }} />
            <Box flexGrow={1} />
            <IconButton color="inherit" onClick={logout}>
              <Iconify icon="material-symbols:logout" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {pathname.startsWith("/p") && (
        <AppBar position="sticky" color="primary">
          <Toolbar variant="dense">
            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                border: (theme) =>
                  theme.palette.mode === "dark"
                    ? `1px solid ${theme.palette.divider}`
                    : "unset",
                width: "100%",
                height: "38px",
                borderRadius: 0.5,
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={`Search Products in ${query.slug[0]}`}
                size="small"
                value={headerSearch}
                onChange={(ev) => {
                  setHeaderSearch(ev.target.value);
                }}
                inputProps={{ "aria-label": "search product" }}
              />

              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
                <Iconify icon="material-symbols:search" />
              </IconButton>
            </Paper>
          </Toolbar>
        </AppBar>
      )}
    </>
  );
}
