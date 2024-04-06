import TargetCard from "@/components/TargetCard/TargetCard";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import slugify from "slugify";

export default function Homepage({ data, brandData }) {
  const colWidth = { xs: 4 };
  const { push } = useRouter();
  return (
    <Box sx={{ flexGrow: 1, p: 1 }}>
      <TargetCard />
      <Typography align="center" m={1} gutterBottom>
        Brands
      </Typography>
      <Grid
        container
        spacing={0}
        sx={() => ({
          "--Grid-borderWidth": "1px",
          borderTop: "var(--Grid-borderWidth) solid",
          borderColor: "divider",
          "& > div": {
            borderRight: "var(--Grid-borderWidth) solid",
            borderBottom: "var(--Grid-borderWidth) solid",
            borderColor: "divider",
            "&:nth-of-type(3n)": {
              borderRight: "none",
            },
          },
        })}
      >
        {brandData.map((data) => (
          <Grid
            key={data.brandId}
            display="flex"
            onClick={() => {
              push(`/p/${slugify(data.brandsName)}/b_${data.brandId}`);
            }}
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            {...colWidth}
            minHeight={85}
          >
            <Link
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
              href={`/p/${slugify(data.brandsName)}/b_${data?.brandId}`}
              prefetch
            >
              <Image
                width={100}
                height={100}
                style={{
                  objectFit: "contain",
                }}
                src={data?.brandImage || "/placeholder.png"}
                alt="discover"
              />
              <Typography gutterBottom fontSize="12px" textAlign="center">
                {data.brandsName}
              </Typography>
            </Link>
          </Grid>
        ))}
      </Grid>
      <Typography  align="center" m={1} gutterBottom>Categories</Typography>
      <Grid
        container
        spacing={0}
        sx={() => ({
          "--Grid-borderWidth": "1px",
          borderTop: "var(--Grid-borderWidth) solid",
          borderColor: "divider",
          "& > div": {
            borderRight: "var(--Grid-borderWidth) solid",
            borderBottom: "var(--Grid-borderWidth) solid",
            borderColor: "divider",
            "&:nth-of-type(3n)": {
              borderRight: "none",
            },
          },
        })}
      >
        {data.map((data) => (
          <Grid
            key={data.subCategoryId}
            display="flex"
            onClick={() => {
              push(
                `/p/${slugify(data.subCategoryName)}/sc_${data.subCategoryId}`
              );
            }}
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            {...colWidth}
            minHeight={85}
          >
            <Link
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
              href={`/p/${slugify(data.subCategoryName)}/sc_${
                data?.subCategoryId
              }`}
              prefetch
            >
              <Image
                width={100}
                height={100}
                style={{
                  objectFit: "contain",
                }}
                src={data?.subCategoryImage || "/placeholder.png"}
                alt="discover"
              />
              <Typography gutterBottom fontSize="12px" textAlign="center">
                {data.subCategoryName}
              </Typography>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
