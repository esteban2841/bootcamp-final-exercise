sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finaltest.controller.Home", {
        onInit() {
            // const store = this.getOwnerComponent().getModel('ProductDataStore').getData()
            const store = this.getOwnerComponent().getModel()
            console.log(store, 'store default')
        }
    });
});