app.service("JiraServiceCustom", ["$rootScope", "$http", function($rootScope, $http) {
	
	this.internalIssues = function (user) {
		var url = $rootScope._server + "/rest/api/2/search?startIndex=0&jql=(component+=+INTERNO)";
		return $http.get(url);
	};
	
}]);

app.service("JiraService", ["$rootScope", "$http", "TextFactory", function($rootScope, $http, TextFactory) {
	
	this.login = function (user, pass) {
		var obj = {
            username: user,
            password: pass
        };
        return $http.post($rootScope._server + "/rest/auth/1/session", obj);
	};
	
	this.logout = function () {
        return $http.delete($rootScope._server + "/rest/auth/1/session");
	};
	
	this.profile = function () {
		var url = $rootScope._server + "/rest/auth/1/session"
        return $http.get(url);
    };
	
	this.issuesByAssignee = function (user) {
		var url = $rootScope._server + "/rest/api/2/search?startIndex=0&jql=(assignee={0}+or+watcher={1})+and+resolution=Unresolved&fields=key&maxResults=1000";
		url = TextFactory.format(url, [user,user]);
		return $http.get(url);
	};
	
	this.issues = function (user, dateIni, dateEnd) {
		var url = $rootScope._server + "/rest/api/2/search?startIndex=0&jql=issueFunction+in+workLogged(%22by+{0}+after+{1}%2F{2}%2F{3}+before+{4}%2F{5}%2F{6}%22)&fields=key&maxResults=1000";
		url = TextFactory.format(url, [user, dateIni.getFullYear(), dateIni.getMonth()+1, dateIni.getDate(), dateEnd.getFullYear(), dateEnd.getMonth()+1, dateEnd.getDate()]);
		return $http.get(url);
	};
	
	this.issueInfo = function (code) {
		var url = $rootScope._server + "/rest/api/2/issue/{0}";
		url = TextFactory.format(url, [code]);
		return $http.get(url);
	};
	
	this.worklog = function (task) {
		var url = $rootScope._server + "/rest/api/2/issue/{0}/worklog";
		url = TextFactory.format(url, [task]);
		return $http.get(url);
	};
	
	this.addWorklog = function (task, date, time, comment) {
		var url = $rootScope._server + "/rest/api/2/issue/{0}/worklog?adjustEstimate=auto";
		url = TextFactory.format(url, [task]);
		var data = {
			"comment": comment,
			"started": date.toISOString().replace("Z","+0000"),
			"created": (new Date()).toISOString().replace("Z","+0000"),
			"timeSpent": time
		};
		return $http.post(url, data);
	};
	
	this.render = function (issue, text) {
		var url = $rootScope._server + "/rest/api/1.0/render";
		var data = {
			"rendererType": "atlassian-wiki-renderer",
			"unrenderedMarkup": text,
			"issueKey": issue
		};
		return $http.post(url, data);
	};
	
	this.getComments = function (issuekey) {
		var url = $rootScope._server + "/rest/api/2/issue/{0}/comment";
		url = TextFactory.format(url, [issuekey]);
		return $http.get(url);
	};

}]);

app.service("JiraTempoService", ["$rootScope", "$http", "TextFactory", function($rootScope, $http, TextFactory) {
	
	this.getTimesheetApprovalStatuses = function (user) {
		var url = $rootScope._server + "/rest/tempo-timesheets/3/timesheet-approval/approval-statuses/?username={0}&numberOfPeriods={1}";
		url = TextFactory.format(url, [user, $rootScope._periods]);
		return $http.get(url);
	};
	
	this.getSupervisors = function (user) {
		var url = $rootScope._server + "/rest/tempo-rest/2.0/planning/getSupervisors?username={0}";
		url = TextFactory.format(url, [user]);
		return $http.get(url);
	};
	
	this.sendStatus = function (user, period, reviewer) {
		var url = $rootScope._server + "/rest/tempo-timesheets/3/timesheet-approval";
		var obj = {
			action: {
				name: "submit", 
				comment: "", 
				reviewer: {
					name: reviewer
				}
			},
			numberOfInvalidWorklogs: 0,
			period: {
				dateFrom: period
			},
			user: {
				name: user
			}
		};
		return $http.post(url, obj);
	}
	
	this.getTimesheetWorklogs = function (user) {
		var url = $rootScope._server + "/rest/tempo-timesheets/3/worklogs/?username={0}dateFrom=2017-05-19";
		url = TextFactory.format(url, [user]);
		return $http.get(url);
	};

}]);