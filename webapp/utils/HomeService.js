sap.ui.define([
    
],function (){
    "use strict";

    return {
        read_oData_entity: async function(oModel, oFilter, entityPath = '/Suppliers'){
            const aRequestsPromise = [
                new Promise(function(resolve, reject){
                    oModel.read(entityPath, {
                        filters: oFilter,
                        success: resolve,
                        error: reject
                    })
                }.bind(this))
            ]

            return Promise.all(aRequestsPromise)
        },
    }
})