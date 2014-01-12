(function ($) {

    var allCounter = [];

    $.fn.countdown = function (method) {
        if (typeof method === 'object' || !method) {
            return pictimeJQinit.apply(this, arguments);
        } else {
            return pictimeFunctions.apply(this, arguments)
        }
    };
    $.fn.countdown.onEventBinding = function (id, eventname) {
        pictimeFunctions.apply(document.getElementById(id), Array.prototype.slice.call(arguments).splice(1, arguments.length - 1));
    };

    function pictimeJQinit(options) {

        options = $.extend(
            {
                deadline:null
            }, options);

        return this.each(function () {
            var $this = $(this);
            $this.data('countdown', options);
            var data = $this.data('countdown');
            pictimeFunctions.call(this, "initUC");
        });
    }




    /////////////////////////////////////////////////////////////////////////////////////

    function pictimeFunctions(method) {

        var $this = $(this);
        var data = $this.data('countdown') || {};
        var id = $this.attr("id");
        var mythis = this;

        if (data.methods == null) {
            data.methods = {
                initUC:initUC,
                updateTime:updateTime,
                destroy:destroy
            };
        }

        if (data.methods[method]) return data.methods[method].apply(this, Array.prototype.slice.call(arguments).splice(1, arguments.length - 1)); else throw "Method [" + method + "] was not found for photoStream, check data.methods";




        function initUC() {
            if(!data.deadline)
                data.deadline = new Date($this.data('time'));

            data.$seconds = $this.find('.seconds');
            data.$minutes = $this.find('.minutes');
            data.$hours = $this.find('.hours');
            data.$days = $this.find('.days');

            allCounter.push($this);
            startGlobalTimer();
            updateTime(new Date);
        }

        function updateTime(dateTime){
            var span = data.deadline - dateTime;
            if(span < 0)
                return;

            var seconds = span/1000;
            var minutes = seconds / 60;
            var hours = minutes / 60;
            var days = hours / 24;
            var secondsLeft = Math.floor(seconds) - Math.floor(minutes) * 60;
            if(data._seconds != secondsLeft) {
                data.$seconds.text(secondsLeft < 10 ? '0' + secondsLeft : secondsLeft);
                data._seconds = secondsLeft;
            }
            var minutesLeft = Math.floor(minutes) - Math.floor(hours) * 60;
            if(minutesLeft != data._minutes) {
                data.$minutes.text(minutesLeft);
                data._minutes = minutesLeft;
            }
            var hoursLeft = Math.floor(hours) - Math.floor(days)*24;
            if(data._hours != hoursLeft) {
                data.$hours.text(hoursLeft);
                data._hours = hoursLeft;
            }
            var daysLeft = Math.floor(days);
            if(data._days != daysLeft) {
                data.$days.text(daysLeft);
                data._days = daysLeft;
            }
        }

        function destroy(){
            $this.removeData('countdown');
        }


    }

    var globalInterval;

    function startGlobalTimer(){
        if(globalInterval)
            return;
        globalInterval = setInterval(function(){
            var date = new Date();
            $.each(allCounter,function(i,counter){
                counter.countdown('updateTime',date);
            });
        },900);
    }

})(jQuery);

