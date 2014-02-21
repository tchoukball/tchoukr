(function( $ ) {

    $.fn.tchoukr = function() {

        return this.each(function() {

            var view = this;

            var fieldRatio = 5/3 ;
            var zoneRatio = 1/3 ;
            var paddingRatio = 1/10 ;

            var $blockComponent = $(this).addClass('tchoukr');
            var $field,$innerField,$zones ;


            function clickEvent(event){
                console.log(event.data);
                return false;
            }

            function addListeners(){
                $zones.on('click',{place:'zone'},clickEvent);
                $field.on('click',{place:'out'},clickEvent);
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

                addListeners();

                view.resize();

            };

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