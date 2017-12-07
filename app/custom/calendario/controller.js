/*********************************************
*   http://www.bootstrap-year-calendar.com   *
*********************************************/

app.controller("jiraCalendarioVacacionesController", ["$rootScope", "$scope", "JiraService", "JiraServiceCustom",
function($rootScope, $scope, JiraService, JiraServiceCustom) {

    $scope.user = $rootScope._profile;
	$scope.eventos = [];
	
	$scope.task = [];

	$rootScope.showLoading();
	
	$scope.creaEvento = function (daterange) {
		
		$scope.currentRange = { startDate: daterange.startDate, endDate: daterange.endDate, task: null, time: null };
		$('#modalTime').modal();
		$scope.$apply();
		
	};
	
	$scope.addWorklog = function () {
		
		if (!$scope.currentRange.startDate) {
			alert("El campo FECHA INICIO es obligatorio");
			return false;
		};
		if (!$scope.currentRange.endDate) {
			alert("El campo FECHA FIN es obligatorio");
			return false;
		};
		if (!$scope.currentRange.task) {
			alert("El campo TAREA es obligatorio");
			return false;
		};
		if (!$scope.currentRange.time) {
			alert("El campo TIEMPO es obligatorio");
			return false;
		};
		
		var fecha_inicio = new Date($scope.currentRange.startDate); 
		var fecha_inicio_aux = new Date($scope.currentRange.startDate); 
		var fecha_fin = new Date($scope.currentRange.endDate);
		
		var finish = 0;
		
		while (fecha_inicio_aux.getTime() <= fecha_fin.getTime()){
			if (fecha_inicio_aux.getDay() != 0 && fecha_inicio_aux.getDay() != 6) {
				finish++;
				JiraService.addWorklog($scope.currentRange.task, fecha_inicio_aux, $scope.currentRange.time, '').success(function (data) {
					console.log("Imputado " +  $scope.currentRange.time + " en la tarea " + $scope.currentRange.task + " para el dia " + fecha_inicio_aux);
					finish--;
					if (finish == 0) {
						$("#modalTime").modal('hide');
						$scope.cargaCalendario();
					}
				});
			}
			fecha_inicio_aux.setDate(fecha_inicio_aux.getDate() + 1);
		}
		
	};
	
	$scope.generaCalendario = function () {
		
		var fecha_inicio = new Date((new Date()).getFullYear(), 0, 1); 
		var fecha_inicio_aux = new Date((new Date()).getFullYear(), 0, 1); 
		var fecha_fin = new Date((new Date()).getFullYear(), 11, 31);
		
		var disabledDates = [];

		while (fecha_inicio_aux.getTime() <= fecha_fin.getTime()){
			if (fecha_inicio_aux.getDay() == 0 || fecha_inicio_aux.getDay() == 6)
				disabledDates.push(new Date(fecha_inicio_aux));
			fecha_inicio_aux.setDate(fecha_inicio_aux.getDate() + 1);
		}
		
		$rootScope.hideLoading();
		
		$('#calendar').calendar({
			enableContextMenu: false,
			enableRangeSelection: true,
			minDate: fecha_inicio,
			maxDate: fecha_fin,
			disabledDays: disabledDates,
			style: "background",
			language: "es",
			dataSource: $scope.eventos,
			mouseOnDay: function(e) {
				if(e.events.length > 0) {
					var content = '';
					
					for(var i in e.events) {
						content += '<div class="event-tooltip-content">'
										+ '<div class="event-name"><b>' + e.events[i].name + '</b></div>'
										+ '<div class="event-location">' + e.events[i].location + '</div>'
									+ '</div>';
					}
				
					$(e.element).popover({ 
						trigger: 'manual',
						container: 'body',
						html:true,
						content: content
					});
					
					$(e.element).popover('show');
				}
			},
			mouseOutDay: function(e) {
				if(e.events.length > 0) {
					$(e.element).popover('hide');
				}
			},
			selectRange: function(e) {
				$scope.creaEvento({ startDate: e.startDate, endDate: e.endDate });
			}
		});
	};
	
	$scope.cargaCalendario = function () {
		JiraServiceCustom.internalIssues().success(function(data){
			
			var finish = data.issues.length;
			$scope.idCalendario = 1;

			for (var j = 0; j < data.issues.length; j++) {
				
				JiraService.issueInfo(data.issues[j].key).success(function (data2) {
					
					$scope.task.push({
						id: data2.key,
						summary: data2.fields.summary
					});

					JiraService.worklog(data2.key).success(function(data3){
					
						for (var i = 0; i < data3.worklogs.length; i++) {
							if (data3.worklogs[i].author.name == $scope.user.name) {
								$scope.eventos.push({
									id: $scope.idCalendario++,
									name: data2.key + " - " + data2.fields.summary,
									color: "lightgreen",
									location: "Tiempo imputado: " + data3.worklogs[i].timeSpent,
									startDate: new Date((new Date(data3.worklogs[i].started)).getFullYear(), (new Date(data3.worklogs[i].started)).getMonth(), (new Date(data3.worklogs[i].started)).getDate(), 0, 0, 0),
									endDate: new Date((new Date(data3.worklogs[i].started)).getFullYear(), (new Date(data3.worklogs[i].started)).getMonth(), (new Date(data3.worklogs[i].started)).getDate(), 23, 59, 59)
								});
							}
						}
						
						if (--finish == 0)
							$scope.generaCalendario();

					}).error(function(error){
						
						$scope.generaCalendario();
						
					});

				});
				
			};
		});
	};
	$scope.cargaCalendario();

}]);