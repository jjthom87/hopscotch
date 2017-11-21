$(document).ready(function(){

	$('#results-table').hide();

	var arr;
	$('#loader').hide();
	$('#search-form').on('submit', function(e){
		e.preventDefault();
		$("#results-table > tbody").empty();

		var split = $("#pac-input").val().split(",");
		for(var i = 0; i < split.length; i++){
			split[i] = split[i].trim();
		}

		var boro = boroughIt(split[1]);
		var house_num = split[0].split(" ")[0];
		var street = split[0].split(" ").slice(1).join(" ");

		var obj = {boro: boro, house_num: house_num, street: street};
		$.ajax({
			method: 'POST',
			url: '/second-post',
			data: JSON.stringify(obj),
			contentType: 'application/json',
			dataType: 'json',
			success: function(res){
				setTimeout(() => {
					$.ajax({
						method: 'GET',
						url: '/get-building'
					}).then((results) => {
						var manArr = [];
						for(var i = 0; i < results.length; i++){
							if(results[i].input_res === res.result){
								manArr.push(results[i]);
							}
						}
						var arrResult = {};
						for (var i = 0, n = manArr.length; i < n; i++) {
						    var item = manArr[i];
						    arrResult[ item.applicant + " - " + item.bin_num + " - " + item.date + " - " + item.doc_num + " - " + item.input_res + " - " + item.job_num + " - " + item.job_status + " - " + item.job_type + " - " + item.license_num + " - " + item.signed_off + " - " + item.status_date ] = item;
						}
						var i = 0;
						var nonDuplicatedArray = [];    
						for(var item in arrResult) {
						    nonDuplicatedArray[i++] = arrResult[item];
						}
						var finalArr = sortBy(nonDuplicatedArray);
						console.log(finalArr.length);

						var arrResultTwo = {};
						for (var i = 0, n = finalArr.length; i < n; i++) {
						    var itemTwo = finalArr[i];
						    arrResultTwo[ itemTwo.applicant.toLowerCase() ] = itemTwo;
						}
						var i = 0;
						var nonDuplicatedArrayTwo = [];    
						for(var itemTwo in arrResultTwo) {
						    nonDuplicatedArrayTwo[i++] = arrResultTwo[itemTwo];
						}
						var finalArrTwo = sortBy(nonDuplicatedArrayTwo);

						var arrResultThree = {};
						for (var i = 0, n = finalArr.length; i < n; i++) {
						    var itemThree = finalArr[i];
						    arrResultThree[ itemThree.license_num ] = itemThree;
						}
						var i = 0;
						var nonDuplicatedArrayThree = [];    
						for(var itemThree in arrResultThree) {
						    nonDuplicatedArrayThree[i++] = arrResultThree[itemThree];
						}
						var finalArrThree = sortBy(nonDuplicatedArrayThree);

						$('#applicant-select').remove();
						var select = $("<select id='applicant-select'>");
						select.addClass('archie-select');
						var defaultOption = $("<option>");
						defaultOption.attr('value', 'all');
						defaultOption.text("All");
						select.append(defaultOption);
						var option;
						finalArrTwo.forEach((app) => {
							option = $("<option>");
							option.attr('value', app.applicant);
							option.text(app.applicant);
							select.append(option);
						});

						$('#license-select').remove();
						var licenseSelect = $("<select id='license-select'>");
						licenseSelect.addClass('archie-select');
						var defaultLicOption = $("<option>");
						defaultLicOption.attr('value', 'all');
						defaultLicOption.text("All");
						licenseSelect.append(defaultLicOption);
						var licOption;
						finalArrThree.forEach((app) => {
							licOption = $("<option>");
							licOption.attr('value', app.license_num);
							licOption.text(app.license_num);
							licenseSelect.append(licOption);
						});


						$('#select-div').append(select).append(licenseSelect);

						$('#results-table').show();
						$("#results-table > tbody").empty();
						var newRow, dateTd, docTd, jobNumTd, jobStatusTd, jobTypeTd, licNumTd, applicantTd, statusDateTd;
						for(var i = 0; i < finalArr.length; i++){
							newRow = $('<tr class="new-set">');
							dateTd = $('<td>');
							docTd = $('<td>');
							jobNumTd = $('<td>');
							jobStatusTd = $('<td>');
							jobTypeTd = $('<td>');
							licNumTd = $('<td>');
							applicantTd = $('<td>');
							statusDateTd = $('<td>');

							dateTd.text(finalArr[i].date);
							docTd.text(finalArr[i].doc_num);
							jobNumTd.text(finalArr[i].job_num);
							jobStatusTd.text(finalArr[i].job_status);
							jobTypeTd.text(finalArr[i].job_type);
							licNumTd.text(finalArr[i].license_num);
							applicantTd.text(finalArr[i].applicant);
							statusDateTd.text(finalArr[i].status_date);
							newRow.append(dateTd).append(docTd).append(jobNumTd).append(jobStatusTd).append(jobTypeTd).append(licNumTd).append(applicantTd).append(statusDateTd);
							$('#tbody').append(newRow)
						}
					});
				}, 5000);
				$('#loader').show();
				$('#pac-input').val('');
				setTimeout(() => {
					$('#loader').hide();
				}, 7500)
			}
		});
	});

	var trArr = [];
	var trNames = [];
	var upNum = 0;
	$(document).on('change', '#applicant-select', () => {
		if(upNum == 0){
			$('#tbody').each(() => {
				trArr.push($(this).find("tr"));
				var tr = $(this).find("tr");
				tr.each(function(){
					trNames.push($(this).find("td").eq(6).text())
				});
			});
			upNum++;
		}
		if($('#applicant-select').val() === "all"){
			var elements = [];
			for(var i = 1; i < trArr[0].length; i++){
				elements.push(trArr[0][i]);
			}
			$('#tbody').append(elements);	
		} else {
			var newTr = [];
			for(var i = 0; i < trArr[0].length; i++){
				if(trNames[i] === $('#applicant-select').val()){
					newTr.push(trArr[0][i]);
				}
			}
			$("#results-table > tbody").empty();
			for(var i = 0; i < newTr.length; i++){
				$('#tbody').append(newTr[i]);
			}
		}
	});

	var trArrTwo = [];
	var trLicNum = [];
	var upNumTwo = 0;
	$(document).on('change', '#license-select', () => {
		if(upNumTwo == 0){
			$('#tbody').each(() => {
				trArrTwo.push($(this).find("tr"));
				var tr = $(this).find("tr");
				tr.each(function(){
					trLicNum.push($(this).find("td").eq(5).text())
				});
			});
			upNumTwo++;
		}
		console.log(trArrTwo);
		console.log($('#applicant-select').val());
	// 	if($('#applicant-select').val() === "all"){
	// 		var elements = [];
	// 		$("#results-table > tbody").empty();
	// 		for(var i = 1; i < trArr[0].length; i++){
	// 			elements.push(trArr[0][i]);
	// 		}
	// 		$('#tbody').append(elements);	
	// 	} else {
	// 		var newTr = [];
	// 		for(var i = 0; i < trArr[0].length; i++){
	// 			if(trNames[i] === $('#applicant-select').val()){
	// 				newTr.push(trArr[0][i]);
	// 			}
	// 		}
	// 		$("#results-table > tbody").empty();
	// 		for(var i = 0; i < newTr.length; i++){
	// 			$('#tbody').append(newTr[i]);
	// 		}
	// 	}
	})

	const boroughIt = (addr) => {
		switch(addr){
			case 'New York':
				return 'manhattan';
				break;
			default:
				addr = addr.charAt(0).toLowerCase() + addr.substring(1, addr.length)
				return addr;
		}
	}

	function sortBy(ar) {
	  return ar.sort((a, b) => a.license_num === b.license_num ?
	      a.applicant.toString().localeCompare(b.applicant) :
	      a.license_num.toString().localeCompare(b.license_num));
	}

});