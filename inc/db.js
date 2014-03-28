

var mongoose = require('mongoose'),
    Schema = mongoose.Schema
    ;

mongoose.connect('mongodb://localhost/tchoukr');

var pf = 'data_';

var schemaTeamComposition = new Schema({
    shirtNumber:{ type: Number, min:0,max:99},
    _player:{ type: Schema.Types.ObjectId, ref: pf+'players' }
});

var schemas = {

    /* Connexion */
    users : new Schema({
        fbId: String,
        email: { type : String , lowercase : true},
        name : String,
        isAdmin : {type : Boolean, default : false},
        created: {type: Date, default: Date.now}
    }),

    /* Events */
    events : new Schema({
        name : {type:String,match: /^[a-z0-9\s-]{4,30}$/i},
        _users : [{ type: Schema.Types.ObjectId, ref: pf+'users' }],
        created: {type: Date, default: Date.now}
    }),

    /* Club */
    clubs : new Schema({
        name : {type:String,match: /^.{4,50}$/i},
        created: {type: Date, default: Date.now}
    }),

    /* Alias */
    teamNames : new Schema({
        name : {type:String,match: /^.{4,50}$/i},
        isAvailable : {type : Boolean, default : true},
        _team : { type: Schema.Types.ObjectId, ref: pf+'teams' },
        created: {type: Date, default: Date.now}
    }),

    /* Team */
    teams : new Schema({
        _club : { type: Schema.Types.ObjectId, ref: pf+'clubs' },
        created: {type: Date, default: Date.now}
    }),

    /* Matchs */
    matchs : new Schema({
        _teamA : { type: Schema.Types.ObjectId, ref: pf+'teamNames' },
        _teamB : { type: Schema.Types.ObjectId, ref: pf+'teamNames' },
        _event : { type: Schema.Types.ObjectId, ref: pf+'events' },
        compositionA : [schemaTeamComposition],
        compositionB : [schemaTeamComposition],
        dateStart : { type: Date, default: Date.now },
        created: {type: Date, default: Date.now}
    }),

    /* Players */
    players : new Schema({
        firstName : {type:String,match: /^.{2,20}$/i},
        lastName : {type:String,match: /^.{2,20}$/i},
        _teams : [{ type: Schema.Types.ObjectId, ref: pf+'teams' }],
        created: {type: Date, default: Date.now}
    })

};

var tables = {};
for(var i in schemas){
    tables[i] = mongoose.model(pf+i,schemas[i]);
}

exports.schemas = schemas ;
exports.tables = tables ;
exports.db = mongoose ;