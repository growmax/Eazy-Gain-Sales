import { map, sortBy } from "lodash";
import axiosInstance from "./axiosInstance";
import FormatElastic from "./elastic-query-builder";

const getBrands = async () => {
  // const res = await axiosInstance("corecommerce/brandses");
  return await refetch();
  // return res.data;
};

export default getBrands;
const refetch = async () => {
  const ElasticBody = {
    size: 0,
    query: {
      bool: {
        must:[ { term: { isPublished: 1 } }],
        should: [],
        must_not: [
          {
            match: {
              internal: true,
            },
          },
        ],
      },
    },
    aggs: {
      subcategory: {
        terms: {
          field: "brandId",
          size: 1000,
        },
        aggs: {
          data: {
            top_hits: {
              size: 1,
              _source: ["brandImage", "brandsName", "brandId"],
            },
          },
        },
      },
    },
  };
  var query = {
    Elasticindex: process.env.NEXT_PUBLIC_TENANT_ID + "pgandproducts",
    queryType: "search",
    ElasticType: "pgproduct",
    ElasticBody,
  };
  const es_data = await axiosInstance.post("elasticsearch/invocations", query);
  const result = map(es_data.data.aggregations.subcategory.buckets, (o) => {
    const formatresult = FormatElastic(o.data);
    return formatresult[0];
  });
  return sortBy(result, "brandsName");
};
