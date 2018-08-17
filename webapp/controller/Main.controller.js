sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/viz/ui5/data/FlattenedDataset",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
	"./InitPage"
], function (Controller, JSONModel, FlattenedDataset, ChartFormatter, Format, InitPageUtil) {
	"use strict";

	return Controller.extend("nickcode.ru_viz.controller.Main", {

		onInit: function () {
			var oComp = this.getOwnerComponent();
			var oMdl = oComp.getModel("graphDataMdl");
			oMdl.attachRequestCompleted(function () {
				console.log(oMdl.getData());
			});

			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;

			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");

			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: false
					},
					window: {
						start: "firstDataPoint",
						end: "lastDataPoint"
					},
					//colorPalette: ["#12aadf", "#FF880B", "#34b77e", "#623a96"],
					isRoundCorner: true,
					animation: {
						dataLoading: true
					}
					//drawingEffect: sap.viz.ui5.types.VerticalBar_drawingEffect.glossy
				},
				legend: {
					visible: false,
					title: {
						visible: false
					}
				},
				valueAxis: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				valueAxis2: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: false,
					text: 'Фактические выплаты за 12 мес.'
				},
				tooltip: {
					visible: true,
					applyTimeAxisFormat: true,
					postRender: function (tooltipDomNode) {
						//Called after tooltip is renderred. 
						var oType = new sap.ui.model.type.Integer({
							//	maxFractionDigits: 0,
							groupingEnabled: true,
							groupingSeparator: ","
								//	decimalSeparator: "."
						});

						var rev = tooltipDomNode.selectAll('.v-body-measure-value').text();
						var amt = Number(rev);
						var oNumFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oType);
						var amount = oNumFormat.format(parseInt(amt, 10));
						tooltipDomNode.selectAll('.v-body-measure-value').html(amount);
						//tooltipDomNode.selectAll('.v-body-measure-value').attr('style', 'color: red;');

					}
				},
				interaction: {
					syncValueAxis: false,
					behaviorType: true,
					selectability: {
						//	mode: 'exclusive'
						mode: 'none'
					}
				}
			});

			oVizFrame.setModel(oMdl);

			var aValuesFeed = [];
			var aColorPalette = [];
			aValuesFeed.push("Revenue");
			aColorPalette.push("#ff002a");

			aValuesFeed.push("Cost");
			aColorPalette.push("#019125");

			var feed = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': aValuesFeed
			});

			oVizFrame.addFeed(feed);

			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: aColorPalette
				}
			});

			// var oPopOver = this.getView().byId("idPopOver");
			// oPopOver.connect(oVizFrame.getVizUid());
			// oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

			sap.viz.api.env.globalSettings({
				disableTooltipTimer: true
			});

			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(oVizFrame.getVizUid());
			oTooltip.setFormatString(formatPattern.STANDARDFLOAT);

			InitPageUtil.initPageSettings(this.getView());

		},

		onAfterRendering: function () {

		},

		onDatasetSelected: function (oEvent) {
			if (!oEvent.getParameters().selected) {
				return;
			}
			var datasetRadio = oEvent.getSource();
			if (this.oVizFrame && datasetRadio.getSelected()) {
				var bindValue = datasetRadio.getBindingContext().getObject();
				var dataset = {
					data: {
						path: "/milk"
					}
				};
				var dim = this.settingsModel.dimensions[bindValue.name];
				dataset.dimensions = dim;
				dataset.measures = this.settingsModel.measures;
				var oDataset = new FlattenedDataset(dataset);
				this.oVizFrame.setDataset(oDataset);
				var dataModel = new JSONModel(this.dataPath + bindValue.value);
				this.oVizFrame.setModel(dataModel);

				var feed = [];
				for (var i = 0; i < dim.length; i++) {
					feed.push(dim[i].name);
				}
				var feeds = this.oVizFrame.getFeeds();
				for (var i = 0; i < feeds.length; i++) {
					if (feeds[i].getUid() === "categoryAxis") {
						var categoryAxisFeed = feeds[i];
						this.oVizFrame.removeFeed(categoryAxisFeed);
						var feed = [];
						for (var i = 0; i < dim.length; i++) {
							feed.push(dim[i].name);
						}
						categoryAxisFeed.setValues(feed);
						this.oVizFrame.addFeed(categoryAxisFeed);
						break;
					}
				}
			}
		},

	});
});