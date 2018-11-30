/**
 * 加载已有的模型名称及对应的texture数量
 */
var model_array
var texture_array
var model_seq
var texture_seq

//从model_master.json中加载1.模型的文件夹名称 2.对应的texture数量
$.ajax({
    type: "GET",
    url: "./live2d/model_master.json",
    data: "",
    async: false,
    dataType:"json",
    success: function(data){
        texture_array = data.textures;
        model_array = data.models;
    }
});


function renderTip(template, context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
    return template.replace(tokenReg, function (word, slash1, token, slash2) {
        if (slash1 || slash2) {
            return word.replace('\\', '');
        }
        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var i, length, variable;
        for (i = 0, length = variables.length; i < length; ++i) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) return '';
        }
        return currentObject;
    });
}

String.prototype.renderTip = function (context) {
    return renderTip(this, context);
};

/**
 * 键盘触发事件
 */
var re = /x/;
console.log(re);
re.toString = function () {
    showMessage('诶，你打开了控制台，是想要看看我的秘密吗？', 5000);
    return '';
};

$(document).on('copy', function () {
    showMessage('嗯？都复制了些什么呀，转载要记得加上出处哦~~', 5000);
});

/**
 * 按钮点击事件
 */

$('.waifu-tool .fui-home').click(function () {
    window.location = 'http://www.baidu.com';

});

$('.waifu-tool .fui-heart').click(function () {
    loadRandTexture();
});

$('.waifu-tool .fui-chat').click(function () {
    showHitokoto();
});

$('.waifu-tool .fui-user').click(function () {
    loadRandModel();
});

$('.waifu-tool .fui-eye').click(function switchNightMode() {
    var night = document.cookie.replace(/(?:(?:^|.*;\s*)night\s*\=\s*([^;]*).*$)|^.*$/, "$1") || '0';
    if (night == '0') {
        document.body.classList.add('night');
        document.cookie = "night=1;path=/"
        console.log('夜间模式开启');
    } else {
        document.body.classList.remove('night');
        document.cookie = "night=0;path=/"
        console.log('夜间模式关闭');
    }

});

$('.waifu-tool .fui-photo').click(function () {
    showMessage('截图保存到桌面了哟，是不是很可爱呢？', 5000, true);
    window.Live2D.captureName = 'Live2D.png';
    window.Live2D.captureFrame = true;
});

$('.waifu-tool .fui-cross').click(function () {
    sessionStorage.setItem('waifu-dsiplay', 'none');
    showMessage('愿你有一天能与重要的人重逢', 1000, true);
    window.setTimeout(function () {
        $('.waifu').hide();
    }, 1000);
});


/**
 * 加载message.json
 */
function initTips() {
    $.ajax({
        cache: true,
        url: `./live2d/message.json`,
        dataType: "json",
        success: function (result) {
            $.each(result.mouseover, function (index, tips) {
                $(tips.selector).mouseover(function () {
                    var text = tips.text;
                    if (Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1) - 1];
                    text = text.renderTip({text: $(this).text()});
                    showMessage(text, 3000);
                });
            });
            $.each(result.click, function (index, tips) {
                $(tips.selector).click(function () {
                    var text = tips.text;
                    if (Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1) - 1];
                    text = text.renderTip({text: $(this).text()});
                    showMessage(text, 3000);
                });
            });
            $.each(result.seasons, function (index, tips){
                var now = new Date();
                var after = tips.date.split('-')[0];
                var before = tips.date.split('-')[1] || after;

                if((after.split('/')[0] <= now.getMonth()+1 && now.getMonth()+1 <= before.split('/')[0]) &&
                    (after.split('/')[1] <= now.getDate() && now.getDate() <= before.split('/')[1])){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                    text = text.render({year: now.getFullYear()});
                    showMessage(text, 6000, true);
                }
            });
        }
    });
}

initTips();

(function () {
    var text;
    if (document.referrer !== '') {
        var referrer = document.createElement('a');
        referrer.href = document.referrer;
        text = '嗨！来自 <span style="color:#0099cc;">' + referrer.hostname + '</span> 的朋友！';
        var domain = referrer.hostname.split('.')[1];
        if (domain == 'baidu') {
            text = '嗨！ 来自 百度搜索 的朋友！<br>欢迎访问<span style="color:#0099cc;">「 ' + document.title.split(' - ')[0] + ' 」</span>';
        } else if (domain == 'so') {
            text = '嗨！ 来自 360搜索 的朋友！<br>欢迎访问<span style="color:#0099cc;">「 ' + document.title.split(' - ')[0] + ' 」</span>';
        } else if (domain == 'google') {
            text = 'hi！ 来自 谷歌搜索 的朋友！<br>欢迎访问<span style="color:#0099cc;">「 ' + document.title.split(' - ')[0] + ' 」</span>';
        }
    } else {
        if (window.location.href == 'www.google.com') { //主页URL判断，需要斜杠结尾
            var now = (new Date()).getHours();
            if (now > 23 || now <= 5) {
                text = '你是夜猫子吗？快去睡觉吧！良好的作息是成功的一半哟~';
            } else if (now > 5 && now <= 7) {
                text = '早上好！一日之计在于晨，美好的一天就要开始了';
            } else if (now > 7 && now <= 11) {
                text = '上午好！不要久坐，多起来走动走动哦！';
            } else if (now > 11 && now <= 14) {
                text = '中午啦，辛苦了一个上午，现在是午餐时间！';
            } else if (now > 14 && now <= 17) {
                text = '午后很容易犯困呢，今天的运动目标完成了吗？';
            } else if (now > 17 && now <= 19) {
                text = '傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~';
            } else if (now > 19 && now <= 21) {
                text = '晚上好，今天过得怎么样？';
            } else if (now > 21 && now <= 23) {
                text = '已经这么晚了呀，早点休息吧，晚安~';
            } else {
                text = '嗨~ 快来和我玩吧！';
            }
        } else {
            text = '欢迎阅读<span style="color:#0099cc;">「 ' + document.title.split(' - ')[0] + ' 」</span>';
        }
    }
    showMessage(text, 8000);
})();


/**
 * 一言api
 */
window.setInterval(showHitokoto, 30000);
function showHitokoto() {
    $.getJSON('https://v1.hitokoto.cn/', function (result) {
        showMessage(result.hitokoto, 5000);
    });
}

function showMessage(text, timeout) {
    if (Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1) - 1];
    $('.waifu-tips').stop();
    $('.waifu-tips').html(text).fadeTo(200, 1);
    if (timeout === null) timeout = 4000;
    hideMessage(timeout);
}
function hideMessage(timeout) {
    $('.waifu-tips').stop().css('opacity', 1);
    if (timeout === null) timeout = 4000;
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}

/**
 * 点击按钮加载随机texture
 */
function loadRandTexture(){
    if(texture_array[model_seq]<=1 || texture_array[model_seq]==undefined){
        showMessage('衣橱里只有这一套啦，将就着看吧~', 3000, true);
    }else {
        var random_texture_seq
        while (random_texture_seq == undefined || random_texture_seq == texture_seq) {
            random_texture_seq = Math.floor(Math.random() * texture_array[model_seq])
        }
        texture_seq = random_texture_seq
        loadlive2d("live2d", "./live2d/model/" + model_array[model_seq] + "/model" + texture_seq + ".json");
        showMessage('我的新衣服好看嘛', 3000, true);
    }
}

/**
 * 点击按钮顺序切换model
 */
function loadRandModel()
{
    if(model_array.length<=1){
        showMessage('大家都出去逛街了，今天只有我陪您哦~', 3000, true);
    }else {
        if(model_seq>=model_array.length-1){
            model_seq=0;
        }else{
            model_seq++;
        }
        texture_seq = Math.floor(Math.random() * texture_array[model_seq])
        loadlive2d("live2d", "./live2d/model/" + model_array[model_seq] + "/model" + texture_seq + ".json");
        console.log("加载完成，当前 model_seq = " + model_seq)
    }
}
/**
 * 初次进入，加载随机模型
 *
 */
$(function () {
    //加载随机模型
    model_seq = Math.floor(Math.random() * model_array.length)
    //加载随机贴图
    texture_seq=Math.floor(Math.random() * texture_array[model_seq])
    //加载live2d
    console.log("开始加载: "+ model_array[model_seq] + " 的 " + texture_seq+" 号模型")
    loadlive2d("live2d", "./live2d/model/" + model_array[model_seq] + "/model" + texture_seq + ".json");
})


