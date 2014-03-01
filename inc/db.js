

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