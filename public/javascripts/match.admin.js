function adminMatch(matchId){

    var $field, $players,$tchoukr ;

    var actionsTypes = {
        'in':[
            {role:'Shooter',required:true},
            {role:'Defender - if ball catched',required:false},
            {role:'Defender 2',required:false},
        ],
        'out':[
            {role:'Shooter',required:true},
        ],
        'zone':[
            {role:'Shooter',required:true},
        ]
    }

    var socket = io.connect('/',{match:matchId});
    socket.emit('registerMatch',{matchId:matchId});
    socket.on('ready',function(){


        initAdmin();

        $tchoukr.addListener(function(action){
            treatAction(action);
        });

    });

    socket.on('newaction',function(data){
        console.log("New Action",data);
    });

    function initAdmin(){
        $field = $('#admin-field');
        $tchoukr = $field.tchoukr().get(0)
        $players = $('#admin-players');
        setMenuAdmin()
        startNewAction();
    }

    function setMenuAdmin(){
        $blockTabLive = $('#admin-tab-live');
        $blockTabCompo = $('#admin-tab-compo');

        $blockTabLive.hide();

        $('#link-live').on('click',function(){
            $blockTabCompo.hide();
            $blockTabLive.show();
            startNewAction();
            return false;
        });
        $('#link-composition').on('click',function(){
            $blockTabCompo.show();
            $blockTabLive.hide();
            return false;
        });
    }

    function startNewAction(){
        $field.show();
        $players.hide();
        $tchoukr.resize();
    }


    var currentPlayerId ;
    var currentAction ;
    var domPlayers ;

    $('.playerPlaying').on('click',function(e){
        var playerDom = $(this) ;
        domPlayers[currentPlayerId].html(playerDom.html())
            .data('team',playerDom.data('team'))
            .data('id',playerDom.data('id'))
        ;
        currentPlayerId++;
        if(currentPlayerId >= currentAction.schema.length)
            submitAction(currentAction);

        return false;
    });

    $('#submitAction').on('click',function(){
        submitAction(currentAction);
        return false;
    });

    // Treat action
    function treatAction(action){

        currentPlayerId = 0 ;
        currentAction = action ;
        domPlayers = [];

        if(actionsTypes[currentAction.place]){
            currentAction.schema = actionsTypes[currentAction.place];
            getPlayers(currentAction);
        }else
            submitAction();
    }


    function getPlayers(){

        $players.show();
        $field.hide();

        $tableActions = $('#playersSelected');
        $tableActions.html("");
        for(var schI in currentAction.schema){
            var pl = currentAction.schema[schI];
            var $line = $('<tr>');
            $line.append($('<td>').text(parseInt(schI)+1));
            $line.append($('<td>').text(pl.required?pl.role:'('+pl.role+'?)'));
            var domSelected = $('<td>');
            domSelected.html(pl.required?$('<b>').text('required'):'');
            $line.append(domSelected);
            domPlayers.push(domSelected);
            $tableActions.append($line);
        }

    }

    function submitAction(){

        console.log("SUBMIT");
        console.log(currentAction);
        currentAction.players = [];
        var team ;
        for(var i in domPlayers){
            var dom = domPlayers[i];
            if(dom.data('id')){
                if(i == 0)
                    currentAction.team  = dom.data('team');

                currentAction.players.push(dom.data('id'));
            }

        }

        for(var i in currentAction.schema){
            if(currentAction.schema[i].required){
                if(! currentAction.players[i]){
                    alert(currentAction.schema[i].role + " is required.");
                    return;
                }
            }
        }

        socket.emit("action",currentAction);
        startNewAction();
    }

};