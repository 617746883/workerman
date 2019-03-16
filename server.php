<?php
use Workerman\Worker;
use Workerman\Lib\Timer;
require_once __DIR__ . '/vendor/Workerman/Autoloader.php';
// 心跳间隔55秒
define('HEARTBEAT_TIME', 55);
// 注意：这里与上个例子不同，使用的是websocket协议
$ws_worker = new Worker("websocket://0.0.0.0:2000");
// 启动1-4个进程对外提供服务
$ws_worker->count = 1;
// 在线人数
$user_count = 0;
// 在线用户列表
$users = array();
// 连接时的回调
$ws_worker->onConnect = function($connection) {
    global $ws_worker,$user_count;
    $user_count += 1;
    foreach ($ws_worker->connections as $conn) {
		$str_json = json_encode([
			'type' => 'usercount',
			'user_count' => $user_count
		]);
		$conn->send($str_json);
	}
};
// 断开时的回调
$ws_worker->onClose = function($connection)
{
    global $ws_worker,$user_count,$users;
    $user_count -= 1;
    // 删除当前用户
    foreach ($users as $key => $value) {
    	if($value['uid'] == $connection->uid) {
    		unset($users[$key]);
    	}
    }
    foreach ($ws_worker->connections as $conn) {
		$str_json = json_encode([
			'type' => 'usercount',
			'user_count' => $user_count,
			'users' => $users
		]);
		$conn->send($str_json);
	}
};

// 当收到客户端发来的数据后返回hello $data给客户端
$ws_worker->onMessage = function($connection, $data) {
	// 申明全局变量
	global $ws_worker,$user_count,$users;
	$connection->lastMessageTime = time();
	// 先转成数组，方便操作
	$data_arr = json_decode($data,true);
	// 设置这个连接的用户信息
	$connection->uid = $data_arr['uid'];
	$connection->username = $data_arr['username'];
	$connection->avatar = $data_arr['avatar'];
	// 判断消息类型，登陆操作执行
    if ($data_arr['action_type'] == 'login') {
    	$users[] = [
    		'uid' => $connection->uid,
    		'username' => $connection->username,
    		'avatar' => $connection->avatar
    	];
		$str = $data_arr['username'] . '上线了';
		// 遍历当前进程所有的客户端进程，发某某某进入了聊天室的消息
		foreach ($ws_worker->connections as $conn) {
			$conn->send(json_encode(array('type'=>'system','data_arr'=>$str,'users'=>$users)));
		}
	}
	if ($data_arr['action_type'] == 'commonmsg') {
		// 遍历当前进程所有的客户端进程，发某某某进入了聊天室的消息
		foreach ($ws_worker->connections as $conn) {
			if($connection->uid == $conn->uid) {
				$data_arr['is_my'] = 1;
			} else {
				$data_arr['is_my'] = 0;
			}
			$conn->send(json_encode(array('type'=>'commonmsg','data_arr'=>$data_arr)));
		}
	}
};

// 运行worker
Worker::runAll();