import { useAuthContext } from "@/auth/hooks/use-auth-context";
import getBrands from "@/utils/get-brands";
import useSWR from "swr/immutable";

export default function useBrands() {
  const { user } = useAuthContext();
  const { userId } = user || {};

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/brands/${userId}` : null,
    getBrands,
    {
      shouldRetryOnError: false,
    }
  );

  return {
    BrandsData: data,
    BrandsError: error,
    BrandsisLoading: isLoading,
    Brandsmutate: mutate,
    // CartValue : cartCalculation(data, true, 0),
  };
}
