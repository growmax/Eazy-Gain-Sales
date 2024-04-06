import getBrands from "@/utils/get-brands";
import getSUbcategorysEs from "@/utils/get-sub";
import { map } from "lodash";
import slugify from "slugify";

export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const categorydata = await getSUbcategorysEs();
    const brandData = await getBrands();
    const brandsPath = map(brandData, (o) => {
      return `/p/${slugify(o.brandsName)}/b_${o.brandId}`;
    });
    const subCategorypaths = map(categorydata, (o) => {
      return `/p/${slugify(o.subCategoryName)}/sc_${o.subCategoryId}`;
    });
    // eslint-disable-next-line no-undef
    Promise.all(
      [...brandsPath, ...subCategorypaths].map(async (o) => {
        await res.revalidate(o);
      })
    ).then(console.log("revalidated"));
    await res.revalidate("/");
    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send("Error revalidating");
  }
}
