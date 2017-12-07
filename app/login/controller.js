app.controller("loginController", ["$rootScope", "$scope", "$location", "JiraService", "TextFactory",
function($rootScope, $scope, $location, JiraService, TextFactory) {

	$scope.login = function () {
		if (!!$scope.user && !!$scope.pass) {
			JiraService.login($scope.user, $scope.pass).success(function (data) {
				if (!!$scope.savedata) {
					chrome.storage.local.set({ "credentials" : TextFactory.encodeBase64($scope.user + "#:#" + $scope.pass) });
				};
				JiraService.profile().success(function (data2) {
					$rootScope._profile = data2;
					$rootScope._userLogin = true;
					$location.path("");
					$scope.$apply();
				});
			}).error(function (error, status) {
				if (status == 403) {
					chrome.notifications.create("PeriodosAprobacion", {
						type: "basic",
						iconUrl: "../icons/time64.png",
						title: "BLOQUEO POR CAPTCHA",
						message: "Su usuario ha sido bloqueado. Tiene que iniciar sesión en la aplicaci&oacute;n para desbloquearlo.",
						requireInteraction: false
					}, function(notificationId) {});
				} else {
					chrome.notifications.create("PeriodosAprobacion", {
						type: "basic",
						iconUrl: "../icons/time64.png",
						title: "ERROR AL INICIAR SESION",
						message: "Compruebe que los datos introducidos son correctos.",
						requireInteraction: false
					}, function(notificationId) {});
				}
			});
		}
	};

}]);