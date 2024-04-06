import { find, map, sortBy } from "lodash";
import FormatElastic from "./elastic-query-builder";
import axiosInstance from "./axiosInstance";
const getSUbcategorysEs = async () => {
  return await refetch();
};

export default getSUbcategorysEs;

const refetch = async () => {
  const ElasticBody = {
    size: 0,
    query: {
      bool: {
        must: [{ term: { isPublished: 1 } }],
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
          field: "productsSubCategories.subCategoryId",
          size: 1000,
        },
        aggs: {
          data: {
            top_hits: {
              size: 1,
              _source: ["productsSubCategories"],
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
    const sub = find(
      formatresult[0]?.productsSubCategories,
      (o1) => o1.subCategoryId === o.key
    );
    return {
      subCategoryId: sub.subCategoryId,
      subCategoryImage: sub.subCategoryImage || '',
      subCategoryName: sub.subCategoryName,
    };
  });
  return sortBy(result, "subCategoryName");
};
