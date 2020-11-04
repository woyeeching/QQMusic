(function (window) {
    function Player($audio) {
        return new Player.prototype.init($audio);
    }
    Player.prototype = {
        constructor:Player,
        musiclist:[],
        init:function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        currentIndex:-1,
        playMusic: function(index, music){
            //判断是否为同一首音乐
            if(this.currentIndex == index){
                if(this.audio.paused){
                    this.audio.play();
                }else {
                    this.audio.pause();
                }
            }else {
                this.$audio.attr('src',music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },
        preIndex:function (){
            var index = this.currentIndex - 1;
            if(index < 0){
                index = this.musiclist.length - 1;
            }
            return index;
        },
        nextIndex:function () {
            var index = this.currentIndex + 1;
            if(index > this.musiclist.length - 1){
                index = 0;
            }
            return index
        },
        changeMusic: function (index) {
            this.musiclist.splice(index, 1);
            if(index < this.currentIndex){
                this.currentIndex = this.currentIndex - 1;
            }
        },
        musicTimeUpdate: function (callBack) {
            $this = this;
            this.$audio.on('timeupdate',function () {
                var duration = $this.audio.duration;
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatTime(currentTime, duration);
                callBack(currentTime,duration,timeStr);
            });
        },
        formatTime: function (currentTime, duration) {
            //总时长
            var endMin = parseInt(duration / 60);
            var endSec = parseInt(duration % 60);
            if (endMin < 10){
                endMin = '0'+endMin;
            }
            if (endSec < 10){
                endSec = '0'+endSec;
            }

            //当前时长
            var curMin = parseInt(currentTime / 60);
            var curSec = parseInt(currentTime % 60);
            if (curMin < 10){
                curMin = '0' + curMin;
            }
            if (curSec < 10){
                curSec = '0' + curSec;
            }
            return curMin+":"+ curSec+"/"+ endMin+":"+ endSec;
        },
        musicSeekTo: function (value) {
            if (isNaN(value)){
                return;
            }
            this.audio.currentTime = this.audio.duration * value;
        },
        musicVoiceSeekTo:function (value) {
            if (isNaN(value)){
                return;
            }
            if (value < 0 || value > 1){

            }
            this.audio.volume = value;
        }
    }
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);