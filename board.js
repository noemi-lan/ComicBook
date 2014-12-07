function Board(canvas, control) {
	this.control = control;
	this.canvas = this.$(canvas);
	this.x=[];//x point 
	this.y=[];//y point
	this.clickDrag=[]; 
	this.lock=false;//before movement, whether has been pressed
	this.w=this.canvas.width; 
	this.h=this.canvas.height;
	this.cxt=this.canvas.getContext('2d'); 
	this.cxt.lineJoin = "round";//context.lineJoin
	this.cxt.lineWidth = 5;
	this.touch =("createTouch" in document);
};

Board.prototype.contextRecord = [];

Board.prototype.$=function(id){
	return typeof id=="string"?document.getElementById(id):id;
}; 

//clear panel
Board.prototype.clear=function(){ 
    this.cxt.clearRect(0, 0, this.w, this.h);
};

Board.prototype.movePoint = function(x, y) {
	/*mouse coordinate--data array*/ 
	this.x.push(x); 
	this.y.push(y); 
	this.clickDrag.push(y); 
};

//drawing
Board.prototype.drawPoint = function() {
    if(this.control.dragClick==0){	
        for(var i=0; i < this.x.length; i++) {//rotate array 
	       this.cxt.beginPath();//context.beginPath(), start to draw
	       if(this.clickDrag[i] && i){
               this.cxt.moveTo(this.x[i-1], this.y[i-1]);//context.moveTo(x, y) 
           }else{ 
               this.cxt.moveTo(this.x[i]-1, this.y[i]); 
           } 
            this.cxt.lineTo(this.x[i], this.y[i]);//context.lineTo(x, y) ,  
            this.cxt.closePath();//context.closePath() , if open, then close 
            this.cxt.strokeStyle = this.control.currentColor;
            this.cxt.lineWidth = this.control.currentFontWeight;
            this.cxt.stroke();//context.stroke(), 
	   } 
    }
};

//eraser
Board.prototype.resetEraser = function(_x, _y) { 
	this.cxt.globalCompositeOperation = "destination-out"; 
	this.cxt.beginPath(); 
	this.cxt.arc(_x, _y, this.control.eraserRadius, 0, Math.PI * 2); 
	this.cxt.strokeStyle = "rgba(250,250,250,0)"; 
	this.cxt.fill(); 
	this.cxt.globalCompositeOperation = "source-over";
};

//addDialog
Board.prototype.addDialog = function(_x, _y, text) {
	debugger;
	var fatherElement = $(this.canvas);
	var div = document.createElement("div");
	div.id= 'context'+this.contextRecord.length;
	debugger;
	$("#optionContext").append('<option value ="'+this.contextRecord.length+'">'+(text)+'</option>');
	this.contextRecord.push(1);
	var divStyleLeft = _x + "px";
	var divStyleTop =  _y + this.canvas.offsetTop + this.canvas.clientTop + "px";
	var divStyleIndex = 100 + $("canvas").length;
	div.style.cssText +="position:absolute;left:"+divStyleLeft+";top:"+divStyleTop+";zIndex:"+divStyleIndex + ";border:1px solid black";
	var newCanvas = document.createElement("canvas");
	var newCtx = newCanvas.getContext("2d");
	this.canvas.parentNode.appendChild(div);
	newCanvas.width = 100;
	newCanvas.height = 30;
	div.appendChild(newCanvas);
	newCtx.font = "Bold 20px Arial"; 
	// align style
	newCtx.textAlign = "left";
	// fill color
	newCtx.fillStyle = this.control.currentColor; 
	// set font
	newCtx.fillText(text, 10, 25);
	$(div).draggable({
		start : function (a, b) {
					zindex = $(this).css("zIndex");
					$(this).css("zIndex", 10006);
				},
		stop : function (a, b) {
					$(this).css("zIndex", zindex);
				},
		containment : $("parent")
	});

	$(div).resizable({
		minHeight : 20,
		minWidth : 50
		}, {
		stop : function (a, b) {
					newCanvas.style.height = b.size.height + "px";
					newCanvas.style.width = b.size.width + "px";
				}
		});
};

//add text
Board.prototype.addText = function(_x, _y, text) {
	// set font
	this.ctx.font = "Bold 20px Arial"; 
	// set align
	this.ctx.textAlign = "left";
	// set fillcolor
	this.ctx.fillStyle = this.control.currentColor; 
	this.ctx.fillText(text, _x, _y); 
};