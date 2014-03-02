
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
    server = http.createServer(app)
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
app.use(express.cookieParser(conf.server.secretkey));
app.use(express.session());
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
app.get('/component', testcomponent.test);

app.use(app.router);



// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log(conf.app.title+' server listening on port ' + app.get('port'));
});
