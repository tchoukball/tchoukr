
function isEventAdmin(req,event){
    return (req.user && event._users.indexOf(req.user._id) > -1)
}

exports.matchDetail = function(req,res){
    if(! req.params.matchid)
        return res.redirect('/');

    var id = req.params.matchid ;
    var db = req.app.get('db');

    db.tables.matchs.findById(id).populate('_teamA _teamB _event').exec(function(err,match){

        var isThisEventAdmin = isEventAdmin(req,match._event);

        if(! match)
            return res.redirect('/');

        db.tables.players.find({_team:match._teamA._team}).exec(function(err,playersA){
        db.tables.players.find({_team:match._teamB._team}).exec(function(err,playersB){

            console.log("Players A",playersA);

            res.render('match-details',{
                match:match,
                teamA:match._teamA,
                teamB:match._teamB,
                event:match._event,
                isAdmin:isThisEventAdmin
            });

        });
        });

    });

}