"use strict";
phantom.outputEncoding="gb2312";

var page = require('webpage').create(),
    system = require('system'),
    keyword,address,t,result;

if (system.args.length === 1) {
    console.log('Usage: task.js <some keyword>');
    phantom.exit();
} else {
  console.log("准备抓取...");
  keyword=system.args[1];
  address='http://www.baidu.com/s?wd='+keyword;
  t = Date.now();
  page.open(address,function(status){

    if(status=='fail'){
      t = Date.now() - t;
      result={code:0,msg:'抓取失败',word:keyword,time:t};
      console.log(JSON.stringify(result));
      phantom.exit();

    }else if(status=='success'/* && page.loadingProgress == 100*/){
      console.log("网页加载成功...");
      t = Date.now() - t;
      result={code:1,msg:'抓取成功',word:keyword,time:t};
  
      page.includeJs(
      //注入jQuery
        'http://cdn.bootcss.com/jquery/3.1.1/jquery.min.js',
          function() {
            var dataList=page.evaluate(function() {
            // jQuery is loaded, now manipulate the DOM
                  var data=[];
                  var $content=$("#content_left").children();
                  $content.each(function(){
                  var obj={},$t_l;
                  $t_l=$(this).find("h3 a");
                  obj.title=$t_l.html();
                  obj.link=$t_l.attr("href");
                  obj.info=$(this).find(".c-abstract").html();
                  obj.pic=$(this).find(".general_image_pic img").attr("src");
                  data.push(obj);
                  });
                  return data;
                });
            result.dataList=dataList;
            console.log("抓取数据如下:");
            console.log(JSON.stringify(result));
            phantom.exit();
          });          
        }       
  });
}