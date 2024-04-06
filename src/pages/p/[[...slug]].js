import axiosInstance from "@/utils/axiosInstance";
import FormatElastic, {
  filterBySubcategory,
} from "@/utils/elastic-query-builder";
import getBrands from "@/utils/get-brands";
import getSUbcategorysEs from "@/utils/get-sub";
import { map } from "lodash";
import dynamic from "next/dynamic";
import slugify from "slugify";
const ProductList = dynamic(() =>
  import("@/sections/productlist/product-list")
);

export const getStaticPaths = async () => {
  const categorydata = await getSUbcategorysEs();
  const brandData = await getBrands();
  const brandsPath = map(brandData, (o) => {
    return `/p/${slugify(o.brandsName)}/b_${o.brandId}`;
  });
  const subCategorypaths = map(categorydata, (o) => {
    return `/p/${slugify(o.subCategoryName)}/sc_${o.subCategoryId}`;
  });
  return {
    paths: [...brandsPath, ...subCategorypaths],
    fallback: "blocking",
  };
};
export async function getStaticProps({ params }) {
  try {
    const CheckIfBrands = params?.slug[1]?.split("_")[0];
    let id = params?.slug[1]?.split("_")[1];
    const query = filterBySubcategory(
      id,
      CheckIfBrands === "b",
      process.env.NEXT_PUBLIC_TENANT_ID
    );
    const esdata = await axiosInstance.post("elasticsearch/invocations", query);
    const categoryData = await getSUbcategorysEs();
    const brandData = await getBrands();
    if (id) {
      return {
        props: {
          categoryData,
          BrandsData: brandData,
          productsdata: FormatElastic(esdata.data),
          CheckIfBrands: CheckIfBrands === "b",
        },
      };
    } else {
      return { notFound: true };
    }
  } catch (error) {
    console.log(error.response);
    return { notFound: true };
  }
}
export default function Produclist({
  productsdata,
  categoryData,
  selectedBuyer,
  headerSearch,
  setSelectedBuyer,
  CheckIfBrands,
  setOpenCustomer,
  BrandsData
}) {
  return (
    <>
      <ProductList
        CheckIfBrands={CheckIfBrands}
        productsdata={productsdata}
        categoryData={categoryData}
        selectedBuyer={selectedBuyer}
        headerSearch={headerSearch}
        setSelectedBuyer={setSelectedBuyer}
        setOpenCustomer={setOpenCustomer}
        BrandsData={BrandsData}
      />
    </>
  );
}
