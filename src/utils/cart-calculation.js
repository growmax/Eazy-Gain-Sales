import _, {  each, isEmpty, maxBy, remove, round, some } from "lodash";

export const cartCalculation = (
  cartData = [],
  isInter = true,
  precision = 2
) => {
  var cartValue = {
    totalItems: cartData?.length,
    totalValue: 0,
    totalTax: 0,
    grandTotal: 0,
    totalLP: 0,
    hideListPricePublic: some(cartData, ["listPricePublic", false]),
  };
  cartData.forEach((data = {}) => {
    // basic data like qty, moq, packqty....
    data = initiating_fundamental_data(data);

    // calulating discounts data....
    data = calculating_discounts_data(data);

    // calcuting item pricing (unitPrice, totalprice, tax)
    data = calculating_pricing_data(data);

    // calculating taxBreakup data
    data = calculating_taxBreakup_data(data, isInter, cartValue, precision);

    data.totalLP = data.unitListPrice * parseFloat(data.quantity);
    cartValue.totalLP += data.totalLP;
    cartValue.totalTax += data.totalTax;
    cartValue.totalValue += data.totalPrice;
    cartValue.taxableAmount = cartValue.totalValue;
    cartValue.grandTotal = cartValue.totalTax + cartValue.totalValue;
  });
  return cartValue;
};

const initiating_fundamental_data = (item) => {
  item.askedQuantity = item.askedQuantity ? item.askedQuantity : item.quantity;
  item.productShortDescription = item.productShortDescription
    ? item.productShortDescription
    : item.shortDescription;
  item.packagingQuantity = item.packagingQty
    ? parseFloat(item.packagingQty)
    : parseFloat(item.packagingQuantity);
  item.minOrderQuantity = item.minOrderQuantity
    ? parseFloat(item.minOrderQuantity)
    : parseFloat(item.packagingQuantity);
  item.checkMOQ = item.minOrderQuantity
    ? item.minOrderQuantity > item.askedQuantity
      ? true
      : false
    : false;
  if (!item.itemNo) {
    item.itemNo = new Date().getTime();
  }
  return item;
};

const calculating_discounts_data = (item) => {
  item.discountPercentage = item?.discount ? item?.discount : 0;
  //discounted price
  item.discountedPrice = item.unitListPrice - ((item.unitListPrice * item.discountPercentage) / 100);
  if (!item.volumeDiscountApplied) {
    item.unitPrice = item.discountedPrice
  }
  return item;
};

const calculating_pricing_data = (item) => {
  item = calculating_taxInclusive_pricing_data(item);
  //UnitPrice...
  item.totalPrice = item.quantity * item.unitPrice
  item.tax = parseFloat(item.hsnDetails?.tax) || 0;
  item.pfRate = 0;
  item.itemTaxableAmount =
    item.unitListPrice + item.pfRate / item.askedQuantity;
  return item;
};

const calculating_taxInclusive_pricing_data = (item) => {
  if (item.taxInclusive) {
    item.unitPrice = item.unitPrice / (1 + item.tax / 100);
  }
  return item;
};

const calculating_taxBreakup_data = (
  item,
  isInter = true,
  cartValue,
  precision = 2
) => {
  //Getting basic taxBreakup calculations...
  item = initializing_interIntraTaxBreakup(item);
  if (isInter) {
    var intraTotalTax = 0;
    if (item.interTaxBreakup?.length > 0) {
      each(item.interTaxBreakup, (inter) => {
        item[inter.taxName] = inter.taxPercentage;
        if (!inter.compound) {
          item[`${inter.taxName}Value`] = round(
            ((item.totalPrice + item.pfRate) * inter.taxPercentage) / 100,
            precision
          );
          intraTotalTax += item[`${inter.taxName}Value`];
        } else {
          item[`${inter.taxName}Value`] = round(
            (intraTotalTax * inter.taxPercentage) / 100,
            precision
          );
        }
        cartValue[`${inter.taxName}Total`] = cartValue[`${inter.taxName}Total`]
          ? cartValue[`${inter.taxName}Total`]
          : 0;
        cartValue[`${inter.taxName}Total`] += item[`${inter.taxName}Value`];
        item.totalTax = round(
          ((item.totalPrice + item.pfRate) * item.totalInterTax) / 100,
          precision
        );
      });
    } else {
      item.totalTax = 0;
    }
  } else {
    item.tax = item.hsnDetails?.intraTax?.totalTax || 0;
    var interTotalTax = 0;
    if (item.intraTaxBreakup?.length > 0) {
      each(item.intraTaxBreakup, (intra) => {
        item[intra.taxName] = intra.taxPercentage;
        if (!intra.compound) {
          item[`${intra.taxName}Value`] = round(
            ((item.totalPrice + item.pfRate) * intra.taxPercentage) / 100,
            precision
          );
          interTotalTax += item[`${intra.taxName}Value`];
        } else {
          item[`${intra.taxName}Value`] = round(
            (interTotalTax * intra.taxPercentage) / 100,
            precision
          );
        }
        cartValue[`${intra.taxName}Total`] = cartValue[`${intra.taxName}Total`]
          ? cartValue[`${intra.taxName}Total`]
          : 0;
        cartValue[`${intra.taxName}Total`] += item[`${intra.taxName}Value`];
        item.totalTax = interTotalTax;
      });
    } else {
      item.totalTax = 0;
    }
  }
  return item;
};

const initializing_interIntraTaxBreakup = (item, taxExemption = false) => {
  item.totalInterTax = taxExemption
    ? 0
    : item.hsnDetails?.interTax?.totalTax
    ? parseFloat(item.hsnDetails?.interTax?.totalTax)
    : 0;
  item.totalIntraTax = taxExemption
    ? 0
    : item.hsnDetails?.intraTax?.totalTax
    ? parseFloat(item.hsnDetails?.intraTax?.totalTax)
    : 0;

  item.interTaxBreakup = [];
  item.compoundInter = remove(item.hsnDetails?.interTax?.taxReqLs, [
    "compound",
    true,
  ]);
  !isEmpty(item.compoundInter) &&
    item.hsnDetails?.interTax?.taxReqLs?.push(item.compoundInter[0]);
  each(item.hsnDetails?.interTax?.taxReqLs, (taxes) => {
    var tax = {
      taxName: taxes.taxName,
      taxPercentage: taxExemption ? 0 : taxes.rate,
      compound: taxes.compound,
    };
    item.interTaxBreakup.push(tax);
  });
  item.intraTaxBreakup = [];
  item.compoundIntra = remove(item.hsnDetails?.intraTax?.taxReqLs, [
    "compound",
    true,
  ]);
  !isEmpty(item.compoundIntra) &&
    item.hsnDetails?.intraTax?.taxReqLs?.push(item.compoundIntra[0]);
  each(item.hsnDetails?.intraTax?.taxReqLs, (taxes) => {
    var tax = {
      taxName: taxes.taxName,
      taxPercentage: taxExemption ? 0 : taxes.rate,
      compound: taxes.compound,
    };
    item.intraTaxBreakup.push(tax);
  });
  return item;
};

export const assign_pricelist_discounts_data_to_products = (
  product,
  prd_wise_discData
) => {
  product.disc_prd_related_obj = prd_wise_discData;

  //Pricing....
  product.MasterPrice = product.disc_prd_related_obj.MasterPrice;
  product.BasePrice = product.disc_prd_related_obj.BasePrice;

  //Pricelist...
  product.priceListCode = product.disc_prd_related_obj.priceListCode;
  product.plnErpCode = product.disc_prd_related_obj.plnErpCode;

  //Discounts...
  product.discountsList = product.disc_prd_related_obj.discounts || [];
  let { suitableDiscount, nextSuitableDiscount } =
    getSuitableDiscountByQuantity(
      product?.quantity,
      product.discountsList,
      product?.packagingQty
        ? product?.packagingQty
        : product?.packagingQuantity || 1
    );
  product.CantCombineWithOtherDisCounts =
    suitableDiscount?.CantCombineWithOtherDisCounts;
  product.nextSuitableDiscount = nextSuitableDiscount;
  product.discountDetails = { ...suitableDiscount };

  product.discountDetails.BasePrice = product.BasePrice;
  product.discountDetails.plnErpCode = product.plnErpCode;
  product.discountDetails.priceListCode = product.priceListCode;
  //Setting master, base, and discount based on pricelist override data..
  if (product.disc_prd_related_obj?.isOveridePricelist === false) {
    product.unitListPrice = product.MasterPrice;

    product.discount =
      ((product.MasterPrice - product.BasePrice) / product.MasterPrice) * 100;
    product.discount = product.discount + (product.discountDetails?.Value || 0);

    product.discountedPrice =
      product.MasterPrice - (product.MasterPrice - product.BasePrice);
  } else {
    product.unitListPrice = product.BasePrice;

    product.discount = product.discountDetails?.Value || 0;
  }
  product.discountPercentage = product.discount;

  //reorder scenario
  product.isApprovalRequired = product.disc_prd_related_obj.isApprovalRequired;
  return product;
};

export function getSuitableDiscountByQuantity(quantity, discountsList,qtyIncrease){
  let  {resultArr: ranges,nextSuitableDiscount } = getObjectsByQuantityValue(quantity, discountsList,qtyIncrease)
  let suitableDiscount =  maxBy(ranges, 'Value');
  return {suitableDiscount,nextSuitableDiscount};
}

function getObjectsByQuantityValue(quantity, arr = []) {
  const resultArr = [];
  for (let obj of arr) {
    if (obj.min_qty <= quantity && quantity <= obj.max_qty) {
      resultArr.push(obj);
    }
  }

  arr =  _.chain(arr);
  const nextSuitableDiscount = arr.filter((discount) => {
    return discount.min_qty > quantity;
  })
  .sortBy('min_qty')
  .first()
  .value();

  return {resultArr, nextSuitableDiscount};
}