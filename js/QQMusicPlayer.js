
$(function () {
    //自定义滚动条
    $('.content_list').mCustomScrollbar();
    var $audio = $('audio');
    var player = new Player($audio);
    var voiceProgress;
    var voiceProgress;
    var lyric

    //初始化音乐列表
    getPlayerList();
    function getPlayerList(){
        //加载歌曲列表
        $.ajax({
                url:"./source/musiclist.json",
                dataType:"json",
                success:function (data) {
                    player.musiclist = data;

                    //遍历获取到的数据，创建每一条音乐
                    var $musicList = $(".content_list ul");
                    $.each(data,function (index,ele) {
                        var $item = createMusicItem(index,ele);
                        $musicList.append($item);
                    });

                    //初始化歌曲信息
                    initMusicInfo(data[0]);
                    
                    //初始化歌词信息
                    initMusicLyric(data[0]);
                },
                error:function (e) {
                    console.log(e);
                }
            }
        );
    }

    //初始化歌曲信息
    function initMusicInfo(music) {
        var $musicImage = $('.song_info_pic img');
        var $musicName = $('.song_info_name a');
        var $musicSinger = $('.song_info_singer a');
        var $musicAlbum = $('.song_info_album a');
        var $musicProgressName = $('.song_progress_name');
        var $musicProgressTime = $('.song_progress_time');
        var $musicBg = $('.mask_bg');

        $musicImage.attr('src', music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name +"/"+ music.singer);
        $musicProgressTime.text("00:00/"+ music.time);
        $musicBg.css("background","url('"+music.cover+"')");
    }
    
    //初始化歌词信息
    function initMusicLyric(music) {
       lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $('.song_lyric_container ul');
        lyric.loadLyric(function () {
            //创建歌词列表
            $.each(lyric.lyrics, function (index,ele) {
                var $item = $("<li>"+ele+"</li>");
                $lyricContainer.append($item);
            });
        });
    }

    //初始化进度条
    initProgress();
    function initProgress() {

        var $progressBar = $('.music_progress_bar');
        var $progressLine = $('.music_progress_line');
        var $progressDot = $('.music_progress_dot');
        progress = Progress($progressBar,$progressLine,$progressDot);

        progress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        progress.progressMove(function (value) {
            player.musicSeekTo(value);
        });

        var $voiceBar = $('.music_voice_bar');
        var $voiceLine = $('.music_voice_line');
        var $voiceDot = $('.music_voice_dot');
        voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);

        voiceProgress.progressClick(function (value) {

            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function (value) {

            var $voiceIcon = $('.music_voice_info a');

            if($($voiceIcon).attr('class').indexOf('music_voice_icon2') == 0){
                $('.music_voice_info a').removeClass('music_voice_icon2');
            $('.music_voice_info a').addClass('music_voice_icon');
            }
            player.musicVoiceSeekTo(value);
        });
    }


    //初始化事件监听
    initEvents();
    function initEvents(){

         //监听歌曲的移入移出
        $(".content_list").delegate(".list_music", "mouseenter", function () {

            // 显示子菜单
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".list_time a").stop().fadeIn(100);
            // 隐藏时长
            $(this).find(".list_time span").stop().fadeOut(100);
        });
        $(".content_list").delegate(".list_music", "mouseleave", function () {

            // 隐藏子菜单
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".list_time a").stop().fadeOut(100);
            // 显示时长
            $(this).find(".list_time span").stop().fadeIn(100);
        });

        //监听复选框事件
        $(".content_list").delegate(".list_check","click",function () {
            $(this).toggleClass('list_checked');
        });

        var $musicPlay = $('.music_play');

        //监听子菜单播放按钮
        $('.content_list').delegate('.list_menu_play','click',function () {

            var $item = $(this).parents('.list_music');

            $(this).toggleClass('list_menu_play2');
            $(this).parents('.list_music').siblings().find('.list_menu_play').removeClass('list_menu_play2');
            if($(this).attr('class').indexOf('list_menu_play2') != -1){
                //按钮处于播放状态
                $musicPlay.addClass('music_play2');
                $item.find('div').css('color','#fff');
                $item.siblings().find('div').css('color','rgba(255,255,255,.5)');
            }else{
                //按钮不处于播放状态
                $musicPlay.removeClass('music_play2');
                $item.find('div').css('color','rgba(255,255,255,0.5)');
            }
            //切换序号状态
            $item.find('.list_number').toggleClass('list_number2');
            $item.siblings().find('.list_number').removeClass('list_number2');

            //播放音乐
            player.playMusic($item.get(0).index,$item.get(0).music);

            //切换歌曲信息
            initMusicInfo($item.get(0).music);
            initMusicLyric($item.get(0).music);
        });

        //监听底部区域播放按钮的点击
        $musicPlay.click(function () {
            //判断是否播放过音乐
            if(player.currentIndex == -1){
                $('.list_music').eq(0).find('.list_menu_play').trigger('click');
            }else{
                $('.list_music').eq(player.currentIndex).find('.list_menu_play').trigger('click');
            }
        });

        //监听底部区域上一首按钮的点击
        $('.music_pre').click(function () {
            $('.list_music').eq(player.preIndex()).find('.list_menu_play').trigger('click');
        });

        //监听底部区域下一首按钮的点击
        $('.music_next').click(function () {
            $('.list_music').eq(player.nextIndex()).find('.list_menu_play').trigger('click');
        });

        //监听删除按钮
        $('.content_list').delegate('.list_menu_del','click',function () {

            var $item = $(this).parents('.list_music');
            $item.remove();
            player.changeMusic($item.get(0).index);

            if($item.get(0).index == player.currentIndex){
                $(".music_next").trigger('click');
            };

            //删除歌曲后重新排序
            $('.list_music').each(function (index, ele) {
                ele.index = index;
                $(ele).find('.list_number').text(index + 1);
            });
        });

        //监听播放进度
        player.musicTimeUpdate(function (currentTime, duration, timeStr) {
            //同步时间
            $('.music_progress_time').text(timeStr);

            //同步进度条
            var value = currentTime / duration * 100;
            progress.setProgress(value);

            //歌词同步
            var index = lyric.currentIndex(currentTime);
            var $item = $('.song_lyric li').eq(index);
            $item.addClass('cur');
            $item.siblings().removeClass('cur');
            if(index <= 2){
                return;
            }
            $('.song_lyric').css({
                marginTop: (-index+2)*30
            });
        });

        //监听声音按钮的点击
        $('.music_voice_icon').click(function () {
            //切换图标、声音
            $(this).toggleClass('music_voice_icon2');
            if($(this).attr('class').indexOf('music_voice_icon2') != -1){
                //变为静音
                player.musicVoiceSeekTo(0);
            }else {
                player.musicVoiceSeekTo(1);
            }
        });

    }


    //创建一条音乐
    function createMusicItem(index,music) {
        var $item = $("" +
            "<li class=\"list_music\">\n" +
            "<div class=\"list_check\"><i></i></div>\n" +
            "<div class=\"list_number\">"+(index + 1)+"</div>\n" +
            "<div class=\"list_name\">"+music.name+"" +
            "     <div class=\"list_menu\">\n" +
            "          <a href=\"javascript:;\" title=\"播放\" class='list_menu_play'></a>\n" +
            "          <a href=\"javascript:;\" title=\"添加\"></a>\n" +
            "          <a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "          <a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "     </div>\n" +
            "</div>\n" +
            "<div class=\"list_singer\">"+music.singer+"</div>\n" +
            "<div class=\"list_time\">\n" +
            "     <span>"+music.time+"</span>\n" +
            "     <a href=\"javascript:;\" title=\"删除\" class='list_menu_del'></a>\n" +
            "</div>\n" +
            "</li>");

        //将歌曲索引号、音乐与li元素绑定
        $item.get(0).index = index;
        $item.get(0).music = music;

        return $item;
    }


});
