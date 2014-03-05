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
        db.tables.events.find({'_users':req.user._id},function(err,events){
            //res.render('home-member',{eventlist:events});
            res.end("Admin clubs");
        });

    }
};