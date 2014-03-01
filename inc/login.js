
exports.app = function(app,passport){

    var loginURL = '/';
    var logoutURL = '/logout';


    app.use(passport.initialize());
    app.use(passport.session());

    var
        FacebookStrategy = require('passport-facebook').Strategy,
        db = app.get('db'),
        conf = app.get('conf')
        ;


    /*
     * FACEBOOK Connect
     * */
    passport.use(new FacebookStrategy({
            clientID: conf.passport.facebook.appid,
            clientSecret: conf.passport.facebook.appsecret,
            callbackURL: conf.passport.facebook.callbackurl
        },
        function(accessToken, refreshToken, profile, done) {
            //console.log("Connect:",profile);
            db.tables.users.findOne({fbId : profile.id}, function(err, oldUser){
                if(oldUser){
                    done(null,oldUser);
                }else{
                    new db.tables.users({
                        fbId : profile.id ,
                        email : profile.emails[0].value,
                        name : profile.displayName
                    }).save(function(err,newUser){
                        if(err) throw err;
                        console.log("New facebook user saved");
                        console.log(newUser);
                        done(null, newUser);
                    });
                }
            });
        }
    ));

    app.get("/auth/facebook",passport.authenticate("facebook",{ scope : "email"}));
    app.get("/auth/facebook/callback",
        passport.authenticate("facebook",{ failureRedirect: loginURL}),
        function(req,res){
            console.log("Redirection");
            res.redirect('/');
        }
    );



    /*
     * SERIALIZE
     * */

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        db.tables.users.findById(id,function(err,user){
            console.log(err);
            if(err) done(err);
            if(user){
                console.log("Ok1");
                user.provider = 'facebook';
                done(null,user);
                console.log("Ok2");

            }else{
                done(null,false);//done("User not found");
            }
        });
    });

    app.get(logoutURL, function(req, res){
        req.logout();
        res.redirect('/');
    });


};