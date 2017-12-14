app.controller("configurationController", ["$rootScope", "$scope", "$location", "JiraService",
function($rootScope, $scope, $location, JiraService) {

    chrome.storage.local.get(["server", "time", "periods", "notifications"], function (data) {
		$scope.server = data.server;
		$scope.time = data.time;
		$scope.periods = data.periods;
		if (!data.notifications) {
			data.notifications = {
				"SesionExpirada": true,
				"PeriodosAprobacion": true
			};
		};
		$scope.notifications = data.notifications;
	});

	$scope.range = [
		{'value': '6', 'text': 'Last week'},
		{'value': '13', 'text': 'Last two weeks'},
		{'value': '20', 'text': 'Last three weeks'},
		{'value': '27', 'text': 'Last four weeks'}
	];
	
	$scope.save = function () {
        if (!$scope.server || !$scope.time || !$scope.periods) {
            return;
        }
		
		chrome.storage.local.set({ "server" : $scope.server , "time" : $scope.time, "periods": $scope.periods, "notifications": $scope.notifications });
		
		$rootScope._server = $scope.server;
		$rootScope._time = $scope.time;
		$rootScope._periods = $scope.periods;
		$rootScope._notifications = $scope.notifications;
		
        JiraService.profile().success(function (data) {
			$rootScope._profile = data;
			$rootScope._userLogin = true;
			$location.path("");
			$scope.$apply();
		}).error(function (error, status) {
			if (status == 401) {
				$location.path("login");
				$scope.$apply();
			} else {
				$location.path("error")
				$scope.$apply();
			}
		});
	};
	
	$('.nav-tabs a').click(function (e) {
		e.preventDefault()
		$(this).tab('show')
	})

}]);