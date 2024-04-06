import Iconify from "@/components/iconify/iconify";
import ProductCard from "@/components/productcard/product-card";
import useBuildOrderProducts from "@/hooks/use-build-order-products";
import useCart from "@/hooks/use-cart";
import {
  AppBar,
  Dialog,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";

import { useRouter } from "next/router";

export default function OrderSummary({
  openSummary,
  selectedBuyer,
  setOpenSummary,
}) {
  const { CartData } = useCart();
  const router = useRouter();
  const { DiscountData, DiscountisLoading } = useBuildOrderProducts(
    CartData,
    selectedBuyer
  );
  return (
    <Dialog
      sx={{
        height: "95vh",
      }}
      disablePortal
      disableScrollLock
      fullScreen
      open={openSummary}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => {
              router.back();
              setOpenSummary(false);
            }}
            aria-label="close"
          >
            <Iconify icon="material-symbols:close" />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Order Summary
          </Typography>
        </Toolbar>
      </AppBar>
      {/* <Toolbar variant="dense" /> */}
      <DialogContent sx={{ p: 0.5 }}>
        {CartData?.map((o) => {
          return (
            <ProductCard
              // hidediscountTable
              DiscountData={DiscountData}
              DiscountisLoading={DiscountisLoading}
              DiscountError={false}
              data={o}
              key={o.productId}
              // showOnlyDiscountedPrice
            />
          );
        })}
        <Toolbar variant="dense" />
      </DialogContent>

      {/* <AppBar position="fixed" color="inherit" sx={{ top: "auto", bottom: 0 }}>
        <Toolbar variant="dense">
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
            }}
            variant="subtitle2"
          >
            {!CartValueLoading ? (
              <>
                Total Price:&nbsp;
                <Box color="error.main">
                  <PricingFormat value={CartValue.grandTotal} />
                </Box>
              </>
            ) : (
              <Skeleton width={"180px"} variant="text" />
            )}
          </Typography>
          <Box flexGrow={1} />
          <LoadingButton
            sx={{
              mx: 1,
            }}
            onClick={() => {
              router.back();
              setOpenSummary(false);
            }}
            variant="text"
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            loading={CartValueLoading || creatingOrder}
            onClick={handleOpenSummary}
            variant="contained"
            color="warning"
          >
            Proceed
          </LoadingButton>
        </Toolbar>
      </AppBar> */}
    </Dialog>
  );
}
