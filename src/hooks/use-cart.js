import { useAuthContext } from "@/auth/hooks/use-auth-context";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr/immutable";

export default function useCart() {
  const { user } = useAuthContext();
  const { userId } = user || {};

  const fetch = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const data = await axiosInstance({
      url: `corecommerce/carts?userId=${userId}&find=ByUserId&pos=1`,
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
        "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
        "Content-Type": "application/json",
      },
    });
    return data.data.data;
  };
  const { data, error, isLoading, mutate,isValidating } = useSWR(
    userId ? `/cart/${userId}` : null,
    fetch,
    {
      shouldRetryOnError: false,
    }
  );

  return {
    CartData: data,
    CartError: error,
    CartisLoading: isLoading,
    Cartmutate: mutate,
    CartisValidating:isValidating
    // CartValue : cartCalculation(data, true, 0),
  };
}
