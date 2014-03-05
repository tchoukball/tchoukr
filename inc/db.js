

var mongoose = require('mongoose'),
    Schema = mongoose.Schema
    ;

mongoose.connect('mongodb://localhost/tchoukr');

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
        _users : [{ type: Schema.Types.ObjectId, ref: 'users' }],
        created: {type: Date, default: Date.now}
    }),

    /* Club */
    clubs : new Schema({
        name : String
    }),

    /* New alias */
    teamNames : new Schema({
        name : String,
        _team : { type: Schema.Types.ObjectId, ref: 'teams' },
    }),

    /* Team */
    teams : new Schema({
        _club : { type: Schema.Types.ObjectId, ref: 'clubs' },
        created: {type: Date, default: Date.now}
    }),

    /* Matchs */
    matchs : new Schema({
        _teamA : [{ type: Schema.Types.ObjectId, ref: 'teamNames' }],
        _teamB : [{ type: Schema.Types.ObjectId, ref: 'teamNames' }],
        _event : { type: Schema.Types.ObjectId, ref: 'events' },
        created: {type: Date, default: Date.now}
    })
};

var tables = {};
for(var i in schemas){
    tables[i] = mongoose.model('data_'+i,schemas[i]);
}

exports.schemas = schemas ;
exports.tables = tables ;
exports.db = mongoose ;