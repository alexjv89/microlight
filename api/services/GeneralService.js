const moment = require("moment-timezone");
var getFinancialYear = function (date) {
	if (typeof date == "string") date = new Date(date);
	var fiscalyear = "";

	if (date.getMonth() + 1 <= 3) {
		fiscalyear = date.getFullYear() - 1 + "-" + date.getFullYear();
	} else {
		fiscalyear = date.getFullYear() + "-" + (date.getFullYear() + 1);
	}
	return fiscalyear;
}

var getAllFiles =  function(dirPath, arrayOfFiles) {
	var fs = require('fs');
	const path = require("path");
	var files = fs.readdirSync(dirPath)

	var arrayOfFiles = arrayOfFiles || []

	files.forEach(function(file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
		} else {
			if(file.substring(file.length-3)=='.js')
				arrayOfFiles.push(path.join(dirPath, "/", file))
		}
	})
	return arrayOfFiles
}

module.exports = {
	sails_helper: require("sails-helper"),
	formatNumberWithCurrency: function (options, number) {
		var options = {
			currency: "INR",
			style: "indian",
			precision: "1",
		};
		var sails_helper = require("sails-helper");
		var output = sails_helper.formatNumber(
			number,
			options.style,
			options.precision
		);
		if (output)
			return (
				options.currency +
        " " +
        sails_helper.formatNumber(number, options.style, options.precision)
			);
		else return "";
	},
	filterObject: function (a, filter) {
		// console.log('\n\n\n ---- inside filterObject');
		var b = {};
		if (typeof filter == "string") filter = filter.split(",");
		filter.forEach(function (key) {
			// console.log(key);
			// using clone here so that in key value is an object, we dont want it to be a reference
			if (a[key]) b[key] = _.cloneDeep(a[key]);
		});
		return b;
	},
	// supported input
	// 3_days
	// 1_day
	// 1_hour
	// 2_hours
	// 1_month
	// 2_months
	// 1_week
	// 2_weeks
	// 1_year
	// 2_years
	dueIn: function (input) {
		var time_frame = input.split("_")[1];
		var count = input.split("_")[0];
		var due_in = new Date().getTime();
		if (time_frame == "hour" || time_frame == "hours") {
			due_in = new Date().getTime() + count * 60 * 60 * 1000;
		} else if (time_frame == "day" || time_frame == "days") {
			due_in = new Date().getTime() + count * 24 * 60 * 60 * 1000;
		} else if (time_frame == "week" || time_frame == "weeks") {
			due_in = new Date().getTime() + count * 7 * 24 * 60 * 60 * 1000;
		} else if (time_frame == "month" || time_frame == "months") {
			due_in = new Date().getTime() + count * 30 * 24 * 60 * 60 * 1000;
		} else if (time_frame == "year" || time_frame == "years") {
			due_in = new Date().getTime() + count * 365 * 24 * 60 * 60 * 1000;
		}
		return due_in;
	},
	/**
   * convert a promise to callback
   * @param  {[type]}   promise  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
	p2c: function (promise, callback) {
		promise.then(
			function (result) {
				callback(null, result);
			},
			function (error) {
				callback(error);
			}
		);
	},
	nextStage: function (stages, current_stage) {
		var i = _.findIndex(stages, current_stage);
		var index = -1;
		stages.forEach(function (stage, i) {
			if (stage == current_stage) index = i;
		});

		// no need to check for index being -1. The next stage will be the first stage in that case
		return stages[index + 1];
	},
	prevStage: function (stages, current_stage) {
		var i = _.findIndex(stages, current_stage);
		var index = -1;
		stages.forEach(function (stage, i) {
			if (stage == current_stage) index = i;
		});

		if(index==0 || index==-1) // no previous stage
			return null 
		else
			return stages[index - 1];
	},
	getMonth: function (for_) {
		var month;
		switch (for_.split(" ")[0]) {
		case "Jan":
			month = "January";
			break;
		case "Feb":
			month = "February";
			break;
		case "Mar":
			month = "March";
			break;
		case "Apr":
			month = "April";
			break;
		case "May":
			month = "May";
			break;
		case "Jun":
			month = "June";
			break;
		case "Jul":
			month = "July";
			break;
		case "Aug":
			month = "August";
			break;
		case "Sep":
			month = "September";
			break;
		case "Oct":
			month = "October";
			break;
		case "Nov":
			month = "November";
			break;
		case "Dec":
			month = "December";
			break;
		}
		return month;
	},
	getFinancialYear: getFinancialYear,
	formatDate: function (date) {
		if (typeof date == "string") date = new Date(date);

		return moment(date).format("DD-MM-YYYY");
	},
	convertSchemaValidationErrorToReadableError: function (errors) {
		return (
			"schema validation did not pass - " +
      errors[0].keyword +
      ": " +
      errors[0].dataPath +
      " " +
      errors[0].message +
      " - " +
      JSON.stringify(errors)
		);
	},
	convertPeriodToOurStyle: function (gst_style_period) {
		return (
			new Date(
				gst_style_period.substr(2, 4) + "-" + gst_style_period.substr(0, 2)
			)
				.toDateString()
				.split(" ")[1] +
      " " +
      gst_style_period.substr(2, 4)
		);
	},
	createOrEdit: function (url) {
		var temp = url.split("?")[0].split("/");
		var create_or_edit = "";
		if (temp[temp.length - 1]) create_or_edit = temp[temp.length - 1];
		else create_or_edit = temp[temp.length - 2];

		return create_or_edit.charAt(0).toUpperCase() + create_or_edit.slice(1);
		// returns Edit or Create - notice the caps
	},
	getAllFiles:getAllFiles,
};
