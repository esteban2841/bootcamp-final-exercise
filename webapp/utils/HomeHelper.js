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
            oComponent.setModel(new JSONModel({
                suppliers: suppliers[0].results,
                valueInputByIdSearch: "",
                valueInputByNameSearch: "",
                supplierForm: {
                    ProductName: "",
                    ProductID: "",
                    UnitPrice: 0,
                    
                },
            }), "SuppliersDataStore")

            const data = oComponent.getModel('SuppliersDataStore').getData()
            console.log(data, 'se setea bien la data')
            return data
            
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