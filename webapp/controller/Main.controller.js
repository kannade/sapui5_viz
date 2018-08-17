sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("nickcode.ru_viz.controller.Main", {
		
		
		onInit: function() {
			var oComp = this.getOwnerComponent();
			//var oMdl = oComp.getModel("graphDataMdl");
			var oPersonDataModel = new JSONModel("graphDataMdl");
		},

		onAfterRendering: function() {
			
		}

	});
});