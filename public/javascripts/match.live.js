$('#players-list-A h3').on('click',function(){$('#players-list-A .team-content').toggleClass('players-showOnMobile')});
$('#players-list-B h3').on('click',function(){$('#players-list-B .team-content').toggleClass('players-showOnMobile')});

var actions = [] ;

var teamsId = {A:null,B:null};
var indexTeams = {};


function liveMatch(matchId){

    for(var tI in teamsId){
        var id = $('#players-list-'+tI+' h3').data('id') ;
        teamsId[tI] = id ;
        indexTeams[id] = tI;
    }

    var socket = io.connect('/');
    socket.emit('registerMatch',{matchId:matchId});
    socket.on('ready',function(){

        $field = $('#admin-field');
        $tchoukr = $field.tchoukr().get(0)

        socket.emit('pleaseSendMeData');

    });

    socket.on('initMatchData',function(data){
        actions = data;
        displayStats();
    });

    socket.on('newaction',function(data){
        actions.push(data);
        displayStats();
    });


};

function sortActions(){
    actions = actions.sort(function(a,b){
         return (a.created > b.created) ;
    });
}

function oppositeTeam(letter){
    if(letter == 'A') return 'B';
    return 'A';
}

function displayStats(){
    sortActions();

    var scoreTotal = {A:0,B:0};
    for(var i in actions){
        var action = actions[i];
        if(indexTeams[action._team]){
            var letterTeam = indexTeams[action._team];
            if(action.isPoint)
                scoreTotal[letterTeam]++ ;
            if(action.isGiven)
                scoreTotal[oppositeTeam(letterTeam)]++ ;
        }
    }

    displayScore(scoreTotal)
}

function displayScore(total){
    for(var t in total){
        var val = total[t];
        if(val < 10) val = '0'+val;
        $('#score'+t).html(val);

    }
}