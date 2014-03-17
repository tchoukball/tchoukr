
function isValidDate(d) {
    if ( Object.prototype.toString.call(d) !== "[object Date]" )
        return false;
    return !isNaN(d.getTime());
}

var redirectHome = function(res){
    res.redirect('/');
}

function isEventAdmin(req,event){
    return (req.user && event._users.indexOf(req.user._id) > -1)
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

                var isThisEventAdmin = isEventAdmin(req,event);

                if(req.body.teamA || req.body.teamB){

                    if(! isThisEventAdmin)
                        return res.redirect(req.originalUrl);

                    var teamA = req.body.teamA;
                    var teamB = req.body.teamB;
                    if(! teamA || ! teamB){
                        return res.redirect(req.originalUrl);
                    }else{

                        var timezone = -1*(parseInt(req.body.timezone)) ;
                        if(timezone >= 0) timezone = '+'+timezone ;
                        var timeString = req.body.datestart + " " + req.body.hourstart + ':00 ' + timezone ;
                        var date = new Date(timeString);
                        console.log(timeString,"=",date);
                        console.log("Body",req.body);

                        if(! isValidDate(date)){
                            console.log("Invalid date");
                            return res.redirect(req.originalUrl);
                        }

                        if(Math.abs(date-new Date()) > 365*3600*24*1000){
                            console.log("Date too far from today");
                            return res.redirect((req.originalUrl));
                        }

                        if(teamA == teamB){
                            return res.redirect(req.originalUrl);
                        }

                        var newMatch  = new db.tables.matchs({
                            _teamA: teamA,
                            _teamB: teamB,
                            _event: event._id,
                            dateStart : date
                        });


                        newMatch.validate(function(err,test){
                            if(err){
                                console.log('new match',err)
                                res.end('Wrong match')
                            }else{
                                newMatch.save();
                                res.redirect(req.originalUrl);
                            }
                        })

                        //res.end("Add match");
                    }
                }else db.tables.teamNames.find({isAvailable:true}).sort('name').exec(function(err,teams){

                    db.tables.matchs.find({_event:event._id}).sort('-dateStart').populate('_teamA _teamB').exec(function(err,matchs){

                        res.render('event-details',{
                            title:event.name,
                            event:event,
                            formAction:req.originalUrl,
                            allTeams:teams,
                            matchsList:matchs,
                            isEventAdmin: isThisEventAdmin
                        });

                    });

                })
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

