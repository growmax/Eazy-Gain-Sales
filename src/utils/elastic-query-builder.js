import { isArray, remove } from "lodash";

export function AllSubcategoryQueryBuilder(tenantId) {
  const body = {
    Elasticindex: tenantId + "pgandproducts",
    queryType: "search",
    ElasticType: "pgproduct",
    ElasticBody: {
      size: 0,
      aggs: {
        products_aggs: {
          filter: {
            bool: {
              should: [
                {
                  match_all: {},
                },
              ],
              must: [],
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
            data: {
              terms: {
                field: "productsSubCategories.subCategoryId",
                size: 1000,
              },
              aggs: {
                source: {
                  top_hits: {
                    size: 1,
                    // _source: ["catalogCode", "productsSubCategories"],
                  },
                },
              },
            },
            count: {
              cardinality: {
                field: "productsSubCategories.subCategoryId",
              },
            },
          },
        },
      },
    },
  };

  return body;
}

export function filterBySubcategory(subcategoryId, CheckIfBrands, tenantId) {
  const query = {
    Elasticindex: tenantId + "pgandproducts",
    queryType: "search",
    ElasticType: "pgproduct",
    ElasticBody: {
      from: 0,
      size: 10000,
      _source: [
        "brandsName",
        "productId",
        "unitOfMeasure",
        "hsnTaxBreakup",
        "productAssetss",
        "productShortDescription",
        "unitQuantity",
        "unitListPrice",
        "packagingQty",
        "minOrderQuantity",
        "brandProductId",
        "primaryUOM",
        "secondaryUOM"
      ],
      query: {
        bool: {
          must: [{ term: {} }],
          must_not: [
            {
              match: {
                prodgrpIndexName: {
                  query: "PrdGrp0*",
                },
              },
            },
          ],
        },
      },
    },
  };
  if (!CheckIfBrands) {
    query.ElasticBody.query.bool.must = [
      {
        term: {
          "productsSubCategories.subCategoryId": parseInt(subcategoryId),
        },
      },
      { term: { isPublished: 1 } }
    ];
  } else {
    query.ElasticBody.query.bool.must = [
      {
        term: { brandId: parseInt(subcategoryId) },
      },
      { term: { isPublished: 1 } }
    ];
  }
  return query;
}

export default function FormatElastic(documents) {
  const formattedResults = [];
  if (isArray(documents.data)) {
    return documents.data;
  }
  if (documents.data) {
    documents.data.hits.hits.forEach(function (documnt) {
      var documentSource = documnt._source;
      documentSource.id = documnt._id;
      formattedResults.push(documentSource);
    });
  }
  if (documents.hits) {
    documents.hits.hits.forEach(function (documnt) {
      var documentSource = documnt._source;
      documentSource.id = documnt._id;
      formattedResults.push(documentSource);
    });
  }
  remove(formattedResults, (o) => o.buildNum || o.notExpandable);
  return formattedResults;
}
