(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init:function (path) {
            this.path = path;
        },
        times:[],
        lyrics:[],
        index: -1,
        currentIndex: function(currentTime){
            if(currentTime >= this.times[0]){
                this.index++;
                this.times.shift();//删除数组最前面的一个元素
            }

            return this.index;
        },
        loadLyric:function (callBack) {
            var $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success:function (data) {
                    $this.parseLyric(data);
                    callBack();
                },
                error:function (e) {
                    console.log(e);
                }
            })
        },
        parseLyric: function (data) {
            $this = this;
            var array = data.split("\n");
            var timeReg = /\[(\d*:\d*\.\d*)\]/;
            //遍历每一行以取出歌词
            $.each(array, function (index, ele) {
                //处理歌词
                var lrc = ele.split("]")[1];
                if(lrc.length <= 1){
                    return true;
                }else {
                    $this.lyrics.push(lrc);
                }

                var res = timeReg.exec(ele);
                if(res == null){
                    return true;
                }
                var timeStr = res[1];
                var res2 = timeStr.split(":");
                var min = parseInt(res2[0]);
                var sec = parseFloat(res2[1]);
                var time = parseFloat(Number(min+sec).toFixed(2));
                $this.times.push(time);
            })
        }
    }

    Lyric.prototype.init.prototype = Lyric.prototype;
        window.Lyric = Lyric;

})(window);