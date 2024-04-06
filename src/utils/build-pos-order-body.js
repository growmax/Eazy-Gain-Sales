import { filter, find, findIndex, map } from "lodash";
import axiosInstance from "./axiosInstance";
import { requestBody } from "./requestDTO";
import { jwtDecode } from "./utils";

class BuildOrderBodyUtils {
  constructor(CartData, selectedBuyer, CartValue) {
    this.CartData = CartData;
    this.CartValue = CartValue;
    this.token = localStorage.getItem("accessToken");
    this.UserData = jwtDecode(localStorage.getItem("accessToken"));
    this.CurrentCustomer = selectedBuyer;
    this.SellerBranchId = null;
    this.Settings = {};
  }
  async getAllModuleSettings(){
    const data = await axiosInstance({
      url: `corecommerce/module_setting/getAllModuleSettings?userId=${this?.UserData?.userId}&companyId=${this?.CurrentCustomer?.companyID}`,
      method: "GET",
    });
    this.Settings = {
      roundingAdjustment: find(data?.data?.data?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ENABLE_ROUNDING_ADJUSTMENT",
      ])?.status,
      showInsuranceCharges: find(data?.data?.data?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ENABLE_INSURANCE",
      ])?.status,
    };

    return this.Settings;
  }

  async getcurrencyFactor() {
    const data = await axiosInstance({
      url: `corecommerce/companys/currencyFactor?companyId=${this.CurrentCustomer?.companyID}`,
      method: "GET",
    });
    return data.data.data;
  }
  async getSellerAddressDetails() {
    const data = await axiosInstance({
      url: `corecommerce/branches/findAllSellerBranch/2?companyId=${this.CurrentCustomer?.companyID}`,
      method: "GET",
    });
    this.SellerBranchId = data?.data?.data[0]?.branchId?.id;
    return data?.data?.data;
  }
  async getAddress() {
    const data = await axiosInstance({
      url: `corecommerce/branches?find=ByCompanyId&companyId=${this.CurrentCustomer?.companyID}`,
      method: "GET",
    });
    const formattedAddress = [];
    map(data.data.data, (o) => {
      formattedAddress.push({
        addressId: {
          ...o.addressId,
          branches: [{ id: o.id, name: o.name, companyId: o.companyId }],
        },
      });
    });
    var BillingAddress = filter(formattedAddress, function (n) {
      return n.addressId.isBilling;
    });
    var ShippingAddress = filter(formattedAddress, function (n) {
      return n.addressId.isShipping;
    });
    return {
      BillingAddress,
      ShippingAddress,
    };
  }
  async getPreferense() {
    const data = await axiosInstance({
      url: `corecommerce/companypreferenceses/getUpdatedPreferences?companyId=${this.CurrentCustomer?.companyID}`,
      method: "GET",
    });
    return data.data.data;
  }
  async getBusinessUnit() {
    const data = await axiosInstance({
      url: `corecommerce/branches/findBUBySellerBranch?branchId=${this.SellerBranchId}`,
      method: "GET",
    });
    return data.data.data;
  }
  async getChannelList() {
    const data = await axiosInstance({
      url: `corecommerce/channel`,
      method: "GET",
    });
    return data.data;
  }
  async getRegisterAddress() {
    const data = await axiosInstance({
      url: `corecommerce/companys/getRegisterAddress?companyId=${this.CurrentCustomer?.companyID}`,
      method: "GET",
    });
    return data.data.data;
  }
  async getAccountOwnerDetails() {
    const data = await axiosInstance({
      url: `corecommerce/accountses/getAccountAndSupportOwner?companyId=${this.CurrentCustomer?.companyID}`,
      method: "GET",
    });
    let accOwners = [];
    const res = data.data.data;
    if (res.accountOwner.length > 0) {
      const activeOwners = filter(res.accountOwner, "isActive");
      if (findIndex(res, ["id", this.UserData.userId]) === -1) {
        accOwners = [
          ...activeOwners,
          {
            id: this.UserData.userId,
            email: this.UserData?.email,
            displayName: this.UserData?.given_name,
            isActive: this.UserData?.isUserActive,
          },
        ];
      } else {
        accOwners = activeOwners;
      }
    } else {
      accOwners = [
        {
          id: this.UserData.userId,
          email: this.UserData?.email,
          displayName: this.UserData?.displayName,
          isActive: true,
        },
      ];
    }
    return accOwners;
  }
  async getDefaultWarehouse() {
    const data = await axiosInstance({
      url: `corecommerce/branches/findWareHouseByBranchId/2?branchId=${this.SellerBranchId}`,
      method: "GET",
    });
    return data.data.data;
  }
  async getTaxandCurrency() {
    const data = await axiosInstance({
      url: `corecommerce/companys/getTaxAndCurrencyByDealerId/${this.CurrentCustomer?.companyID}`,
      method: "GET",
    });
    return data.data.data[0];
  }
  async getCostData () {
    const data = await axiosInstance({
      url: `corecommerce/product/getCostInfo?userId=${this.UserData.userId}`,
      method: "POST",
      data: map(this.CartData, o => o.productId)
    });
    return data?.data?.data || [];
  }
  async build() {
    const Settings = await this.getAllModuleSettings();
    const factor = await this.getcurrencyFactor();
    const address = await this.getAddress();
    const preference = await this.getPreferense();
    const sellerAddress = await this.getSellerAddressDetails();
    const BussinessUnit = await this.getBusinessUnit();
    const channelList = await this.getChannelList();
    const regAddress = await this.getRegisterAddress();
    const AccountOwnerList = await this.getAccountOwnerDetails();
    const DefaultWH = await this.getDefaultWarehouse();
    const taxandcurrency = await this.getTaxandCurrency();
    const costData = await this.getCostData();
    this.CurrentCustomer = { ...taxandcurrency, ...this.CurrentCustomer };

    return {
      factor,
      address,
      preference,
      BussinessUnit,
      sellerAddress,
      channelList,
      regAddress,
      AccountOwnerList,
      DefaultWH,
      Settings,
      costData,
    };

  }

  async procesOrderBody() {
    const buildBody = await this.build();
    return requestBody(
      this.UserData.companyId,
      buildBody.sellerAddress[0]?.branchId,
      buildBody.address.BillingAddress[0]?.addressId,
      buildBody.address.ShippingAddress[0]?.addressId,
      this.CartValue,
      this.UserData,
      buildBody.preference,
      this.CartData,
      {},
      true,
      this.CurrentCustomer,
      {},
      false,
      false,
      null,
      [],
      buildBody.BussinessUnit?.[0]?.branchBUId,
      null,
      buildBody.channelList?.[0],
      buildBody.regAddress,
      buildBody.DefaultWH?.addressId?.city,
      buildBody.Settings,
      buildBody.DefaultWH,
      buildBody.AccountOwnerList,
      buildBody.factor,
      buildBody.costData
    );
  }
}

export default BuildOrderBodyUtils;
