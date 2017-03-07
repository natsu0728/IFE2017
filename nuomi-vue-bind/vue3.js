//用event函数进行封装 并把对象嵌套的对象属性也用同一个观察者观察
function Observer(data){
	this.data=data;
	this.walk(data);
	//用来存放回调
	this.cb={};
}

var p=Observer.prototype;

p.walk=function(obj){
	var val;
	for(var key in obj){
		if(obj.hasOwnProperty(key)){
			val=obj[key];
			if(typeof val==='object'){
				this.walk(val);
			}
		this.convert(key,val,obj);
		}
	}

}

p.convert=function(key,val,obj){
	var observer=this;
	Object.defineProperty(obj,key,{
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
				observer.walk(newVal);
			}
			var oldVal=val;
			val=newVal;
			//触发事件
			observer.eventOn(key,oldVal,newVal,obj);
		}
	})
}

p.eventOn=function(key,oldVal,newVal,obj){
	var rootProp;
	//key是嵌套属性
	if(obj!=this.data){
		for(var prop in this.data){
			if(obj===this.data[prop]){
				rootProp=prop;
				break;
			}else{
				rootProp=this.getRootObj(this.data[prop],obj,prop);
				if(rootProp){break;}
			}
		}
	}else{
	//key是根属性
		rootProp=key;
	}
	if(this.cb[rootProp]){
		this.cb[rootProp].forEach(function(sub){
			sub(oldVal,newVal);
		})
	}
}

//遍历找出obj的根属性
p.getRootObj=function(rootObj,obj,rootProp){
	var objSon;
	for(var prop in rootObj){
			objSon=rootObj[prop];
			if(objSon===obj){
				break;
			}else if(typeof objSon==='object'){
				/*console.log("之前是"+prop+"继续遍历"+rootProp);*/
				return this.getRootObj(objSon,obj,rootProp);
			}
	}
	return rootProp;
}

//挂上回调函数
p.$watch=function(prop,callback){
	if(!this.cb[prop]){
		this.cb[prop]=[];
	}
	this.cb[prop].push(callback);
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

app.$watch('user',function(oldVal,newVal){
		console.log('我的user属性变了，可能是姓名，可能是年龄，变为了'+newVal);
});
