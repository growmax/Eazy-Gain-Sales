import ProductCard from "@/components/productcard/product-card";
import useDiscounts from "@/hooks/use-discounts";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { map } from "lodash";
import React from "react";

export default function LeftSection({
  loading,
  productData,
  DiscountError,
  InventoryData,
  InventoryDataLoading,
}) {
  // const { CartData } = useCart();
  const { DiscountData, DiscountisLoading } = useDiscounts(
    "plp",
    map(productData, "productId")
  );
  return (
    <>
      {loading
        ? new Array(5).fill(0).map((o, i) => (
            <Card
              key={i}
              sx={{
                borderRadius: 0,
                // height: "160px",
              }}
              variant="outlined"
              square
            >
              <Box p={2} display="flex">
                <Box mx={1} height={80} position="relative" width={80}>
                  <Skeleton height={80} width={80} />
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
                    <Typography
                      // textAlign="center"
                      fontSize="12px"
                      fontWeight="bold"
                      lineHeight="1.3"
                      letterSpacing="0.5px"
                      mb={0.5}
                      // noWrap
                    >
                      <Skeleton />
                    </Typography>
                    <Typography
                      // textAlign="center"
                      fontSize="12px"
                      fontWeight="bold"
                      lineHeight="1.3"
                      letterSpacing="0.5px"
                      mb={0.5}
                      // noWrap
                    >
                      <Skeleton />
                    </Typography>
                  </CardContent>
                </Box>
              </Box>
            </Card>
          ))
        : productData.map((o) => {
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
    </>
  );
}
