<?php

    /**
     * 状态码说明
     * 200 成功
     * 201 未登录
     * 202 失败
     * 203 空值
     * 204 无结果
     */

	// 页面编码
	header("Content-type:application/json");
	
	// 判断登录状态
    session_start();
    if(isset($_SESSION["yinliubao"])){
        
        // 已登录
        // 接收参数
        $zm_id = trim($_GET['zm_id']);
        
        // 过滤参数
        if(empty($zm_id) || $zm_id == '' || $zm_id == null || !isset($zm_id)){
            
            // 非法请求
            $result = array(
			    'code' => 203,
                'msg' => '非法请求'
		    );
        }else{
            
            // 数据库配置
        	include '../Db.php';
        
        	// 实例化类
        	$db = new DB_API($config);
        
        	// 数据库huoma_qun_zima表
        	$huoma_qun_zima = $db->set_table('huoma_qun_zima');
        
        	// 执行查询（查询当前zm_id的详情）
        	$where_QunzmInfo = ['zm_id'=>$zm_id];
            $find_QunzmInfo = $huoma_qun_zima->find($where_QunzmInfo);
            
            // 返回数据
            if($find_QunzmInfo && $find_QunzmInfo > 0){
                
                // 有结果
                $result = array(
        		    'qunzmInfo' => $find_QunzmInfo,
        		    'code' => 200,
        		    'msg' => '获取成功'
    		    );
            }else{
                
                // 无结果
                $result = array(
        		    'code' => 204,
        		    'msg' => '获取失败'
    		    );
            }
        }
    	
    }else{
        
        // 未登录
        $result = array(
			'code' => 201,
            'msg' => '未登录'
		);
    }

	// 输出JSON
	echo json_encode($result,JSON_UNESCAPED_UNICODE);
	
?>