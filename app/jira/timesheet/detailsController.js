app.controller("jiraTimesheetDetailsController", ["$rootScope", "$scope", "$filter", "$routeParams", "TimeFactory", "JiraService",
function($rootScope, $scope, $filter, $routeParams, TimeFactory, JiraService) {

    $scope.user = $rootScope._profile;
	$scope.issue = {
		key: $routeParams.issueCode,
	};
	
	$scope.cargado = false;
	
	$scope.secondsFormat = function(workedSeconds) {
		return TimeFactory.secondsFormat(workedSeconds);
	};
	
	$scope.renderCommentBody = function(comment) {
		JiraService.render($scope.issue.key, comment.body).success(function(data){
			comment.body = data;
		});
	};
	
	$scope.dateStringFormat = function (dateString) {
		var date = new Date(dateString);
		return date.format("dd/mm/yyyy hh:MM:ss");
	};
	
	JiraService.issueInfo($scope.issue.key).success(function (data) {
		$scope.issue.summary = data.fields.summary;
		$scope.issue.description = data.fields.description;
		JiraService.render($scope.issue.key, data.fields.description).success(function(data2){
			$scope.issue.description = data2;
		});
		$scope.issue.status = data.fields.status;
		$scope.issue.issuetype = data.fields.issuetype;
		$scope.issue.progress = data.fields.progress;
		$scope.issue.assignee = data.fields.assignee;
		$scope.issue.creator = data.fields.creator;
		$scope.cargado = true;
	});
	
	JiraService.getComments($scope.issue.key).success(function(data){
		$scope.issue.comments = data.comments;
		for (var i = 0; i < $scope.issue.comments.length; i++) {
			$scope.renderCommentBody($scope.issue.comments[i]);
		};
	});
	
	JiraService.worklog($scope.issue.key).success(function (data) {
		$scope.issue['worklogs'] = data.worklogs
	});
	
}]);