sap.ui.define([
    "com/bootcamp/sapui5/finaltest/controller/BaseController",
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/ui/model/json/JSONModel",
    "com/bootcamp/sapui5/finaltest/utils/HomeHelper",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
        "sap/m/MessageBox"
], (BaseController, Fragment, Device, JSONModel, HomeHelper, FilterOperator, Filter, MessageBox) => {
    "use strict";

    return BaseController.extend("com.bootcamp.sapui5.finaltest.controller.Detail", {
        onInit: function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
            this._mViewSettingsDialogs = {};
            const models = this.getOwnerComponent().getModel("SuppliersDataStore").getData()
            console.log(models, 'data que llega al iniciar Detalle')
            this.creationForm = {}
        },

        onShowDetailsCreation: function (oEvent) {
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
                const MultiCombo = this.byId("MT_CATEGORIES_SELECT")
                console.log(MultiCombo, 'iMultiCombo')
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }

            pDialog.then(function (oDialog) {
                //overwriting the Dialog product detail model inside the dialog View in order to change the product detail ref
                console.log(itemSelected, oDialog, 'item inside fragment')
                oDialog.setModel(new JSONModel({
                    ...itemSelected,
                    categories
                }), "ProductSelected")
                if (Device.system.desktop) {
                    oDialog.addStyleClass("sapUiSizeCompact");
                }
                return oDialog;
            });
            const MultiCombo = this.byId("MT_CATEGORIES_SELECT")
            console.log(MultiCombo, 'iMultiCombo')

            return pDialog;
        },

        showProductDetailDialog: function (oSelectedItem, categories) {
            console.log(categories, 'showProductDetailDialog')
            this.getVisualizationDialog("com.bootcamp.sapui5.finaltest.view.fragments.ProductDetailDialog", oSelectedItem, categories)
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        createSupplierProduct(oEvent) {
            let oView = this.getView();
            let oFilter = []


            let bIsValid = true;

            this.creationForm.ProductID = this.byId("ProductId").getValue()
            this.creationForm.ProductName = this.byId("ProductName").getValue()
            this.creationForm.ProductPrice = this.byId("ProductPrice").getValue()

            console.log(this.creationForm.CategoryID, 'valor multiinput')
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
                return;
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

            const models = this.getOwnerComponent().getModel("SuppliersDataStore").getData()

            this.closeCreateSupplierDialog()


            MessageBox.success("Product created successfully", {
                title: "Success",                                    
                onClose: null,                                       
                styleClass: "",                                      
                actions: sap.m.MessageBox.Action.OK,                 
                emphasizedAction: sap.m.MessageBox.Action.OK,        
                initialFocus: null,                                  
                textDirection: sap.ui.core.TextDirection.Inherit,    
                dependentOn: null                                    
            });

            console.log(models, form, ' acac los modelos para crear con inputs form')

        },

        filterSupplier: async function (oFilter, data) {

            const oData = await HomeHelper.getDataProducts(oFilter)

            console.log(oData, 'filtro de supplier')
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

            let products = this.getView().byId("SUPPLIER_PRODUCTS_TABLE").getBinding("items")

            products.getModel().refresh();

        },
    });
});