app.controller("appController", ["$rootScope", "$scope", "$location", "JiraService", "JiraTempoService", "TextFactory",
function($rootScope, $scope, $location, JiraService, JiraTempoService, TextFactory) {

    $rootScope._userLogin = false; 		// bool - user is signed in Jira
	$rootScope._profile = null; 		// json - JIRA Profile
	$rootScope._server = null;			// string - JIRA server
	$rootScope._time = null;			// int - days to show in time tracking table
	$rootScope._periods = null;			// int - periods
	$rootScope._notifications = null;	// json<bool> - active notifications

	$rootScope.manifest = chrome.runtime.getManifest();
	$rootScope.isDebug = $rootScope.manifest.app.isDebug;
	
	$rootScope.pageLoading = false;

	$rootScope.showLoading = function() {
		$rootScope.pageLoading = true;
	};
	
	$rootScope.hideLoading = function() {
		$rootScope.pageLoading = false;
	};

	$scope.validaStorage = function (data) {
		$scope.localStorage = data;
		if (!data.notifications) {
			data.notifications = {
				"SesionExpirada": true,
				"PeriodosAprobacion": true
			};
		}
		if (!$scope.localStorage.server || !$scope.localStorage.time || !$scope.localStorage.periods) {
			$location.path("configuration");
			$scope.$apply();
		} else {
			$rootScope._server = data.server;
			$rootScope._time = data.time;
			$rootScope._periods = data.periods;
			$rootScope._notifications = data.notifications;
			chrome.storage.local.set({ "notifications" : $rootScope._notifications });
			$scope.getProfile();
		}
	};
	
	$scope.getProfile = function () {
		JiraService.profile().success(function (data) {
			$rootScope._profile = data;
			$rootScope._userLogin = true;
			$location.path("");
			//$scope.$apply();
		}).error(function (error, status) {
			if (status == 401) {
				if (!!$scope.localStorage.credentials) {
					$scope.login();
				} else {
					$location.path("login");
					$scope.$apply();
				}
			} else {
				$location.path("error");
				$scope.$apply();
			}
		});
	};
	
	$scope.login = function () {
		var credentials = TextFactory.decodeBase64($scope.localStorage.credentials).split("#:#");
		JiraService.login(credentials[0], credentials[1]).success(function (data) {
			JiraService.profile().success(function (data2) {
				$rootScope._profile = data2;
				$rootScope._userLogin = true;
			});
		}).error(function (error, status) {
			$location.path("login");
			$scope.$apply();
		});
	};

	$scope.exit = function () {
		$rootScope._profile = null;
		$rootScope._userLogin = false;
		chrome.storage.local.remove(["credentials"],function(){
			JiraService.logout().success(function(){
				$location.path("login");
				$scope.$apply();
			});
		})
	};
	
	$scope.reloadStorage = function() {
		chrome.storage.local.get(["server", "time", "credentials", "periods", "notifications"], function (data) {
			$scope.validaStorage(data);
		});
	};
	$scope.reloadStorage();
	
	chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
		if (notificationId == "PeriodosAprobacion") {
			if (buttonIndex == 0) {
				$rootScope._notifications.PeriodosAprobacion = false;
				$scope.localStorage.notifications.PeriodosAprobacion = false;
				chrome.storage.local.set({ "notifications" : $rootScope._notifications });
			}
		}
	});
	
	setInterval(function() { // Validación de sesión de usuario activa
		if ($rootScope._userLogin) {
			JiraService.profile().error(function (error, status) {
				if (status == 401) {
					if (!!$scope.localStorage.credentials) {
						$scope.login();
					} else {
						$location.path("login");
						$scope.$apply();
						if ($rootScope._notifications.ExpiredSession) {
							chrome.notifications.create("ExpiredSession", {
								type: "basic",
								iconUrl: "../icons/time64.png",
								title: "Your session has expired",
								message: "Your session has expired. Please, sign in again.",
								requireInteraction: true
							}, function(notificationId) {});
						}
					}
				}
			});
		}
	}, 1000*60); // every minute
	
	if (!$rootScope.isDebug)
		document.oncontextmenu = function(){return false};

}]);
