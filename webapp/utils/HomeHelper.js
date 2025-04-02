sap.ui.define([
    "com/bootcamp/sapui5/finaltest/utils/HomeService",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
], function (HomeService, JSONModel, MessageBox){
    "use strict"

    return {
		init: function (oNorthwindModel) {
			this._oNorthwindModel = oNorthwindModel;
		},

        setDefaultModelStore: async function (oComponent){
            const oFilters = []
            const suppliers = await HomeService.read_oData_entity(this._oNorthwindModel, oFilters, '/Suppliers')
            const products = await HomeService.read_oData_entity(this._oNorthwindModel, oFilters, '/Products')
            const categories = await HomeService.read_oData_entity(this._oNorthwindModel, oFilters, '/Categories')

            oComponent.setModel(new JSONModel({
                suppliers: suppliers[0].results,
                products: products[0].results,
                categories: categories[0].results,
                filteredProductsByProvider: [],
                valueInputSearch: "",
                newProductName: "",
                newProductID: "",
                newUnitPrice: 0,
                multiFilter: [],
            }), "SuppliersDataStore")

            const data = oComponent.getModel('SuppliersDataStore').getData()
            return data
            
        },

        handleCreationFormValidation: function (view) {
            let oView = view;

            //getting locale variables for the instanced language
            
            let oBundle = oView.getModel("i18n").getResourceBundle();
            let errorAlertText = oBundle.getText("errorFormAlert");
            let errorMessageText = oBundle.getText("errorFormMessage");
            console.log(errorAlertText, ' locale text')
            //getting user given product fields 

            const form = [
                {fieldName: 'CategoryID', value: oView.byId("CategoryID").getSelectedKey()},
                {fieldName: 'ProductID', value: oView.byId("ProductID").getValue()},
                {fieldName: 'ProductName', value: oView.byId("ProductName").getValue()},
                {fieldName: 'UnitPrice', value: oView.byId("UnitPrice").getValue()},
                {fieldName: 'QuantityPerUnit', value: oView.byId("QuantityPerUnit").getValue()},
                {fieldName: 'UnitsInStock', value: oView.byId("UnitsInStock").getValue()},
            ] 
            
            const newProduct = {}

            let isProductValid = true;

            form.forEach(field=>{
                if (!field.value) {
                    //in case no value was passed set ui red color
                    // to the input and display and alert to notify the user
                    oView.byId(field.fieldName).setValueState("Error");
                    isProductValid = false;
                    this.showAlert(`${errorAlertText} ${field.fieldName}`, 'error', 'Error')
                }else{
                    newProduct[field.fieldName] = field.value
                }
                

            })
            if (!isProductValid) {
                sap.m.MessageToast.show(errorMessageText);
                return {isProductValid, newProduct};
            }

            return {isProductValid, newProduct}
        },

        showAlert(message, type = 'success', title= 'Success') {

            MessageBox[type](message, {
                title: title,
                onClose: null,
                styleClass: "",
                actions: sap.m.MessageBox.Action.OK,
                emphasizedAction: sap.m.MessageBox.Action.OK,
                initialFocus: null,
                textDirection: sap.ui.core.TextDirection.Inherit,
                dependentOn: null
            });
        },

        filterSupplierProducts: async function (oFilters){
            const supplierProducts = await HomeService.read_oData_entity(this._oNorthwindModel, oFilters, '/Products')
            return supplierProducts
        },

        getDataProducts: async function (oFilters, entity = '/Suppliers'){
            // let oFilters = [];
            return await HomeService.read_oData_entity(this._oNorthwindModel, oFilters, entity)
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