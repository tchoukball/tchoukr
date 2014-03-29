
module.exports = function(app,io){

    var db = app.get('db');

    io.sockets.on('connection', function (socket,data){

        var matchId ;

        socket.on('registerMatch',function(data){
            matchId = data.matchId ;
            console.log("Match",matchId);
            socket.join("match"+matchId);
            socket.set('matchId',data.matchId,function () {
                socket.emit('ready');
            });
        });

        socket.on('action', function (data) {
            var action = new db.tables.actions();

            action._players = data.players ;
            action._team = data.team;
            action._match = matchId;
            action.value = data.place;
            action.position = {
                x:data.x,
                y:data.y
            };
            /*
            *         isGiven: Boolean,
             isPoint: Boolean,
            * */
            if(action.value == 'out' || action.value == 'zone')
                action.isGiven = true ;

            if(action.value == 'in' && action._players.length == 1)
                action.isPoint = true ;


            console.log("For",matchId,data);

            action.save(function(err){
                if(err) return console.warn(err,data);
                io.sockets.in('match'+matchId).emit('newaction',data);
            })


        });

    });


}
