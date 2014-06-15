$('#players-list-A h3').on('click',function(){$('#players-list-A .team-content').toggleClass('players-showOnMobile')});
$('#players-list-B h3').on('click',function(){$('#players-list-B .team-content').toggleClass('players-showOnMobile')});

var
    $field = $('#match-field'),
    $tchoukr = $field.tchoukr().get(0),
    actions = [],
    teamsId = {A:null,B:null},
    indexTeams = {},
    statsPlayers = {},
    playersDOM = {},
    $actionList = $('#match-actions'),
    $tablePlayersStats = $('#players-stats'),
    scaleTR = 10, offsetTR = 1
;

scaleTR -= offsetTR;

function getDomFromLetter(letter){
    var p = {};
    $('#players-list-'+letter+' li').each(function(a,b){
       p[$(b).data('id')] = b;
    });
    return p ;
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
        return new Date(a.created)-new Date(b.created);
    });
}

function oppositeTeam(letter){
    if(letter == 'A') return 'B';
    return 'A';
}

function oppositeTeamId(id){
    return teamsId[oppositeTeam(indexTeams[id])];
}

var scoreTotal ;
function displayStats(){

    sortActions();

    scoreTotal = {A:0,B:0};
    statsPlayers = {};
    $tchoukr.removeMarkers();
    $actionList.html("");

    for(var i in actions){
        treatAction(actions[i]);
    }

    displayScore(scoreTotal);
    displayPlayersStats();
}

function increasePlayerStats(team,player,stat){
    if(! player) return ;
    if(! statsPlayers[player]) statsPlayers[player] = {team:team,point:0,given:0,defense:0,defended:0};
    if(! statsPlayers[player][stat]) statsPlayers[player][stat] = 0;
    statsPlayers[player][stat]++;
}

function treatAction(action){

    if(! indexTeams[action._team]) return ;

    var typeSign = 'unknown';
    action.letterTeam = indexTeams[action._team];

    var shooter = action._players[0] ;

    if(action.isPoint){
        scoreTotal[action.letterTeam]++ ;
        typeSign = 'point';
    }

    if(action.isGiven){
        scoreTotal[oppositeTeam(action.letterTeam)]++ ;
        typeSign = 'given';
    }

    if(action._players.length > 1){
        typeSign = 'defense' ;
        for(var i in action._players)
            if(i)
                increasePlayerStats(oppositeTeamId(action._team),action._players[i],'defense');

    }


    var fontAwesomeSign ;
    switch(typeSign){
        case'given':
            fontAwesomeSign = 'minus-circle';
            increasePlayerStats(action._team,shooter,'given');
            break;
        case'point':
            fontAwesomeSign = 'bullseye';
            increasePlayerStats(action._team,shooter,'point');
            break;
        case'defense':
            fontAwesomeSign = 'thumbs-down';
            increasePlayerStats(action._team,shooter,'defended');
            break;
        default:
            fontAwesomeSign = 'circle';
    }
    $tchoukr.addMarker(
        action.position,
        $('<div>').addClass('marker-team-'+action.letterTeam+' marker-type-'+typeSign).html(
            $('<i>').addClass('fa fa-'+fontAwesomeSign).attr('title',action.created)
        )
    );

    var player = getPlayerInformations(action._team,shooter);

    var $actionLine = $('<tr>');
    $actionList.prepend($actionLine);

    var dateBegin = new Date(actions[0].created);
    var dateAction = new Date(action.created);
    action.minute = Math.floor((dateAction-dateBegin)/1000/60);
    action.scoreDiff = Math.abs(scoreTotal.A-scoreTotal.B);
    action.score = scoreTotal;

    $actionLine.append($('<td>').text(action.minute+"'"));
    for(var i in scoreTotal){
        var isLosing = scoreTotal[i] < scoreTotal[oppositeTeam(i)];
        $actionLine.append($('<td>').addClass('td-score').addClass('td-score-'+i).toggleClass('td-score-losing',isLosing).html(scoreTotal[i]));
    }
    $actionLine.append($('<td>').addClass('td-score').html(action.scoreDiff));
    $actionLine.append($('<td>').html($('<i>').addClass('fa fa-'+fontAwesomeSign)));
    $actionLine.append($('<td>').html(player.name));
    $actionLine.append($('<td>').html(getActionComments(action)));
}

function getActionComments(action){
    var comments = [];

    // During a point
    if(action.isGiven || action.isPoint){

        if(action.score.A == action.score.B)
            comments.push('equalisation');

        if(action.scoreDiff == 2)
            comments.push('+2')
    }else{
        var playersList = getPlayersList(teamsId[oppositeTeam(action.letterTeam)],action._players);
        if(playersList != "")
            comments.push('defended by '+playersList);
    }

    if(action.value == 'out')
        comments.push('out');

    if(action.isGiven)
        comments.push('given point');

    return comments.join(', ');
}

function getPlayersList(team,_players){
    var p = [];
    for(var i in _players){
        var player = getPlayerInformations(team,_players[i]);
        if(player.name)
            p.push(player.name);
    }
    return p.join(' and ');
}

function getPlayerDom(teamId,id){
    if(! playersDOM[teamId]){
        console.warn("Unknow team",teamId,playersDOM);
        return ;
    }else if(! playersDOM[teamId][id]){
        console.warn("Unknow player",id,playersDOM);
        return ;
    }
    return playersDOM[teamId][id];
}

function getPlayerInformations(teamId,id){
    var pDOM = getPlayerDom(teamId,id);
    if(! pDOM) return {};
    var p = $(pDOM);
    return {
        name:p.find('.playerName').html(),
        shirtNumber:p.find('.shirtNumber').html()
    }
}

function displayScore(total){
    for(var t in total){
        var val = total[t];
        if(val < 10) val = '0'+val;
        $('#score'+t).html(val);

    }
}

function getPlayerStats(){
    var stats = [];
    for(var pId in statsPlayers){
        var p = statsPlayers[pId];
        p.player = pId;
        p.diff = p.point- p.given;
        p.score = p.diff+p.defense ;
        p.rank = p.score-(p.defended/2) ;
        stats.push(p);
    }
    stats.sort(function(a,b){
        return a.rank-b.rank;
    });
    return stats;
}

function displayPlayersStats(){

    var stats = getPlayerStats();
    if(! stats.length) return;

    var worstTR = stats[0].rank;
    var bestTR = stats[stats.length-1].rank+1;


    $tablePlayersStats.html("");
    for(var pId in stats){
        var p = stats[pId];
        var player = getPlayerInformations(p.team, p.player);
        if(! player.name) continue;

        var rank = Math.ceil((p.rank-worstTR)/(bestTR-worstTR)*scaleTR)+offsetTR;


        var $line = $('<tr>');
        $tablePlayersStats.prepend($line);
        $line.append($('<td>').text(player.name));
        $line.append($('<td>').text(p.point));
        $line.append($('<td>').text(p.given));
        $line.append($('<td>').text(p.defense));
        $line.append($('<td>').text(rank));

    }

}
