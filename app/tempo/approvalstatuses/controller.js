app.controller("tempoApprovalStatusesController", ["$rootScope", "$scope", "$filter", "JiraTempoService", "TimeFactory",
function($rootScope, $scope, $filter, JiraTempoService, TimeFactory) {
	
	$scope.user = $rootScope._profile;
	
	$scope.approvalStatuses = null;
	$scope.supervisors = [];
	
	$scope.translateStatus = function (text) {
		if (text == 'open') return "Abierto";
		if (text == 'approved') return "Aprobado";
		if (text == 'ready_to_submit') return "Listo para enviar";
		if (text == 'waiting_for_approval') return "Esperando aprobación";
		return "ESTADO DESCONOCIDO";
	};

	$scope.getTimesheetApprovalStatuses = function() {
		$rootScope.showLoading();
		JiraTempoService.getTimesheetApprovalStatuses($scope.user.name).success(function(data){
			$scope.approvalStatuses = data;
			$rootScope.hideLoading();
		})
		.error(function(error){
			$rootScope.hideLoading();
		});
	};
	
	$scope.secondsFormat = function(workedSeconds) {
		return TimeFactory.secondsFormat(workedSeconds);
	};
	
	$scope.getStatusClass = function(status) {
		if (status == 'open' || status == 'ready_to_submit')
			return 'progress-bar-info';
		if (status == 'approved')
			return 'progress-bar-success';
		if (status == 'waiting_for_approval')
			return 'progress-bar-warning';
		return 'progress-bar-danger';
	};
	
	$scope.sendStatus = function (user, period, reviewer) {
		$rootScope.showLoading();
		JiraTempoService.sendStatus(user, period, reviewer).success(function (data){
			$rootScope.hideLoading();
			$scope.getTimesheetApprovalStatuses();
		}).error(function (error){
			$rootScope.hideLoading();
			$scope.getTimesheetApprovalStatuses();
		});
	}
	
	$scope.getTimesheetApprovalStatuses();
	
	JiraTempoService.getSupervisors($scope.user.name).success(function(data){
		$scope.supervisors = data["simple-user"];
	});
	
}]);