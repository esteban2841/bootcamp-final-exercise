sap.ui.define([
    "com/bootcamp/sapui5/finaltest/utils/HomeService",
    "sap/ui/model/json/JSONModel",
], function (HomeService, JSONModel){
    "use strict"

    return {
		init: function (oNorthwindModel) {
			this._oNorthwindModel = oNorthwindModel;
		},

        setDefaultModelStore: async function (oComponent){
            const oFilters = []
            const suppliers = await HomeService.read_oData_entity(this._oNorthwindModel, oFilters, '/Suppliers')
            const products = await HomeService.read_oData_entity(this._oNorthwindModel, oFilters, '/Products')
            oComponent.setModel(new JSONModel({
                suppliers: suppliers[0].results,
                products: products[0].results,
                filteredProductsByProvider: [],
                valueInputByIdSearch: "",
                valueInputByNameSearch: "",
                newProductName: "",
                newProductID: "",
                newUnitPrice: 0,
            }), "SuppliersDataStore")

            const data = oComponent.getModel('SuppliersDataStore').getData()
            console.log(data, 'se setea bien la data')
            return data
            
        },

        filterSupplierProducts: async function (oFilters){
            console.log(oFilters, 'filtering supplier products')
            const supplierProducts = await HomeService.read_oData_entity(this._oNorthwindModel, oFilters, '/Products')
            return supplierProducts
        },

        getDataProducts: async function (oFilters){
            console.log(oFilters, 'filtros in fn')
            // let oFilters = [];
            return await HomeService.read_oData_entity(this._oNorthwindModel, oFilters)
        },

        setProductModel: async function (oController, oDatos, ModelName) {
            let oListModel = oController.getOwnerComponent().getModel(ModelName);
            if(!oListModel){
                const oModel  = new JSONModel([]);
                oModel.setSizeLimit(1000000);	
                oController.getOwnerComponent().setModel(oModel, ModelName);  
                oListModel = oController.getOwnerComponent().getModel(ModelName);
            }

            oListModel.setData(oDatos);
        },

    }
}

)