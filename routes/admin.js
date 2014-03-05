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

        function displayResult(){
            db.tables.clubs.find().exec(function(err,clubs){
                res.render('clubs-admin',{title:"Manage Clubs",clubsList:clubs});
            });
        }

        if(req.body.newclub){
            var clubName = req.body.newclub ;
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
                            displayResult();
                        }
                    })
                }

            });
        }else
            displayResult();

    }
};