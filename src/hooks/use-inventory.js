import { useAuthContext } from "@/auth/hooks/use-auth-context";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr/immutable";
/**
 *
 * @param {*} productId
 * @param {*} companyId
 * @param {*} tenantId
 * @returns
 */
export default function useProductInventory(productId) {
  const { user } = useAuthContext();
  const { companyId, userId } = user || {};
  const fetch = () => {
    return axiosInstance({
      url: `corecommerce/inventorys/findWareHouseByProduct?userId=${userId}&companyId=${companyId}`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: productId,
    });
  };
  const { data, error } = useSWR(
    companyId && productId ? [`getInventory-${productId}`] : null,
    fetch
  );
  return {
    InventoryData: data?.data?.data || {},
    InventoryDataError: error,
    InventoryDataLoading: companyId ? !error && !data : false,
  };
}
