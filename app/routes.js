// app/routes.js
module.exports = function(app, passport, fs, multiparty) {
	/* Inhalt (Gibt die Startseite aus) */
	app.get('/', function(request, response) {
		response.render('index.jade', { 
			title: 'we♥games',
			user: request.user
		});
	});
	
	app.get('/logout', function(req, res){
  		req.logout();
  		res.redirect('/');
	});
};

function isLoggedIn(request, response, next) {
	if (request.isAuthenticated()) {
		return next();
	}
	request.flash('loginMessage', 'Du musst angemeldet sein, um diese Seite aufzurufen!');
	response.redirect('/login.html');
}
