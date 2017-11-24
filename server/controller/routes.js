var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

const hostUrl = 'http://a810-bisweb.nyc.gov/bisweb/';

var router = express.Router();

var db = process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/buildings_one';
const Building = require('../models/Buildings.model.js');
const Bin = require('../models/Bin.model.js');

mongoose.connect(db, function(err,res){
	if(err){
		console.log("Error connection to: " + db + '. ' + err);
	} else {
		console.log("Succeeded connecting to: " + db);
	}
});

router.get('/', function(req,res){
	//Building.collection.drop();
	res.sendFile(path.join(__dirname, '../../client/public/index.html'));
});

var dataArr = [];
var moreDataArr = [];
var bin_num;
router.post('/second-post', function(req,res){
	res.set("User-Agent",'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
	var agent = {
		"User-Agent":'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
	}
	//Building.collection.drop();
	var inputRes = req.body.boro + " " + req.body.house_num + " " + req.body.street;
	try {
		var num;
		switch(req.body.boro){
			case 'manhattan':
				num = 1;
				break;
			case 'bronx':
				num = 2;
				break;
			case 'brooklyn':
				num = 3;
				break;
			case 'queens':
				num = 4;
				break;
			case 'staten island':
				num = 5;
				break;
		}
		var options = {
		  url: `${hostUrl}/PropertyProfileOverviewServlet?boro=${num}&houseno=${req.body.house_num}&street=${req.body.street}`,
		  headers: {
		  	"User-Agent":'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
		  }
		};
		var upNum = 0
		while(upNum <= 16){
			request(options, function(testErr, testRes, testHtml){
				//console.log(testRes.client._httpMessage.res.request.originalCookieHeader)
				var optionsTwo = {
				  url: `${hostUrl}/PropertyProfileOverviewServlet?boro=${num}&houseno=${req.body.house_num}&street=${req.body.street}`,
				  headers: {
				  	"User-Agent":'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
				  }
				};
				request(optionsTwo, function(err, resOne, html){
					console.log(resOne)
					if(err) {
						console.log("Err: " + err)
					}
					var $ = cheerio.load(html);
					$('.maininfo').each(function(index, element){
						var arr = [];
						arr.push($(element).text())
						arr.forEach((a) => {
							if(a.indexOf("BIN#") > -1){
								var bin_num = a.split("#")[1].trim();
								var moreOptions = {
								  url: `${hostUrl}/JobsQueryByLocationServlet?requestid=1&allbin=${bin_num}`,
								  headers: {
								  	"User-Agent":'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
								  }
								};
								request(moreOptions, function(error, resTwo, body){
									if(error) {
										console.log("Error: " + error)
									}
									var $ = cheerio.load(body);
									$('body').each(function(){
										var table = $(this).find("table").eq(5);
										table.each(function(){
											var tr = $(this).find("tr");
											tr.each(function(){
												if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") > -1){
													var data = {
														bin_num: bin_num,
														date: $(this).find("td").eq(0).text(),
														job_num: $(this).find("td").eq(1).text().trim(),
														doc_num: $(this).find("td").eq(2).text(),
														job_type: $(this).find("td").eq(3).text(),
														job_status: $(this).find("td").eq(4).text(),
														status_date: $(this).find("td").eq(5).text(),
														license_num: $(this).find("td").eq(6).text(),
														applicant: $(this).find("td").eq(7).text(),
														signed_off: true,
														input_res: inputRes
													}
													Building.insertMany(data);
												}
												if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") == -1 && $(this).find("td").eq(0).text().indexOf("/") > -1){
													var data = {
														bin_num: bin_num,
														date: $(this).find("td").eq(0).text(),
														job_num: $(this).find("td").eq(1).text().trim(),
														doc_num: $(this).find("td").eq(2).text(),
														job_type: $(this).find("td").eq(3).text(),
														job_status: $(this).find("td").eq(4).text(),
														status_date: $(this).find("td").eq(5).text(),
														license_num: $(this).find("td").eq(6).text(),
														applicant: $(this).find("td").eq(7).text(),
														signed_off: false,
														input_res: inputRes
													}
													Building.insertMany(data);
												}
												if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") == -1 && $(this).find("td").eq(5).text().indexOf("/") > -1){
													var data = {
														bin_num: bin_num,
														date: $(this).find("td").eq(0).text(),
														job_num: $(this).find("td").eq(1).text().trim(),
														doc_num: $(this).find("td").eq(2).text(),
														job_type: $(this).find("td").eq(3).text(),
														job_status: $(this).find("td").eq(4).text(),
														status_date: $(this).find("td").eq(5).text(),
														license_num: $(this).find("td").eq(6).text(),
														applicant: $(this).find("td").eq(7).text(),
														signed_off: false,
														input_res: inputRes
													}
													Building.insertMany(data);
												}
											})
										})
										var tableSix = $(this).find("table").eq(6);
										tableSix.each(function(){
											var trZero = $(this).find("tr").eq(0);
											trZero.each(function(){
												var tdTwo = $(this).find("input[name*='next']" ).val( "has next in it!" );
												if(tdTwo){
													var recount_num = parseInt($(this).find("input[name='glreccountn']").val());
													var num_on_page = 41;
													var zeros;
													while (num_on_page < recount_num){
														if(num_on_page < 100){
															zeros = "00";
														} else {
															zeros = "0";
														}
														var newUrl = `${hostUrl}/JobsQueryByLocationServlet?&allbin=${bin_num}&glreccountn=0000000${recount_num}&allboroughname=&allstrt=&allnumbhous=&jobsubmdate_month=&jobsubmdate_date=&jobsubmdate_year=&allinquirytype=BXS1PRA3&alljobtype=&passdocnumber=&stcodekey=&ckbunique=&allcount=${zeros}${num_on_page}`;
														var moreMoreOptions = {
														  url: newUrl,
														  headers: agent
														};
														request(moreMoreOptions, function(errorTwo, responseTwo, bodyTwo){
															var $ = cheerio.load(bodyTwo);
															$('body').each(function(){
																var table = $(this).find("table").eq(5);
																table.each(function(){
																	var tr = $(this).find("tr");
																	tr.each(function(){
																		if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") > -1){
																			var dataAgain = {
																				bin_num: bin_num,
																				date: $(this).find("td").eq(0).text(),
																				job_num: $(this).find("td").eq(1).text().trim(),
																				doc_num: $(this).find("td").eq(2).text(),
																				job_type: $(this).find("td").eq(3).text(),
																				job_status: $(this).find("td").eq(4).text(),
																				status_date: $(this).find("td").eq(5).text(),
																				license_num: $(this).find("td").eq(6).text(),
																				applicant: $(this).find("td").eq(7).text(),
																				signed_off: true,
																				input_res: inputRes
																			}
																			Building.insertMany(dataAgain);
																		}
																		if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") == -1 && $(this).find("td").eq(0).text().indexOf("/") > -1){
																			var dataAgain = {
																				bin_num: bin_num,
																				date: $(this).find("td").eq(0).text(),
																				job_num: $(this).find("td").eq(1).text().trim(),
																				doc_num: $(this).find("td").eq(2).text(),
																				job_type: $(this).find("td").eq(3).text(),
																				job_status: $(this).find("td").eq(4).text(),
																				status_date: $(this).find("td").eq(5).text(),
																				license_num: $(this).find("td").eq(6).text(),
																				applicant: $(this).find("td").eq(7).text(),
																				signed_off: false,
																				input_res: inputRes
																			}
																			Building.insertMany(dataAgain);
																		}
																		if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") == -1 && $(this).find("td").eq(5).text().indexOf("/") > -1){
																			var data = {
																				bin_num: bin_num,
																				date: $(this).find("td").eq(0).text(),
																				job_num: $(this).find("td").eq(1).text().trim(),
																				doc_num: $(this).find("td").eq(2).text(),
																				job_type: $(this).find("td").eq(3).text(),
																				job_status: $(this).find("td").eq(4).text(),
																				status_date: $(this).find("td").eq(5).text(),
																				license_num: $(this).find("td").eq(6).text(),
																				applicant: $(this).find("td").eq(7).text(),
																				signed_off: false,
																				input_res: inputRes
																			}
																			Building.insertMany(data);
																		}
																	});
																});
															});
														});
														num_on_page += 40;
													}
												}
											});
										});
									})
								});
							}
						})
					});
				});
			});
			upNum++;
		}
		// let upNumTwo = 0;
		// while(upNumTwo <= 16){
		// 	request(options, function(err, resOne, html){
		// 		if(err) {
		// 			console.log("Err: " + err)
		// 		}
		// 		var $ = cheerio.load(html);
		// 		$('.maininfo').each(function(index, element){
		// 			var arr = [];
		// 			arr.push($(element).text())
		// 			arr.forEach((a) => {
		// 				if(a.indexOf("BIN#") > -1){
		// 					var bin_num = a.split("#")[1].trim();
		// 					var moreOptions = {
		// 					  url: `${hostUrl}/JobsQueryByLocationServlet?requestid=1&allbin=${bin_num}`,
		// 					  headers: agent
		// 					};
		// 					request(moreOptions, function(error, resTwo, body){
		// 						if(error) {
		// 							console.log("Error: " + error)
		// 						}
		// 						var $ = cheerio.load(body);
		// 						$('body').each(function(){
		// 							var table = $(this).find("table").eq(5);
		// 							table.each(function(){
		// 								var tr = $(this).find("tr");
		// 								tr.each(function(){
		// 									if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") > -1){
		// 										var data = {
		// 											bin_num: bin_num,
		// 											date: $(this).find("td").eq(0).text(),
		// 											job_num: $(this).find("td").eq(1).text().trim(),
		// 											doc_num: $(this).find("td").eq(2).text(),
		// 											job_type: $(this).find("td").eq(3).text(),
		// 											job_status: $(this).find("td").eq(4).text(),
		// 											status_date: $(this).find("td").eq(5).text(),
		// 											license_num: $(this).find("td").eq(6).text(),
		// 											applicant: $(this).find("td").eq(7).text(),
		// 											signed_off: true,
		// 											input_res: inputRes
		// 										}
		// 										Building.insertMany(data);
		// 									}
		// 									if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") == -1 && $(this).find("td").eq(0).text().indexOf("/") > -1){
		// 										var data = {
		// 											bin_num: bin_num,
		// 											date: $(this).find("td").eq(0).text(),
		// 											job_num: $(this).find("td").eq(1).text().trim(),
		// 											doc_num: $(this).find("td").eq(2).text(),
		// 											job_type: $(this).find("td").eq(3).text(),
		// 											job_status: $(this).find("td").eq(4).text(),
		// 											status_date: $(this).find("td").eq(5).text(),
		// 											license_num: $(this).find("td").eq(6).text(),
		// 											applicant: $(this).find("td").eq(7).text(),
		// 											signed_off: false,
		// 											input_res: inputRes
		// 										}
		// 										Building.insertMany(data);
		// 									}
		// 									if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") == -1 && $(this).find("td").eq(5).text().indexOf("/") > -1){
		// 										var data = {
		// 											bin_num: bin_num,
		// 											date: $(this).find("td").eq(0).text(),
		// 											job_num: $(this).find("td").eq(1).text().trim(),
		// 											doc_num: $(this).find("td").eq(2).text(),
		// 											job_type: $(this).find("td").eq(3).text(),
		// 											job_status: $(this).find("td").eq(4).text(),
		// 											status_date: $(this).find("td").eq(5).text(),
		// 											license_num: $(this).find("td").eq(6).text(),
		// 											applicant: $(this).find("td").eq(7).text(),
		// 											signed_off: false,
		// 											input_res: inputRes
		// 										}
		// 										Building.insertMany(data);
		// 									}
		// 								})
		// 							})
		// 							var tableSix = $(this).find("table").eq(6);
		// 							tableSix.each(function(){
		// 								var trZero = $(this).find("tr").eq(0);
		// 								trZero.each(function(){
		// 									var tdTwo = $(this).find("input[name*='next']" ).val( "has next in it!" );
		// 									if(tdTwo){
		// 										var recount_num = parseInt($(this).find("input[name='glreccountn']").val());
		// 										var num_on_page = 41;
		// 										var zeros;
		// 										while (num_on_page < recount_num){
		// 											if(num_on_page < 100){
		// 												zeros = "00";
		// 											} else {
		// 												zeros = "0";
		// 											}
		// 											var newUrl = `${hostUrl}/JobsQueryByLocationServlet?&allbin=${bin_num}&glreccountn=0000000${recount_num}&allboroughname=&allstrt=&allnumbhous=&jobsubmdate_month=&jobsubmdate_date=&jobsubmdate_year=&allinquirytype=BXS1PRA3&alljobtype=&passdocnumber=&stcodekey=&ckbunique=&allcount=${zeros}${num_on_page}`;
		// 											var moreMoreOptions = {
		// 											  url: newUrl,
		// 											  headers: agent
		// 											};
		// 											request(moreMoreOptions, function(errorTwo, responseTwo, bodyTwo){
		// 												var $ = cheerio.load(bodyTwo);
		// 												$('body').each(function(){
		// 													var table = $(this).find("table").eq(5);
		// 													table.each(function(){
		// 														var tr = $(this).find("tr");
		// 														tr.each(function(){
		// 															if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") > -1){
		// 																var dataAgain = {
		// 																	bin_num: bin_num,
		// 																	date: $(this).find("td").eq(0).text(),
		// 																	job_num: $(this).find("td").eq(1).text().trim(),
		// 																	doc_num: $(this).find("td").eq(2).text(),
		// 																	job_type: $(this).find("td").eq(3).text(),
		// 																	job_status: $(this).find("td").eq(4).text(),
		// 																	status_date: $(this).find("td").eq(5).text(),
		// 																	license_num: $(this).find("td").eq(6).text(),
		// 																	applicant: $(this).find("td").eq(7).text(),
		// 																	signed_off: true,
		// 																	input_res: inputRes
		// 																}
		// 																Building.insertMany(dataAgain);
		// 															}
		// 															if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") == -1 && $(this).find("td").eq(0).text().indexOf("/") > -1){
		// 																var dataAgain = {
		// 																	bin_num: bin_num,
		// 																	date: $(this).find("td").eq(0).text(),
		// 																	job_num: $(this).find("td").eq(1).text().trim(),
		// 																	doc_num: $(this).find("td").eq(2).text(),
		// 																	job_type: $(this).find("td").eq(3).text(),
		// 																	job_status: $(this).find("td").eq(4).text(),
		// 																	status_date: $(this).find("td").eq(5).text(),
		// 																	license_num: $(this).find("td").eq(6).text(),
		// 																	applicant: $(this).find("td").eq(7).text(),
		// 																	signed_off: false,
		// 																	input_res: inputRes
		// 																}
		// 																Building.insertMany(dataAgain);
		// 															}
		// 															if($(this).find("td").eq(4).text().indexOf("X SIGNED OFF") == -1 && $(this).find("td").eq(5).text().indexOf("/") > -1){
		// 																var data = {
		// 																	bin_num: bin_num,
		// 																	date: $(this).find("td").eq(0).text(),
		// 																	job_num: $(this).find("td").eq(1).text().trim(),
		// 																	doc_num: $(this).find("td").eq(2).text(),
		// 																	job_type: $(this).find("td").eq(3).text(),
		// 																	job_status: $(this).find("td").eq(4).text(),
		// 																	status_date: $(this).find("td").eq(5).text(),
		// 																	license_num: $(this).find("td").eq(6).text(),
		// 																	applicant: $(this).find("td").eq(7).text(),
		// 																	signed_off: false,
		// 																	input_res: inputRes
		// 																}
		// 																Building.insertMany(data);
		// 															}
		// 														});
		// 													});
		// 												});
		// 											});
		// 											num_on_page += 40;
		// 										}
		// 									}
		// 								});
		// 							});
		// 						})
		// 					});
		// 				}
		// 			})
		// 		});
		// 	});
		// 	upNumTwo++;
		// }
		res.json({result: req.body.boro + " " + req.body.house_num + " " + req.body.street})
	} catch (errz) {
		console.log(errz)
	}
});

router.get('/get-building', (req,res) => {
	Building.find({}).exec((err, results) => {
		res.json(results)
	});
})



module.exports = router;