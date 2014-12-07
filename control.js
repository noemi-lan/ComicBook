$(document).ready(function(){
    //set initial state
	var control = {
		init:function(){
			this.$=function(id){return typeof id=="string"?document.getElementById(id):id;}; 
			this.isEraser=false; 
			this.eraserRadius=15;
		
			this.currentColor = "#3498db"; 
			this.fontWeight = [2,5,8];
			this.currentFontWeight = 5; 
			this.isAddDialog = false; 
			this.boards = {"canvas0":new Board("canvas0", this)};
			this.boardNum = 1;
			this.layerNum =[1];
			this.currentBoard = this.boards['canvas0']; //current panel
			this.currentLayerPanel = 0;   //present layer
			this.dragClick = 0; //whether in drag state 0 is false，1 is true
			//whether is touch or mouse
			this.touch = ("createTouch" in document);
			this.StartEvent = this.touch ? "touchstart" : "mousedown";
			this.MoveEvent = this.touch ? "touchmove" : "mousemove"; 
			this.EndEvent = this.touch ? "touchend" : "mouseup"; 
			
			this.eraser=this.$("eraser");
			this.iptClear=this.$("clear");         
			this.revocation=this.$("revocation"); 
			this.imgurl=this.$("imgurl");//save image
			
			this.startRecord=[];
			this.moveRecord=2;
			this.currenrecord=0;      //back
			this.forwardRecord=0;     //forward
			this.a=[];
			
			$("#canvas0").resizable();  			
			this.recordArray = [[],[],[]] ;   //save 20 history  
 			this.dragBind();
			this.bind();

			this.color=["#000000","#3498db","#34495e","#16a085","#27ae60","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#95a5a6","#f39c12", "#d35400", "#7f8c8d", "#00FFFF", "#FFFF00"];
		},
		
		dragBind:function(){
			t = this;
			$(".draggable").draggable();
			if(t.dragClick==0 ){
				$(".draggable").draggable('disable');
					this.currentColor="#3498db"; 
			}else{
			$(".draggable").draggable('enable');
					this.currentColor="#f7f7f7"; 
			}
		},
		
		bind:function(){
			t = this;
			this.iptClear.onclick=function() { 
			    t.currentBoard.clear(); 
			}; 

			this.revocation.onclick=function() { 
			    t.currentBoard.redraw(); 
			}; 

			/*eraser*/ 
			this.eraser.onclick=function(e) { 
			    t.isEraser=true; 
			    var eraserIptNum=this.$("eraser").getElementsByTagName("input"); 
				eraserIptNum.className="grea";
			    //t.$("eraser").style.borderColor= "red";
			}; 

			this.imgurl.onclick=function(e) { 
			    //t.getUrl(); 
			};

			/*mousedown, record the mouse position and draw, unlock，open mousemove event*/ 
			$(document).on(this.StartEvent, ".canvas", function(e){
				var id = $(this).attr("id");
				var board = t.boards[id];
				t.currentBoard = board;
				var touch=t.touch ? e.touches[0] : e; 
				 
				if(t.isEraser) { 
					var _x=(touch.pageX - $(this).offset().left)*480/$("#"+id).width();//x: mouse
					var _y=(touch.pageY - $(this).offset().top)*480/$("#"+id).height();//y: mouse
				    t.moveRecord=1;				 
				    t.startRecord.unshift([_x,_y]);
				    board.resetEraser(_x,_y,touch); 
					board.lock=true;
				} else if(t.isAddDialog) {
					var _x=(touch.pageX - $(this).offset().left);//x: mouse
					var _y=(touch.pageY - $(this).offset().top);//y: mouse
					t.moveRecord=2;					
				    t.startRecord.unshift([_x,_y]);
					board.addDialog(_x, _y, $("#dialogText").val());
				} else { 
					var _x=(touch.pageX - $(this).offset().left)*480/$("#"+id).width();
					var _y=(touch.pageY - $(this).offset().top)*480/$("#"+id).height();
				    t.moveRecord=3;				   
				    t.startRecord.unshift([_x,_y]);				
				    board.movePoint(_x,_y);
				    board.drawPoint(); 
					board.lock=true;
				} 
			});

			/*mouse movement*/ 
			$(document).on(this.MoveEvent, ".canvas", function(e){
				var id = $(this).attr("id");
				var board = t.boards[id];
				var touch=t.touch ? e.touches[0] : e; 
				if(board.lock)//t.lock为true则执行 
				{ 
				    var _x=(touch.pageX - $(this).offset().left)*480/$("#"+id).width();
				    var _y=(touch.pageY - $(this).offset().top)*480/$("#"+id).height();
				    if(t.isEraser) { 
				        board.resetEraser(_x,_y,touch);
				         t.startRecord.unshift([_x,_y]); 				         
				    } else { 
				        board.movePoint(_x,_y);
				        board.drawPoint();
				        t.startRecord.unshift([_x,_y]); 				      
				    } 
				   
				} 
			});
			
			//reset								
			$(document).on(this.EndEvent, ".canvas", function(e){
				/*reset data*/ 
				var id = $(this).attr("id");
				var board = t.boards[id];
				board.lock=false; 
				board.x=[]; 
				board.y=[]; 
				board.clickDrag=[]; 
				
				var touch=t.touch ? e.touches[0] : e; 
				var _x=(touch.pageX - $(this).offset().left)*480/$("#"+id).width();
				var _y=(touch.pageY - $(this).offset().top)*480/$("#"+id).height();
				t.startRecord.unshift([_x,_y]); 
				t.startRecord.unshift(id); 
				t.startRecord.unshift(t.moveRecord); 				
				t.a[t.currenrecord]=t.startRecord;
				t.startRecord=[];
				++t.currenrecord;			
			});
			
			//undo
			$("#undo").on('click',function(e){			
				if(t.currenrecord!=0){	
					var num = t.currenrecord;				
					var record = t.a[--num];							
					if(record != undefined ){		
						var args = record[0];
						if(args==3){
							this.isEraser=true;
							var id = record[1];											
							var board = t.boards[id];
							t.currentBoard = board;
							var touch=t.touch ? e.touches[0] : e; 
						
							record.forEach(function(a,b,c){
								if(a.length==2){							
									board.resetEraser(a[0],a[1],touch);
								}
							});						
						}
						if(args == 1){
							this.isEraser=false;
							var id = record.shift();											
							var board = t.boards[id];
							t.currentBoard = board;
							var touch=t.touch ? e.touches[0] : e; 
							record.forEach(function(a,b,c){
								console.log(a[0],a[1]);
								board.movePoint(a[0],a[1]);
								board.drawPoint(); 
								board.lock=true;
							});																						
						}
					--t.currenrecord;						
					}else{
						alert("back to initial");
					}
					
				}
			});
			
			
			//redo
			$("#redo").on('click',function(e){					
				var num = t.currenrecord;				
				var record = t.a[num];												
				if(record != undefined ){	
					console.log("qianjin"+t.currenrecord);	
					var args = record[0];
					if(args==3){
						this.isEraser=false;
						var id = record[1];											
						var board = t.boards[id];
						t.currentBoard = board;
						var touch=t.touch ? e.touches[0] : e; 
						record.forEach(function(a,b,c){
							if(a.length==2){
								console.log(a[0],a[1]);
								board.movePoint(a[0],a[1]);
								board.drawPoint();//draw
								board.lock=true;
							}
						});										
					}
					if(args == 1){
						this.isEraser=true;
						var id = record[1];											
						var board = t.boards[id];
						t.currentBoard = board;
						var touch=t.touch ? e.touches[0] : e; 
						record.forEach(function(a,b,c){
							if(a.length==2){
								console.log(a[0],a[1]);
								board.resetEraser(a[0],a[1],touch);
							}
						});																				
					}
					++t.currenrecord;	
				}else{
					alert("the last step");
				}		
			});



			this.changeColor(); // changecolor
			
			//addpanel
			$("#addCanvasBorad").click(function(e) { // add panel
				var size = t.boardNum++;
				$("#panelBorad").append('<ul id="panel'+size+'"  style="width:200px;height:200px;float:left;display: block;margin: 10px 0px 0px 10px;position:relative;"><li class="draggable"  style="position: absolute;top:0;" id="layer'+size+'0" width="480" height="480" ><canvas id="canvas'+size+'" class="canvas" width="480" height="480">your browser cannot support canvas</canvas></li></ul>');
				$("#option").append('<option value ="'+size+'">panel'+(size+1)+'</option>');
				$("#canvas" + size).resizable();
				
				$('#layButton'+t.currentLayerPanel).hide();
				
				$('#layButton').append('<div id="layButton'+ size+'" style="position:absoluete; top:0;"></div>');   
				
				$('#layButton'+ size).append('<br><input id="lay'+size+'0'+'" class="lay'+size+'"  type="button" value="layer1" style="width:80px;">');   //panel-layer				
				t.currentLayerPanel=size;					
				$('#option').val(size);   
				
				$("#optionBorder").append('<option value ="'+size+'">border'+(size+1)+'</option>');
							 
				//$("#canvas" + size).draggable();
				var newBoard = new Board("canvas" + size, t);
				t.boards["canvas"+ size] = newBoard;	
				t.layerNum[size]=1;										
				t.currentBoard = t.boards["canvas"+ size];		
			});
			
			//panel  button change and layer change    panel event bind		
			$('#option').on('change',function(e){
				var num = $("#option").val();   //get shown layer
				if(num !=  t.currentLayerPanel){
					$('#layButton'+t.currentLayerPanel).hide();
					$('#layButton'+num).show();
					t.currentLayerPanel = num;
				}								
			});
			
				
			
			$("#addLayer").click(function(e) { // add panel event bind				
				var panelNumber = $("#option").val();   //get number of add layer		
				var layerNumber = t.layerNum[panelNumber];	 //get the layer number of every panel					
				var copyLayer = $('#layer'+panelNumber+'0').clone();    //get the first of layer needed to be built
				$(copyLayer).attr("id",'layer'+(panelNumber)+layerNumber);	 	//change Id	  
				$('#panel'+panelNumber).append(copyLayer);					//add
				$('#layer'+ panelNumber+layerNumber +' canvas').attr("id","canvas"+panelNumber+layerNumber);	//change canvas id				
				var newBoard = new Board("canvas" + panelNumber+ layerNumber , t);									
				t.boards["canvas"+ panelNumber + layerNumber] = newBoard;	
				t.layerNum[panelNumber] = ++layerNumber;		
				$('#layButton'+panelNumber).append('<br><input id="lay'+panelNumber+layerNumber+'" class="lay'+panelNumber+'"  type="button" value="layer'+layerNumber+'" style="width:120px;">');						
			});
			//delet character
			$('#deleteContext').on('click',function(e){
				var text = $("#optionContext").val(); 							
				$('#optionContext option[value="'+text+'"]').remove();
				$('#context'+text).remove();
			});
			
			//in drag state
            //in drag state

			
			//in drag state
			$(document).keydown(function(event){ 
			  if(event.keyCode == 16){ 
               this.currentColor="#f7f7f7";
             // this.cxt.stroke('disable');

				t.dragClick=1;
				t.dragBind(); 
              }
              console.log(event.keyCode); 
            });
			
			//stop drag state
            $(document).keyup(function(event){ 
			  if(event.keyCode == 16){ 
               this.currentColor="#3498db";
               //t.cxt.stroke('enable');
				t.dragClick=0;
				t.dragBind();
              }
            });
       			
			//delete panel
			$("#deletePanel").click(function(e) {
				var num = $("#optionBorder").val();   	
				t.boardNum--;
				var li = $('#panel'+ num);
				li.remove();
				t.boards[Number(num)] = undefined;
				debugger;
				$('#optionBorder option[value="'+num+'"]').remove();
				$('#option option[value="'+num+'"]').remove();							
			});
			
			
			$("#addDialog").click(function(e) {
				var clsName = $(this).attr("class");
				if (clsName && clsName.indexOf("grea") != -1) {
					t.isAddDialog = false;
					$(this).attr("class", "");
				} else {
					t.isAddDialog = true;
					$(this).attr("class", "grea");
				}
			});
		},
		
		
		deleteBorder:function(){
			t=this;
			t.boardNum--;			
			console.log(t.boards);
			var num = $(t.currentBoard.canvas).attr('id').split("canvas")[1];
			$('#optionBorder option[value="'+num+'"]').remove();
			$('#option option[value="'+num+'"]').remove();	
			Number(num);
			var li = $('#panel'+ num);
			// var li = $(t.currentBoard.canvas).parents("li");
			li.remove();
			t.boards[$(t.currentBoard.canvas).attr("id")] = undefined;
			if(num!=0){
				num--;
				console.log(t.boards[Number(num)]);
				t.currentBoard = t.boards['canvas'+Number(num)];
			}else{
				t.currentBoard=t.boards['canvas0'];
			}
		},

		changeColor:function() { 
		    /*add event to button*/ 
		    var t=this,iptNum=this.$("color").getElementsByTagName("input"),fontIptNum=this.$("font").getElementsByTagName("input"); 
		    for(var i=0,l=iptNum.length;i<l;i++) { 
		        iptNum[i].index=i; 
		        iptNum[i].onclick=function() { 
					t.currentBoard.cxt.save(); 
		            t.currentColor=t.color[this.index]; 
		            t.$("eraser").style.borderColor= "#000";
		            t.isEraser=false; 
		        }; 
		    }; 
		    for(var i=0,l=fontIptNum.length;i<l;i++) { 
		        fontIptNum[i].index=i; 
		        fontIptNum[i].onclick=function() { 
		            t.changeBackground(this.index); 
					t.currentFontWeight = t.fontWeight[this.index];
		            t.$("eraser").style.borderColor= "#000"; 
		            t.isEraser=false; 
		        };
		    }; 
		},

		changeBackground:function(num) { 
		    /*change pencil*/ 
		    var fontIptNum=this.$("font").getElementsByTagName("input"); 
		    for(var j=0,m=fontIptNum.length;j<m;j++) { 
		        fontIptNum[j].className=""; 
		        if(j==num) fontIptNum[j].className="grea"; 
		    } 
		},
		
		onAddBoard:function(e) {
			var size = $("#canvasBorad ul li").size();
			var newBoardId = new Board("canvas" + size, t);	
		}			
	};
	control.init();
});