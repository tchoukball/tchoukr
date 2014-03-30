(function( $ ) {

    $.fn.tchoukr = function() {

        return this.each(function() {

            var view = this;
            $view = $(this)

            var fieldRatio = 5/3 ;
            var zoneRatio = 1/3 ;
            var paddingRatio = 1/10 ;

            var $blockComponent = $(this).addClass('tchoukr');
            var $field,$innerField,$zones ;

            function clickEvent(event){
                var data = event.data;
                console.log(event);
                data.x = (event.pageX-view.offsetLeft)/$view.width();
                data.y = (event.pageY-view.offsetTop)/$view.height();

                noticeListeners(data);

                return false;
            }

            function addEventsListeners(){
                $zones.on('click',{place:'zone',isGiven:true},clickEvent);
                $field.on('click',{place:'out',isGiven:true},clickEvent);
                $innerField.on('click',{place:'in'},clickEvent);
            }

            this.init = function(){
                $field = $('<div>').addClass("field");
                $innerField = $('<div>').addClass('inner-field');
                $field.append($innerField);

                $innerField.append($('<div>').addClass('zone zone-left'));
                $innerField.append($('<div>').addClass('zone zone-right'));
                $innerField.append($('<div>').addClass('middle'));

                $blockComponent.html($field);

                $zones = $('.zone',view);

                addEventsListeners();

                view.resize();

            };

            var listeners = [];
            this.addListener = function(callback){
                listeners.push(callback);
            }

            function noticeListeners(event){
                for(var i in listeners)
                    listeners[i](event);
            }

            function percent(perOne){
                return (perOne*100)+'%';
            }

            this.addMarker = function(position,dom){
                console.log(position);
                $field.append($(dom).addClass('marker').css({top:percent(position.y),left:percent(position.x)}));
            }

            this.removeMarkers = function(){
                $field.find('marker').remove();
            }

            this.resize = function(){
                $field.height($blockComponent.width()/fieldRatio);
                $field.css('padding',$field.height()*paddingRatio);

                var rZone = $innerField.height()*zoneRatio;

                $zones
                    .css({
                        'height':rZone,
                        'width':rZone,
                        'margin-top':-1*rZone/2
                    })
                    .each(function(){
                        var type = 'right';
                        if($(this).hasClass('zone-left'))
                            type = 'left';
                        $(this).css(type,-1*rZone/2);
                    });
            }

            this.init();

            $(window).resize(function(){
                view.resize();
            });

            return this;

        });

    };

}(jQuery));