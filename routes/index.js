
/*
 * GET home page.
 */

exports.index = function(req, res){
    if(! req.isAuthenticated())
        return res.render('index');

    res.render('home-member');
};

exports.newevent = function(req,res){

    if(! req.isAuthenticated()) res.redirect('/');

    var redirect = function(){
        res.redirect('/');
    }

    var db = res.app.get('db');

    if(req.body.newevent){
        var eventName = req.body.newevent;
        db.tables.events.findOne({name:eventName},function(err,event){
            if(event){
                res.end("Event already exists");
            }else{
                var newEvent  = new db.tables.events({
                    name: req.body.newevent,
                    _users:[req.user._id]
                });

                newEvent.validate(function(err,test){
                    if(err){
                        res.end('Wrong name')
                    }else{
                        newEvent.save();
                        redirect();
                    }
                })
            }

        });

    }else{
        redirect();
    }


}

