$('#players-list-A h3').on('click',function(){$('#players-list-A .team-content').toggleClass('players-showOnMobile')});
$('#players-list-B h3').on('click',function(){$('#players-list-B .team-content').toggleClass('players-showOnMobile')});

var
    $field = $('#match-field'),
    $tchoukr = $field.tchoukr().get(0),
    actions = [],
    teamsId = {A:null,B:null},
    indexTeams = {},
    playersDOM = {}

function getDomFromLetter(letter){
    return $('#players-list-'+letter+' li');
}

function liveMatch(matchId){

    for(var tI in teamsId){
        var id = $('#players-list-'+tI+' h3').data('id') ;
        teamsId[tI] = id ;
        indexTeams[id] = tI;
        playersDOM[id] = getDomFromLetter(tI);
    }

    var socket = io.connect('/');
    socket.emit('registerMatch',{matchId:matchId});
    socket.on('ready',function(){

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

var scoreTotal ;
function displayStats(){

    sortActions();

    scoreTotal = {A:0,B:0};
    $tchoukr.removeMarkers();

    for(var i in actions){
        treatAction(actions[i]);
    }

    displayScore(scoreTotal);
}

function treatAction(action){

    if(! indexTeams[action._team]) return ;

    var typeSign = 'defense';
    var letterTeam = indexTeams[action._team];

    if(action.isPoint){
        scoreTotal[letterTeam]++ ;
        typeSign = 'point';
    }

    if(action.isGiven){
        scoreTotal[oppositeTeam(letterTeam)]++ ;
        typeSign = 'given';
    }

    var fontAwesomeSign ;
    switch(typeSign){
        case'given':
            fontAwesomeSign = 'minus-circle';
            break;
        case'point':
            fontAwesomeSign = 'bullseye';
            break;
        case'defense':
            fontAwesomeSign = 'thumbs-down';
            break;
        default:
            fontAwesomeSign = 'circle';
    }
    $tchoukr.addMarker(
        action.position,
        $('<div>').addClass('marker-team-'+letterTeam+' marker-type-'+typeSign).html(
            $('<i>').addClass('fa fa-'+fontAwesomeSign)
        )
    );
}

function displayScore(total){
    for(var t in total){
        var val = total[t];
        if(val < 10) val = '0'+val;
        $('#score'+t).html(val);

    }
}
