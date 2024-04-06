import { useAuthContext } from "@/auth/hooks/use-auth-context";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr/immutable";

export default function useDiscounts(path, productIds, selectedBuyer) {
  const { user } = useAuthContext();
  const { userId, currency } = user || {};
  const fetch = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const data = await axiosInstance({
      url: selectedBuyer?.companyID
        ? `discounts/discount/getDiscount?CompanyId=${selectedBuyer?.companyID}`
        : "discounts/discount/getDiscount",
      method: "POST",
      data: {
        currency: currency?.id,
        Productid: productIds,
      },
      headers: {
        Authorization: "Bearer " + accessToken,
        "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
        "Content-Type": "application/json",
      },
    });
    return data.data.data;
  };
  const { data, error, isLoading, mutate } = useSWR(
    userId && productIds?.length
      ? [
          `${path}/${userId}/${JSON.stringify(productIds)}`,
          [...productIds],
          selectedBuyer?.companyID,
        ]
      : null,
    fetch,
    {
      shouldRetryOnError: false,
    }
  );
  return {
    DiscountData: data,
    DiscountError: error,
    DiscountisLoading: isLoading,
    Discountmutate: mutate,
  };
}
