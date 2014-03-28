function adminMatch(matchId){

    var $field, $players,$tchoukr ;

    var actionsTypes = {
        'in':[
            {role:'Shooter',required:true},
            {role:'Defender 1',required:false},
            {role:'Defender 2',required:false},
        ],
        'out':[
            {role:'Schooter',required:true},
        ],
        'zone':[
            {role:'Schooter',required:true},
        ]
    }

    var socket = io.connect('/',{match:matchId});
    socket.emit('registerMatch',{matchId:matchId});
    socket.on('ready',function(){


        initAdmin();

        socket.on('news', function (data) {
            console.log(data);
            socket.emit('my other event', { my: 'data' });
        });

        $tchoukr.addListener(function(action){
            treatAction(action);
        });

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
        console.log("New action");
    }


    var currentPlayerId ;
    var currentAction ;
    var domPlayers ;

    $('.playerPlaying').on('click',function(e){
        var playerDom = $(this) ;
        console.log(currentPlayerId);
        console.log(domPlayers[currentPlayerId]);
        domPlayers[currentPlayerId].html(playerDom.html());

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
        if(actionsTypes[currentAction.place]){
            currentAction.schema = actionsTypes[currentAction.place];
            getPlayers(currentAction);
        }else
            submitAction();
    }


    function getPlayers(){

        $players.show();
        $field.hide();

        domPlayers = [];

        $tableActions = $('#playersSelected');
        $tableActions.html("");
        for(var schI in currentAction.schema){
            var pl = currentAction.schema[schI];
            var $line = $('<tr>');
            $line.append($('<td>').text(parseInt(schI)+1));
            $line.append($('<td>').text(pl.required?pl.role:'('+pl.role+'?)'));
            var domSelected = $('<td>');
            domSelected.html(pl.required?'required':'if there is one');
            $line.append(domSelected);
            domPlayers.push(domSelected);
            $tableActions.append($line);
        }

    }

    function submitAction(){

        console.log(currentAction);

        socket.emit("action",currentAction);
        startNewAction();
    }

};