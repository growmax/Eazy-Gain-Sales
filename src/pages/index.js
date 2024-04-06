import getBrands from "@/utils/get-brands";
import getSUbcategorysEs from "@/utils/get-sub";
import dynamic from "next/dynamic";
const Homepage = dynamic(() => import("@/sections/home/Homepage"), {
  ssr: false,
});
export async function getStaticProps() {
  const esdata = await getSUbcategorysEs();
  const brandData = await getBrands();

  return {
    props: {
      categoryData: esdata,
      brandData,
    },
  };
}

export default function Home({ categoryData,brandData }) {
  return (
    <div>
      <Homepage data={categoryData} brandData={brandData} />
    </div>
  );
}
