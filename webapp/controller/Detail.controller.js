sap.ui.define([
    "com/bootcamp/sapui5/finaltest/controller/BaseController",
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/ui/model/json/JSONModel",
    "com/bootcamp/sapui5/finaltest/utils/HomeHelper",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter"
], (BaseController, Fragment, Device, JSONModel, HomeHelper, FilterOperator, Filter) => {
    "use strict";

    return BaseController.extend("com.bootcamp.sapui5.finaltest.controller.Detail", {
        onInit: function () {
            console.log('entro en detail')
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
            this._mViewSettingsDialogs = {};
            
        },

        onShowDetails: function(oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext();
            let oSelectedItem = oBindingContext.getObject();
            console.log(oSelectedItem, 'selection')
            // Your dialog opening logic here
            this.showProductDetailDialog(oSelectedItem);
        },

        onCloseDialog (){
            this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.ProductDetailDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.close();
            });
        },

		getVisualizationDialog: function (sDialogFragmentName, itemSelected) {

            let pDialog = this._mViewSettingsDialogs[sDialogFragmentName]
            
			if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
                    oDialog.setModel(new JSONModel({
                        ...itemSelected
                    }), "ProductSelected")
					if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}

            pDialog.then(function (oDialog) {
                //overwriting the Dialog product detail model inside the dialog View in order to change the product detail ref
                oDialog.setModel(new JSONModel({
                    ...itemSelected
                }), "ProductSelected")
                if (Device.system.desktop) {
                    oDialog.addStyleClass("sapUiSizeCompact");
                }
                return oDialog;
            });

			return pDialog;
		},

        showProductDetailDialog: function (oSelectedItem) {
			this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.ProductDetailDialog", oSelectedItem)
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
            });
		},

        createSupplierProduct(){
            let oFilter = []
            let supplierId = this.getView().byId("ST_SUPPLIER_PRODUCTS").getBindingContext().getObject()
            const models = this.getOwnerComponent().getModel("SuppliersDataStore").getData()
            
            oFilter.push(new Filter("SupplierID", FilterOperator.EQ, supplierId.SupplierID));
            this.filterSupplier(oFilter)

            const productSupplier = supplierId.Products._list

            console.log( productSupplier, supplierId, 'sm table')
        },
        
        filterSupplier: async function (oFilter, data){
            
            const oData = await HomeHelper.getDataProducts(oFilter)

            console.log(oData, 'filtro de supplier')
        },
        
        showCreateProductDialog: function () {
			this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.CreateProductDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
            });
		},
        
   
        _onObjectMatched: function (oEvent) {
            // Obtener el ProductID de la URL y enlazar el contexto
            let sSupplierID = oEvent.getParameter("arguments").SupplierID;

            console.log(sSupplierID, ' Product id in detail')
            this.getView().bindElement({
                path: "/Suppliers(" + sSupplierID + ")",
                parameters: {
                    expand: "Products"
                }
            });
        },
    });
});