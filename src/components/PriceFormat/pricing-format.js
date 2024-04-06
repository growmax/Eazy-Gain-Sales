import { useAuthContext } from "@/auth/hooks/use-auth-context";
import React from "react";
import Accounting from "accounting-js";

export default function PricingFormat({ value }) {
  const { user } = useAuthContext();
  const { currency } = user || {};
  const { symbol, decimal, thousand, precision } = currency || {
    currencyCode: "INR",
    decimal: ".",
    description: "Indian rupee",
    id: 66,
    precision: 2,
    symbol: "₹",
    tenantId: 54,
    thousand: ",",
  };
  return (
    <>
      {Accounting.formatMoney(parseFloat(value), {
        symbol,
        decimal,
        thousand,
        precision,
      })}
    </>
  );
}
