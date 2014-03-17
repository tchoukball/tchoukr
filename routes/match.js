exports.matchDetail = function(req,res){
    if(! req.params.matchid)
        return res.redirect('/');

    var id = req.params.matchid ;
    var db = req.app.get('db');

    db.tables.matchs.findById(id).populate('_teamA _teamB _event').exec(function(err,match){

        console.log(match);

        if(! match)
            return res.redirect('/');

        res.render('match-details',{
            match:match,
            teamA:match._teamA,
            teamB:match._teamB,
            event:match._event,
        })

    });

}