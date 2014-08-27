'use strict';
//data
var data = {
	labels    : ['d1', 'd2', 'd3', 'd4'],
	datasets  : [
		{
			label : 'S1',
			data  : [3, 34, 21, 4],
			color : 'rgba(92,154,215,0.7)'
		},
		{
			label : 'S2',
			data  : [23, 4, 7, 15],
			color : 'rgba(231,127,56,0.7)'
		},
		{
			label : 'S3',
			data  : [12, 9, 5, 23],
			color : 'rgba(162,165,174,0.7)'
		}
	]
};
//Util
var Util = {
	//get the max value of the data value
	getMaxNumber: function(dataObj){
		var tmpArr = [], i=0, max;
		$(dataObj.datasets).each(function(){
			$(this.data).each(function(index,element){
				tmpArr.push(element);
				max = Math.max.apply({},tmpArr);
			});
		});
		do{
			max = max + i;
			i++;
		}
		while(max % 10 !== 0);
		return max;
	},
	//create axis and grids based on the max value
	createGrid: function(max, dataObj, stage, isBar){
		var gridLayer = new Kinetic.Layer({
				id:'grid'
			}),
			y, x, xBarDis, xLineDis, yDis, xWdith;
		y = max / 10;
		yDis = (stage.height()-40)/y;
		x = dataObj.datasets[0].data.length;
		//the unit width is different between bar and line chart
		xBarDis = Math.round((stage.width()-50)/x);
		xLineDis = Math.round((stage.width()-50)/(x-1));
		//create x grids
		for(var j=0; j <= y; j++){
			var yFinalPoint = stage.height() - 30 - j * yDis,
				xLine = new Kinetic.Line({
				points : [40, yFinalPoint, stage.width()-10, yFinalPoint],
				stroke : 'rgba(245, 245, 245, 1)'
			});
			gridLayer.add(xLine);
		}
		//create x scales
		if(isBar){
			xWdith = xBarDis;
		}
		else{
			xWdith = xLineDis;
		}
		for(var k = 0; k < x; k++){
			var textX;
			//for bar chart
			if(isBar){
				textX = new Kinetic.Text({
					x          : 40 + xWdith * k,
					width      : xWdith,
					align      : 'center',
					y          : stage.height()-25,
					fontSize   : 10,
					fontFamily : 'Calibri',
					fill       : '#bbb',
					text       : dataObj.labels[k]
				});
			}
			//for line chart
			else{
				textX = new Kinetic.Text({
					x          : 40 + xWdith * k - 10,
					width      : 20,
					align      : 'center',
					y          : stage.height()-25,
					fontSize   : 10,
					fontFamily : 'Calibri',
					fill       : '#bbb',
					text       : dataObj.labels[k]
				});
			}
			gridLayer.add(textX);
		}
		//create y grids
		var xFinalPoint;
		for(var m=0; m < x; m++){
			if(isBar){
				xFinalPoint = 40 + m * xBarDis;
			}
			else{
				xFinalPoint = 40 + m * xLineDis;
			}
			var yLine = new Kinetic.Line({
				points : [xFinalPoint, 10,  xFinalPoint, stage.height()-30],
				stroke : 'rgba(245, 245, 245, 1)'
			});
			gridLayer.add(yLine);
		}
		//create y scales
		for(var n = y; n >= 0; n--){
			var p = y-n;
			var textY = new Kinetic.Text({
				x         : 0,
				width     : 30,
				align     : 'right',
				y         : 5 + yDis * n,
				fontSize  : 10,
				fontFamily: 'Calibri',
				fill      : '#bbb',
				text      : p*10
			});
			gridLayer.add(textY);
		}
		stage.add(gridLayer);
	},
	//create bar layers for respective dataset
	createBars: function(maxNumber, dataObj, stage, hand){
		var x = dataObj.datasets[0].data.length,
			setsNumber = dataObj.datasets.length,
			space = 2,
			distance = Math.round((stage.width()-50)/x);
		$(dataObj.datasets).each(function(index){
			var fillColor = dataObj.datasets[index].color,
				width = Math.round((distance * 0.6) / setsNumber - (setsNumber - 1) * space);
			//closure for maintaining scope
			(function(num){
				var singleBarLayer = new Kinetic.Layer({
					id : hand + num
				});
				$(dataObj.datasets[num].data).each(function(index,element){
					var rect = new Kinetic.Rect({
						x           : Math.round(distance * (index + 0.2)) + num * (width+2) + 44,
						y           : stage.height()-30,
						offset      : {x:0, y:(element / maxNumber) * (stage.height()-40)},
						width       : width,
						height      : Math.round((element / maxNumber) * (stage.height()-40)),
						strokeWidth : 0,
						fill        : fillColor
					});
					singleBarLayer.add(rect);
				});
				stage.add(singleBarLayer);
			})(index);
		});
	},
	//create line layers for respective dataset
	createLines: function(maxNumber, dataObj, stage ,hand){
		var x = dataObj.datasets[0].data.length,
			distance = Math.round((stage.width()-50)/(x-1));
		$(dataObj.datasets).each(function(index){
			var strokeColor = dataObj.datasets[index].color;
			//closure for maintaining scope
			(function(num){
				var singleLineLayer = new Kinetic.Layer({
					id : hand + num
				});
				$(dataObj.datasets[num].data).each(function(index, element){
					var endYPoint = dataObj.datasets[num].data[index + 1],
						line  = new Kinetic.Line({
						x       : 40,
						y       : stage.height()-30,
						stroke  : strokeColor,
						points  : [distance * index, -(Math.round((element / maxNumber) * (stage.height() - 40))), distance * (index + 1), -(Math.round((endYPoint / maxNumber) * (stage.height() - 40)))]
					});
					singleLineLayer.add(line);
				});
				stage.add(singleLineLayer);
			})(index);
		});
	},
	//create legends
	createLegends : function(canvasWrapper, dataObj, stage, hoverColor, hand, isBar){
		$(canvasWrapper).append('<ul class="legends"></ul>');
		$(dataObj.datasets).each(function(index){
			//append legends and set style
			$('.legends', canvasWrapper).append('<li><span class="' + hand + index + '"></span>' + dataObj.datasets[index].label + '</li>');
			var originalColor = dataObj.datasets[index].color;
			$('.' + hand + index, canvasWrapper).css('background-color', originalColor);
			//add mouse over and out function
			$('.legends>li', canvasWrapper).eq(index)
			.on('mouseover', function(){
				$(this).find('span').css('background-color','transparent');
				//redraw the corresponding shapes(the corresponding shapes are collected in on layer)
				var id ='#' + $(this).find('span').attr('class');
				var layer = stage.find(id)[0];
				layer.children.each(function(element){
					if(isBar){
						element.fill(hoverColor);
					}
					else{
						element.stroke(hoverColor);
					}
				});
				layer.draw();
			})
			.on('mouseout', function(){
				$(this).find('span').css('background-color',originalColor);
				//restore the corresponding shapes fill color
				var id ='#' + $(this).find('span').attr('class');
				var layer = stage.find(id)[0];
				layer.children.each(function(element){
					if(isBar){
						element.fill(originalColor);
					}
					else{
						element.stroke(originalColor);
					}
				});
				layer.draw();
			});
		});
	}
};

var Common = Util || {};

//bar chart
(function(){
	//create main stage
	var	stage = new Kinetic.Stage({
			container  : 'bar-chart-wrapper',
			width      : 410,
			height     : 200
		});
	var maxNumber = Common.getMaxNumber(data);
	Common.createGrid(maxNumber, data, stage, true);
	Common.createBars(maxNumber, data, stage, 'bar');
	Common.createLegends('#bar-chart-wrapper', data, stage, 'rgba(0,188,84,0.7)', 'bar', true);
})();
//line chart
(function(){
	//create main stage
	var stage = new Kinetic.Stage({
		container : 'line-chart-wrapper',
		width     : 410,
		height    : 200
	});
	var maxNumber = Common.getMaxNumber(data);
	Common.createGrid(maxNumber, data, stage, false);
	Common.createLines(maxNumber, data, stage, 'line');
	Common.createLegends('#line-chart-wrapper', data, stage, 'rgba(0,188,84,0.7)', 'line', false);
})();