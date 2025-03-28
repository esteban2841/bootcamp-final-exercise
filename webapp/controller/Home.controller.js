sap.ui.define([
    "sap/ui/core/mvc/Controller",
	'sap/ui/core/Fragment',
	'sap/ui/Device',
	'sap/ui/model/Sorter',
], (Controller, Fragment, Device, Sorter) => {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finaltest.controller.Home", {
        onInit() {
            // const store = this.getOwnerComponent().getModel('ProductDataStore').getData()
            const store = this.getOwnerComponent().getModel()
            console.log(store, 'store default')
            this._mViewSettingsDialogs = {};
        },

		getViewSettingsDialog: function (sDialogFragmentName) {
            console.log(sDialogFragmentName, 'dialog name', this.getView().getId(), this)
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
                    console.log(oDialog, 'dialog fragment container')
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
    });
});