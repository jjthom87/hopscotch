$(document).ready(function(){

	$('#results-table').hide();

	var trArr;
	var trNamesAndLicenses;
	var upNum;

	$('#loader').hide();
	$('#search-form').on('submit', function(e){
		trArr = [];
		trNamesAndLicenses = [];
		upNum = 0;

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
				$("#export-to-csv-div").remove();
				$('#applicant-select').remove();
				$('#license-select').remove();
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
						    arrResult[ item.applicant.toLowerCase() + " - " + item.bin_num + " - " + item.date + " - " + item.doc_num + " - " + item.input_res + " - " + item.job_num + " - " + item.job_status + " - " + item.job_type + " - " + item.license_num + " - " + item.signed_off + " - " + item.status_date ] = item;
						}
						var i = 0;
						var nonDuplicatedArray = [];    
						for(var item in arrResult) {
						    nonDuplicatedArray[i++] = arrResult[item];
						}
						var finalArr = sortBy(nonDuplicatedArray);
						//console.log(finalArr.length);

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

						var select = $("<select id='applicant-select'>");
						select.addClass('form-control archie-select');
						var disabledAppOption = $("<option>");
						disabledAppOption.attr('disabled', true);
						disabledAppOption.text("Select Applicant");
						var defaultOption = $("<option>");
						defaultOption.attr('value', 'all');
						defaultOption.text("All Applicants");
						select.append(disabledAppOption).append(defaultOption);
						var applicants = [];
						finalArrTwo.forEach((arr) => {
							applicants.push(arr.applicant);
						});
						var option;
						applicants.sort().forEach((app) => {
							option = $("<option>");
							option.attr('value', app);
							option.text(app);
							select.append(option);
						});

						var licenseSelect = $("<select id='license-select'>");
						licenseSelect.addClass('form-control archie-select');
						var disabledLicOption = $("<option>");
						disabledLicOption.attr('disabled', true);
						disabledLicOption.text("Select License");
						var defaultLicOption = $("<option>");
						defaultLicOption.attr('value', 'all');
						defaultLicOption.text("All License #s");
						licenseSelect.append(disabledLicOption).append(defaultLicOption);
						var licOption;
						finalArrThree.forEach((app) => {
							licOption = $("<option>");
							licOption.attr('value', app.license_num);
							licOption.text(app.license_num);
							licenseSelect.append(licOption);
						});


						$('#applicant-select-div').append(select)
						$('#license-select-div').append(licenseSelect);

						var exportDiv = $('<div id="export-to-csv-div">')
						var exportA = $('<a>',{
							class: "export",
							href: "#"
						});
						var exportButton = $('<button>',{
							class: "btn btn-primary",
							text: "Export to CSV"
						});
						exportA.append(exportButton);
						exportDiv.append(exportA);
						$('#export-div').append(exportDiv);

						var so_arr = ["All", "Yes", "No"]
						var soInputDiv = $('<div id="so_input_div">');
						soInputDiv.css({margin: '5px',display: 'inline-flex'});
						var str = "Signed Off: "
						for(var i = 0; i < so_arr.length; i++){
							str += "<input class='archie-select' type='radio' name='signed_off' style='margin: 5px;' value=" + so_arr[i] + "> " + so_arr[i] + "<br>"
						}
						soInputDiv.append(str);
						$('#signed_off-div').append(soInputDiv);

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
				}, 6000);
				$('#loader').show();
				$('#pac-input').val('');
				setTimeout(() => {
					$('#loader').hide();
				}, 10000)
			}
		});
	});

	$(document).on('change', '.archie-select', () => {
		var so_radio = $("input[name='signed_off']:checked").val();

		if(upNum == 0){
			$('#tbody').each(() => {
				trArr.push($(this).find("tr"));
				var tr = $(this).find("tr");
				tr.each(function(){
					trNamesAndLicenses.push({name: $(this).find("td").eq(6).text(), license_num: $(this).find("td").eq(5).text(), signed_off: $(this).find("td").eq(3).text()})
				});
			});
			upNum++;
		}

		if(so_radio === "All" || !so_radio){
			if($('#applicant-select').val() === "all" && $('#license-select').val() === "all"){
				var tnlDupRem = {};
				for (var i = 0, n = trNamesAndLicenses.length; i < n; i++) {
				    var tnlItem = trNamesAndLicenses[i];
				    tnlDupRem[ tnlItem.name.toLowerCase() + " - " + tnlItem.license_num ] = tnlItem;
				}
				var i = 0;
				var nonDuplicatedArrayFour = [];    
				for(var tnlItem in tnlDupRem) {
				    nonDuplicatedArrayFour[i++] = tnlDupRem[tnlItem];
				}
				var trNames = [];
				var trLicenses = [];
				for(var i = 0; i < nonDuplicatedArrayFour.length; i++){
					trNames.push(nonDuplicatedArrayFour[i].name);
					trLicenses.push(nonDuplicatedArrayFour[i].license_num);
				}

				var uniqueNames = [];
				$.each(trNames, function(i, el){
				    if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
				});

				var uniqueLicenses = [];
				$.each(trLicenses, function(i, el){
				    if($.inArray(el, uniqueLicenses) === -1) uniqueLicenses.push(el);
				});

				uniqueNames.sort();
				uniqueLicenses.sort();

				var elements = [];

				$('#license-select').remove();
				var licenseSelect = $("<select id='license-select'>");
				licenseSelect.addClass('form-control archie-select');
				var disabledLicOption = $("<option>");
				disabledLicOption.attr('disabled', true);
				disabledLicOption.text("Select License");
				var defaultLicOption = $("<option>");
				defaultLicOption.attr('value', 'all');
				defaultLicOption.text("All License #s");
				licenseSelect.append(disabledLicOption).append(defaultLicOption);

				$('#applicant-select').remove();
				var select = $("<select id='applicant-select'>");
				select.addClass('form-control archie-select');
				var disabledOption = $("<option>");
				disabledOption.attr('disabled', true);
				disabledOption.text("Select Applicant");
				var defaultOption = $("<option>");
				defaultOption.attr('value', 'all');
				defaultOption.text("All Applicants");
				select.append(disabledOption).append(defaultOption);

				for(var i = 1; i < trArr[0].length; i++){
					elements.push(trArr[0][i]);
				}

				for(var i = 1; i < uniqueNames.length; i++){
					var option;
					option = $("<option>");
					option.attr('value', uniqueNames[i]);
					option.text(uniqueNames[i]);
					select.append(option);
				}

				for(var i = 1; i < uniqueLicenses.length; i++){
					var licOption;
					licOption = $("<option>");
					licOption.attr('value', uniqueLicenses[i]);
					licOption.text(uniqueLicenses[i]);
					licenseSelect.append(licOption);
				}

				$('#applicant-select-div').append(select)
				$('#license-select-div').append(licenseSelect)
				$('#tbody').append(elements);	
			} else if ($('#applicant-select').val() !== "all" && $('#license-select').val() === "all") {
				var newTr = [];
				$('#license-select').remove();
				var licenseSelect = $("<select id='license-select'>");
				licenseSelect.addClass('form-control archie-select');
				var disabledLicOption = $("<option>");
				disabledLicOption.attr('disabled', true);
				disabledLicOption.text("Select License");
				var defaultLicOption = $("<option>");
				defaultLicOption.attr('value', 'all');
				defaultLicOption.text("All License #s");
				licenseSelect.append(disabledLicOption).append(defaultLicOption);

				var licArray = [];
				for(var i = 1; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].name.toLowerCase() === $('#applicant-select').val().toLowerCase()){
						newTr.push(trArr[0][i]);
						licArray.push({license_num: trNamesAndLicenses[i].license_num})
					}
				}
				var licResultThree = {};
				for (var i = 0, n = licArray.length; i < n; i++) {
				    var licItem = licArray[i];
				    licResultThree[ licItem.license_num ] = licItem;
				}
				var i = 0;
				var nonDuplicatedLicArray = [];    
				for(var licItem in licResultThree) {
				    nonDuplicatedLicArray[i++] = licResultThree[licItem];
				}

				var finalLicNonDupArray = [];
				$.each(nonDuplicatedLicArray, function(i, el){
				    if($.inArray(el, finalLicNonDupArray) === -1) finalLicNonDupArray.push(el);
				});

				for(var i = 0; i < finalLicNonDupArray.length; i++){
					var licOption = $("<option>");
					licOption.attr('value', finalLicNonDupArray[i].license_num);
					licOption.text(finalLicNonDupArray[i].license_num);
					licenseSelect.append(licOption);
				}

				$('#license-select-div').append(licenseSelect)

				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			} else if ($('#applicant-select').val() === "all" && $('#license-select').val() !== "all") {
				var newTr = [];
				$('#applicant-select').remove();
				var applicantSelect = $("<select id='applicant-select'>");
				applicantSelect.addClass('form-control archie-select');
				var disabledAppOption = $("<option>");
				disabledAppOption.attr('disabled', true);
				disabledAppOption.text("Select Applicant");
				var defaultAppOption = $("<option>");
				defaultAppOption.attr('value', 'all');
				defaultAppOption.text("All Applicants");
				applicantSelect.append(disabledAppOption).append(defaultAppOption);

				var appArray = [];
				for(var i = 1; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].license_num === $('#license-select').val()){
						newTr.push(trArr[0][i]);
						appArray.push({applicant: trNamesAndLicenses[i].name})
					}
				}
				var appResultThree = {};
				for (var i = 0, n = appArray.length; i < n; i++) {
				    var appItem = appArray[i];
				    appResultThree[ appItem.applicant.toLowerCase() ] = appItem;
				}
				var i = 0;
				var nonDuplicatedAppArray = [];    
				for(var appItem in appResultThree) {
				    nonDuplicatedAppArray[i++] = appResultThree[appItem];
				}

				var finalAppNonDupArray = [];
				$.each(nonDuplicatedAppArray, function(i, el){
				    if($.inArray(el, finalAppNonDupArray) === -1) finalAppNonDupArray.push(el);
				});

				for(var i = 0; i < finalAppNonDupArray.length; i++){
					var appOption = $("<option>");
					appOption.attr('value', finalAppNonDupArray[i].applicant);
					appOption.text(finalAppNonDupArray[i].applicant);
					applicantSelect.append(appOption);
				}

				$('#applicant-select-div').append(applicantSelect);

				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			} else if ($('#applicant-select').val() !== "all" && $('#license-select').val() !== "all") {
				var newTr = [];
				for(var i = 0; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].license_num === $('#license-select').val() && trNamesAndLicenses[i].name.toLowerCase() === $('#applicant-select').val().toLowerCase()){
						newTr.push(trArr[0][i]);
					}
				}
				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			}
		} else if (so_radio === "Yes"){
			if($('#applicant-select').val() === "all" && $('#license-select').val() === "all"){
				var newTr = [];
				$('#license-select').remove();
				var licenseSelect = $("<select id='license-select'>");
				licenseSelect.addClass('form-control archie-select');
				var disabledLicOption = $("<option>");
				disabledLicOption.attr('disabled', true);
				disabledLicOption.text("Select License");
				var defaultLicOption = $("<option>");
				defaultLicOption.attr('value', 'all');
				defaultLicOption.text("All License #s");
				licenseSelect.append(disabledLicOption).append(defaultLicOption);

				$('#applicant-select').remove();
				var applicantSelect = $("<select id='applicant-select'>");
				applicantSelect.addClass('form-control archie-select');
				var disabledAppOption = $("<option>");
				disabledAppOption.attr('disabled', true);
				disabledAppOption.text("Select Applicant");
				var defaultAppOption = $("<option>");
				defaultAppOption.attr('value', 'all');
				defaultAppOption.text("All Applicants");
				applicantSelect.append(disabledAppOption).append(defaultAppOption);

				var licArray = [];
				var appArray = [];
				for(var i = 1; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].signed_off.indexOf('X SIGNED OFF') > -1){
						newTr.push(trArr[0][i]);
						licArray.push({license_num: trNamesAndLicenses[i].license_num});
						appArray.push({applicant: trNamesAndLicenses[i].name});
					}
				}

				var appResultFour = {};
				for (var i = 0, n = appArray.length; i < n; i++) {
				    var appItem = appArray[i];
				    appResultFour[ appItem.applicant ] = appItem;
				}
				var i = 0;
				var nonDuplicatedAppArray = [];    
				for(var appItem in appResultFour) {
				    nonDuplicatedAppArray[i++] = appResultFour[appItem];
				}
				var finalAppNonDupArray = [];
				$.each(nonDuplicatedAppArray, function(i, el){
				    if($.inArray(el, finalAppNonDupArray) === -1) finalAppNonDupArray.push(el);
				});
				for(var i = 0; i < finalAppNonDupArray.length; i++){
					var appOption = $("<option>");
					appOption.attr('value', finalAppNonDupArray[i].applicant);
					appOption.text(finalAppNonDupArray[i].applicant);
					applicantSelect.append(appOption);
				}

				var licResultThree = {};
				for (var i = 0, n = licArray.length; i < n; i++) {
				    var licItem = licArray[i];
				    licResultThree[ licItem.license_num ] = licItem;
				}
				var i = 0;
				var nonDuplicatedLicArray = [];    
				for(var licItem in licResultThree) {
				    nonDuplicatedLicArray[i++] = licResultThree[licItem];
				}
				var finalLicNonDupArray = [];
				$.each(nonDuplicatedLicArray, function(i, el){
				    if($.inArray(el, finalLicNonDupArray) === -1) finalLicNonDupArray.push(el);
				});
				for(var i = 0; i < finalLicNonDupArray.length; i++){
					var licOption = $("<option>");
					licOption.attr('value', finalLicNonDupArray[i].license_num);
					licOption.text(finalLicNonDupArray[i].license_num);
					licenseSelect.append(licOption);
				}

				$('#license-select-div').append(licenseSelect);
				$('#applicant-select-div').append(applicantSelect);
				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}	
			} else if ($('#applicant-select').val() !== "all" && $('#license-select').val() === "all") {
				var newTr = [];

				$('#license-select').remove();
				var licenseSelect = $("<select id='license-select'>");
				licenseSelect.addClass('form-control archie-select');
				var disabledLicOption = $("<option>");
				disabledLicOption.attr('disabled', true);
				disabledLicOption.text("Select License");
				var defaultLicOption = $("<option>");
				defaultLicOption.attr('value', 'all');
				defaultLicOption.text("All License #s");
				licenseSelect.append(disabledLicOption).append(defaultLicOption);

				var licArray = [];
				for(var i = 1; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].name.toLowerCase() === $('#applicant-select').val().toLowerCase() && trNamesAndLicenses[i].signed_off.indexOf('X SIGNED OFF') > -1){
						newTr.push(trArr[0][i]);
						licArray.push({license_num: trNamesAndLicenses[i].license_num});
					}
				}

				var licResultThree = {};
				for (var i = 0, n = licArray.length; i < n; i++) {
				    var licItem = licArray[i];
				    licResultThree[ licItem.license_num ] = licItem;
				}
				var i = 0;
				var nonDuplicatedLicArray = [];    
				for(var licItem in licResultThree) {
				    nonDuplicatedLicArray[i++] = licResultThree[licItem];
				}
				var finalLicNonDupArray = [];
				$.each(nonDuplicatedLicArray, function(i, el){
				    if($.inArray(el, finalLicNonDupArray) === -1) finalLicNonDupArray.push(el);
				});
				for(var i = 0; i < finalLicNonDupArray.length; i++){
					var licOption = $("<option>");
					licOption.attr('value', finalLicNonDupArray[i].license_num);
					licOption.text(finalLicNonDupArray[i].license_num);
					licenseSelect.append(licOption);
				}

				$('#license-select-div').append(licenseSelect);

				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			} else if ($('#applicant-select').val() === "all" && $('#license-select').val() !== "all") {
				var newTr = [];
				$('#applicant-select').remove();
				var applicantSelect = $("<select id='applicant-select'>");
				applicantSelect.addClass('form-control archie-select');
				var disabledAppOption = $("<option>");
				disabledAppOption.attr('disabled', true);
				disabledAppOption.text("Select Applicant");
				var defaultAppOption = $("<option>");
				defaultAppOption.attr('value', 'all');
				defaultAppOption.text("All Applicants");
				applicantSelect.append(disabledAppOption).append(defaultAppOption);

				var appArray = [];
				for(var i = 0; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].license_num === $('#license-select').val() && trNamesAndLicenses[i].signed_off.indexOf('X SIGNED OFF') > -1){
						newTr.push(trArr[0][i]);
						appArray.push({applicant: trNamesAndLicenses[i].name})
					}
				}
				var appResultThree = {};
				for (var i = 0, n = appArray.length; i < n; i++) {
				    var appItem = appArray[i];
				    appResultThree[ appItem.applicant.toLowerCase() ] = appItem;
				}
				var i = 0;
				var nonDuplicatedAppArray = [];    
				for(var appItem in appResultThree) {
				    nonDuplicatedAppArray[i++] = appResultThree[appItem];
				}

				var finalAppNonDupArray = [];
				$.each(nonDuplicatedAppArray, function(i, el){
				    if($.inArray(el, finalAppNonDupArray) === -1) finalAppNonDupArray.push(el);
				});

				for(var i = 0; i < finalAppNonDupArray.length; i++){
					var appOption = $("<option>");
					appOption.attr('value', finalAppNonDupArray[i].applicant);
					appOption.text(finalAppNonDupArray[i].applicant);
					applicantSelect.append(appOption);
				}

				$('#applicant-select-div').append(applicantSelect);

				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			} else if ($('#applicant-select').val() !== "all" && $('#license-select').val() !== "all") {
				var newTr = [];
				for(var i = 0; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].license_num === $('#license-select').val() && trNamesAndLicenses[i].name.toLowerCase() === $('#applicant-select').val().toLowerCase() && trNamesAndLicenses[i].signed_off.indexOf('X SIGNED OFF') > -1){
						newTr.push(trArr[0][i]);
					}
				}
				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			}
		} else if (so_radio === "No"){
			if($('#applicant-select').val() === "all" && $('#license-select').val() === "all"){
				var newTr = [];
				$('#license-select').remove();
				var licenseSelect = $("<select id='license-select'>");
				licenseSelect.addClass('form-control archie-select');
				var disabledLicOption = $("<option>");
				disabledLicOption.attr('disabled', true);
				disabledLicOption.text("Select License");
				var defaultLicOption = $("<option>");
				defaultLicOption.attr('value', 'all');
				defaultLicOption.text("All License #s");
				licenseSelect.append(disabledLicOption).append(defaultLicOption);

				$('#applicant-select').remove();
				var applicantSelect = $("<select id='applicant-select'>");
				applicantSelect.addClass('form-control archie-select');
				var disabledAppOption = $("<option>");
				disabledAppOption.attr('disabled', true);
				disabledAppOption.text("Select Applicant");
				var defaultAppOption = $("<option>");
				defaultAppOption.attr('value', 'all');
				defaultAppOption.text("All Applicants");
				applicantSelect.append(disabledAppOption).append(defaultAppOption);

				var licArray = [];
				var appArray = [];
				for(var i = 1; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].signed_off.indexOf('X SIGNED OFF') == -1){
						newTr.push(trArr[0][i]);
						licArray.push({license_num: trNamesAndLicenses[i].license_num});
						appArray.push({applicant: trNamesAndLicenses[i].name});
					}
				}

				var appResultFour = {};
				for (var i = 0, n = appArray.length; i < n; i++) {
				    var appItem = appArray[i];
				    appResultFour[ appItem.applicant ] = appItem;
				}
				var i = 0;
				var nonDuplicatedAppArray = [];    
				for(var appItem in appResultFour) {
				    nonDuplicatedAppArray[i++] = appResultFour[appItem];
				}
				var finalAppNonDupArray = [];
				$.each(nonDuplicatedAppArray, function(i, el){
				    if($.inArray(el, finalAppNonDupArray) === -1) finalAppNonDupArray.push(el);
				});
				for(var i = 0; i < finalAppNonDupArray.length; i++){
					var appOption = $("<option>");
					appOption.attr('value', finalAppNonDupArray[i].applicant);
					appOption.text(finalAppNonDupArray[i].applicant);
					applicantSelect.append(appOption);
				}

				var licResultThree = {};
				for (var i = 0, n = licArray.length; i < n; i++) {
				    var licItem = licArray[i];
				    licResultThree[ licItem.license_num ] = licItem;
				}
				var i = 0;
				var nonDuplicatedLicArray = [];    
				for(var licItem in licResultThree) {
				    nonDuplicatedLicArray[i++] = licResultThree[licItem];
				}
				var finalLicNonDupArray = [];
				$.each(nonDuplicatedLicArray, function(i, el){
				    if($.inArray(el, finalLicNonDupArray) === -1) finalLicNonDupArray.push(el);
				});
				for(var i = 0; i < finalLicNonDupArray.length; i++){
					var licOption = $("<option>");
					licOption.attr('value', finalLicNonDupArray[i].license_num);
					licOption.text(finalLicNonDupArray[i].license_num);
					licenseSelect.append(licOption);
				}

				$('#license-select-div').append(licenseSelect);
				$('#applicant-select-div').append(applicantSelect);
				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}	
			} else if ($('#applicant-select').val() !== "all" && $('#license-select').val() === "all") {
				var newTr = [];

				$('#license-select').remove();
				var licenseSelect = $("<select id='license-select'>");
				licenseSelect.addClass('form-control archie-select');
				var disabledLicOption = $("<option>");
				disabledLicOption.attr('disabled', true);
				disabledLicOption.text("Select License");
				var defaultLicOption = $("<option>");
				defaultLicOption.attr('value', 'all');
				defaultLicOption.text("All License #s");
				licenseSelect.append(disabledLicOption).append(defaultLicOption);

				var licArray = [];
				for(var i = 1; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].name.toLowerCase() === $('#applicant-select').val().toLowerCase() && trNamesAndLicenses[i].signed_off.indexOf('X SIGNED OFF') == -1){
						newTr.push(trArr[0][i]);
						licArray.push({license_num: trNamesAndLicenses[i].license_num});
					}
				}

				var licResultThree = {};
				for (var i = 0, n = licArray.length; i < n; i++) {
				    var licItem = licArray[i];
				    licResultThree[ licItem.license_num ] = licItem;
				}
				var i = 0;
				var nonDuplicatedLicArray = [];    
				for(var licItem in licResultThree) {
				    nonDuplicatedLicArray[i++] = licResultThree[licItem];
				}
				var finalLicNonDupArray = [];
				$.each(nonDuplicatedLicArray, function(i, el){
				    if($.inArray(el, finalLicNonDupArray) === -1) finalLicNonDupArray.push(el);
				});
				for(var i = 0; i < finalLicNonDupArray.length; i++){
					var licOption = $("<option>");
					licOption.attr('value', finalLicNonDupArray[i].license_num);
					licOption.text(finalLicNonDupArray[i].license_num);
					licenseSelect.append(licOption);
				}

				$('#license-select-div').append(licenseSelect);

				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			} else if ($('#applicant-select').val() === "all" && $('#license-select').val() !== "all") {
				var newTr = [];
				$('#applicant-select').remove();
				var applicantSelect = $("<select id='applicant-select'>");
				applicantSelect.addClass('form-control archie-select');
				var disabledAppOption = $("<option>");
				disabledAppOption.attr('disabled', true);
				disabledAppOption.text("Select Applicant");
				var defaultAppOption = $("<option>");
				defaultAppOption.attr('value', 'all');
				defaultAppOption.text("All Applicants");
				applicantSelect.append(disabledAppOption).append(defaultAppOption);

				var appArray = [];
				for(var i = 0; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].license_num === $('#license-select').val() && trNamesAndLicenses[i].signed_off.indexOf('X SIGNED OFF') == -1){
						newTr.push(trArr[0][i]);
						appArray.push({applicant: trNamesAndLicenses[i].name})
					}
				}
				var appResultThree = {};
				for (var i = 0, n = appArray.length; i < n; i++) {
				    var appItem = appArray[i];
				    appResultThree[ appItem.applicant.toLowerCase() ] = appItem;
				}
				var i = 0;
				var nonDuplicatedAppArray = [];    
				for(var appItem in appResultThree) {
				    nonDuplicatedAppArray[i++] = appResultThree[appItem];
				}

				var finalAppNonDupArray = [];
				$.each(nonDuplicatedAppArray, function(i, el){
				    if($.inArray(el, finalAppNonDupArray) === -1) finalAppNonDupArray.push(el);
				});

				for(var i = 0; i < finalAppNonDupArray.length; i++){
					var appOption = $("<option>");
					appOption.attr('value', finalAppNonDupArray[i].applicant);
					appOption.text(finalAppNonDupArray[i].applicant);
					applicantSelect.append(appOption);
				}

				$('#applicant-select-div').append(applicantSelect);

				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			} else if ($('#applicant-select').val() !== "all" && $('#license-select').val() !== "all") {
				var newTr = [];
				for(var i = 0; i < trArr[0].length; i++){
					if(trNamesAndLicenses[i].license_num === $('#license-select').val() && trNamesAndLicenses[i].name.toLowerCase() === $('#applicant-select').val().toLowerCase() && trNamesAndLicenses[i].signed_off.indexOf('X SIGNED OFF') == -1){
						newTr.push(trArr[0][i]);
					}
				}
				$("#results-table > tbody").empty();
				for(var i = 0; i < newTr.length; i++){
					$('#tbody').append(newTr[i]);
				}
			}
		}
	});

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

	function exportTableToCSV(filename) {

		var $rows = $('#results-table').find('tr:has(th,td)'),

		  tmpColDelim = String.fromCharCode(11),
		  tmpRowDelim = String.fromCharCode(0),

		  colDelim = '","',
		  rowDelim = '"\r\n"',
		  csv = '"' + $rows.map(function(i, row) {
		    var $row = $(row),
		      $cols = $row.find('th,td');

		    return $cols.map(function(j, col) {
		      var $col = $(col),
		        text = $col.text();

		      return text.replace(/"/g, '""');

		    }).get().join(tmpColDelim);

		  }).get().join(tmpRowDelim)
		  .split(tmpRowDelim).join(rowDelim)
		  .split(tmpColDelim).join(colDelim) + '"';
		if (false && window.navigator.msSaveBlob) {

		  var blob = new Blob([decodeURIComponent(csv)], {
		    type: 'text/csv;charset=utf8'
		  });

		  window.navigator.msSaveBlob(blob, filename);

		} else if (window.Blob && window.URL) {    
		  var blob = new Blob([csv], {
		    type: 'text/csv;charset=utf-8'
		  });
		  var csvUrl = URL.createObjectURL(blob);
		  $(this)
		    .attr({
		      'download': filename,
		      'href': csvUrl
		    });
		} else {
		  var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
		  $(this)
		    .attr({
		      'download': filename,
		      'href': csvData,
		      'target': '_blank'
		    });
		}
	}

	$(document).on('click', '.export', function(event) {
		var args = ['export.csv'];
		exportTableToCSV.apply(this, args);
	});

});