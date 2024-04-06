import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { isArray } from "lodash";
import QuatityDetails from "./quatity-details";
import { LoadingButton } from "@mui/lab";
import axiosInstance from "@/utils/axiosInstance";
import { useAuthContext } from "@/auth/hooks/use-auth-context";
import useCart from "@/hooks/use-cart";
import Iconify from "../iconify/iconify";
import { useRouter } from "next/router";

export default function QuantityEdit({
  openQtyEdit,
  setOpenQtyEdit,
  ProductImages,
  data,
  IsInCart,
  // OverallQty,
  CasesQty,
  ShowQty,
  IsOpenCase,
  
}) {
  const [AddingToCart, setaddToCart] = useState(false);
  const { user } = useAuthContext();
  const {
    productShortDescription,
    unitOfMeasure,
    unitQuantity,
    packagingQty,
    minOrderQuantity,
    primaryUOM,
  } = data;
  const minQty = data.minOrderQuantity
    ? data.minOrderQuantity
    : data.packagingQty;
  const [Value, setValue] = useState(IsInCart?.quantity || minQty);
  const { Cartmutate } = useCart();
  const router = useRouter();
  useEffect(() => {
    setValue(!primaryUOM ? IsInCart?.quantity : IsOpenCase ? CasesQty : ShowQty);
  }, [
    ShowQty,
    openQtyEdit,
    IsOpenCase,
    CasesQty,
    IsInCart?.quantity,
    primaryUOM,
  ]);

  const handleAddToCart = async () => {
    try {
      setaddToCart(true);
      const accessToken = localStorage.getItem("accessToken");
      await axiosInstance({
        url: `corecommerce/carts?userId=${user.userId}&pos=1`,
        method: IsInCart ? "PUT" : "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
          "Content-Type": "application/json",
        },
        data: {
          pos: 1,
          productsId: data.productId,
          itemNo: IsInCart?.itemNo,
          quantity: !primaryUOM ? parseFloat(Value): IsOpenCase
            ? ShowQty + parseFloat(Value) * unitOfMeasure
            : CasesQty * unitOfMeasure + parseFloat(Value),
        },
      });
      await Cartmutate();
      setOpenQtyEdit(false);
      router.back();
      setaddToCart(false);
    } catch (error) {
      setaddToCart(false);
    }
  };
  const handleRemoveToCart = async () => {
    try {
      setaddToCart(true);
      const accessToken = localStorage.getItem("accessToken");
      await axiosInstance({
        url: `corecommerce/carts/${user.userId}?productsId=${data.productId}&itemNo=${IsInCart?.itemNo}&pos=1`,
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + accessToken,
          "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
          "Content-Type": "application/json",
        },
      });
      await Cartmutate();
      setaddToCart(false);
      setOpenQtyEdit(false);
      router.back();
    } catch (error) {
      setaddToCart(false);
    }
  };

  return (
    <>
      <Dialog
        // disablePortal
        disableScrollLock
        onClose={() => {
          setOpenQtyEdit(false);
          router.back();
        }}
        fullWidth
        open={openQtyEdit}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-end",
          },
        }}
        PaperProps={{
          sx: {
            borderTopRightRadius: "16px",
            borderTopLeftRadius: "16px",
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            width: "100%",
            m: 0,
            height: "50vh",
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
      >
        <DialogTitle>Edit Qty</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center">
            <Box position="relative" height={80} width={80}>
              <Image
                alt="Mountains"
                src={isArray(ProductImages) ? ProductImages[0] : ProductImages}
                fill
                style={{
                  objectFit: "contain",
                }}
                sizes="100vw"
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                ml: 1,
              }}
            >
              <Typography
                // textAlign="center"
                fontSize="12px"
                fontWeight="bold"
                lineHeight="1.3"
                letterSpacing="0.5px"
                mb={0.5}
                // noWrap
              >
                {productShortDescription}
              </Typography>
              <QuatityDetails
                unitOfMeasure={unitOfMeasure}
                unitQuantity={unitQuantity}
                packagingQty={packagingQty}
                minOrderQuantity={minOrderQuantity}
              />
            </Box>
          </Box>
          <Divider
            sx={{
              mt: 1,
            }}
          />
          <Box mt={1} display="flex" alignItems="baseline">
            <TextField
              autoFocus
              fullWidth
              helperText={`Quantity Should be multiples of ${
                minOrderQuantity || packagingQty
              }`}
              onWheel={() => document.activeElement.blur()}
              size="small"
              error={parseFloat(Value) % parseFloat(minQty) !== 0}
              type="number"
              sx={{
                "& .MuiInputBase-root": {
                  pr: 0,
                },
              }}
              onFocus={(ev) => {
                ev.target.select();
              }}
              InputProps={{
                // ref: textFieldRef,
                type: "number",
                endAdornment: (
                  <InputAdornment position="end">
                    <LoadingButton
                      loading={AddingToCart}
                      color="primary"
                      size="small"
                      onClick={handleRemoveToCart}
                    >
                      <Iconify icon={"ic:outline-delete"} width="20px" />
                    </LoadingButton>
                  </InputAdornment>
                ),
              }}
              value={Value}
              onChange={(ev) => {
                setValue(ev.target.value);
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={AddingToCart}
            onClick={() => {
              setOpenQtyEdit(false);
              router.back();
            }}
            fullWidth
          >
            Cancel
          </Button>

          <LoadingButton
            disabled={
              Value === 0 || parseFloat(Value) % parseFloat(minQty) !== 0
            }
            onClick={handleAddToCart}
            loading={AddingToCart}
            variant="contained"
            color="primary"
            fullWidth
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
