import { useAuthContext } from "@/auth/hooks/use-auth-context";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr/immutable";

export default function useBuyerSelect(searchText, latitude, longitude) {
  const query = {
    query_by:
      "companyName, accountOwner, accountType, branchName, businessType, city, companyName, country, currencyCode, currencySymbol, district, erp_Code, gst, inviteStatus, pan, state, subIndustry, supportOwner, ownerEmail, ownerPhone",
    q: searchText || "*",
    page: 1,
    per_page: 100,
    sort_by: `companyID:desc`,
    filter_by: `tenantCode:${process.env.NEXT_PUBLIC_TENANT_ID}&&isActivated:1`,
  };

  query.sort_by = `location(${latitude || "11.401388154563108"},${
    longitude || "79.66321369552126"
  }):asc`;
  // query.sort_by = `location(11.401388154563108, 79.66321369552126):asc`;

  const { user } = useAuthContext();
  const { userId } = user || {};
  const fetch = async () => {
    let queryString = new URLSearchParams(query);
    const accessToken = localStorage.getItem("accessToken");
    const data = await axiosInstance({
      url: `typesense/collections/discovercustomers/documents/search/?${queryString}`,
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
        "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
        "X-Typesense-Api-Key": process.env.NEXT_PUBLIC_TYPESENSE_KEY,

        "Content-Type": "application/json",
      },
    });
    return data.data;
  };
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ["buyerAccounts", searchText] : null,
    fetch,
    {
      shouldRetryOnError: false,
    }
  );
  return {
    CustomerData: data?.hits,
    CustomerTotalCount: data?.out_of,
    CustomerError: error,
    CustomerIsLoading: isLoading,
    CustomerMutate: mutate,
  };
}
