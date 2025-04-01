sap.ui.define([
	'sap/ui/core/Fragment',
	'sap/ui/Device',
	'sap/ui/model/Sorter',
	"com/bootcamp/sapui5/finaltest/controller/BaseController",
	"com/bootcamp/sapui5/finaltest/utils/HomeHelper",
	'sap/ui/model/FilterOperator',
	'sap/ui/model/Filter',
], (Fragment, Device, Sorter, BaseController, HomeHelper, FilterOperator, Filter) => {
    "use strict";

    return BaseController.extend("com.bootcamp.sapui5.finaltest.controller.Home", {
        onInit() {
            // const store = this.getOwnerComponent().getModel('ProductDataStore').getData()
            const store = this.getOwnerComponent().getModel()
            this._mViewSettingsDialogs = {};
			this.oRouter = this.getOwnerComponent().getRouter()
        },

		onPress: async function (){
            
            let oFilter = [];
            // let sValue = this.byId("inputID").getValue();
            // let sValueCombo = this.byId("comboboxID").getSelectedKey();

            let values = this.getOwnerComponent().getModel("SuppliersDataStore").getData()
			
            if (values.valueInputByIdSearch) {
                oFilter.push(new Filter("SupplierID", FilterOperator.EQ, values.valueInputByIdSearch));
            }
			
			if(values.valueInputByNameSearch){
				oFilter.push(new Filter("CompanyName", FilterOperator.Contains, values.valueInputByNameSearch));

			}
            let oDatos = await HomeHelper.getDataProducts(oFilter);
            
            let CurrentState = this.getOwnerComponent().getModel('SuppliersDataStore').getData()
            
            CurrentState.suppliers = oDatos[0].results
            
            await HomeHelper.setProductModel(this, CurrentState, "SuppliersDataStore");
        },
		resetFilters: async function (){
            
            let oFilter = [];
            // let sValue = this.byId("inputID").getValue();
            // let sValueCombo = this.byId("comboboxID").getSelectedKey();
            let oDatos = await HomeHelper.getDataProducts(oFilter);
            
            let CurrentState = this.getOwnerComponent().getModel('SuppliersDataStore').getData()
            
            CurrentState.suppliers = oDatos[0].results
            
            await HomeHelper.setProductModel(this, CurrentState, "SuppliersDataStore");
        },

		getViewSettingsDialog: function (sDialogFragmentName) {
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},

		handleSortDialogConfirm: function (oEvent) {
			let oTable = this.byId("suppliersTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},


        handleSortButtonPressed: function () {
			this.getViewSettingsDialog("com.bootcamp.sapui5.finaltest.view.fragments.SortDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
            });
		},

		onItemPressRedirect: function(oEvent){
            let oSource = oEvent.getSource();
            let oDatos = oSource.getBindingContext("SuppliersDataStore").getObject();
            this.oRouter.navTo("detail", {
                SupplierID: oDatos.SupplierID
            });
        },
    });
});