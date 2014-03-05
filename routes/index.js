


var redirectHome = function(res){
    res.redirect('/');
}

exports.index = function(req, res){
    if(! req.isAuthenticated())
        return res.render('index');

    var db = req.app.get('db');
    db.tables.events.find({'_users':req.user._id},function(err,events){
        res.render('home-member',{eventlist:events});
    });

};

exports.eventDetail = function(req,res){
    if(req.params.eventid){
        var id = req.params.eventid ;
        var db = req.app.get('db');

        db.tables.events.findById(id,function(err,event){
            if(! event)
                redirectHome(res);
            else{
                res.render('event-details',{title:event.name,event:event});
            }
        });

    }else{
        redirectHome(res);
    }
}

exports.eventNew = function(req,res){

    if(! req.isAuthenticated()) redirectHome(res);


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
                        redirectHome(res);
                    }
                })
            }

        });

    }else{
        redirectHome(res);
    }


}

