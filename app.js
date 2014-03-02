
/**
 * Module dependencies.
 */

var
    express = require('express'),
    routes = require('./routes'),
    testcomponent = require('./routes/testcomponent'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    ymlConfig = require('yaml-config')
    app = express(),
    server = http.createServer(app),
    SessionStore = require("session-mongoose")(express)
;



var conf = ymlConfig.readConfig('./config.yml',app.get('env'));
app.set('conf',conf);
app.set('db',require('./inc/db'));

// all environments

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

// Session
var sessionStore = new SessionStore({
    interval: 3600*24*30*1000,
    connection: app.get('db').db.connection // <== custom connection
});
var cookieParser = express.cookieParser(conf.server.secretkey);
app.set('sessionStore',sessionStore);
app.set('cookieParser',cookieParser);
app.use(cookieParser);
app.use(express.session({
    key: conf.server.sessioncookie,
    store: sessionStore,
    secret: conf.server.secretkey,
    cookie: {maxAge: 3600*24*31*365*1000 },
}));

app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


app.locals.moment = require('moment');


require('./inc/login').app(app,passport);


app.get('*',function(req,res,next){
    res.locals.user = req.user;
    res.locals.appName = conf.app.title;
    next();
});

app.get('/', routes.index);
app.post('/newevent', routes.newevent);
app.get('/component', testcomponent.test);

app.use(app.router);



// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log(conf.app.title+' server listening on port ' + app.get('port'));
});
