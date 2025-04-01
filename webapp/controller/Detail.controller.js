sap.ui.define([
    "com/bootcamp/sapui5/finaltest/controller/BaseController",
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/ui/model/json/JSONModel",
    "com/bootcamp/sapui5/finaltest/utils/HomeHelper",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
], (BaseController, Fragment, Device, JSONModel, HomeHelper, FilterOperator, Filter, MessageBox) => {
    "use strict";

    return BaseController.extend("com.bootcamp.sapui5.finaltest.controller.Detail", {
        onInit: function () {

            // getting router ref for this view
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //setting initial variables
            this._mViewSettingsDialogs = {};
            this.creationForm = {}

            //getting the route params to render the supplier detail inside the view
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        onShowDetailsCreation: function (oEvent) {
            //getting row reference on to set the model inside the dialog state
            let rowId = oEvent.getSource().sId.split("").pop()
            let SuppliersDataStore = this.getOwnerComponent().getModel("SuppliersDataStore").getData();
            let oSelectedItem = SuppliersDataStore.filteredProductsByProvider[rowId]
            // Your dialog opening logic here
            console.log(SuppliersDataStore, 'modelo a enviar al dialog')
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

        onSelectionChange: async function (oEvent) {
            const filters = []
            const model = this.getOwnerComponent().getModel("SuppliersDataStore").getData()
            let sValueCombo = oEvent.getSource().getSelectedKey()
            const data = await HomeHelper.getDataProducts(filters, '/Categories')
            model.categories = data[0].results

            this.creationForm.CategoryID = sValueCombo

            await HomeHelper.setProductModel(this, model, "SuppliersDataStore");

        },

        getVisualizationDialog: function (sDialogFragmentName, itemSelected, categories = []) {


            console.log(categories, 'antes de setear el modelo')
            let pDialog = this._mViewSettingsDialogs[sDialogFragmentName]

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    console.log(itemSelected, oDialog, 'item inside fragment1')
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
            console.log(categories, 'showProductDetailDialog')
            this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.ProductDetailDialog", oSelectedItem, categories)
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        handleCreationFormValidation: function () {
            let oView = this.getView();

            let bIsValid = true;
            if (!this.creationForm.CategoryID) {
                oView.byId("CategoryId").setValueState("Error");
                bIsValid = false;
            }

            if (!this.creationForm.ProductID) {
                oView.byId("ProductId").setValueState("Error");
                bIsValid = false;
            }

            if (!this.creationForm.ProductName) {
                oView.byId("ProductName").setValueState("Error");
                bIsValid = false;
            }

            if (!this.creationForm.ProductPrice) {
                oView.byId("ProductPrice").setValueState("Error");
                bIsValid = false;
            }


            if (!bIsValid) {
                sap.m.MessageToast.show("Please fill all required fields");
                return bIsValid;
            }

            return bIsValid
        },

        createSupplierProduct() {
            let oFilter = []

            this.creationForm.ProductID = this.byId("ProductId").getValue()
            this.creationForm.ProductName = this.byId("ProductName").getValue()
            this.creationForm.ProductPrice = this.byId("ProductPrice").getValue()

            const isFormValid = this.handleCreationFormValidation()

            if(!isFormValid){
                return
            }

            let oTable = this.byId("SUPPLIER_PRODUCTS_TABLE");

            // Obtener los datos del modelo
            let oModel = this.getOwnerComponent().getModel("SuppliersDataStore");
            let SuppliersDataStore = this.getOwnerComponent().getModel("SuppliersDataStore").getData();
            let aProducts = oModel.getProperty("/filteredProductsByProvider");

            aProducts.push(this.creationForm)


            // Crear un modelo JSON temporal para la tabla
            let oTableModel = new JSONModel(
                SuppliersDataStore
            );

            // Vincular los datos a la tabla
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
                            class: "{SuppliersDataStore>ProductID}",
                            press: function (oEvent) {
                                this.onShowDetailsCreation(oEvent); // <-- Llamada explícita
                            }.bind(this)
                        })
                    ]
                })
            });

            oTable.getModel().refresh()

            this.closeCreateSupplierDialog()

            this.showAlertOnSuccess("Product created successfully")

        },

        showAlertOnSuccess(message) {

            MessageBox.success(message, {
                title: "Success",
                onClose: null,
                styleClass: "",
                actions: sap.m.MessageBox.Action.OK,
                emphasizedAction: sap.m.MessageBox.Action.OK,
                initialFocus: null,
                textDirection: sap.ui.core.TextDirection.Inherit,
                dependentOn: null
            });
        },

        showCreateProductDialog: function () {
            const models = this.getOwnerComponent().getModel("SuppliersDataStore").getData()
            this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.CreateProductDialog", {}, models.categories)
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },


        _onObjectMatched: async function (oEvent) {
            // Obtener el ProductID de la URL y enlazar el contexto
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