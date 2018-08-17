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
			//получим компонент
			var oComp = this.getOwnerComponent();

			//получим модель
			var oMdl = oComp.getModel("graphDataMdl");

			//как получить содержимое модели, когда она определена через manifest
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
					visible: true,
					text: 'Стоимость молока.'
				},
				tooltip: {
					visible: true,
					applyTimeAxisFormat: true,
					preRender: function (tooltipDomNode) {
						//Called before render tooltip.
						// tooltipDomNode.append('div').text('nickcode.ru').style({
						// 	'font-weight': 'bold'
						// });
					},
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

						var message = "milk";
						tooltipDomNode.append('div').text(message).style({
							'font-family': 'Arial',
							'font-size': '13px',
							'font-weight': 'bold',
							'white-space': 'normal',
							'text-overflow': 'ellipsis',
							'overflow': 'hidden',
							'padding-left': '0px',
							'padding-top': '6px',
							'color': '#000',
							'max-width': '10rem'
						});

						//tooltipDomNode.selectAll('.v-body-measure-value').attr('style', 'color: red;');

					}
				},
				interaction: {
					syncValueAxis: false,
					behaviorType: true,
					selectability: {
						mode: 'exclusive'
							//mode: 'none'
					}
				}
			});

			oVizFrame.setModel(oMdl);

			//Динамически добавим графики и цвета
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

			//добавляем оси
			oVizFrame.addFeed(feed);

			//добавляем цвета для осей
			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: aColorPalette
				}
			});

			//Всплывающее окошко по нажатию на элемент графика
			// var oPopOver = this.getView().byId("idPopOver");
			// oPopOver.connect(oVizFrame.getVizUid());
			// oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

			//Всплывающее окошко при наведении мышки на элемент графика
			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(oVizFrame.getVizUid());
			oTooltip.setFormatString(formatPattern.STANDARDFLOAT);

			//Уберем задержку перед появлением тултипа:
			sap.viz.api.env.globalSettings({
				disableTooltipTimer: true
			});

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