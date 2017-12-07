var app = angular.module("jira",["ngRoute"]);

app.config(function($routeProvider, $locationProvider, $compileProvider, $sceProvider) {
	$routeProvider
		.when("/jira/timesheet", {
			templateUrl: "jira/timesheet/index.html",
			controller: "jiraTimesheetController"
		})
		.when("/jira/timesheet/issue/:issueCode", {
			templateUrl: "jira/timesheet/details.html",
			controller: "jiraTimesheetDetailsController"
		})
		.when("/tempo/approvalstatuses", {
			templateUrl: "tempo/approvalstatuses/index.html",
			controller: "tempoApprovalStatusesController"
		})
		.when("/custom/calendario", {
			templateUrl: "custom/calendario/index.html",
			controller: "jiraCalendarioVacacionesController"
		})
		.when("/configuration", {
			templateUrl: "configuration/index.html",
			controller: "configurationController"
		})
		.when("/help", {
			templateUrl: "help/index.html"
		})
		.when("/error", {
			templateUrl: "error/index.html"
		})
		.when("/login", {
			templateUrl: "login/index.html",
			controller: "loginController"
		});
		
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
	//$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
});

app.filter('WorklogsFilter', function() {
	
	return function(input, date, username) {
		var out = [];
		if (typeof input == 'undefined' || typeof date == 'undefined' || typeof username == 'undefined')
			return out;
		for(var i = 0; i < input.length; i++) {
			if (
				input[i].author.name == username && 
				new Date(input[i].started).getFullYear() == date.getFullYear() &&
				new Date(input[i].started).getMonth()+1 == date.getMonth()+1 &&
				new Date(input[i].started).getDate() == date.getDate()
			)
				out.push(input[i]);
		}
		return out;
	};
	
});