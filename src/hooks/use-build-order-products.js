import {
  assign_pricelist_discounts_data_to_products,
  cartCalculation,
} from "@/utils/cart-calculation";
import { cloneDeep, find, map } from "lodash";
import { useEffect, useState } from "react";
import useDiscounts from "./use-discounts";

export default function useBuildOrderProducts(cartData, selectedBuyer) {
  const { DiscountData, DiscountisLoading } = useDiscounts(
    "cart",
    map(cartData, "productId"),
    selectedBuyer
  );
  const [CartValue, SetCartValue] = useState({});
  const [Products, setProducts] = useState([]);
  useEffect(() => {
    const Products = map(cartData, (cart) => {

      const Productwise_Discounts =
        find(cloneDeep(DiscountData) || [], (disc) => {
          return disc.ProductVariantId === cart.productId;
        }) || {};
      cart = assign_pricelist_discounts_data_to_products(
        cart,
        Productwise_Discounts
      );
      return cart;
    });
    setProducts(Products);
    const CartValue = cartCalculation(Products, true);
    if (!DiscountisLoading) {
      SetCartValue(CartValue);
    }
  }, [DiscountisLoading, cartData, DiscountData]);

  return {
    CartValue: CartValue,
    Products: Products,
    CartValueLoading: DiscountisLoading,
    DiscountData: DiscountData,
    DiscountisLoading: DiscountisLoading,
  };
}
