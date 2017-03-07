//用event函数进行封装 
function Observer(data){
	this.data=data;
	this.parent=null;
	//用来存放回调
	this.cb={};
	this.children={};
	this.walk(data);	
}

var p=Observer.prototype;

p.walk=function(obj){
	var val;
	for(var key in obj){
		if(obj.hasOwnProperty(key)){
			val=obj[key];
			if(typeof val==='object'){
				var obs=new Observer(val);
				obs.parent=this;
				//用观察者记录嵌套属性的属性名
				obs.key=key;
				this.children[key]=obs;
			}
		this.convert(key,val);
		}
	}

}

p.convert=function(key,val){
	var observer=this;
	Object.defineProperty(this.data,key,{
		enumerable:true,
		configurable:true,
		get:function(){
			/*console.log('你访问了'+key);*/
			return val;
		},
		set:function(newVal){
			console.log('新的'+key+'='+newVal);
			if(newVal===val) return;
			//设置的新属性为对象时再调用观察者
			if(typeof newVal==='object'){
				var obs=new Observer(val);
				obs.parent=this;
				obs.key=key;
				observer.children[key]=obs;
			}
			val=newVal;
			//触发事件
			observer.eventOn(key,newVal);
		}
	})
}

p.eventOn=function(key,newVal){
	//执行挂在这个观察者上的回调
	if(this.cb[key]){
		this.cb[key].forEach(function(sub){
			sub(newVal);
		})
	}
	//如果触发的是嵌套属性 冒泡到上一级观察者
	if(this.parent){
		var prevObser=this.parent;
		var prevKey=this.key;
		prevObser.eventOn(prevKey,this.data);
	}
}


//挂上回调函数
p.$watch=function(prop,callback){
	//prop可能是一个“obj.prop.key”的形式，找到观察prop的observer，把回调函数挂上去
	var props=prop.split("."),
		len=props.length,
		obs=this;
	props.forEach(function(prop){
		if(len-- >1){
			obs=obs.children[prop];
		}
		
	});
	console.log("给"+obs.key+"挂上了回调函数");
	var key=props[props.length-1];
	if(!obs.cb[key]){
		obs.cb[key]=[];
	}
	obs.cb[key].push(callback);
}



//测试代码
var data={
	user:{
		name:{xin:"zhang",
			  ming:{chinese:"san",
			  		english:"three"
			  		},
			  nickname:{chinese:"asan",
			  		english:"a3"
			  		}
			},
		age:20
	},
	address:{
		city:"beijing"
	},
	id:123
}

var app=new Observer(data);

app.$watch('user.name.xin',function(newVal){
		console.log('我的xin属性变了，变为了'+newVal);
});

app.$watch('user.name',function(newVal){
		console.log('我的用户名属性变了，可能是姓，可能是名，变为了'+newVal.xin);
});