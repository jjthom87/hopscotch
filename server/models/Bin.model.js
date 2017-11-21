var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BinSchema = new Schema({
	bin_num: String,
	signed_off: String
});

module.exports = mongoose.model('Bin', BinSchema);