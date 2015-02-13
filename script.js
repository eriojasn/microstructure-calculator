var WIDTH = 7;
var HEIGHT = 800;
var EPSILON = 2;
var EPSILON2 = .001;

var coolingLine = function(intercept, rate) {
	this.intercept = intercept;
	this.rate = rate;
};

var line = function(intercept, poly1, poly2, poly3, poly4, poly5, poly6, minX, minY, maxX, maxY) {
	this.order = 6;
	this.intercept = intercept;
	this.poly1 = poly1;
	this.poly2 = poly2;
	this.poly3 = poly3;
	this.poly4 = poly4;
	this.poly5 = poly5;
	this.poly6 = poly6;
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;
};

var graphLines = function(ps, pf, ms, mf) {
	this.ps = ps;
	this.pf = pf;
	this.ms = ms;
	this.mf = mf;
};

var pearliteStartLine = new line(-889.642, 2661, -1949, 758.6, -162.8, 18.19, -.8271, 1.1342, 492.7536, 5.5842, 695.6522);
var pearliteFinishLine = new line(-4039.5556, 6978.0024, -4362.4367, 1450.195, -268.2902, 26.1107, -1.0436, 1.867978, 510.1449, 5.859551, 675.3623);

var pearliteFloorSlope = (pearliteFinishLine.minY - pearliteStartLine.minY) / (pearliteFinishLine.minX - pearliteStartLine.minX);
var pearliteFloorIntercept = pearliteFinishLine.minY - pearliteFloorSlope * pearliteFinishLine.minX;
var pearliteFloor = new line(pearliteFloorIntercept, pearliteFloorSlope, 0, 0, 0, 0, 0, 0, 0, 0, 0);

var martensiteStartLine = new line(217.3913, 0, 0, 0, 0, 0, 0, 0, 0, 2.2, 217.3913);
var martensiteFinishLine = new line(118.840, 0, 0, 0, 0, 0, 0, 0, 0, 2.3, 118.840);

var myGraphLines = new graphLines(pearliteStartLine, pearliteFinishLine, martensiteStartLine, martensiteFinishLine);

var findIntersection = function(coolingRate, line) {
	var coolingRateY;
	var lineY;
	var delta;
	var minDelta = Number.MAX_VALUE;

	for(var x = 0; x < WIDTH; x += EPSILON2)
	{
		coolingRateY = evaluateCoolingRate(x, coolingRate);
		lineY = evaluateLine(x, line);

		delta = Math.abs(coolingRateY - lineY);

		if(delta < EPSILON)
		{
			if(delta < minDelta)
				minDelta = delta;
			else
				return x;
		}

		if(coolingRateY < line.minY)
		{
			break;
		}
	}

	return false;
};

var evaluateCoolingRate = function(x, coolingRate) {
	var y = coolingRate.intercept - coolingRate.rate * Math.pow(10, x - 1);

	return y;
};

var evaluateLine = function(x, line) {
	var y = line.intercept;

	for(var i = 1; i <= line.order; i++)
	{
		var index = "poly" + i;
		y += line[index] * Math.pow(x, i);
	}

	return y;
};

var findMix = function(startpoint, endpoint, midpoint) {
	var mix = 0;
	mix = (midpoint - startpoint) / (endpoint - startpoint) * 100;

	return mix;
};

var drawGraph = function(lines) {
	var c = document.getElementById("graph");
	var ctx = c.getContext("2d");
	var colors = ["red", "orange", "blue", "indigo"];
	var i = 0;
	var lineY;
	var cHeight = c.height;
	var cWidth = c.width;
	var xTicks = 7;
	var yTicks = 8;

	c.height = cHeight;
	c.width = cWidth;

	ctx.font = "10px Times New Roman";

	for(var c = 1; c <= xTicks; c++)
	{
		ctx.fillStyle = "lightgray";
		ctx.fillRect(c * (cWidth / xTicks), cHeight - 5, 1, 0 - cHeight);

		for(var j = 1; j < 10; j++)
		{
			ctx.fillStyle = "lightgray";
			ctx.fillRect((getBaseLog(10, j) + c - 1) * (cWidth / xTicks), cHeight, 1, 0 - cHeight);
		}

		ctx.fillStyle = "black";
		ctx.fillRect(c * (cWidth / xTicks), cHeight - 5, 1, 5);

		ctx.fillText(Math.pow(10, c - 1) + " s", c * (cWidth / xTicks), cHeight);
	}

	for(var c = 1; c <= yTicks; c++)
	{
		ctx.fillStyle = "lightgray";
		ctx.fillRect(0, c * (cHeight / yTicks), cWidth, 1);

		ctx.fillStyle = "black";
		ctx.fillRect(0, c * (cHeight / yTicks), 5, 1);

		if(c != yTicks)
			ctx.fillText((800 - c * 100) + "°C", 0, c * (cHeight / yTicks));
		else
			ctx.fillText(".1 s, 0°C", 0, c * (cHeight / yTicks));
	}

	for(var line in lines)
	{
		ctx.fillStyle = colors[i];
		i++;

		for(var x = 0; x < WIDTH; x += EPSILON2)
		{
			lineY = evaluateLine(x, lines[line]);

			if(x > lines[line].minX && x < lines[line].maxX) {
				ctx.fillRect(x * 60, 400 - lineY / 2, 1, 1);
			}
		}

		ctx.font = "15px Times New Roman";
		ctx.fillText(line, lines[line].maxX * 60, 400 - lines[line].maxY / 2);
	}
};

var drawRate = function(coolingRate)
{
	var c = document.getElementById("graph");
	var ctx = c.getContext("2d");
	ctx.fillStyle = "black";
	var coolingRateY;

	for(var x = 0; x < WIDTH; x += EPSILON2)
	{
		coolingRateY = evaluateCoolingRate(x, coolingRate);
		ctx.fillRect(x * 60, 400 - coolingRateY / 2, 1, 1);
	}
};

var getBaseLog = function(x, y) {
	return Math.log(y) / Math.log(x);
};

var runProgram = function() {
	var myCoolingRate = document.getElementById("userCoolRate").value;
	var coolingRate = new coolingLine(727, myCoolingRate);
	var martensiteOut = document.getElementById("martensiteOut");
	var pearliteOut = document.getElementById("pearliteOut");

	drawGraph(myGraphLines);
	drawRate(coolingRate);

	if(!findIntersection(coolingRate, pearliteStartLine)) {
		pearliteOut.innerHTML = "0";
		martensiteOut.innerHTML = "100";
	}
	else if(findIntersection(coolingRate, pearliteFinishLine)) {
		pearliteOut.innerHTML = "100";
		martensiteOut.innerHTML = "0";
	}
	else {
		var floorIntersectX = 0;
		floorIntersectX = findIntersection(coolingRate, pearliteFloor);

		var pearlite = 0;
		pearlite = findMix(pearliteStartLine.minX, pearliteFinishLine.minX, floorIntersectX);

		var martensite = 0;
		martensite = 100 - pearlite;

		pearliteOut.innerHTML = pearlite;
		martensiteOut.innerHTML = martensite;
	}
};

