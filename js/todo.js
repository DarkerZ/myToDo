/**
 * Created by Johney on 2017/4/14.
 */

//提取
var $add_task = $(".add-task");
var $mainText = $(".add-task input");
var $task_list =$(".task-list");
var $mask = $(".task-detail-mask");
var $task_delete = $(".task-delete");
var $delete_yes = $(".task-delete .yes");
var $delete_no = $(".task-delete .no");
var $task_detail = $(".task-detail");
var $close = $task_detail.find(".close");
var $content = $task_detail.find(".content");
var $input_item = $task_detail.find(".input-item textarea");
var $update = $task_detail.find(".input-item button");
var $datetime = $task_detail.find(".datetime");
var $Delete;
var $Detail;


var task_arr = [];//把值存在对象里面 再把对象push到数组里面 再把数组存到浏览器里面
var off;//删除开关


init();//初始化
//初始化
function init(){
    renew_data();
    submit();
    warn()();
}

//创建对象
function createObj(newTask){
    task_arr.push(newTask);
    store.set("abc",task_arr);
}

//输入添加
function add(data,index,pend){
    var $li = '<li class="task-item" data-index="'+index+'">'+
                '<input type="checkbox" class="complete" '+(data.complete ? "checked" : "")+'>'+
                '<span class="task-content">'+data.content+'</span>'+
                '<div class="fr">'+
                '<span class="action delete">删除</span>'+
                '<span class="action detail">详细</span>'+
                '</div>'+
                '</li>';
    if(pend=='prepend'){
        $task_list.prepend($li);
    }else if(pend=='append'){
        $task_list.append($li);
    }


}

//点击提交
function submit(){
    $add_task.on("submit",function(ev){
        ev.preventDefault();//阻止默认事件
        if(!$mainText.val()){
           return;
        }else{
            var newTask = {};
            newTask.content = $mainText.val();
            $mainText.val("");
            createObj(newTask);
            // add($mainText.val());
            renew_data();
        }
    })
}

/*-------------------------------------删除功能----------------------------------------*/

//删除提醒
function Delete(index){
    if(off){
        deleteObj(index);
        renew_data();
    }
    $task_delete.hide();
    $mask.hide();

}

//删除功能
function delFun(index){
        $task_delete.fadeIn(100);
        $mask.fadeIn(300);
        // console.log($(this).parent().parent().index());
        $delete_yes.click(function(){
            off = true;
            Delete(index);
            $delete_yes.unbind("click");
        });
        $delete_no.click(function(){
            off = false;
            $task_delete.fadeOut(100);
            $mask.fadeOut(300);
            $delete_yes.unbind("click");
        });
}

//删除事件
function delEvent(){
    $Delete.on("click",function(){
        var index = $(this).parent().parent().data("index");
        delFun(index);
    });
}


//删除对象
function deleteObj(index){
    task_arr.splice(index,1);
    store.set("abc",task_arr);
}

//刷新数据
function renew_data(){
    task_arr = store.get("abc") || [];
    $task_list.empty();
    var is_complete = [];
    for(var i=0;i<task_arr.length;i++){
        if(task_arr[i].complete){
            is_complete[i]=task_arr[i];
        }else{
            add(task_arr[i],i,"prepend");
        }
    }
    for(var j=0;j<is_complete.length;j++){
        if(is_complete[j]){
            add(is_complete[j],j,"append");
            $('.task-list .task-item[data-index='+j+']').addClass('cur');
        }
    }

    $Delete = $(".action.delete");
    $Detail = $(".action.detail");
    delEvent();
    detailEvent();
    select();
}

/*---------------------------------详细功能--------------------------------*/
//详细事件
function detailEvent(){
    $Detail.on("click",function(){
        var index = $(this).parent().parent().data("index");
        detailFun(index);
    })
    datetimepicker();
}

//详细功能
function detailFun(index){
  $task_detail.slideDown(100);
    $mask.fadeIn(300);
    reFlash(index);
    $content.bind("dblclick",function(){//双击标题编辑
        var $titleInput = $task_detail.find(".titleInput");
        $(this).hide();
        $titleInput.show()
            .val($(this).text())
            .focus()
            .on("blur",function(){
                $(this).hide();
                $content.show();
                if(!$(this).val()){
                    return;
                }else{
                    $content.text($(this).val());
                }
            });
        });

    $update.bind("click",function(){//点击更新
        var $task_content =  $(".task-item").filter("[data-index="+index+"]").find(".task-content");
        var newObj = {};
        newObj.content = $content.text();
        newObj.detailCont = $input_item.val();
        newObj.date = $datetime.val();
        up_data(index,newObj);
        $task_content.text(task_arr[index].content);
        $task_detail.fadeOut(100);
        $mask.fadeOut(300);
        $update.unbind("click");
    });
    $close.on("click",function(){//点击X关闭
        $task_detail.fadeOut(100);
        $mask.fadeOut(300);
        $update.unbind("click");
    });
    $mask.bind("click",function(){//点击外面关闭
        $task_detail.fadeOut(100);
        $(this).fadeOut(300);
        $update.unbind("click");
        $mask.unbind("click");
    });
}

//刷新数据
function reFlash(index){
    $content.text(task_arr[index].content);
    $input_item.val(task_arr[index].detailCont);
    $datetime.val(task_arr[index].date);
}

//更新数据
function up_data(index,newObj){
    task_arr[index] = $.extend({},task_arr[index],newObj);
    store.set("abc",task_arr);
}

//选中事件
function select(){
    var $complete = $(".task-list .complete");

    $complete.bind('click',function(){
        var index = $(this).parent().data("index");
        var newObj = {};
        if(task_arr[index].complete){
            newObj.complete = false;
        }else{
            newObj.complete = true;
        }
        up_data(index,newObj);
        renew_data();
        $(this).unbind('click');
    })
}

//jquery.datetimepicker插件配置
function datetimepicker(){
    $.datetimepicker.setLocale('ch');//设置中文
    $('.datetimepicker').datetimepicker({
       theme:'dark'
    });
}

/*--------------------------------到点提醒-------------------------------*/
//到点提醒
function warn(){
    var timer = null;
    return function(){
        timer = setInterval(function(){
            var current = new Date().getTime();//获取当前时间
            for(var i=0;i<task_arr.length;i++){
                if(!task_arr[i].date || task_arr[i].complete || task_arr[i].off)continue;
                var endTime = (new Date(task_arr[i].date)).getTime();//获取结束时间
                //判断如果结束时间的毫秒数 - 当前时间的毫秒数 < 1 ？ 到点提醒 ： 继续循环
                if(endTime - current<1){
                    clearInterval(timer);
                    up_data(i,{off:true});
                    playMusic();//播放music
                    showMsg(task_arr[i].content);//弹出msg
                    break;
                }
            }
        },50)
    }
}

//播放music
function playMusic(){
    var music = document.getElementById("music");
    music.play();
}

//弹出msg
function showMsg(content){
    var $msg = $('.msg');
    var $msg_content = $msg.find(".msg-content");
    var $confirmed = $msg.find(".confirmed");
    $msg.slideDown(200);
    $msg_content.text(content);

    $confirmed.bind('click',function(){
        $msg.slideUp(200);
        warn()();
        $(this).unbind();
    })
}








