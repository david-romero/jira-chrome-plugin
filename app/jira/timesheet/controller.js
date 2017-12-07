app.controller("jiraTimesheetController", ["$rootScope", "$scope", "$filter", "DateFactory", "TimeFactory", "JiraService",
function($rootScope, $scope, $filter, DateFactory, TimeFactory, JiraService) {

    $scope.user = $rootScope._profile;
    $scope.task = null;
    $scope.taskCount = 0;

    $scope.dateIni = DateFactory.addDays(new Date(), $rootScope._time*(-1)-1);
	$scope.dateEnd = DateFactory.addDays(new Date(), 1);
	
	$scope.issuesAssignee = [];

    $scope.totalWork = [];
	$scope.dateRange = [];
	
	for (var i = $rootScope._time*(-1); i <= 0; i++) {
		$scope.dateRange.push(DateFactory.addDays(new Date(), i));
		$scope.totalWork.push(0);
	};
	
	$scope.timeWorklogEnter = function(keyEvent) {
		if (keyEvent.which === 13)
			$scope.addWorklog(false);
	};
	
	$scope.dateWorklogChange = function (ev) {
		if ($scope.dateWorklog.getDay() == 0 || $scope.dateWorklog.getDay() == 6) {
			alert("No se puede imputar tiempo en fin de semana. Seleccione otra fecha.");
			$scope.dateWorklog = null;
		}
	};

    $scope.$watch('taskCount', function() {
		if ($scope.task != null && $scope.task.issues.length == $scope.taskCount) {
			$scope.updateTotalWork();
		}
    });
	
	$scope.isWeekend = function (date) {
		return DateFactory.isWeekend(date);
	};
	
	$scope.secondsFormat = function (number) {
		return TimeFactory.secondsFormat(number);
	};
	
	$scope.isWeekendClass = function (date) {
		if ($scope.isWeekend(date))
			return "danger";
		else if (date.getDay() === 2 || date.getDay() === 4)
			return "warning";
		else
			return "";
	};

    $scope.updateTotalWork = function() {
		for (var i = 0; i < $scope.totalWork.length; i++) {
			$scope.totalWork[i] = 0;
		};
		for (var i = 0; i < $scope.task.issues.length; i++) {
			for (var j = 0; j < $scope.dateRange.length; j++) {
				var work = $filter('WorklogsFilter')($scope.task.issues[i].worklogs,$scope.dateRange[j],$scope.user.name);
				for (var k = 0; k < work.length; k++) {
					$scope.totalWork[j] += work[k].timeSpentSeconds;
				}
			}
		}
	};

    $scope.getIssueInfo = function (issue) {
		JiraService.issueInfo(issue.key).success(function (data) {
			issue['summary'] = data.fields.summary;
			issue['description'] = data.fields.description;
			issue['status'] = data.fields.status;
			issue['issuetype'] = data.fields.issuetype;
			issue['progress'] = data.fields.progress;
			if (!!data.fields.assignee)
				issue['assignee'] = data.fields.assignee.key;
			else
				issue['assignee'] = null;
			JiraService.render(issue.key,data.fields.description).success(function(data2){
				issue['description'] = data2;
			});
		});
	};
	
	$scope.getWorklog = function (issue,count) {
		JiraService.worklog(issue.key).success(function (data) {
			issue['worklogs'] = []
			for (var i = 0; i < data.worklogs.length; i++) {
				var encontrado = false;
				for (var j = 0; j < issue['worklogs'].length; j++) {
					
					if (
						data.worklogs[i].author.name == issue['worklogs'][j].author.name && 
						new Date(data.worklogs[i].started).getFullYear() == new Date(issue['worklogs'][j].started).getFullYear() &&
						new Date(data.worklogs[i].started).getMonth()+1 == new Date(issue['worklogs'][j].started).getMonth()+1 &&
						new Date(data.worklogs[i].started).getDate() == new Date(issue['worklogs'][j].started).getDate()
					) {
						encontrado = true;
						issue['worklogs'][j].timeSpentSeconds += data.worklogs[i].timeSpentSeconds;
					}
					
				}
				if (!encontrado)
					issue['worklogs'].push(data.worklogs[i]);
			}
			if (count)
				$scope.taskCount = $scope.taskCount + 1;
		});
	};

	$scope.getIssuesAssignee = function () {
		JiraService.issuesByAssignee($scope.user.name).success(function (data) {
			$scope.issuesAssignee = data;
			for (var i = 0; i < $scope.issuesAssignee.issues.length; i++) {
				$scope.getWorklog($scope.issuesAssignee.issues[i], false);
				$scope.getIssueInfo($scope.issuesAssignee.issues[i]);
			}
		});
	};
	
	$scope.addWorklog = function (end) {
		if ($scope.dateWorklog == null || typeof $scope.dateWorklog == 'undefined') {
			alert("El campo FECHA es obligatorio");
			return false;
		};
		if (typeof $scope.timeWorklog == 'undefined' || $scope.timeWorklog.trim() == '') {
			alert("El campo TIEMPO es obligatorio");
			return false;
		}
		JiraService.addWorklog($scope.currentIssueDetail.key, $scope.dateWorklog, $scope.timeWorklog, $scope.commentWorklog).success(function (data) {
			var issue = $filter('filter')($scope.task.issues, { key: $scope.currentIssueDetail.key }, true);
			if (issue.length == 0)
				$scope.task.issues.push($scope.currentIssueDetail);
			$scope.updateWorklogModel($scope.currentIssueDetail.key, $scope.dateWorklog, $scope.timeWorklog);
			$scope.updateTotalWork();
			$scope.timeWorklog = "";
			$scope.commentWorklog = "";
			if (!end) {
				$scope.dateWorklog = null;
				$("#modalTime").modal('hide');
			}
		});
	};
	
	$scope.updateWorklogModel = function (task, date, time) {
		var issue = $filter('filter')($scope.task.issues, { key: task }, true)[0];
		issue.worklogs.push({
			author: {
				name: $scope.user.name
			},
			started: date.toISOString().replace("Z","+0000"),
			timeSpentSeconds: TimeFactory.timeMaskToSeconds(time)
		});
	};
	
	$scope.showModalTime = function (issue, date) {
		$scope.currentIssueDetail = issue;
		$scope.dateWorklog = new Date();
		if (!!date)
			$scope.dateWorklog = date;
		$scope.timeWorklog = "";
		$scope.commentWorklog = "";
		$("#modalTime").modal();
		$("#collapseComment").collapse('hide');
		$('#modalTime').on('shown.bs.modal', function () {
			$('#modalTime_Tiempo').focus();
		});
	};
	
	$scope.showModalSummary = function (issue) {
		$scope.currentIssueDetail = issue;
		$("#modalSummary").modal();
	};
	
	$scope.showModalSearch = function () {
		$scope.selectedAssigneeIssue = null;
		$("#modalSearch").modal();
	};
	
    $scope.getIssues = function () {
		$scope.taskCount = 0;
		JiraService.issues($scope.user.name, $scope.dateIni, $scope.dateEnd).success(function (data) {
			$scope.task = data;
			for (var i = 0; i < $scope.task.issues.length; i++) {
				$scope.getWorklog($scope.task.issues[i],true);
				$scope.getIssueInfo($scope.task.issues[i]);
			}
		});
	};
	
	$scope.refreshIssues = function () {
		$scope.dateIni = DateFactory.addDays(new Date(), $rootScope._time*(-1)-1);
		$scope.dateEnd = DateFactory.addDays(new Date(), 1);
		$scope.totalWork = [];
		$scope.dateRange = [];
		for (var i = $rootScope._time*(-1); i <= 0; i++) {
			$scope.dateRange.push(DateFactory.addDays(new Date(), i));
			$scope.totalWork.push(0);
		};
		$scope.getIssues();
	};

	$scope.getIssuesAssignee();
    $scope.getIssues();
	
}]);