function isAdmin(req,res){
    if(! req.isAuthenticated() || ! req.user.isAdmin){
        res.redirect('/');
        return false ;
    }

    return true ;
}

exports.clubs = function(req, res){
    if(isAdmin(req,res)){

        var db = req.app.get('db');

        function redirect(){
            res.redirect(req.originalUrl);
        }

        function displayResult(){
            db.tables.clubs.find().sort('name').exec(function(err,clubs){
                var indexedClubs = {};
                for(var i in clubs)
                    indexedClubs[clubs[i]._id] = clubs[i];
                db.tables.teamNames.find().populate('_team').exec(function(err,teams){
                    console.log(teams);
                    res.render('clubs-admin',{title:"Manage clubs and teams",clubsList:indexedClubs,teamsList:teams});
                });
            });
        }

        if(req.body.newteam){
            if(req.body.clubid){

                var teamName = req.body.newteam.trim() ;


                db.tables.teamNames.findOne({name:teamName},function(err,team){

                    if(team){
                        res.end("Team already exists");
                    }else{

                        var newTeam = new db.tables.teams({
                            _club : req.body.clubid
                        })

                        var newTeamName  = new db.tables.teamNames({
                            name: teamName,
                            _team: newTeam._id
                        });

                        newTeam.validate(function(err){
                            if(err)
                                console.log("validation",err);
                            else newTeamName.validate(function(err){
                                if(err){
                                    console.log("Error in team name",err);
                                    res.end(err.errors.name.message);
                                }else{
                                    newTeam.save(function(err){
                                        if(err)console.log("Error in newTeam",err);
                                    });
                                    newTeamName.save(function(){
                                        if(err)console.log("Error in newTeamName",err);
                                    });
                                    redirect();
                                }
                            });

                        });


                    }
                });
            }else
                redirect();
        }else if(req.body.newclub){
            var clubName = req.body.newclub.trim() ;
            db.tables.clubs.findOne({name:clubName},function(err,club){

                if(club){
                    res.end("Club already exists");
                }else{
                    var newClub  = new db.tables.clubs({
                        name: clubName
                    });

                    newClub.validate(function(err){
                        if(err){
                            res.end('Wrong name')
                        }else{
                            newClub.save();
                            redirect();
                        }
                    })
                }

            });
        }else
            displayResult();

    }
};