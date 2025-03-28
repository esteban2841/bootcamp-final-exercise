sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/bootcamp/sapui5/finaltest/model/models",
    "com/bootcamp/sapui5/finaltest/utils/HomeHelper"
], (UIComponent, models, HomeHelper) => {
    "use strict";

    return UIComponent.extend("com.bootcamp.sapui5.finaltest.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            this.initializeHomeHelperLibrary()
        },

        async initializeHomeHelperLibrary (){
            HomeHelper.init(this.getModel())
            await HomeHelper.setDefaultModelStore(this)
        }
    });
});