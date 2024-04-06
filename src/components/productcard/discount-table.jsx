import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import Iconify from "../iconify/iconify";
import PricingFormat from "../PriceFormat/pricing-format";
import { sortBy } from "lodash";

const DiscountTable = ({
  data,
  suitableDiscount,
  Product_Price,
  discount_Percentage,
  isOveridePricelist,
  roundOff,
  secondaryUOM
}) => {
  return (
    <TableContainer
    sx={{
      borderRadius: 0.5,
      width: "95%",
      // margin: "8px",
      ml: "8px",
      my: 1,
      // mr: "-10px",

      // border: (theme) => `3px solid ${theme.palette.primary.light}`,
      // boxShadow: 2,
    }}
    elevation={4}
    component={Paper}
  >
    <Table size="small" aria-label="simple table">
      <TableHead
        sx={{
          backgroundColor: "#0b5cff",
          color: "white",
        }}
      >
        <TableRow>
          <TableCell
            sx={{
              background: "inherit",
              color: "white",
            }}
            align="center"
          >
            Quantity
          </TableCell>
          <TableCell
            sx={{
              background: "inherit",
              color: "white",
            }}
            align="center"
          >
            Price / {secondaryUOM}
          </TableCell>
          <TableCell
            sx={{
              background: "inherit",
              color: "white",
            }}
            align="center"
          >
            Margin
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody
        sx={{
          backgroundColor: "#0b5cff4d",
        }}
      >
        {sortBy(data, "Value")?.map((o) => {
          const Discount = !isOveridePricelist
            ? o.Value + discount_Percentage
            : o.Value;
          const Price = Product_Price - (Product_Price * Discount) / 100;
          return (
            <TableRow
              key={o.Value}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell align="center" component="th" scope="row">
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {suitableDiscount?.Value === o?.Value && (
                    <Iconify
                      icon={"material-symbols:star-outline"}
                      color="success.main"
                      width={15}
                    />
                  )}
                  <Typography variant="body2">
                    {o.min_qty}-{o.max_qty}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center" component="th" scope="row">
                <Typography variant="body2">
                  <PricingFormat value={Price} />
                </Typography>
                {/* &nbsp;
              <Typography color="text.disabled" variant="caption">
                ({parseFloat(Discount?.toFixed(roundOff))}%)
            </Typography> */}
              </TableCell>
              <TableCell align="center" component="th" scope="row">
                <Typography variant="body2" color="text">
                  {parseFloat(Discount?.toFixed(roundOff))}%
                </Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
  );
};

export default DiscountTable;
