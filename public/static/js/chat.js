/*生产随机数(从minNum到maxNum)*/
function randomNum(minNum,maxNum) {
	switch(arguments.length){
		case 1:
			return parseInt(Math.random()*minNum+1,10);
		break;
		case 2:
	  		return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
	  	break;
	  	default:
	  		return 0;
	  	break;
	}
}

/*聊天记录框，滚动条置底*/
function message_scrollTop(){
	// $(".message").scrollTop($(".message")[0].scrollHeight);
	$(".message").scrollTop = $(".message").scrollHeight;
}

/*发送消息*/
function send(headSrc,str){
	var html="<div class='send'><div class='msg'><img src="+headSrc+" />"+"<p><i class='msg_input'></i>"+str+"</p></div></div>";
	upView(html);
}

/*接受消息*/
function show(headSrc,str){
	var html="<div class='show'><div class='msg'><img src="+headSrc+" />"+"<p><i class='msg_input'></i>"+str+"</p></div></div>";
	upView(html);
}

/*提醒消息*/
function notice(str){
	var html="<div class='notice'><div class='msg'>"+"<i class='msg_input'></i>"+str+"</div></div>";
	upView(html);
}

/*更新视图*/
function upView(html){
	$('.message').append(html);
	// $('body').animate({scrollTop:$('.message').outerHeight()-window.innerHeight},200);
	$('.message').scrollTop = $('.message').scrollHeight;
}

ws = new WebSocket("ws://47.75.86.92:2000");
var uid = randomNum(1,99999);
var username_arr = ['周杰伦','张国荣','陈绮贞','华晨宇','李宗盛','许嵩','陈奕迅','王力宏','Taylor Swift','张学友','SUL1SS'];
var username = username_arr[randomNum(0,10)];
var avatar_arr = ['/public/static/images/touxiang.jpg','/public/static/images/timg.jpg','/public/static/images/timg1.jpg','/public/static/images/timg2.jpg','/public/static/images/timg3.jpg','/public/static/images/timg4.jpg','/public/static/images/timg5.jpg','/public/static/images/timg6.jpg','/public/static/images/timg7.jpg','/public/static/images/timg8.jpg','/public/static/images/timg9.jpg',];
var avatar = avatar_arr[randomNum(0,10)];

$(function(){
	$('.footer').on('keyup','input',function(){
		if ($(this).val().length>0) {
			$(this).next().css('background','#114F8E').prop('disabled',true);		
		} else {
			$(this).next().css('background','#ddd').prop('disabled',false);
		}
	})
	$('.footer p').click(function(){
		show(avatar,$(this).prev().val());
		var msg_obj = {"action_type":"commonmsg","uid":uid,"username":username,"avatar":avatar,"msg":$(this).prev().val()};
		var msg = JSON.stringify(msg_obj);
	    ws.send(msg);
	    $(this).prev().val('');
	})
});

/*监听回车键，发送消息*/
$(document).keyup(function(event){
	if(event.keyCode == 13){
		show(avatar,$('.footer input').val());
		var msg_obj = {"action_type":"commonmsg","uid":uid,"username":username,"avatar":avatar,"msg":$(this).prev().val()};
		var msg = JSON.stringify(msg_obj);
	    ws.send(msg);
	    $('.footer input').val('');
	}
});

// 连接时的回调
ws.onopen = function() {
	var msg_obj = {"action_type":"login","uid":uid,"username":username,"avatar":avatar};
	var msg = JSON.stringify(msg_obj);
    ws.send(msg);
};
// 收到消息时回调
ws.onmessage = function(e) {
	var str = e.data;
	var obj = JSON.parse(str); //由JSON字符串转换为JSON对象
	console.log(obj);
	if (obj.type == 'system') {
		notice(obj.data_arr);
	} else if (obj.type == 'commonmsg') {
		if (uid !== obj.data_arr.uid) {
			send(obj.data_arr.avatar,obj.data_arr.msg)
		}		
	} else if (obj.type == 'usercount') {
		$('.right').html('');
		$('.right').html('在线：' + obj.user_count);
	}
	
};