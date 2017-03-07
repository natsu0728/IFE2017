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
			console.log('你访问了'+key);
			return val;
		},
		set:function(newVal){
			console.log('新的'+key+'='+newVal);
			if(newVal===val) return;
			//设置的新属性为对象时再调用观察者
			if(typeof newVal==='object'){
				observer.walk(newVal);
			}
			val=newVal;
			//触发事件
			observer.eventOn(key,val);
		}
	})
}

p.eventOn=function(key,val){
	if(this.cb[key]){
		this.cb[key].forEach(function(sub){
			sub(val);
		})
	}
}

//目前还不能给嵌套的对象属性添加回调函数，prop必须是一级属性
p.$watch=function(prop,callback){
	if(!this.cb[prop]){
		this.cb[prop]=[];
	}
	this.cb[prop].push(callback);
}



//测试代码
var data={
	user:{
		name:"zhangsan",
		age:"24"
	},
	address:{
		city:"beijing"
	},
	id:123
}

var app=new Observer(data);

app.$watch('id',function(id){
		console.log('我的id变了，现在的id是'+id);
});