
module.exports = function(app,io){

    var db = app.get('db');

    io.sockets.on('connection', function (socket,data){

        var matchId ;

        socket.on('registerMatch',function(data){
            matchId = data.matchId ;
            console.log("Match",matchId);
            socket.set('matchId',data.matchId,function () {
                socket.emit('ready');
            });
        });

        socket.on('action', function (data) {
            var action = new db.tables.actions(action);
            if(false) action.save(function(err){
                if(err) return console.warn(err);
            })
            console.log("For",matchId,data);
        });

    });


}
