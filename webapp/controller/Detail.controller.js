sap.ui.define([
    "com/bootcamp/sapui5/finaltest/controller/BaseController",
    "com/bootcamp/sapui5/finaltest/utils/HomeHelper",
    "com/bootcamp/sapui5/finaltest/utils/HomeService",
], (BaseController, HomeHelper, HomeService) => {
    "use strict";

    return BaseController.extend("com.bootcamp.sapui5.finaltest.controller.Detail", {
        onInit: function () {
            console.log('entro en detail')
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            //Logic to get the smart table when created and mounted in ui to inject html buttons to the rows 
        },
        
        onShowDetails: function(oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            var oSelectedItem = oBindingContext.getObject();
            
            // Your dialog opening logic here
            this.showDetailDialog(oSelectedItem);
        },

        showDetailDialog: function(oSelectedItem) {
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment(
                    "your.namespace.fragments.DetailDialog",
                    this
                );
                this.getView().addDependent(this._oDialog);
            }
            
            // Bind the selected item to the dialog
            this._oDialog.bindElement({
                path: "/" + oSelectedItem.__metadata.path,
                model: "yourModelName"
            });
            
            this._oDialog.open();
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