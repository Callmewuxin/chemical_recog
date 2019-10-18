var COLOURS = '#121212';
var radius = 0;
var startDraw = 0;
var specialCharLabel = ['Ｔ', 'ｑ', '⊕', 'ｅ', 'ｋ', 'Ｈ', '５', '＋', 'ｂ', '７', '４', 'ｗ', 'Ｙ', 'ｓ', 'Ｍ', 'ｍ', 'Ｒ', '↓', '＜', '［', '８', '２', 'ｙ', '→', 'Ｏ', '６', 'ｉ', '＝', 'Ａ', '）', 'ｎ', 'ｘ', 'Ｎ', 'Ｉ', 'Ｌ', '←', 'Ｑ', 'ｐ', '＃', '９', 'a', 'Ｆ', 'ｄ', '＊', 'ｔ', '｝', '≤', 'ｕ', 'Ｊ', 'ｆ', 'Ｇ', '＞', 'ｇ', '（', '３', '１', '↑', 'Ｄ', '÷', '？', '－', 'Ｂ', 'ｊ', 'ｌ', 'Ｕ', 'Ｅ'];
var charLabel2char = {'５':'5', '７':'7', '４':'4', '８':'8', '２':'2','６':'6', '９':'9',  '３':'3', '１':'1'}; // 编码转换
var pointCoodi=[];
var pointCoodi_copy = [];
var charlist = []; // 一个字符为单位的笔迹信息
var strokeList = []; // 一个笔画为单位的笔迹信息
var times=0;
var signal=0;
var result = [];
var hidetimes=0;
var stroke = 0;
var height = document.documentElement.clientHeight ; 
var width = document.documentElement.clientWidth ; 
var ViewHeight = height/4;
var ViewWidth= 3*width/10;
var tableNum=0;
var tableNumDraw=0;
var ViewStyle = document.getElementById("View");
var container = document.getElementById("areaDraw");
var element = document.getElementById("draw");
var DrawTableStyle = document.getElementById("tableView");
var chem;
var id;
var idBefore;
var isTable = false;
var isText = true;
// var testRec = ["3", "ｘ", "2", "+", "+", "-", "-", "+", "+", "-", "-"];
var testend = -1;
var stroke = -1;
var strokelist = [];
var strokend = [];
var ctx;
var writeType = 1;

var PreLineY = 0;
var isNextLine = false;
var canvasChosen;
var getTime = 4000;
var mouseX,mouseY;
//画布创建与笔迹位置坐标存储
document.oncontextmenu = function(e){
	return false;
};

var doDraw = Sketch.create({
	container: document.getElementById("areaDraw"),
	
    autoclear: false,
	retina: 'auto',
    setup: function() { 	
        console.log( '开始' );
    },
    update: function() {
        radius = 2 + abs( sin( this.millis * 0.003 ) * 3 );
        //console.log(container.clientHeight||container.offsetHeight);
    },

    keydown: function() {
        if ( this.keys.C ) this.clear();//清除页面
    },
    touchstart:function(){
		ctx = this;
		// console.log("button " + event.button);
		/*
		if (event.button == 2){
			
			ctx.fillRect(0,0,100,100);
		}
		*/
		if (event.button == 2 && charlist.length > 0){
			console.log("点击右键事件");
			deleteMark();
		}
		//console.log(this);
		startDraw=1;
		stroke++;
		strokelist.push([]);
		console.log(stroke);
        //pointCoodi.push({x:this.mouse.ox,y:this.mouse.oy});
		if(this.mouse.oy>PreLineY){
			isNextLine = true;
		}
		isTable = false;
    },
    touchmove: function() {
		//console.log(this);
        if(startDraw){
            for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
			touch = this.touches[i];
			//console.log(touch);
            this.lineCap = 'round';
            this.lineJoin = 'round';
            this.fillStyle = this.strokeStyle = COLOURS;
            this.lineWidth = radius;
            this.beginPath();
            this.moveTo( touch.ox, touch.oy );
            this.lineTo( touch.x, touch.y );
            this.stroke();
			pointCoodi.push({x:touch.ox,y:touch.oy});
			pointCoodi_copy.push({x:touch.ox,y:touch.oy});
			strokelist[stroke].push({x:touch.ox,y:touch.oy});
			// console.log(pointCoodi);
			}
        }
        
        if(this.mouse.oy>PreLineY){
        	PreLineY = this.mouse.oy;
        }
    },
    touchend:function(){
		
		startDraw=0;
		mouseX = this.mouse.ox;
		mouseY = this.mouse.oy;
		pointCoodi.push({x:this.mouse.ox,y:this.mouse.oy});
		pointCoodi_copy.push({x:this.mouse.ox,y:this.mouse.oy});
		strokeList.push(pointCoodi_copy);
		strokelist[stroke].push({x:this.mouse.ox,y:this.mouse.oy});
		// console.log(strokelist);
		if(pointCoodi.length!=0)
			postCoodi(); 
		if(signal==0){
			// console.log(pointCoodi);
			signal=1;//互斥信号量保证同时只有一个函数在等待执行
			var handler=setTimeout(function(){
			signal=0;
			//console.log(n);
			var n = strokelist[stroke].length;
				if(writeType == 1){
					getRecogResult();

				}else{
					getRecogResultElse();
				}
				
				clearTimeout(handler);
			},getTime);//test，延迟1.5秒进行笔迹路径post和识别执行
		}
    }

});



//滑动显示或隐藏缩略图
function move(){
	if(hidetimes!=0)
		Hide.reverse();
	Hide.play();
	hidetimes=1;
}
var Hide = anime({
	targets: '#ViewAll',
	translateX: ViewWidth,
	easing: 'easeInQuad',
	autoplay: false
	});

//页面数据获得模拟//
var text02,text03;
var confirm02 = document.getElementById("confirm02");

//向识别缩略图内添加内容
//添加文字内容
function addContext(str,canvasChosen){
	if(!isTable){
		ViewStyle.innerHTML+=str;
		if(isNextLine){
			ViewStyle.innerHTML+="<br>";
			isNextLine = false;
		}
		midOfView();
	}
	else{	
		console.log(canvasChosen.id);
		var canvasId = canvasChosen.id;
		var CellId = "Cell"+canvasId;
		console.log(CellId);
		var chosenCell = document.getElementById(CellId);
		chosenCell.innerHTML+=str;
	}
	
}
//添加预览表格
function createTable(row, cols) {
	
    tableNode = document.createElement("table"); //获得对象   
    tableNode.setAttribute("id", "table"+tableNum);
    tableNode.setAttribute("class", "table");
    	
	//alert(row);  
    if (row <= 0 || isNaN(row)) {
        alert("输入的行号错误，不能创建表格，请重新输入：");
        return;
    }
    if (isNaN(cols) || cols <= 0) {
        alert("输入的列号错误，不能创建表格，请重新输入：");
        return;
	}
    //上面确定了 现在开始创建  
    for (var x = 0; x < row; x++) {
        var trNode = tableNode.insertRow();
        for (var y = 0; y < cols; y++) {
            var tdNode = trNode.insertCell();
            tdNode.setAttribute("id","CellToCanvas"+(x + 1) + " " + (y+1));
            
            // tdNode.innerHTML = "单元格" + (x + 1) + "-" + (y + 1);
        }
    }
    ViewStyle.appendChild(tableNode);  
    ViewStyle.innerHTML+="<p>";
    midOfView();
    
}

//可获得点击单元格的id/数据
//function getColumnDetail(object){ 
//	isTable = true;
//	isText = false;
//	object.style.background="grey";
//	if (id != null)
//	{
//		idBefore=id;
//		var cellBefore=document.getElementById(idBefore);//清楚前一个选择的cell的样式
//		cellBefore.style.background="white";
//	}
//	id = object.id;  //弹出被点单元格里的内容
//	
//	
//}

// 表格添加列
function addColumn()
{
	var table1 = document.getElementById("tableDraw"+ tableNum);
	var table2 = document.getElementById("table" + tableNum);
	
	addColumntable(table1);
	addColumntable(table2);
}
function addColumntable(table){
	var r = table.rows.length;
	var c = table.rows[0].cells.length;
	for(i=0; i<r; i++)
	{
		var trNode = table.rows[i];
		var tdNode = trNode.insertCell();
		tdNode.setAttribute("id","CellToCanvas"+(i + 1) + " " + (c+1));
		 if(table.id == "tableDraw"+ tableNum){
			  var canvas = document.createElement("canvas");
			  canvas.setAttribute("class", "canvasOfTable");
				canvas.setAttribute("id", "ToCanvas"+(i + 1) + " " + (c+1));
				cellMonitor(canvas,tdNode);
		  }
		
	}
  }

// 表格删除列
function delColumn()
{
	var table1 = document.getElementById("tableDraw"+ tableNum);
	var table2 = document.getElementById("table" + tableNum);
	deleteColumntable(table1);
	deleteColumntable(table2);
}
function deleteColumntable(table)
    {
      var r = table.rows.length;
      var c = table.rows[0].cells.length;
      for(i=0; i<r; i++)
      {
        table.rows[i].deleteCell(c-1);
      }
    }

// 表格添加行
function addRow()
{
	var table1 = document.getElementById("tableDraw"+ tableNum);
	var table2 = document.getElementById("table" + tableNum);
	addRowtable(table1);
	addRowtable(table2);
}
function addRowtable(table){
	var c = table.rows[0].cells.length;
	var r = table.rows.length;
	table.insertRow(r);
	for(j=0; j<c; j++)
	{
	  var tdNode = table.rows[r].insertCell(j);
	  tdNode.setAttribute("id","CellToCanvas"+(r + 1) + " " + (j + 1));
	  
	  if(table.id == "tableDraw"+ tableNum){
		  var canvas = document.createElement("canvas");
		  canvas.setAttribute("class", "canvasOfTable");
			canvas.setAttribute("id", "ToCanvas"+(r+1)+" "+(j+1));
			cellMonitor(canvas,tdNode);
	  }
	 
		
	}
  }

  // 表格删除行
function delRow()
{
	var table1 = document.getElementById("tableDraw"+ tableNum);
	var table2 = document.getElementById("table" + tableNum);
	delRowtable(table1);
	delRowtable(table2);
}
function delRowtable(table)
  {
	var r = table.rows.length;
	table.deleteRow(r-1);
  }

//View控制，区域长度View.height，始终滑动条保持当前输入内容显示
function midOfView(){
	ViewStyle.scrollTop = ViewStyle.scrollHeight;
}
//页面控制，页面滚轮移到表格位置
function midOfDraw(positionX, positionY){
	window.scrollTo(0,positionY);
}

//发送点坐标函数
postCoodi = function(){
	var json = JSON.stringify(pointCoodi);
	times++;
	pointCoodi_copy = [];

	/*
	$.ajax({//向服务器发出请求的方法
		type:"post",
		url:"/project/index",//向服务器请求的url
		data:{coodi:json,times:times},//注意，就算不需要发送数据给后端也要有data
		dataType:'text',//服务器响应的数据类型
		success:function(){//请求服务器成功后返回页面时页面可以进行处理，data就是后端返回的数据
			//console.log(pointCoodi);
			pointCoodi=[];
			
		},
		error:function(e){
			alert("postCoodi异常"+e.responseText);
		}
		});
	*/
};
function cellContext(id, str){
	if(id!=null){
		var cell = document.getElementById(id);
		console.log(cell);
		cell.innerHTML +="<div class ='inputText'>"+str+"</div><br>";
		midOfView();
	}
	
	
}


getRecogResult = function(){
	charlist.push(strokeList);
	strokeList = [];
	console.log("一个字符写完了");
	/*
	$.ajax({
		type : 'get',
		url : '/project/index',
		data: {recog:"CHN"},
		dataType : "text",
		success : function(str){
			chem=str;
			result.push(chem);
			strokend = [];
			
			// console.log("get success: "+str);
			// console.log("result: " + result);
			addContext(str,canvasChosen);
			if(str == ("x"||"X")&&isTable)
				clearCellInner(canvasChosen);

		},
		error : function(e) {
			alert("getRecogResult异常！"+e.responseText);
		}
	});
	*/
};

getRecogResultElse = function(){
	charlist.push(strokeList);
	strokeList = [];
	console.log("一个字符写完了");
	/*
	$.ajax({
		type : 'get',
		url : '/project/index',
		data: {recog:"1"},
		dataType : "text",
		success : function(str){
			chem=str;
			result.push(chem);
			strokend = [];
			console.log("get success: "+str);
			addContext(str,canvasChosen);
			var res = result.length;
			if(!isTable){
				
				console.log("当前长度：" + res);
				console.log("当前识别结果：" + result[res-1]);
				if (result[res-2] == "ｘ"){
					console.log('前一位是乘号');
					console.log("行： " + result[res-3]);
					console.log("列： " + result[res-1]);
					var r = Number(charLabel2char[result[res-3]]);
					var c = Number(charLabel2char[result[res-1]]);
					createDoubleTable(r,c,mouseX,mouseY);
				} // 创建表格
				
				
			}
			if (tableNum > 0){
				console.log("table 数"+ tableNum);
				console.log("this "+result[res-1]);
				if (result[res-1] == '＋' || result[res-1] == '－')
				{
				var tableDraw = document.getElementById("tableDraw"+ tableNum);
				 //console.log(tableDraw);
				var xright = tableDraw.offsetWidth + tableDraw.offsetLeft;
				var ybottom = tableDraw.offsetHeight + tableDraw.offsetTop;
				var xleft = tableDraw.offsetLeft;
				var ytop = tableDraw.offsetTop;
				var n = strokelist[stroke].length;
				var n1 = strokelist[stroke-1].length;
				var x1, y1, x2, y2, ymin1, xmin1;
				if (mouseX > xright && mouseY <ybottom && mouseY > ytop ){  // 还需要加判断识别字符是加号
					if (result[res-1] == '－')
					{
						x1 = strokelist[stroke][0].x;
						x2 = strokelist[stroke][n-1].x;
						y1 = strokelist[stroke][0].y;
						y2 = strokelist[stroke][n-1].y;
						ymin1 = Math.min(y1, y2);
						xmin1 = Math.min(x1, x2);
						ctx.clearRect(xmin1-5, ymin1-5, Math.abs(x2 - x1) + 15, Math.abs(y2 - y1) + 15);
						delColumn();
					}
					if (result[res-1] == '＋')
					{
						x1 = strokelist[stroke-1][0].x;
						x2 = strokelist[stroke-1][n1-1].x;
						y1 = strokelist[stroke][0].y;
						y2 = strokelist[stroke][n-1].y;
						ctx.clearRect(x1-5, y1-5, Math.abs(x2 - x1) + 15, Math.abs(y2 - y1) + 15);
						addColumn();
					}
				}

				if (mouseX > xleft && mouseX <xright && mouseY > ybottom ){  // 还需要加判断识别字符是加号
					if (result[res-1] == '－')
					{
						x1 = strokelist[stroke][0].x;
						x2 = strokelist[stroke][n-1].x;
						y1 = strokelist[stroke][0].y;
						y2 = strokelist[stroke][n-1].y;
						ymin1 = Math.min(y1, y2);
						xmin1 = Math.min(x1, x2);
						ctx.clearRect(xmin1-5, ymin1-5, Math.abs(x2 - x1) + 15, Math.abs(y2 - y1) + 15);
						delRow();
					}
					if (result[res-1] == '＋')
					{
						x1 = strokelist[stroke-1][0].x;
						x2 = strokelist[stroke-1][n1-1].x;
						y1 = strokelist[stroke][0].y;
						y2 = strokelist[stroke][n-1].y;
						ctx.clearRect(x1-5, y1-5, Math.abs(x2 - x1) + 15, Math.abs(y2 - y1) + 15);
						addRow();
					}
				}
				}
				}
			
			console.log("result: " + result);
			if(str == ("x"||"X")&&isTable)
				clearCellInner(canvasChosen);
		},
		error : function(e) {
			alert("getRecogResult异常！"+e.responseText);
		}
	});
	*/
};

function createDoubleTable(row, col ,positionX ,positionY){
	tableNum = tableNum + 1;
	isTable = true;
	createTableCanvas(row,col,positionX,positionY);
	createTable(row, col);
	midOfDraw(positionX,positionY);
}



function createTableCanvas(row, cols,positionX,positionY) {
	//doDraw.stop();
	// tableNum++;
    var tableNode = document.createElement("table"); //获得对象   
    tableNode.setAttribute("id", "tableDraw"+tableNum);
    tableNode.setAttribute("class", "table");
    	
	//alert(row);   
    if (row <= 0 || isNaN(row)) {
        alert("输入的行号错误，不能创建表格，请重新输入：");
        return;
    }
    if (isNaN(cols) || cols <= 0) {
        alert("输入的列号错误，不能创建表格，请重新输入：");
        return;
	}
    //上面确定了 现在开始创建  
    for (var x = 0; x < row; x++) {
        var trNode = tableNode.insertRow();
        for (var y = 0; y < cols; y++) {
			var tdNode = trNode.insertCell();
			tdNode.setAttribute("id", (x+1)+" "+(y+1)+"tablecanvas"+tableNum);
			var canvas = document.createElement("canvas");
			canvas.setAttribute("class", "canvasOfTable");
			canvas.setAttribute("id", "ToCanvas"+(x+1)+" "+(y+1));
			cellMonitor(canvas,tdNode);
            // tdNode.innerHTML = "单元格" + (x + 1) + "-" + (y + 1);
        }
    }
    //tableNode.style.background = "grey";
    
    document.body.appendChild(tableNode);  
    tableNode.style.position="absolute";
    tableNode.style.left= "10px";
    tableNode.style.top = 70+positionY+"px";
    tableNode.style.zIndex = 10;
    //tableNode.style.background = "grey"
    ViewStyle.innerHTML+="<p>";
    midOfView();
}


function cellMonitor(elementCanvas,containerCanvas)
{
	var doDraw1 = Sketch.create({
		container: containerCanvas,
		element:elementCanvas,
		autoclear: false,
		retina: 'auto',
		setup: function() { 
			//console.log("表格中container " + containerCanvas.id)
		},
		update: function() {
			radius = 2 + abs( sin( this.millis * 0.003 ) * 2 );
			//console.log(container.clientHeight||container.offsetHeight);
		},
	
		keydown: function() {
			if ( this.keys.C ) this.clear();//清除页面
		},
		touchstart:function(){
			console.log(elementCanvas.id);
			startDraw=1;
			isTable = true;
			canvasChosen = elementCanvas;
			//pointCoodi.push({x:this.mouse.ox,y:this.mouse.oy});
		},
		touchmove: function() {
			if(startDraw){
				for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
				touch = this.touches[i];
				//console.log(touch);
				this.lineCap = 'round';
				this.lineJoin = 'round';
				this.fillStyle = this.strokeStyle = COLOURS;
				this.lineWidth = radius;
				this.beginPath();
				this.moveTo( touch.ox, touch.oy );
				this.lineTo( touch.x, touch.y );
				this.stroke();
				pointCoodi.push({x:touch.ox,y:touch.oy});
				}
			}   
		},
		touchend:function(){
			startDraw=0;
			var mouseX = this.mouse.ox;
			var mouseY = this.mouse.oy;
			pointCoodi.push({x:this.mouse.ox,y:this.mouse.oy});
			if(pointCoodi.length!=0)
				postCoodi();
			
			if(signal==0){
				signal=1;//互斥信号量保证同时只有一个函数在等待执行
				var handler=setTimeout(function(){
					signal=0;				
					cellContext(id, specialCharLabel[10]);
					clearTimeout(handler);
					if(writeType == 1){
						getRecogResult();
					}else{
						getRecogResultElse();
					}
				},getTime);//test，延迟1.5秒进行笔迹路径post和识别执行
			}
		}
	
	});
}
$(function(){
    $(".cw-switch").click(function() {
        if($(this).hasClass('cw-switch-checked')){
            $("#word").text('En');
            writeType = 0;
            getTime = 1000;
            console.log(writeType);
        }else{
            $("#word").text('汉');
            writeType = 1;
            getTime = 4000;
            console.log(writeType);
        }
        $(this).toggleClass('cw-switch-checked');
        
    });
});

function clearCellInner(canvasChosen){
    var cxt=canvasChosen.getContext("2d");  
    cxt.clearRect(0,0,canvasChosen.width,canvasChosen.height);  
    
    var canvasId = canvasChosen.id;
	var CellId = "Cell"+canvasId;
	var chosenCell = document.getElementById(CellId);
	chosenCell.innerHTML = "";	
	
//	var cxt=canvasChosen.getContext("2d");  
//	var imgData = cxt.getImageData(0,0,canvasChosen.width,canvasChosen.height);
//	console.log(canvasChosen.width);
//	canvasChosen.width = canvasChosen.width+50;
//	cxt.width = canvasChosen.width+50;
//	canvasChosen.height = canvasChosen.height;
//    cxt.putImageData(imgData,0,0);	
}

function deleteMark()
{
	
	// 清空字迹
	var charLength = charlist.length;
	// console.log("charLength: " + charLength);
	// console.log(charlist[charLength - 1]);
	var xlist = [];
	var ylist = [];
	for (var i=0; i< charlist[charLength - 1].length; i++) // 笔画数组
	{
		// console.log("笔画数组 " + charlist[charLength - 1][i]);
		for (j=0; j< charlist[charLength - 1][i].length; j++) // 点数组
		{
			// console.log("点数组 " + charlist[charLength - 1][i][j]);
			xlist.push(charlist[charLength - 1][i][j].x);
			ylist.push(charlist[charLength - 1][i][j].y);
		}
	}
	console.log("xlist ", xlist);
	console.log("ylist ", ylist);
	var xleft, xright, ytop, ybottom;
	xleft = Math.min(...xlist);
	xright = Math.max(...xlist);
	ytop = Math.min(...ylist);
	ybottom = Math.max(...ylist);
	console.log("xleft ", xleft);
	console.log("xright ", xright);
	console.log("ytop ", ytop);
	console.log("ybottom", ybottom);

	ctx.clearRect(xleft-3, ytop-3, xright - xleft  + 10, ybottom - ytop + 10);

	// 弹出字符笔迹数组
	charlist.pop();
	// result.pop();
}