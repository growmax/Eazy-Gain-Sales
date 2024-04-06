import { useAuthContext } from "@/auth/hooks/use-auth-context";
import ProgressBar from "@/components/progress-bar";
import { SnackbarProvider } from "@/components/snackbar";
import useBuyerSelect from "@/hooks/use-buyer-select";
import useCart from "@/hooks/use-cart";
import { usePosition } from "@/hooks/use-position";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  TextField,
} from "@mui/material";
import { map } from "lodash";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { cloneElement, useEffect, useState } from "react";

const Header = dynamic(() => import("./Header"), { ssr: false });
export default function Layout({ children }) {
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const { Cartmutate } = useCart();
  const { latitude, longitude } = usePosition(true);
  const { authenticated } = useAuthContext();
  const { CustomerData, CustomerMutate } = useBuyerSelect(
    searchText,
    latitude,
    longitude
  );
  const [selectedBuyer, setSelectedBuyer] = useState();
  const [openCustomer, setOpenCustomer] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const localItem = localStorage.getItem("selectedBuyer");
    if (localItem) {
      setSelectedBuyer(JSON.parse(localItem));
    }
  }, []);
  const modifiedChildren = React.Children.map(children, (child) => {
    // Adding props to the child component
    return cloneElement(child, {
      selectedBuyer,
      headerSearch,
      setSelectedBuyer,
      setOpenCustomer,
    });
  });
  useEffect(() => {
    router.events.on("hashChangeStart", (url) => {
      if (openCustomer && !url.includes("#buyerselect")) {
        setOpenCustomer(false);
        setSearchText("");
      }
    });
    router.beforePopState(() => {
      if (openCustomer) {
        setOpenCustomer(false);
        setSearchText("");
        return true;
      }
      return true;
    });
    if (openCustomer) {
      CustomerMutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCustomer, router]);
  return (
    <>
      <ProgressBar />
      {authenticated && (
        <Header
          selectedBuyer={selectedBuyer}
          setOpenCustomer={setOpenCustomer}
          setHeaderSearch={setHeaderSearch}
          headerSearch={headerSearch}
        />
      )}
      <SnackbarProvider>{modifiedChildren}</SnackbarProvider>
      <Dialog
        fullWidth
        fullScreen
        onClose={() => {
          router.back();
          setSearchText("");
          setOpenCustomer(false);
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-end",
          },
        }}
        PaperProps={{
          sx: {
            borderTopRightRadius: "16px",
            borderTopLeftRadius: "16px",
            height: "70vh",
            overflow: "hidden",
            "& .MuiAutocomplete-listbox": {
              maxHeight: "83%",
              "& .MuiAutocomplete-option .MuiAutocomplete-option[aria-selected='true']":
                {
                  background: "transparent !important",
                },
            },
          },
        }}
        open={openCustomer}
      >
        <DialogTitle
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            padding: "16px 24px",
          }}
        >
          Select Customers
        </DialogTitle>
        <TextField
          sx={{
            borderRadius: 0,
          }}
          onChange={(ev) => {
            setSearchText(ev.target.value);
            Cartmutate();
          }}
          autoFocus={openCustomer}
          value={searchText}
          placeholder="Search for customer"
        />
        <DialogContent
          sx={{
            padding: 0,
          }}
        >
          <List component="nav" aria-label="main mailbox folders">
            {map(CustomerData, "document").map((o) => {
              return (
                <ListItemButton
                  key={o.id}
                  divider
                  selected={selectedBuyer?.id === o?.id}
                  onClick={() => {
                    localStorage.setItem("selectedBuyer", JSON.stringify(o));
                    setSelectedBuyer(o);
                    router.back();
                    setOpenCustomer(false);
                    setSearchText("");
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{
                      variant: "body1",
                    }}
                    primary={`${o.companyName}${
                      o.erp_Code ? ` - (${o.erp_Code})` : ""
                    }${o.city ? `, ${o.city}` : ""}`}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
