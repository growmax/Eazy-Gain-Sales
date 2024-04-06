import Iconify from "@/components/iconify/iconify";
import useDiscounts from "@/hooks/use-discounts";
import React, { useEffect, useRef, useState } from "react";
import SwipeableViews from "react-swipeable-views";

import {
  AppBar,
  Box,
  // FormControlLabel,
  // Grid,
  Link,
  Skeleton,
  // Switch,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { lighten } from "@mui/material/styles";
import { map } from "lodash";
import { useRouter } from "next/router";
// import Image from "next/image";
import { findIndex } from "lodash";
import slugify from "slugify";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import PricingFormat from "@/components/PriceFormat/pricing-format";
import { useSnackbar } from "@/components/snackbar";
import useBuildOrderProducts from "@/hooks/use-build-order-products";
import useCart from "@/hooks/use-cart";
import axiosInstance from "@/utils/axiosInstance";
import BuildOrderBodyUtils from "@/utils/build-pos-order-body";
import { LoadingButton } from "@mui/lab";
// import dynamic from "next/dynamic";
import useProductInventory from "@/hooks/use-inventory";
import OrderSummary from "../../components/ordersummary/order-summary";
import LeftSection from "./left-section";
export default function ProductList({
  categoryData,
  productsdata,
  BrandsData,
  selectedBuyer,
  // headerSearch,
  setSelectedBuyer,
  CheckIfBrands,
  setOpenCustomer,
}) {
  const { asPath, ...router } = useRouter();
  const { user } = useAuthContext();
  // const [isBrand, setIsBrand] = useState(CheckIfBrands);
  const [openSummary, setOpenSummary] = useState(false);
  const { userId, companyId } = user || {};
  const { enqueueSnackbar } = useSnackbar();
  const [creatingOrder, setcreatingOrder] = useState(false);
  const tabsRef = useRef(null);
  const [value, setValue] = React.useState(0);
  const [productStateLoading, setisproductStateLoading] = useState(false);

  const { DiscountError } = useDiscounts(
    "plp",
    map(productsdata, "productId"),
    selectedBuyer
  );
  const { InventoryData, InventoryDataLoading } = useProductInventory(
    map(productsdata, "productId"),
    selectedBuyer
  );
  const { CartData, Cartmutate, CartisValidating } = useCart();
  const {
    CartValue,
    CartValueLoading,
    Products: CheckoutProducts,
  } = useBuildOrderProducts(CartData, selectedBuyer);
  const BuildOrderUtils = new BuildOrderBodyUtils(
    CheckoutProducts,
    selectedBuyer,
    CartValue
  );
  useEffect(() => {
    const { slug } = router.query;
    if (slug) {
      //@ts-ignore
      const CheckIfBrands = slug[1]?.split("_")[0] === "b";
      //@ts-ignore
      const id = slug[1]?.split("_")[1];
      if (CheckIfBrands) {
        const value = findIndex(
          BrandsData,
          (o) => o.brandId === parseFloat(id)
        );
        setValue(value);
      } else {
        const value = findIndex(
          categoryData,
          (o) => o.subCategoryId === parseFloat(id)
        );
        setValue(value);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asPath]);
  const handleOpenSummary = async () => {
    if (!selectedBuyer) {
      router.push(asPath + "#buyerselect", undefined, {
        shallow: true,
      });
      setOpenCustomer(true);
      enqueueSnackbar("Select a buyer to proceed", {
        variant: "info",
      });
      return;
    }
    if (openSummary) {
      await handleCheckout();
      router.back();
      setOpenSummary(false);
    } else {
      router.push(asPath + "#order-summary", undefined, {
        shallow: true,
      });
      setOpenSummary(true);
    }
  };
  const handleCheckout = async () => {
    if (!selectedBuyer) {
      router.push(router.asPath + "#buyerselect", undefined, {
        shallow: true,
      });
      setOpenCustomer(true);
      enqueueSnackbar("Select a buyer to proceed", {
        variant: "info",
      });
      return;
    }
    try {
      setcreatingOrder(true);
      const buildData = await BuildOrderUtils.procesOrderBody();
      await axiosInstance({
        url: `corecommerce/orders/createOrderBySeller?sellerUserId=${userId}&sellerCompanyId=${companyId}`,
        data: buildData,
        method: "POST",
      });
      await ClearCart();
      setcreatingOrder(false);
      setSelectedBuyer(null);
      localStorage.removeItem("selectedBuyer");
      enqueueSnackbar("Order Created", {
        variant: "success",
      });
    } catch (error) {
      console.log(error);
      setcreatingOrder(false);
    }
  };
  const ClearCart = async () => {
    await axiosInstance({
      url: `corecommerce/carts?userId=${userId}&find=ByUserId&pos=${1}`,
      method: "DELETE",
    });
    await Cartmutate();
  };
  useEffect(() => {
    router.events.on("hashChangeStart", (url) => {
      if (openSummary && !url.includes("#order-summary")) {
        setOpenSummary(false);
      }
    });
    router.beforePopState(() => {
      if (openSummary) {
        setOpenSummary(false);
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSummary, router]);
  const handleChange = (event, newValue) => {
    setisproductStateLoading(true);
    setValue(newValue);
    if (CheckIfBrands) {
      router
        .replace(
          `/p/${slugify(BrandsData[newValue].brandsName)}/b_${
            BrandsData[newValue].brandId
          }`,
          undefined,
          {
            scroll: false,
          }
        )
        .then(() => {
          setisproductStateLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      router
        .replace(
          `/p/${slugify(categoryData[newValue].subCategoryName)}/sc_${
            categoryData[newValue].subCategoryId
          }`,
          undefined,
          { scroll: false }
        )
        .then(() => {
          setisproductStateLoading(false);
        })

        .catch((err) => {
          console.log(err);
        });
    }
  };
  const handleChangeIndex = (index) => {
    setisproductStateLoading(true);
    setValue(index);

    if (CheckIfBrands) {
      router
        .replace(
          `/p/${slugify(BrandsData[index].brandsName)}/b_${
            BrandsData[index].brandId
          }`,
          undefined,
          {
            scroll: false,
          }
        )
        .then(() => {
          setisproductStateLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      router
        .replace(
          `/p/${slugify(categoryData[index].subCategoryName)}/sc_${
            categoryData[index].subCategoryId
          }`,
          undefined,
          { scroll: false }
        )
        .then(() => {
          setisproductStateLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        ref={tabsRef}
        variant="scrollable"
        sx={{ mx: 1 }}
        scrollButtons={false}
      >
        {CheckIfBrands
          ? BrandsData?.map((o, i) => (
              <Tab
                key={o.brandId}
                ref={tabsRef}
                label={o.brandsName}
                value={i}
                {...a11yProps(i)}
              />
            ))
          : categoryData?.map((o, i) => (
              <Tab
                sx={{
                  fontSize: "16px",
                }}
                ref={tabsRef}
                key={o.subCategoryId}
                label={o.subCategoryName}
                {...a11yProps(i)}
              />
            ))}
      </Tabs>
      <Box overflow="scroll" height={"calc(100vh - 237px)"}>
      <SwipeableViews
        axis={"x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        {CheckIfBrands
          ? BrandsData?.map((o, i) => (
              <TabPanel key={o.subCategoryId} value={value} index={i}>
                <LeftSection
                  loading={productStateLoading}
                  DiscountError={DiscountError}
                  InventoryData={InventoryData}
                  InventoryDataLoading={InventoryDataLoading}
                  productData={productsdata}
                />
              </TabPanel>
            ))
          : categoryData?.map((o, i) => (
              <TabPanel key={o.subCategoryId} value={value} index={i}>
                <LeftSection
                  loading={productStateLoading}
                  DiscountError={DiscountError}
                  InventoryData={InventoryData}
                  InventoryDataLoading={InventoryDataLoading}
                  productData={productsdata}
                />
              </TabPanel>
            ))}
      </SwipeableViews>
      </Box>
      {/* <Grid container> */}
      {/* <Grid item xs={3}>
          <Box
            sx={{
              left: 0,
              position: "fixed",
              overflowY: "auto",
              borderRight: (theme) => `1px solid ${theme.palette.grey[300]}`,
              // background: (theme) => theme.palette.grey[300],
              top: 97,
              bottom: CartData?.length ? 95 : 0,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={isBrand}
                  onChange={() => {
                    setIsBrand(!isBrand);
                  }}
                />
              }
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: "12px",
                },
              }}
              label={isBrand ? "Brand" : "Category"}
              labelPlacement="bottom"
            />
            {isBrand
              ? BrandsData?.map((o) => (
                  <Box
                    key={o.brandId}
                    className="main-category-box"
                    sx={{
                      width: "90px",
                      height: "90px",
                      display: "flex",
                      cursor: "pointer",
                      padding: "0.5rem",
                      alignItems: "center",
                      flexDirection: "column",
                      justifyContent: "center",
                      borderBottom: "1px solid",
                      borderRightColor: (theme) => theme.palette.grey[600],
                      borderBottomColor: (theme) => theme.palette.grey[300],
                      borderRight: (theme) =>
                        router?.asPath !==
                        `/p/${slugify(o.brandsName)}/b_${o.brandId}`
                          ? "0 px solid"
                          : `5px solid ${theme.palette.primary.main} !important`,
                    }}
                    onClick={() => {
                      router.push(
                        `/p/${slugify(o.brandsName)}/b_${o.brandId}`,
                        undefined,
                        {
                          scroll: false,
                        }
                      );
                    }}
                  >
                    <Image
                      width={50}
                      height={50}
                      quality={5}
                      style={{
                        objectFit: "contain",
                        marginBottom: 2,
                      }}
                      src={o?.brandImage || "/placeholder.png"}
                      alt="discover"
                    />
                    <Typography
                      sx={{
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      textAlign="center"
                      fontSize="11px"
                      lineHeight="1"
                      gutterBottom
                      noWrap
                    >
                      {o.brandsName}
                    </Typography>
                  </Box>
                ))
              : categoryData.map((o) => (
                  <Box
                    key={o.subCategoryId}
                    className="main-category-box"
                    sx={{
                      width: "90px",
                      height: "90px",
                      display: "flex",
                      cursor: "pointer",
                      padding: "0.5rem",
                      alignItems: "center",
                      flexDirection: "column",
                      justifyContent: "center",
                      borderBottom: "1px solid",
                      borderRightColor: (theme) => theme.palette.grey[600],
                      borderBottomColor: (theme) => theme.palette.grey[300],
                      borderLeft: (theme) =>
                        router?.asPath !==
                        `/p/${slugify(o.subCategoryName)}/sc_${o.subCategoryId}`
                          ? "0 px solid"
                          : `3px solid ${theme.palette.primary.main} !important`,
                    }}
                    onClick={() => {
                      router.push(
                        `/p/${slugify(o.subCategoryName)}/sc_${
                          o.subCategoryId
                        }`,
                        undefined,
                        { scroll: false }
                      );
                    }}
                  >
                    <Image
                      width={50}
                      height={50}
                      style={{
                        objectFit: "contain",
                        marginBottom: 2,
                      }}
                      src={o?.subCategoryImage || "/placeholder.png"}
                      alt="discover"
                    />
                    <Typography
                      sx={{
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      textAlign="center"
                      fontSize="11px"
                      lineHeight="1"
                      gutterBottom
                      noWrap
                    >
                      {o.subCategoryName}
                    </Typography>
                  </Box>
                ))}
          </Box>
        </Grid> */}

      {/* <Box
        sx={{
          position: "fixed",
          overflowY: "auto",
          top: 100,
          bottom: CartData?.length ? 95 : 0,
          width: "75%",
        }}
      >
        {productsdata
          .filter((item) => {
            const itemName = item.productShortDescription.toLowerCase();
            return itemName.includes(headerSearch);
          })
          .map((o) => {
            return (
              <ProductCard
                DiscountData={DiscountData}
                DiscountisLoading={DiscountisLoading}
                DiscountError={DiscountError}
                data={o}
                key={o.productId}
                InventoryData={InventoryData}
                InventoryDataLoading={InventoryDataLoading}
              />
            );
          })}
      </Box> */}
      {/* <Grid py={1} item xs={9}>
        
        </Grid> */}
      {/* </Grid> */}
      {Boolean(CartData?.length) && (
        <AppBar
          position="fixed"
          color="inherit"
          sx={{
            top: "auto",
            bottom: 0,
            transition: "all",
            zIndex:
              openSummary && !asPath?.includes("#qty-edit")
                ? 99999
                : 1100,
          }}
        >
          {!openSummary && (
            <Box
              sx={{
                bgcolor: (theme) => lighten(theme.palette.primary.light, 0.8),
                pr: 2.5,
                pl: 1.5,
                py: 0.5,
              }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Link
                onClick={() => {
                  router.push(asPath + "#buyerselect", undefined, {
                    shallow: true,
                  });
                  setOpenCustomer(true);
                }}
                sx={{
                  textDecoration: "underline",
                }}
              >
                {selectedBuyer?.companyName || "Select Customer"}
              </Link>
              <Link
                onClick={ClearCart}
                sx={{
                  textDecoration: "underline",
                }}
              >
                Clear Cart
              </Link>
            </Box>
          )}
          <Toolbar>
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
              }}
              variant="subtitle2"
            >
              {!CartValueLoading || CartisValidating ? (
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
              loading={CartValueLoading || creatingOrder}
              onClick={handleOpenSummary}
              startIcon={
                <Iconify icon="material-symbols:shopping-cart-checkout" />
              }
              variant="contained"
              color="warning"
            >
              {openSummary ? "Proceed" : "Create Order"}
            </LoadingButton>
          </Toolbar>
        </AppBar>
      )}
      <OrderSummary
        selectedBuyer={selectedBuyer}
        handleCheckout={handleCheckout}
        openSummary={openSummary}
        setOpenSummary={setOpenSummary}
        handleOpenSummary={handleOpenSummary}
        creatingOrder={creatingOrder}
      />
    </>
  );
}

function a11yProps(index) {
  return {
    id: `full-width-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
}
