
module.exports = function(app,io){

    var db = app.get('db');

    io.sockets.on('connection', function (socket){
        console.log("Hey");
    });

}
