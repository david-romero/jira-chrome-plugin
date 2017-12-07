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

app.filter("ToHTML", ['$sce', function($sce) {
	
	return function(htmlCode){
		return $sce.trustAsHtml(htmlCode);
	}
  
}])