
// 进入就加载
window.onload = function (){
    
    // 获取登录状态
    getLoginStatus();
    
    // 获取页码
    var pageNum = queryURLParams(window.location.href).p;
    
    if(pageNum !== 'undefined'){
        
        // 获取当前页码的中间页数据列表
        getZjyList(pageNum);
    }else{
        
        // 获取不到页码就获取首页
        getZjyList();
    }
}

// 获取登录状态
function getLoginStatus(){
    
    // 获取
    $.ajax({
        type: "POST",
        url: "../login/getLoginStatus.php",
        success: function(res){
            
            // 成功
            if(res.code == 200){
                
                // 已登录
                // 账号信息
                var $accountInfo_HTML = $(
                    '<span class="user_name">'+res.user_name+'</span>' +
                    '<span onclick="exitLogin();">退出</span>'
                );
                $("#accountInfo").html($accountInfo_HTML);
                
                // 初始化
                initialize_Login('login',res.user_admin)
            }else{
                
                // 未登录
                $('#accountInfo').html('<a href="../login/">登录账号</a>');
                
                // 初始化
                initialize_Login('unlogin');
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 登录后的一些初始化
function initialize_Login(loginStatus,adminStatus){
    
    if(loginStatus == 'login'){
        
        // 显示创建按钮
        $('#button-view').css('display','block');
        
        // 判断管理员权限
        if(adminStatus == 1){
            
            // 显示开放API按钮
            $('#openApi').html('<a href="./openApi.html"><button class="tint-btn" style="margin-left: 5px;">开放API</button></a>');
        }
        
    }else{
        
        // 隐藏创建按钮
        $('#button-view').css('display','none');
        $('#openApi').css('display','none');
    }
}

// 获取中间页列表
function getZjyList(pageNum) {
    
    // 判断是否有pageNum参数传过来
    if(!pageNum){
        
        // 如果没有就默认请求第1页
        reqUrl = "./getZjyList.php";
    }else{
        
        // 如果有就请求pageNum的那一页
        reqUrl = "./getZjyList.php?p="+pageNum
    }
    
    // AJAX获取
    $.ajax({
        type: "POST",
        url: reqUrl,
        success: function(res){
            
            // 初始化
            initialize_getZjyList();
            
            // 表头
            var $thead_HTML = $(
                '<tr>' +
                '   <th>序号</th>' +
                '   <th>标题</th>' +
                '   <th>淘口令</th>' +
                '   <th>原价</th>' +
                '   <th>券后价</th>' +
                '   <th>创建时间</th>' +
                '   <th>访问次数</th>' +
                '   <th>复制次数</th>' +
                '   <th style="text-align: right;">操作</th>' +
                '</tr>'
            );
            $("#right .data-list thead").html($thead_HTML);
            
            // 状态码为200代表有数据
            if(res.code == 200){
                
                // 如果有数据
                // 遍历数据
                for (var i=0; i<res.zjyList.length; i++) {
                    
                    // 数据判断并处理
                    // （1）序号
                    var xuhao = i+1;
                    
                    // （2）标题
                    var zjy_title = res.zjyList[i].zjy_short_title;
                    
                    // （3）淘口令
                    var zjy_tkl = res.zjyList[i].zjy_tkl;
                    
                    // （4）原价
                    var zjy_original_cost = res.zjyList[i].zjy_original_cost;
                    
                    // （5）券后价
                    var zjy_discounted_price = res.zjyList[i].zjy_discounted_price;
                    
                    // （6）创建时间
                    var zjy_create_time = res.zjyList[i].zjy_create_time;
                    
                    // （7）访问次数
                    var zjy_pv = res.zjyList[i].zjy_pv;
                    
                    // （8）复制次数
                    var zjy_copyNum = res.zjyList[i].zjy_copyNum;
                    
                    // （9）ID
                    var zjy_id = res.zjyList[i].zjy_id;
                    
                    // 列表
                    var $tbody_HTML = $(
                        '<tr>' +
                        '   <td>'+xuhao+'</td>' +
                        '   <td>'+zjy_title+'</td>' +
                        '   <td>'+zjy_tkl+'</td>' +
                        '   <td>'+zjy_original_cost+'</td>' +
                        '   <td>'+zjy_discounted_price+'</td>' +
                        '   <td>'+zjy_create_time+'</td>' +
                        '   <td>'+zjy_pv+'</td>' +
                        '   <td>'+zjy_copyNum+'</td>' +
                        '   <td class="dropdown-td">' +
                        '       <div class="dropdown">' +
                        '    	    <button type="button" class="dropdown-btn" data-toggle="dropdown">•••</button>' +
                        '           <div class="dropdown-menu">' +
                        '               <span class="dropdown-item" data-toggle="modal" data-target="#ShareZjyModal" onclick="shareZjy('+zjy_id+')">分享</span>' +
                        '               <span class="dropdown-item" data-toggle="modal" data-target="#EditZjyModal" onclick="getZjyInfo('+zjy_id+')">编辑</span>' +
                        '               <span class="dropdown-item" data-toggle="modal" data-target="#DelZjyModal" onclick="askDelZjy('+zjy_id+')">删除</span>' +
                        '           </div>' +
                        '       </div>' +
                        '   </td>' +
                        '</tr>'
                    );
                    $("#right .data-list tbody").append($tbody_HTML);
                }
                
                // 分页
                if(res.page == 1 && res.allpage == 1){
                    
                    // 当前页码=1 且 总页码>1
                    // 无需显示分页控件
                    $("#right .data-card .fenye").css("display","none");
                }else if(res.page == 1 && res.allpage > 1){
                    
                    // 当前页码=1 且 总页码>1
                    // 代表还有下一页
                    var $Fenye_HTML = $(
                    '<ul>' +
                    '   <li><button id="'+res.nextpage+'" onclick="getFenye(this);" title="下一页"><img src="../../static/img/nextPage.png" /></button></li>' +
                    '   <li><button id="'+res.allpage+'" onclick="getFenye(this);" title="最后一页"><img src="../../static/img/lastPage.png" /></button></li>' +
                    '</ul>'
                    );
                    $("#right .data-card .fenye").css("display","block");
                }else if(res.page == res.allpage){
                    
                    // 当前页码=总页码
                    // 代表这是最后一页
                    var $Fenye_HTML = $(
                    '<ul>' +
                    '   <li><button id="1" onclick="getFenye(this);" title="第一页"><img src="../../static/img/firstPage.png" /></button></li>' +
                    '   <li><button id="'+res.prepage+'" onclick="getFenye(this);" title="上一页"><img src="../../static/img/prevPage.png" /></button></li>' +
                    '</ul>'
                    );
                    $("#right .data-card .fenye").css("display","block");
                }else{
                    
                    var $Fenye_HTML = $(
                    '<ul>' +
                    '   <li><button id="1" onclick="getFenye(this);" title="第一页"><img src="../../static/img/firstPage.png" /></button></li>' +
                    '   <li><button id="'+res.prepage+'" onclick="getFenye(this);" title="上一页"><img src="../../static/img/prevPage.png" /></button></li>' +
                    '   <li><button id="'+res.nextpage+'" onclick="getFenye(this);" title="下一页"><img src="../../static/img/nextPage.png" /></button></li>' +
                    '   <li><button id="'+res.allpage+'" onclick="getFenye(this);" title="最后一页"><img src="../../static/img/lastPage.png" /></button></li>' +
                    '</ul>'
                    );
                    $("#right .data-card .fenye").css("display","block");
                }
                
                // 渲染分页控件
                $("#right .data-card .fenye").html($Fenye_HTML);
                
                // 设置URL
                if(res.page !== 1){
                    window.history.pushState('', '', '?p='+res.page+'&token='+creatPageToken(32));
                }
                
            }else{
                
                // 非200状态码
                if(res.code == 205){
                    
                    // 205状态码代表用户升级版本但未初始化
                    warningPage('<p>检测到你正在升级版本</p><button onclick="Upgrade();" class="default-btn" style="cursor:pointer;">'+res.msg+'</button>');
                    $('#button-view').html('');
                    $('#openApi').html('');
                }else{
                    
                    warningPage(res.msg);
                }
                
                // 如果是未登录
                // 3秒后自动跳转到登录页面
                if(res.code == 201){
                    redirectLoginPage(3000);
                }
            }
            
      },
      error: function(){
        
        // 发生错误
        errorPage('服务器发生错误！')
      },
    });
}

// 跳转到登录界面
function redirectLoginPage(second){
    
    // second毫秒后跳转
    setTimeout('location.href="../login/";', second);
}

// 分页
function getFenye(e){
    
    // 页码
    var pageNum = e.id;
    
    // 获取该页列表
    getZjyList(pageNum);
}

// 升级
function Upgrade(){
    
    $.ajax({
        type: "POST",
        url: "./Upgrade.php",
        success: function(res){
            
            // 成功
            if(res.code == 200){
                
                alert(res.msg);
                location.reload();
            }else{
                
                alert(res.msg);
            }
        },
        error: function() {
            
            // 服务器发生错误
            alert('服务器发生错误');
        }
    });
}

// 创建中间页
function createZjy(){
    
    $.ajax({
        type: "POST",
        url: "./createZjy.php",
        data: $('#createZjy').serialize(),
        success: function(res){
            
            // 成功
            if(res.code == 200){
                
                // 操作反馈（操作成功）
                showSuccessResult(res.msg)
                
                // 隐藏modal
                setTimeout('hideModal("createZjyModal")', 500);
                
                // 重新加载中间页列表
                setTimeout('getZjyList();', 500);
            }else{
                
                // 操作反馈（操作失败）
                showErrorResult(res.msg)
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 编辑中间页
function editZjy(){
    
    $.ajax({
        type: "POST",
        url: "./editZjy.php",
        data: $('#editZjy').serialize(),
        success: function(res){
            
            // 成功
            if(res.code == 200){
                
                // 操作反馈（操作成功）
                showSuccessResult(res.msg)
                
                // 隐藏EditZjyModal
                setTimeout('hideModal("EditZjyModal")', 500);
                
                // 重新加载中间页列表
                setTimeout('getZjyList();', 500);
            }else{
                
                // 操作反馈（操作失败）
                showErrorResult(res.msg)
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 询问是否要删除中间页
function askDelZjy(zjyid){
    
    // 将群id添加到button的delZjy函数用于传参执行删除
    $('#DelZjyModal .modal-footer').html('<button type="button" class="default-btn" onclick="delZjy('+zjyid+');">确定删除</button>')
}

// 删除中间页
function delZjy(zjyid){
    
    // 删除
    $.ajax({
        type: "GET",
        url: "./delZjy.php?zjyid="+zjyid,
        success: function(res){
            
            // 成功
            if(res.code == 200){
                
                // 操作反馈（操作成功）
                // 隐藏DelZjyModal
                hideModal("DelZjyModal");
                
                // 重新加载中间页列表
                setTimeout('getZjyList()', 500);
            }else{
                
                // 操作反馈（操作失败）
                showErrorResult(res.msg)
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 获取中间页详情
function getZjyInfo(zjy_id){
    
    // 根据zjy_id获取详情
    $.ajax({
        type: "GET",
        url: "./getZjyInfo.php?zjy_id="+zjy_id,
        success: function(res){

            if(res.code == 200){
                
                // （1）长标题
                $('#zjy_long_title_edit').val(res.zjyInfo.zjy_long_title);
                
                // 获取域名列表
                getDomainNameList('edit');
                
                // （2）获取当前设置的域名
                $("#zjy_rkym_edit").append('<option value="'+res.zjyInfo.zjy_rkym+'">'+res.zjyInfo.zjy_rkym+'</option>');
                $("#zjy_ldym_edit").append('<option value="'+res.zjyInfo.zjy_ldym+'">'+res.zjyInfo.zjy_ldym+'</option>');
                $("#zjy_dlym_edit").append('<option value="'+res.zjyInfo.zjy_dlym+'">'+res.zjyInfo.zjy_dlym+'</option>');
                
                // （3）短标题
                $('#zjy_short_title_edit').val(res.zjyInfo.zjy_short_title);
                
                // （4）淘口令
                $('#zjy_tkl_edit').val(res.zjyInfo.zjy_tkl);
                
                // （5）原价
                $('#zjy_original_cost_edit').val(res.zjyInfo.zjy_original_cost);
                
                // （6）券后价
                $('#zjy_discounted_price_edit').val(res.zjyInfo.zjy_discounted_price);
                
                // （7）商品主图
                $('#zjy_goods_img_edit').val(res.zjyInfo.zjy_goods_img);
                
                // （8）商品链接
                $('#zjy_goods_link_edit').val(res.zjyInfo.zjy_goods_link);
                
                // （8）zjy_id
                $('#zjy_id_edit').val(zjy_id);
                            
            }else{
                
                // 操作反馈（操作失败）
                showErrorResult(res.msg)
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 获取中间页配置
function getZjyConfig(){
    
    hideResult();
    
    $.ajax({
        type: "GET",
        url: "./getZjyConfig.php",
        success: function(res){

            if(res.code == 200){
                
                // （1）zjy_config_appkey
                $('#zjy_config_appkey').val(res.zjyConfigInfo.zjy_config_appkey);
                
                // （2）zjy_config_sid
                $('#zjy_config_sid').val(res.zjyConfigInfo.zjy_config_sid);
                
                // （3）zjy_config_pid
                $('#zjy_config_pid').val(res.zjyConfigInfo.zjy_config_pid);
                
                // （4）zjy_config_tbname
                $('#zjy_config_tbname').val(res.zjyConfigInfo.zjy_config_tbname);
                            
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 提交配置
function configZjy(){
    
    $.ajax({
        type: "POST",
        url: "./configZjy.php",
        data: $('#configZjy').serialize(),
        success: function(res){
            
            // 成功
            if(res.code == 200){
                
                // 操作反馈（操作成功）
                showSuccessResult(res.msg)
                
                // 隐藏modal
                setTimeout('hideModal("configZjyModal")', 500);

            }else{
                
                // 操作反馈（操作失败）
                showErrorResult(res.msg)
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 获取域名列表
function getDomainNameList(module){
    
    // 判断是作用于哪个模块的
    if(module == 'create'){
        
        // 初始化
        initialize_getDomainNameList(module);
        
        // 获取
        $.ajax({
            type: "GET",
            url: "./getDomainNameList.php",
            success: function(res){
                
                // 成功
                if(res.code == 200){
                    
                    // 操作反馈（操作成功）
                    // 判断rkymList是否有域名
                    if(res.rkymList.length>0){;
                        for (var i=0; i<res.rkymList.length; i++) {
                            $("#zjy_rkym").append('<option value="'+res.rkymList[i].domain+'">'+res.rkymList[i].domain+'</option>');
                        }
                    }else{
                        $("#zjy_rkym").append('<option value="">暂无入口域名</option>');
                    }
                    // 判断ldymList是否有域名
                    if(res.ldymList.length>0){
                        for (var i=0; i<res.ldymList.length; i++) {
                            $("#zjy_ldym").append('<option value="'+res.ldymList[i].domain+'">'+res.ldymList[i].domain+'</option>');
                        }
                    }else{
                        $("#zjy_zzym").append('<option value="">暂无落地域名</option>');
                    }
                    // 判断dlymList是否有域名
                    if(res.dlymList.length>0){
                        for (var i=0; i<res.dlymList.length; i++) {
                            $("#zjy_dlym").append('<option value="'+res.dlymList[i].domain+'">'+res.dlymList[i].domain+'</option>');
                        }
                    }else{
                        $("#zjy_dlym").append('<option value="">暂无短链域名</option>');
                    }
                }else{
                    
                    // 操作反馈（操作失败）
                    showErrorResult(res.msg)
                }
            },
            error: function() {
                
                // 服务器发生错误
                showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
            }
        });
    }else if(module == 'edit'){
        
        // 初始化
        initialize_getDomainNameList(module);
        
        // 获取
        $.ajax({
            type: "GET",
            url: "./getDomainNameList.php",
            success: function(res){
                
                // 成功
                if(res.code == 200){
                    
                    // 操作反馈（操作成功）
                    // 判断rkymList是否有域名
                    if(res.rkymList.length>0){;
                        for (var i=0; i<res.rkymList.length; i++) {
                            $("#zjy_rkym_edit").append('<option value="'+res.rkymList[i].domain+'">'+res.rkymList[i].domain+'</option>');
                        }
                    }else{
                        $("#zjy_rkym_edit").append('<option value="">暂无入口域名</option>');
                    }
                    // 判断ldymList是否有域名
                    if(res.ldymList.length>0){
                        for (var i=0; i<res.ldymList.length; i++) {
                            $("#zjy_ldym_edit").append('<option value="'+res.ldymList[i].domain+'">'+res.ldymList[i].domain+'</option>');
                        }
                    }else{
                        $("#zjy_ldym_edit").append('<option value="">暂无落地域名</option>');
                    }
                    // 判断dlymList是否有域名
                    if(res.dlymList.length>0){
                        for (var i=0; i<res.dlymList.length; i++) {
                            $("#zjy_dlym_edit").append('<option value="'+res.dlymList[i].domain+'">'+res.dlymList[i].domain+'</option>');
                        }
                    }else{
                        $("#zjy_dlym_edit").append('<option value="">暂无短链域名</option>');
                    }
                }else{
                    
                    // 操作反馈（操作失败）
                    showErrorResult(res.msg)
                }
            },
            error: function() {
                
                // 服务器发生错误
                showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
            }
        });
    }
}

// 分享中间页
function shareZjy(zjy_id){
    
    // 初始化二维码
    $("#shareQrcode").html('');

    // 分享
    $.ajax({
        type: "GET",
        url: "./shareZjy.php?zjy_id="+zjy_id,
        success: function(res){
            
            // 成功
            if(res.code == 200){
                
                // 长链接
                $("#longUrl").text(res.longUrl);
                
                // 短链接
                $("#shortUrl").text(res.shortUrl);
                
                // 二维码
                new QRCode(document.getElementById("shareQrcode"), res.longUrl);
            }else{
                
                // 操作反馈（操作失败）
                showErrorResult(res.msg)
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 注销登录
function exitLogin(){
    
    $.ajax({
        type: "POST",
        url: "../login/exitLogin.php",
        success: function(res){
            
            // 成功
            if(res.code == 200){
                
                // 刷新
                location.reload();
            }
        },
        error: function() {
            
            // 服务器发生错误
            showErrorResult('服务器发生错误！可按F12打开开发者工具点击Network或网络查看返回信息进行排查！')
        }
    });
}

// 生成随机token
function creatPageToken(length) {
    var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) 
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}

// 隐藏Modal（传入节点id决定隐藏哪个Modal）
function hideModal(modal_Id){
    $('#'+modal_Id+'').modal('hide');
}
// 显示Modal（传入节点id决定隐藏哪个Modal）
function showModal(modal_Id){
    $('#'+modal_Id+'').modal('show');
}

// 错误页面
function errorPage(text){
    $("#right .data-list").css('display','none');
    $("#right .data-card .loading").html('<img src="../../static/img/errorIcon.png"/><br/><p>'+text+'</p>');
    $("#right .data-card .loading").css('display','block');
}

// 提醒页面
function warningPage(text){
    $("#right .data-list").css('display','none');
    $("#right .data-card .loading").html('<img src="../../static/img/warningIcon.png"/><br/><p>'+text+'</p>');
    $("#right .data-card .loading").css('display','block');
}

// 初始化（getZjyList获取中间页列表）
function initialize_getZjyList(){
    $("#right .data-list").css('display','block');
    $("#right .data-card .loading").css('display','none');
    $("#right .data-list tbody").empty('');
}

// 初始化（获取域名列表）
function initialize_getDomainNameList(module){
    
    if(module == 'create'){
        
        // 将所有值清空
        $("#taokouling").val('');
        $("#zjy_short_title").val('');
        $("#zjy_long_title").val('');
        $("#zjy_tkl").val('');
        $("#zjy_original_cost").val('');
        $("#zjy_discounted_price").val('');
        $("#zjy_goods_img").val('');
        $("#zjy_goods_link").val('');
        $("#selectGoodsImgtext").text('上传图片');
        $("#zjy_rkym").empty();
        $("#zjy_ldym").empty();
        $("#zjy_dlym").empty();
        hideResult();
        
        // 设置默认值
        $("#zjy_rkym").append('<option value="">选择入口域名</option>');
        $("#zjy_ldym").append('<option value="">选择落地域名</option>');
        $("#zjy_dlym").append('<option value="">选择短链域名</option>');
        
    }else if(module == 'edit'){
        
        // 将所有值清空
        $("#zjy_rkym_edit").empty();
        $("#zjy_ldym_edit").empty();
        $("#zjy_dlym_edit").empty();
        hideResult();
    }

}

// 打开操作反馈（操作成功）
function showSuccessResult(content){
    $('#app .result').html('<div class="success">'+content+'</div>');
    $('#app .result .success').css('display','block');
    setTimeout('hideResult()', 2500); // 2.5秒后自动关闭
}

// 打开操作反馈（操作失败）
function showErrorResult(content){
    $('#app .result').html('<div class="error">'+content+'</div>');
    $('#app .result .error').css('display','block');
    setTimeout('hideResult()', 2500); // 2.5秒后自动关闭
}

// 关闭操作反馈
function hideResult(){
    $("#app .result .success").css("display","none");
    $("#app .result .error").css("display","none");
    $("#app .result .success").text('');
    $("#app .result .error").text('');
}

// 获取URL参数
function queryURLParams(url) {
    var pattern = /(\w+)=(\w+)/ig;
    var parames = {};
    url.replace(pattern, ($, $1, $2) => {
        parames[$1] = $2;
    });
    return parames;
}