/* Datenbank */
var db = require('../config/database.js');
var userTemp = {};

module.exports = function(app, passport, fs, multiparty, bcrypt, mysql, accessDb) {
	// Datenbankverbindung herstellen
	var connection = mysql.createConnection(db.connection);
	connection.config.database = db.database;

	/* Index */
	app.get('/', function(request, response) {
		accessDb.getAllActiveGames(render);
		function render(rows, err) {
			response.render('index.jade', {
				title: 'we♥games | Index',
				user: request.user,
				results: rows,
				message: request.flash('message')
			});
		}
	});

	/* Einzelspielansicht */
	app.get('/play', function(request, response) {
		var gameId = request.param("game");
		if (request.user == undefined) {
			request.flash('playMessage', 'Du musst angemeldet sein, damit dein Highscore gespeichert werden kann!');
		}
		accessDb.getGameAndHighscores(gameId, render);
		function render(rowsGame, rowsScore, err) {
			if (rowsGame[0] == undefined) {
				request.flash('message', 'Dieses Spiel wurde leider nicht gefunden!');
				response.redirect('/');
			} else {
				response.render('game.jade', {
					title: 'we♥games | ' + rowsGame[0].gamename,
					user: request.user,
					results: rowsGame[0],
					message: request.flash('playMessage'),
					scores: rowsScore
				});
			}	
		}
	});
	
	/* Suche */
	app.post('/search', function(request, response) {
		var searchString = request.body.search;
		if (searchString == "" || searchString == "'" || searchString == " ") {
			request.flash('message', 'Deine Suche nach: ´ ' + searchString + ' ´ hat leider keiner Ergenisse geliefert.');
			response.redirect('/');
		} else {
			accessDb.searchGames(searchString, render);
			function render (rows, searchString, err) {
				response.render('index.jade', {
					title: 'we♥games | Suche',
					user: request.user,
					search: searchString,
					results: rows
				});
			}
		}
	});

	/* Login */
	app.get('/login.html', function(request, response) {
		response.render('login.jade', { 
			title: 'we♥games | Login',
			message: request.flash('loginMessage'),
			user: request.user
		});
	});

	/* Wenn Nutzer vor Login auf bestimmter Seite war, wird er daruf zurückgebracht */
	app.get('/loginSuccess', isLoggedIn, function(request, response) {
		var userIp = request.connection.remoteAddress;
		if (userTemp[userIp] == undefined) {
			userTemp[userIp] = '/';
		}
		response.redirect(userTemp[userIp]);
		delete userTemp[userIp];
	});
	
	/* Bearbeiten von Nutzerangaben */	
	app.get('/userSetting.html',isLoggedIn, function(request, response) {
		accessDb.getOwnUser(request, render);
		function render(rows, request, err) {
			response.render('userSetting.jade', { 
				title: 'we♥games | Profil bearbeiten',
				user: request.user,
				edituser: request.user,
				results: rows,
				message: request.flash('message')
			});
		}	
	});

	/* Seite zum hochladen */
	app.get('/upload.html', isLoggedIn, function(request, response) {
		response.render('upload.jade', { 
			title: 'we♥games | Upload',
			user: request.user
		});
	});
	app.get('/uploadDoneGame.html', isLoggedIn, function(request, response) {
		response.render('uploadDoneGame.jade', { 
			title: 'we♥games | Upload',
			user: request.user
		});
	});
	/* ----- CREATE GAME ----- */
	app.get('/createGame.html', isLoggedIn, function(request, response) {
		response.render('createGame.jade', { 
			title: 'we♥games | CREATE NOW',
			user: request.user
		});
	});

	app.post('/createGame', isLoggedIn, function(request, response) {
		console.log(JSON.stringify(request.body));
		var requestObj = request.body;
		var gameObj = {
	    	"gamedata": {
	        	"name": requestObj.game_name,
	        	"description": requestObj.game_description
	    	},
			"gameparameter": {
				"scrolldirection": requestObj.scroll_direction,
				"scrollspeed": requestObj.scroll_speed,
				"borders": {},
				"foes": {},
				"player": {
					"active": requestObj.player_active,
					"speed": requestObj.player_speed,
					"gravity": requestObj.player_gravitiy,
					"shoot": {},
					"size": {
						"width": requestObj.player_width,
						"height": requestObj.player_height
					},
					"shape": requestObj.player_shape,
				}
			}
		}
		if (requestObj.selfscroll) {
			gameObj.gameparameter.selfscroll = requestObj.selfscroll;
		}
		if (requestObj.border_top) {
			gameObj.gameparameter.borders.top = requestObj.border_top;
		}
		if (requestObj.border_bottom) {
			gameObj.gameparameter.borders.bottom = requestObj.border_bottom;
		}
		if (requestObj.border_left) {
			gameObj.gameparameter.borders.left = requestObj.border_left;
		}
		if (requestObj.border_right) {
			gameObj.gameparameter.borders.right = requestObj.border_right;
		}
		gameObj.gameparameter.foes = {
			"active": requestObj.foes_active,
			"speed": requestObj.foes_speed,
			"gravity": requestObj.foes_gravity,
			"size": {
				"width": requestObj.foes_width,
				"height": requestObj.foes_height
			},
			"shape": requestObj.foes_shape
		}
		if (requestObj.foes_shape != "eigene") {
			gameObj.gameparameter.foes.color = requestObj.foes_color;
		}
		
		if (requestObj.player_shoot_enabled) {
			gameObj.gameparameter.player.shoot = {
				"enabled": requestObj.player_shoot_enabled,
				"speed": requestObj.player_shoot_speed,
				"shape": requestObj.player_shoot_shape,
				"color": requestObj.player_shoot_color
			}
		}
		if (requestObj.player_shape != "eigene") {
				gameObj.gameparameter.player.color = requestObj.player_color;
		}
		console.log(gameObj);
		response.status(200).send(gameObj);
	});

	app.post('/submitScore', function(request, response) {
		if (request.user != undefined) {
			accessDb.setHighscore(request, render);
			function render(status, err) {
				response.status(status).send();
			}
		}
	});

	/* Login */
	app.post('/login', passport.authenticate('login-local', {
		successRedirect: '/loginSuccess', 
		failureRedirect: '/login.html' 
	}));

	/* Registrierung eines neuen Benutzers */
	app.post('/signUp',isLoggedIn, passport.authenticate('local-signup', {
		//request.flash('signUp', 'User erfolgreich angelegt!');
		successRedirect : '/tableUsers.html',
		failureRedirect : '/signUp.html',
	}));

	/* Änderung von eigenen Benutzerdaten */
	app.post('/userSetting', isLoggedIn, function(request,response) {
		accessDb.updateUser(request, render);
		function render(request, redirect) {
			request = this.request;
			response.redirect(redirect);
		}
	});

	/* Uploadhandling */
	app.post('/uploads',isLoggedIn, function(req, res) {
		var form = new multiparty.Form();
		var gameId;

		form.on('close', function() {
			//res.redirect('/play?game=' + gameId);
		});

    	form.parse(req, function(err, fieldsObject, filesObject, fieldsList, filesList) {
    		//Daten werden in DB gespeichert
    		connection.query("INSERT INTO " + db.tableGames + "(gamename, description, user, inactive) VALUES (?, ?, ?, 0)", [fieldsObject.gamename, fieldsObject.gamedescription, req.user.id_user], function(err, rows, fields) {			
    			if (!err) {
					// Gibt die ID des des zufor erstellten Datensatzes aus
					connection.query("SELECT LAST_INSERT_ID() as id_game", function(err, rows, fields){
						if (!err) {
							// ID für das Spiel wird in der Datenbank festgelegt und Pfad vervollständigt
							gameId = rows[0].id_game;
							var path = "uploads/" + req.user.id_user + "/" + gameId + "." + fieldsObject.gamename;
	    					// Ordner für das Spiel wird erstellt
							if(typeof fieldsObject.gamename != undefined) {
			    				fs.mkdir(path, 0777, function (err) {
									if (err) {
										console.log(JSON.stringify(err));
										res.status(500).end();
									} else {
										//Alle hochgeladenen Dateien werden verarbeitet
										for (var i = 0; i < filesObject.datei.length; i++) {
											var originalFilename = filesObject.datei[i].originalFilename;
											var fileName = originalFilename.substr(0,5);
											//für das Anzeigebild wird der Datensatz ergänzt
											if (fileName == "image") {
												var fileEnc = originalFilename.substr(originalFilename.length - 3);
												connection.query("UPDATE " + db.tableGames + " SET imageEnc='" + fileEnc + "' WHERE id_game='" + gameId + "'", function(err, rows, fields) {
													if (err) {
														console.log(JSON.stringify(err));
													}
												});
												fs.rename(filesObject.datei[i].path, path + "/image." + fileEnc , function(err) {
													if (err) {
														console.log(JSON.stringify(err));
													};
												});
											//JS Datei wird ebenfalls in Dtansatz gebracht
											} else if (originalFilename.substr(originalFilename.length - 2) == "js") {
												connection.query("UPDATE " + db.tableGames + " SET javascript='" + originalFilename + "' WHERE id_game='" + gameId + "'", function(err, rows, fields) {
													if (err) {
														console.log(JSON.stringify(err));
													}
												});
												fs.rename(filesObject.datei[i].path, path + "/" + originalFilename , function(err) {
													if (err) {
														console.log(JSON.stringify(err));
													};
												});
											//Alles andere wird einfach gespeichert
											} else {
												fs.rename(filesObject.datei[i].path, path + "/" + originalFilename , function(err) {
													if (err) {
														console.log(JSON.stringify(err));
													};
												});
											}
										}
										res.status(200).send("/play?game=" + gameId);
									}
								});
							}
						} else {
							console.log("SubmitError " + JSON.stringify(err));
							return;
						}
					});
				} else {
					console.log("INSERT ERROR ------ " + JSON.stringify(err));
					res.status(500).send("Internal Server Error");
				}
			});
    	});
	});

	/* Logout */
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	/*----- Admin Ansicht -----*/
	app.get('/tableUsers.html', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			accessDb.getAllUsers(render);
			function render(rows, err) {
				response.render('tableUsers.jade', { 
					title: 'we♥games | Alle Benutzer',
					user: request.user,
					results: rows
				});
			}
		} else {
			response.redirect('/userSetting.html');
		}
	});

	/* Neuen Nutzer anmelden */
	app.get('/signUp.html', isLoggedIn, function(request, response) {
		response.render('signUp.jade', { 
			title: 'we♥games | Benutzer registrieren',
			user: request.user,
			message: request.flash('signUpMessage')
		});
	});
	app.get('/tableGames.html', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			accessDb.getAllGames(render);
			function render(rows, err) {
				response.render('tableGames.jade', {
					title: 'we♥games | Alle Spiele',
					games: rows,
					user: request.user
				});
			}
		} else {
			response.redirect('/userSetting.html');
		}
	});
	// Nutzer editieren
	app.get('/editUser.html', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			accessDb.getUser(request, render);
			function render(rows, request, err) {
				response.render('userSetting.jade', {
					title: 'we♥games | Benutzer bearbeiten',
					user: request.user,
					edituser: {
						id: rows[0].id_user,
						username: rows[0].username,
						email: rows[0].email,
					},
					message: request.flash('message'),
					results: ''
				});
			}
		} else {
			response.redirect('/userSetting.html');
		}
	});

	app.get('/removeGame', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			accessDb.removeGame(request, render);
			function render(redirect, err) {
				response.redirect(redirect);
			}
		}
	});

	// Nutzer löschen
	app.get('/removeUser', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			accessDb.removeUser(request, render);
			function render(redirect, err) {
				response.redirect(redirect);
			}
		}
	});
};

/* Prüft ob Nutzer eingeloggt ist */
function isLoggedIn(request, response, next) {
	if (request.isAuthenticated()) {
		return next();
	}
	var clientIp = request.connection.remoteAddress;
	userTemp[clientIp] = request.path;
	request.flash('loginMessage', 'Du musst angemeldet sein, um diese Seite aufrufen zu können!');
	response.redirect('/login.html');
}