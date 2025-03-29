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