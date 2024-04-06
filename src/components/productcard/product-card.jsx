/* eslint-disable @next/next/no-img-element */
import {
  Box,
  // Button,
  Card,
  CardActions,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { lighten } from "@mui/material/styles";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import useCart from "@/hooks/use-cart";
import axiosInstance from "@/utils/axiosInstance";
import { getSuitableDiscountByQuantity } from "@/utils/cart-calculation";
import { LoadingButton } from "@mui/lab";
import { find, isArray, map } from "lodash";
import { useEffect, useState } from "react";
import PricingFormat from "../PriceFormat/pricing-format";
import Iconify from "../iconify/iconify";
import Label from "../label/label";
import DiscountTable from "./discount-table";
// import QuatityDetails from "./quatity-details";
import { useRouter } from "next/router";
import QuantityEdit from "./quantity-edit";

export default function ProductCard({
  data,
  DiscountData,
  DiscountisLoading,
  hidediscountTable,
  showOnlyDiscountedPrice,
  InventoryData,
  InventoryDataLoading,
}) {
  const [AddingToCart, setaddToCart] = useState(false);
  const router = useRouter();
  const [openQtyEdit, setOpenQtyEdit] = useState(false);
  const [IsOpenCase, setIsOpenCase] = useState(false);

  const {
    productAssetss,
    productShortDescription,
    unitOfMeasure,
    // unitQuantity,
    // packagingQty,
    // minOrderQuantity,
    productId,
    primaryUOM,
    secondaryUOM,
  } = data;
  const ProductImages = productAssetss?.length
    ? map(
        productAssetss.filter((o1, i) => {
          if (o1.isDefault) {
            return o1?.source;
          } else if (i === 0) {
            return o1?.source;
          }
        }),
        "source"
      )
    : "/placeholder.png";
  const ProductWise_Discounts = find(
    DiscountData,
    (o) => o.ProductVariantId === data.productId
  );
  const ProductWise_Inventory = find(
    InventoryData,
    (o) => o.productsId === data.productId
  );
  let totalAvailableStock = 0;
  ProductWise_Inventory?.wareHouse?.forEach((warehouse) => {
    const availableStock = warehouse.availableStock;
    totalAvailableStock += availableStock;
  });
  const { user } = useAuthContext();
  const { roundOff } = user || {};

  const discount_Percentage = ProductWise_Discounts?.isOveridePricelist
    ? 0
    : ((ProductWise_Discounts?.MasterPrice - ProductWise_Discounts?.BasePrice) /
        ProductWise_Discounts?.MasterPrice) *
      100;
  const minQty = data.minOrderQuantity
    ? data.minOrderQuantity
    : data.packagingQty;
  const { CartData, Cartmutate, CartisValidating } = useCart();

  const handleAddToCart = async () => {
    try {
      setaddToCart(true);
      const accessToken = localStorage.getItem("accessToken");
      const Cartdata = await axiosInstance({
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
          quantity: IsInCart
            ? IsInCart.quantity + parseFloat(minQty)
            : parseFloat(minQty),
        },
      });

      await Cartmutate(Cartdata.data.data, { revalidate: false });
      setaddToCart(false);
    } catch (error) {
      setaddToCart(false);
    }
  };
  const handleAddToBag = async () => {
    try {
      setaddToCart(true);
      const Cartdata = await axiosInstance({
        url: `corecommerce/carts?userId=${user.userId}&pos=1`,
        method: IsInCart ? "PUT" : "POST",
        headers: {
          "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
          "Content-Type": "application/json",
        },
        data: {
          pos: 1,
          productsId: data.productId,
          itemNo: IsInCart?.itemNo,
          quantity:
            IsInCart.quantity < unitOfMeasure
              ? unitOfMeasure
              : IsInCart.quantity + unitOfMeasure,
        },
      });

      await Cartmutate(Cartdata.data.data, { revalidate: false });
      setaddToCart(false);
    } catch (error) {
      setaddToCart(false);
    }
  };
  const handleRemoveToCart = async () => {
    try {
      setaddToCart(true);
      const accessToken = localStorage.getItem("accessToken");

      if (IsInCart.quantity === parseFloat(minQty)) {
        await axiosInstance({
          url: `corecommerce/carts/${user.userId}?productsId=${data.productId}&itemNo=${IsInCart?.itemNo}&pos=1`,
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + accessToken,
            "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
            "Content-Type": "application/json",
          },
        });
      } else {
        await axiosInstance({
          url: `corecommerce/carts?userId=${user.userId}&pos=1`,
          method: "PUT",
          headers: {
            Authorization: "Bearer " + accessToken,
            "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
            "Content-Type": "application/json",
          },
          data: {
            pos: 1,
            productsId: data.productId,
            itemNo: IsInCart?.itemNo,
            quantity: IsInCart.quantity - parseFloat(minQty),
          },
        });
      }

      await Cartmutate();
      setaddToCart(false);
    } catch (error) {
      setaddToCart(false);
    }
  };
  const handleRemoveToBag = async () => {
    try {
      setaddToCart(true);
      const accessToken = localStorage.getItem("accessToken");

      if (IsInCart.quantity - unitOfMeasure === 0) {
        await axiosInstance({
          url: `corecommerce/carts/${user.userId}?productsId=${data.productId}&itemNo=${IsInCart?.itemNo}&pos=1`,
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + accessToken,
            "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
            "Content-Type": "application/json",
          },
        });
      } else {
        await axiosInstance({
          url: `corecommerce/carts?userId=${user.userId}&pos=1`,
          method: "PUT",
          headers: {
            Authorization: "Bearer " + accessToken,
            "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
            "Content-Type": "application/json",
          },
          data: {
            pos: 1,
            productsId: data.productId,
            itemNo: IsInCart?.itemNo,
            quantity: IsInCart.quantity - unitOfMeasure,
          },
        });
      }

      await Cartmutate();
      setaddToCart(false);
    } catch (error) {
      setaddToCart(false);
    }
  };

  const IsInCart = find(CartData, (cart) => cart.productId === productId);

  const { suitableDiscount } = getSuitableDiscountByQuantity(
    IsInCart?.askedQuantity || 0,
    ProductWise_Discounts?.discounts || []
  );
  useEffect(() => {
    router.events.on("hashChangeStart", (url) => {
      if (openQtyEdit && !url.includes("#qty-edit")) {
        setOpenQtyEdit(false);
      }
    });

    router.beforePopState(() => {
      if (openQtyEdit) {
        setOpenQtyEdit(false);
      }
      return true;
    });
  }, [openQtyEdit, router]);
  const Discount = !ProductWise_Discounts?.isOveridePricelist
    ? suitableDiscount?.Value + discount_Percentage
    : suitableDiscount?.Value;
  const Product_Price = !ProductWise_Discounts?.isOveridePricelist
    ? ProductWise_Discounts?.MasterPrice
    : ProductWise_Discounts?.BasePrice;
  const FinalPrice = suitableDiscount
    ? Product_Price - (Product_Price * Discount) / 100
    : null;
  const OverallQty = IsInCart?.quantity;
  const CasesQty = IsInCart?.quantity / unitOfMeasure >= 1 ? Math.floor(IsInCart?.quantity / unitOfMeasure) : 0
  const ShowQty = unitOfMeasure
    ? OverallQty -
    CasesQty * unitOfMeasure
    : IsInCart?.quantity;
  const BagDiscount = getSuitableDiscountByQuantity(
    unitOfMeasure,
    ProductWise_Discounts?.discounts
  );


  return (
    <>
      <Card
        sx={{
          borderRadius: 0,
          mb: 2,  
        }}
        variant="outlined"
        square
      >
        <Box pt={1} display="flex">
          <Box mx={1} height={125} position="relative" width={125}>
            <img
              alt={data.brandProductId}
              src={isArray(ProductImages) ? ProductImages[0] : ProductImages}
              height="100%"
              width="100%"
              style={{ objectFit: "contain" }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <CardContent
              sx={{
                flex: "1 0 auto",
                p: 1,
                "&:last-child": {
                  pb: 1,
                },
              }}
            >
              <Typography fontWeight="bold" lineHeight="1.3" mb={0.5}>
                {productShortDescription}
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                mb={0.5}
                spacing={0.5}
                sx={{ typography: "subtitle2" }}
              >
                {DiscountisLoading || CartisValidating ? (
                  <Skeleton width={"100%"} variant="text" />
                ) : (
                  <>
                    <Box color="text.secondary">MRP:&nbsp;</Box>
                    {!showOnlyDiscountedPrice ? (
                      <>
                        <Box color="#b12704" component="span">
                          <PricingFormat
                            value={
                              ProductWise_Discounts?.isOveridePricelist
                                ? ProductWise_Discounts?.BasePrice
                                : FinalPrice
                                ? FinalPrice
                                : ProductWise_Discounts?.BasePrice
                            }
                          />
                        </Box>
                        {!ProductWise_Discounts?.isOveridePricelist && (
                          <Box
                            component="span"
                            sx={{
                              color: "text.disabled",
                              textDecoration: "line-through",
                            }}
                          >
                            <PricingFormat
                              value={ProductWise_Discounts?.MasterPrice}
                            />
                          </Box>
                        )}
                      </>
                    ) : suitableDiscount ? (
                      <Box color="#b12704" component="span">
                        <PricingFormat
                          value={
                            ProductWise_Discounts?.BasePrice -
                            (ProductWise_Discounts?.BasePrice *
                              suitableDiscount.Value) /
                              100
                          }
                        />
                      </Box>
                    ) : (
                      <Box color="#b12704" component="span">
                        <PricingFormat
                          value={ProductWise_Discounts?.BasePrice}
                        />
                      </Box>
                    )}
                    {discount_Percentage > 0 && (
                      <Label
                        variant="filled"
                        sx={{
                          bgcolor: "#b12704",
                        }}
                        color="success"
                      >
                        Margin
                        {FinalPrice
                          ? parseFloat(Discount?.toFixed(roundOff))
                          : parseFloat(discount_Percentage?.toFixed(roundOff))}
                        %
                      </Label>
                    )}
                  </>
                )}
              </Stack>
              {InventoryDataLoading ? (
                <Typography
                  fontSize="12px"
                  fontWeight="bold"
                  lineHeight="1.3"
                  letterSpacing="0.5px"
                  mb={0.5}
                >
                  <Skeleton></Skeleton>
                </Typography>
              ) : (
                <Typography
                  fontSize="12px"
                  fontWeight="bold"
                  lineHeight="1.3"
                  letterSpacing="0.5px"
                  mb={0.5}
                  color="error.main"
                >
                  {totalAvailableStock} {secondaryUOM} in stock
                </Typography>
              )}
              {primaryUOM && secondaryUOM && (
                <Stack
                  direction="row"
                  alignItems="center"
                  mb={0.5}
                  spacing={0.5}
                  sx={{ typography: "subtitle2" }}
                >
                  <Box color="text.secondary">1 {primaryUOM}:&nbsp;</Box>
                  <Box color="#b12704" component="span">
                    <Box color="#b12704" component="span">
                      <PricingFormat
                        value={
                          BagDiscount.suitableDiscount?.Value
                            ? unitOfMeasure *
                              BagDiscount.suitableDiscount?.Value
                            : unitOfMeasure * ProductWise_Discounts?.BasePrice
                        }
                      />
                    </Box>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Box>
        </Box>

        <CardActions
          sx={{
            alignItems: "baseline",
            mb: 0.5,
            "& >:not(:first-of-type)": {
              ml: 0,
            },
          }}
        >
          {!IsInCart &&   <Box flexGrow={1} />}
          {IsInCart ? (
            <>
              {primaryUOM ? (
                <Box
                  width="100%"
                  mb={1}
                  display="flex"
                  alignItems="center"
                  position="relative"
                >
                  <Typography
                    gutterBottom
                    top={"-30px"}
                    my={1}
                    /* The above code is setting the value of the `left` property to "32px" in a React
                  component. */
                    left="32px"
                    position="absolute"
                    variant="caption"
                  >
                    1&nbsp;{primaryUOM} = {unitOfMeasure} {secondaryUOM}
                  </Typography>
                  <LoadingButton
                    loading={DiscountisLoading || AddingToCart}
                    color="primary"
                    size="large"
                    sx={{
                      p: "1px",
                      width: "40px",
                      minWidth: "unset",
                    }}
                    variant="outlined"
                    disabled={OverallQty < unitOfMeasure}
                    onClick={handleRemoveToBag}
                  >
                    <Iconify icon={"material-symbols:remove"} />
                  </LoadingButton>
                  <Box
                    component="span"
                    textAlign="center"
                    width="70px"
                    height={40}
                    borderRadius={1}
                    onClick={() => {
                      setIsOpenCase(true);
                      setOpenQtyEdit(true);
                      router.push(router.asPath + "#qty-edit", undefined, {
                        shallow: true,
                      });
                    }}
                    color="primary.main"
                    sx={{
                      bgcolor: (theme) =>
                        lighten(theme.palette.primary.light, 0.9),
                    }}
                    mx={1}
                    fontWeight={600}
                    fontSize={20}
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                  >
                    {CasesQty}
                  </Box>
                  <LoadingButton
                    loading={DiscountisLoading || AddingToCart}
                    color="primary"
                    onClick={handleAddToBag}
                    // size="small"
                    size="large"
                    sx={{
                      p: "1px",
                      width: "40px",
                      minWidth: "unset",
                    }}
                    variant="outlined"
                    // onClick={handleCartAmountChange(qty + 1)}
                  >
                    <Iconify icon="material-symbols:add" />
                  </LoadingButton>
                  <Typography
                    gutterBottom
                    bottom="-30px"
                    width="100%"
                    // left="72px"
                    align="center"
                    mb={1}
                    /* The above code is setting the value of the `left` property to "32px" in a React
                  component. */
                    // left="32px"
                    position="absolute"
                    variant="caption"
                  >
                    {primaryUOM}
                  </Typography>
                </Box>
              ) : (
                <Box width="100%" />
              )}
              <Box
                my={2}
                width="100%"
                display="flex"
                alignItems="center"
                position="relative"
              >
                {primaryUOM && (
                  <Typography
                    gutterBottom
                    top={"-30px"}
                    my={1}
                    width="100%"
                    /* The above code is setting the value of the `left` property to "32px" in a React
                  component. */
                    textAlign="center"
                    // left="14px"
                    position="absolute"
                    variant="caption"
                  >
                    {CasesQty > 0
                      ? `${CasesQty} ${primaryUOM} + ${ShowQty} ${secondaryUOM} added`
                      : `${ShowQty} ${secondaryUOM} added`}
                  </Typography>
                )}
                <LoadingButton
                  loading={DiscountisLoading || AddingToCart}
                  color="primary"
                  // size="small"
                  size="large"
                  sx={{
                    p: "1px",
                    width: "40px",
                    minWidth: "unset",
                  }}
                  variant="outlined"
                  disabled={ShowQty === 0}
                  onClick={handleRemoveToCart}
                >
                  <Iconify
                    icon={
                      IsInCart.quantity === parseFloat(minQty)
                        ? "ic:outline-delete"
                        : "material-symbols:remove"
                    }
                  />
                </LoadingButton>
                <Box
                  component="span"
                  textAlign="center"
                  width="70px"
                  height={40}
                  borderRadius={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  onClick={() => {
                    setIsOpenCase(false);
                    setOpenQtyEdit(true);
                    router.push(router.asPath + "#qty-edit", undefined, {
                      shallow: true,
                    });
                  }}
                  color="primary.main"
                  sx={{
                    bgcolor: (theme) =>
                      lighten(theme.palette.primary.light, 0.9),
                  }}
                  mx={1}
                  fontWeight={600}
                  fontSize={20}
                >
                  {!primaryUOM ? OverallQty : ShowQty}
                </Box>
                <LoadingButton
                  loading={DiscountisLoading || AddingToCart}
                  color="primary"
                  onClick={handleAddToCart}
                  size="large"
                  sx={{
                    p: "1px",
                    width: "40px",
                    minWidth: "unset",
                  }}
                  variant="outlined"
                  // onClick={handleCartAmountChange(qty + 1)}
                >
                  <Iconify icon="material-symbols:add" />
                </LoadingButton>
                <Typography
                  gutterBottom
                  bottom="-28px"
                  mb={1}
                  /* The above code is setting the value of the `left` property to "32px" in a React
                  component. */
                  // left="72px"
                  align="center"
                  width="100%"
                  position="absolute"
                  variant="caption"
                >
                  {secondaryUOM}
                </Typography>
              </Box>
            </>
          ) : (
            <LoadingButton
              // fullWidth
              loading={DiscountisLoading || AddingToCart}
              startIcon={<Iconify icon="material-symbols:add-shopping-cart" />}
              sx={{
                backgroundColor: "#f7b800",
                color: "inherit",
                // borderRadius: "4px",
              }}
              // size="small"
              fullWidth
              onClick={handleAddToCart}
              variant="text"
              color="primary"
            >
              AddToCart
            </LoadingButton>
          )}
        </CardActions>
        {!hidediscountTable &&
          Boolean(ProductWise_Discounts?.discounts?.length) && (
            <DiscountTable
              roundOff={roundOff}
              Product_Price={
                !ProductWise_Discounts?.isOveridePricelist
                  ? ProductWise_Discounts?.MasterPrice
                  : ProductWise_Discounts?.BasePrice
              }
              suitableDiscount={suitableDiscount}
              data={ProductWise_Discounts?.discounts}
              discount_Percentage={discount_Percentage}
              unitOfMeasure={unitOfMeasure}
              isOveridePricelist={ProductWise_Discounts?.isOveridePricelist}
              secondaryUOM={secondaryUOM}
            />
          )}
      </Card>

      <QuantityEdit
        data={data}
        ProductImages={ProductImages}
        openQtyEdit={openQtyEdit}
        setOpenQtyEdit={setOpenQtyEdit}
        IsInCart={IsInCart}
        OverallQty={OverallQty}
        CasesQty={CasesQty}
        ShowQty={ShowQty}
        IsOpenCase={IsOpenCase}
      />
    </>
  );
}
