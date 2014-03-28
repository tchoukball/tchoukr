
function isEventAdmin(req,event){
    return (req.user && event._users.indexOf(req.user._id) > -1)
}

var sortNames = 'lastName firstName';

exports.matchDetail = function(req,res){
    if(! req.params.matchid)
        return res.redirect('/');

    var id = req.params.matchid ;
    var db = req.app.get('db');

    db.tables.matchs.findById(id)
        .populate('_teamA _teamB _event compositionA._player compositionB._player')
        .exec(function(err,match){

        var isThisEventAdmin = isEventAdmin(req,match._event);

        if(! match)
            return res.redirect('/');

        res.render('match-details',{
            match:match,
            teamA:match._teamA,
            teamB:match._teamB,
            event:match._event,
            compoA: match.compositionA,
            compoB: match.compositionB,
            isAdmin:isThisEventAdmin
        });


    });

}

exports.matchAdmin = function(req,res){
    if(! req.params.matchid)
        return res.redirect('/');

    var id = req.params.matchid ;
    var db = req.app.get('db');

    db.tables.matchs.findById(id)
        .populate('_teamA _teamB _event compositionA._player compositionB._player')
        .exec(function(err,match){

        if(! match)
            return res.redirect('/');

        if(req.body.addplayer){
            var teamAdd = req.body.team;
            if(teamAdd == match._teamA._team || teamAdd == match._teamB._team){

                var newPlayer  = new db.tables.players({
                    firstName: req.body.firstname,
                    lastName: req.body.lastname,
                    _teams:[teamAdd]
                });

                newPlayer.validate(function(err){
                    if(err){
                        res.end('Wrong name')
                    }else{
                        newPlayer.save();
                        return res.redirect(req.path);
                    }
                })
            }else{
                console.log("Wrong team");
                console.log(teamAdd);
                return res.redirect(req.path);
            }
        }


        if(! isEventAdmin(req,match._event))
            return res.redirect('/match/'+match._id);

        db.tables.players.find({_teams:match._teamA._team}).sort(sortNames).exec(function(err,playersA){
        db.tables.players.find({_teams:match._teamB._team}).sort(sortNames).exec(function(err,playersB){

            var teams = {
                A:{team:match._teamA,players:playersA},
                B:{team:match._teamB,players:playersB}
            };

            var edited = false ;
            for(var ti in teams){
                var team = teams[ti];
                if(req.body['editTeam'+team.team._id]){
                    edited = true ;
                    match['composition'+ti] = generateCompo(team.players);
                }
            }

            if(edited){
                match.save(function(err,ok){
                    if(err) return res.end(JSON.stringify(err,null,4));
                    console.log("match updated",err,ok);
                    res.redirect(req.path);
                });
                return ;
            }

            res.render("match-admin",{
                match:match,
                teamA:match._teamA,
                teamB:match._teamB,
                event:match._event,
                playersA:playersA,
                playersB:playersB
            });
        });
        });
    });

    function generateCompo(players){
        var compo = [];
        for(var i in players){
            var player = players[i];
            if(req.body['player'+player._id]){
                compo.push({
                    shirtNumber:req.body['player'+player._id],
                    _player:player._id
                });
            }
        }
        return compo;
    }

}

