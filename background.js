/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {

	chrome.app.window.create('app/index.html', {
		id: 'main',
		singleton: true,
		frame: {
			type: 'chrome',
			color: '#4e5d6c',
			activeColor: '#4e5d6c',
			inactiveColor: '#4e5d6c'
		},
		bounds: { width: 900, height: 600 },
		innerBounds: { minWidth: 900, minHeight: 600 }
	});
	
});