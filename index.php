<?php
// +----------------------------------------------------------------------
// | SUL1SS
// +----------------------------------------------------------------------
// | Copyright (c) 2019.
// +----------------------------------------------------------------------
// | Author: SUL1SS <617746883@.com>
// +----------------------------------------------------------------------
// [ 应用入口文件 ]

// 检测PHP环境
if(version_compare(PHP_VERSION,'5.5.0','<'))  die('require PHP > 5.5.0 !');
// 定义应用目录
define('APP_PATH', __DIR__ . '/app/');
// 加载引导文件
require __DIR__ . '/framework/start.php';