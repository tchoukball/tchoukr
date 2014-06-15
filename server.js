
/**
 * Module dependencies.
 */

var
    express = require('express'),
    path = require('path'),
    passport = require('passport'),
    ymlConfig = require('yaml-config'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    SessionStore = require("session-mongoose")(express)
;


var conf = ymlConfig.readConfig('./config.yml',app.get('env'));
app.set('conf',conf);
app.set('db',require('./inc/db'));

// all environments

app.set('port', process.env.PORT || conf.server.port);
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

function addLocals(req,res,next){
    res.locals.user = req.user;
    res.locals.appName = conf.app.title;
    res.locals.path = req.path;
    next();
}

app.get('*',addLocals);
app.post('*',addLocals);


var
    routes = require('./routes'),
    adminRoutes = require('./routes/admin'),
    matchRoutes = require('./routes/match'),
    testcomponent = require('./routes/testcomponent')
;

// Index
app.get('/', routes.index);

// Events
app.get('/event/:eventid', routes.eventDetail);
app.post('/event/:eventid', routes.eventDetail);
app.post('/newevent', routes.eventNew);

// Match
app.get('/match/:matchid', matchRoutes.matchDetail);
app.get('/match/:matchid/admin', matchRoutes.matchAdmin);
app.post('/match/:matchid/admin', matchRoutes.matchAdmin);

// Tests
app.get('/component', testcomponent.test);

// Admin
app.get('/admin/clubs', adminRoutes.clubs);
app.post('/admin/clubs', adminRoutes.clubs);


app.use(app.router);

require('./inc/sockets.js')(app,io);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

server.listen(app.get('port'), function(){
  console.log(conf.app.title+' server listening on port ' + app.get('port'));
});
