app.factory("TextFactory", function (){
	
	return {
		
		format: function(text, arg) {
			var textAux = text;
			for(var i = 0; i < arg.length; i++) {
				textAux = textAux.replace("{"+i+"}", arg[i]);
			}
			return textAux;
		},
		
		encodeBase64: function(text) {
			return btoa(text);
		},
		
		decodeBase64: function(text) {
			return atob(text);
		}
		
	};
	
});

app.factory("DateFactory", function (){
	
	return {

		addDays: function(date, days) {
			var dateAux = new Date(date.valueOf());
			dateAux.setDate(dateAux.getDate() + days);
			return dateAux;
		},
		
		isWeekend: function(date) {
			return ( date.getDay() === 6 || date.getDay() === 0 );
		}
		
	};
	
});

app.factory("TimeFactory", function (){
	
	return {
		
		secondsFormat: function (number) {
			var hours   = Math.floor(number / 3600);
			var minutes = Math.floor((number - (hours * 3600)) / 60);
			var seconds = number - (hours * 3600) - (minutes * 60);
			
			var out = "";
			if (hours != 0) out += hours + "h";
			if (minutes != 0) {
				if (out != "") out += " ";
				out += minutes + "m";
			}
			if (seconds != 0) {
				if (out != "") out += " ";
				out += seconds + "m";
			}
			return out;
		},
		
		timeMaskToSeconds: function(mask) {
			var calculo = {"h":3600, "m":60, "s":1};
			var valores = mask.split(" ");
			var totalSegundos=0;
			
			valores.forEach(function(e) {
				for (var k in calculo) {
					if (e.substr(-1) == k)
					{
						totalSegundos = totalSegundos + (parseInt(e.substr(0,e.length-1))*calculo[k]);
					}
				}
			});
			
			return totalSegundos;
		}
		
	};
	
});