sap.ui.define([
    "com/bootcamp/sapui5/finaltest/controller/BaseController",
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/ui/model/json/JSONModel",
    "com/bootcamp/sapui5/finaltest/utils/HomeHelper",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
], (BaseController, Fragment, Device, JSONModel, HomeHelper, FilterOperator, Filter, MessageBox, MessageToast) => {
    "use strict";

    return BaseController.extend("com.bootcamp.sapui5.finaltest.controller.Detail", {
        onInit: function () {

            // getting router ref for this view
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //setting initial variables
            this._mViewSettingsDialogs = {};

            //getting the route params to render the supplier detail inside the view
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        onShowDetailsCreation: function (oEvent) {
            //getting row reference on to set the model inside the dialog state
            let rowId = oEvent.getSource().sId.split("").pop()
            let SuppliersDataStore = this.getOwnerComponent().getModel("SuppliersDataStore").getData();
            let oSelectedItem = SuppliersDataStore.filteredProductsByProvider[rowId]
            // Your dialog opening logic here
            this.showProductDetailDialog(oSelectedItem, SuppliersDataStore.categories);
        },

        onCloseDialog() {
            this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.ProductDetailDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.close();
                });
        },
        closeCreateSupplierDialog() {
            this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.CreateProductDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.close();
                });
        },

        getVisualizationDialog: function (sDialogFragmentName, itemSelected, categories = []) {
            let pDialog = this._mViewSettingsDialogs[sDialogFragmentName]

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    oDialog.setModel(new JSONModel({
                        ...itemSelected,
                        categories
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
                    ...itemSelected,
                    categories
                }), "ProductSelected")
                if (Device.system.desktop) {
                    oDialog.addStyleClass("sapUiSizeCompact");
                }
                return oDialog;
            });

            return pDialog;
        },

        showProductDetailDialog: function (oSelectedItem, categories) {
            this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.ProductDetailDialog", oSelectedItem, categories)
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        createSupplierProduct() {
            let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let productSuccessText = oBundle.getText("productSuccessText");
            let oFilter = []
            
            const {isProductValid, newProduct} = HomeHelper.handleCreationFormValidation(this.getView())
            
            if (!isProductValid) {
                return
            }
            
            let oTable = this.byId("SUPPLIER_PRODUCTS_TABLE");
            
            // Obtain Model data
            let oModel = this.getOwnerComponent().getModel("SuppliersDataStore");
            let SuppliersDataStore = this.getOwnerComponent().getModel("SuppliersDataStore").getData();
            let aProducts = oModel.getProperty("/filteredProductsByProvider");
            
            aProducts.push(newProduct)
            
            
            // Create a JSON model inside the binding
            let oTableModel = new JSONModel(
                SuppliersDataStore
            );
            
            // Bind data into the table
            oTable.setModel(oTableModel);
            
            oTable.bindAggregation("items", {
                path: "SuppliersDataStore>/filteredProductsByProvider",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: "{SuppliersDataStore>ProductID}" }),
                        new sap.m.Text({ text: "{SuppliersDataStore>ProductName}" }),
                        new sap.m.Text({ text: "{SuppliersDataStore>UnitPrice}" }),
                        new sap.m.Text({ text: "{SuppliersDataStore>CategoryID}" }),
                        new sap.m.Button({
                            icon: "sap-icon://display",
                            press: function (oEvent) {
                                this.onShowDetailsCreation(oEvent); // <-- Llamada explícita
                            }.bind(this)
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://delete",
                            press: function (oEvent) {
                                this.delete(oEvent); // <-- Llamada explícita
                            }.bind(this)
                        })
                    ]
                })
            });
            
            oTable.getModel().refresh()
            
            this.closeCreateSupplierDialog()
            
            HomeHelper.showAlert(productSuccessText)
            
        },
        
        deleteProductReassurance: async function (rowIndex) {
            let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let productSuccessDelete = oBundle.getText("deleted");
            
            let oModel = this.getOwnerComponent().getModel("SuppliersDataStore").getData();
            // get rid of product by row index match
            let oSelectedItem = [...oModel.filteredProductsByProvider].filter((prod, index) => index !== Number(rowIndex))
            let oBinding = this.getView().byId("SUPPLIER_PRODUCTS_TABLE").getBinding("items")

            MessageBox.confirm("Are you sure you want to delete this product?", {
                title: "Confirm Deletion",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: async function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oModel.filteredProductsByProvider = [...oSelectedItem]
                        oBinding.getModel().refresh();
                        MessageToast.show(productSuccessDelete);
                    }
                }
            });
        },

        async delete(oEvent) {
            let rowId = oEvent.getSource().sId.split("").pop()
            this.deleteProductReassurance(rowId)
        },

        showCreateProductDialog: function () {
            const models = this.getOwnerComponent().getModel("SuppliersDataStore").getData()
            this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.CreateProductDialog", {}, models.categories)
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },


        _onObjectMatched: async function (oEvent) {
            // Obtain supplierID and link it into the table by binding it
            let sSupplierID = oEvent.getParameter("arguments").SupplierID;

            const oFilter = []
            const models = this.getOwnerComponent().getModel("SuppliersDataStore").getData()


            if (sSupplierID) {
                oFilter.push(new Filter("SupplierID", FilterOperator.EQ, sSupplierID));
            }

            const filteredProductsBySupplierId = await HomeHelper.filterSupplierProducts(oFilter)
            models.filteredProductsByProvider = filteredProductsBySupplierId[0].results

            this.getView().bindElement({
                path: "/Suppliers(" + sSupplierID + ")",
                parameters: {
                    expand: "Products"
                }
            });

            //refresh table items binding due to filtered products by provider to have a ref to modified afterwards

            let oBinding = this.getView().byId("SUPPLIER_PRODUCTS_TABLE").getBinding("items")

            oBinding.getModel().refresh();

        },
    });
});