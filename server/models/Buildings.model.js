var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BuildingSchema = new Schema({
	bin_num: String,
	date: String,
	job_num: String,
	doc_num: String,
	job_type: String,
	job_status: String,
	status_date: String,
	license_num: String,
	applicant: String,
	input_res: String,
	signed_off: Boolean
});

module.exports = mongoose.model('Building', BuildingSchema);