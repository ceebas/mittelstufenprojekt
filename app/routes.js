/* Datenbank */
var db = require('../config/database.js');
var userTemp = {};

module.exports = function(app, passport, fs, multiparty, bcrypt, mysql) {
	// Datenbankverbindung herstellen
	var connection = mysql.createConnection(db.connection);
	connection.config.database = db.database;

	/* Index */
	app.get('/', function(request, response) {
		connection.query("select * from " + db.tableGames + " WHERE inactive = 0", function(err, rows, fields) {
			if (err) {
				console.log(JSON.stringify(err));
			}
			response.render('index.jade', {
				title: 'we♥games | Index',
				user: request.user,
				results: rows,
				message: request.flash('message')
			});
		});
	});

	/* Einzelspielansicht */
	app.get('/play', function(request, response) {
		var gameId = request.param("game");
		if (request.user == undefined) {
			request.flash('playMessage', 'Du musst angemeldet sein, damit dein Highscore gespeichert werden kann!');
		}
		connection.query("select * from " + db.tableGames + " WHERE id_game LIKE '" + gameId + "' AND inactive = 0", function(err, rowsGame, fields) {
			if (err) {
				console.log(JSON.stringify(err));
				request.flash('message', err);
				response.redirect('/')
			} else if (rowsGame[0] == undefined) {
				request.flash('message', 'Dieses Spiel wurde leider nicht gefunden!');
				response.redirect('/');
			} else {
				connection.query("SELECT high.*, user.username FROM " + db.tableHighscores + " high left join " + db.tableUsers + " user ON high.user = user.id_user WHERE game LIKE '" + gameId + "'ORDER BY score DESC LIMIT 10", function(err, rowsScore, fileds) {
					if (err) {
						console.log(err);
					}
					response.render('game.jade', {
						title: 'we♥games | ' + rowsGame[0].gamename,
						user: request.user,
						results: rowsGame[0],
						message: request.flash('playMessage'),
						scores: rowsScore
					});
				});
			}
		});
	});
	
	/* Suche */
	app.post('/search', function(request, response) {
		var searchString = request.body.search;
		if (searchString == "" || searchString == "'" || searchString == " ") {
			request.flash('message', 'Deine Suche nach: ´ ' + searchString + ' ´ hat leider keiner Ergenisse geliefert.');
			response.redirect('/');
		} else {
			connection.query("SELECT * FROM " + db.tableGames + " WHERE (gamename LIKE '%" + searchString + "%' or description LIKE '%" + searchString + "%')", function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
				}
				response.render('index.jade', {
					title: 'we♥games | Suche',
					user: request.user,
					search: searchString,
					results: rows
				});
			});
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
		connection.query("select * from " + db.tableGames +" WHERE user='" + request.user.id_user +"'", function(err, rows, fields) {
			if (err) {
				console.log(JSON.stringify(err));
			}
			response.render('userSetting.jade', { 
				title: 'we♥games | Profil bearbeiten',
				user: request.user,
				edituser: request.user,
				results: rows,
				message: request.flash('message')
			});
		});
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




	app.post('/submitScore', function(request, response) {
		if (request.user != undefined) {
			var gameData = request.body;
			connection.query("INSERT INTO " + db.tableHighscores + " (user, game, score, tStamp) VALUES (?, ?, ?, NOW())", [request.user.id_user, gameData.gameId, gameData.score], function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					response.status(500).send("Internal Server Error");
				} else {
					response.status(200).send("OK");
				}
			});
		}
	});

	/* Login */
	app.post('/login', passport.authenticate('login-local', {
		successRedirect: '/loginSuccess', 
		failureRedirect: '/login.html' 
	}));

	/* Registrierung eines neuen Benutzers */
	app.post('/signUp',isLoggedIn, passport.authenticate('local-signup', {
		successRedirect : '/tableUsers.html',
		failureRedirect : '/signUp.html',
	}));

	/* Änderung von eigenen Benutzerdaten */
	app.post('/userSetting', isLoggedIn, function(request,response) {
		var newData = request.body;
		var sqlUpdate = '';
		if (newData.passwordControl != newData.newPassword) {
			request.flash('message', 'Passwörter stimmen nicht überein');
			response.redirect('back');
		} else {
			sqlUpdate = "UPDATE " + db.tableUsers + " SET email='" + newData.email + "'";
			if (newData.newPassword !== '') {
				newData.newPassword = bcrypt.hashSync(newData.newPassword, null, null);
				sqlUpdate += ", password='" + newData.newPassword + "'";
			}
			if(newData.id_user != undefined) {
				sqlUpdate +=  " WHERE id_user='" + newData.id_user + "'";
			} else {
				sqlUpdate += " WHERE id_user='" + request.user.id_user + "'";
			}
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE username='" + newData.id_user + "'", function(err, rows, fields) {
				if (err) {
					request.flash('message', err);
				} else {
					connection.query(sqlUpdate, function(err, rows, fields) {
						if (err) {
							console.log(JSON.stringify(err));
							request.flash('message', err);
							response.redirect('/tableUsers.html');
						} else {
							if (request.user.isAdmin == 0) {
								request.logout();
								request.flash('loginMessage', 'Melde dich mit deinen neuen Daten an!');
								response.redirect('/login.html');
							} else if (request.user.isAdmin == 1 && newData.id_user == undefined) {
								response.redirect("/");
							} else {
								response.redirect('/tableUsers.html');
							}
						}
					});
				}
			});
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
    		connection.query("INSERT INTO " + db.tableGames + "(gamename, description, user) VALUES (?, ?, ?)", [fieldsObject.gamename, fieldsObject.gamedescription, req.user.id_user], function(err, rows, fields) {			
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
			connection.query("select * from " + db.tableUsers + " WHERE isAdmin NOT LIKE 1", function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					response.redirect('/');
				} else {
					response.render('tableUsers.jade', { 
						title: 'we♥games | Alle Benutzer',
						user: request.user,
						results: rows
					});
				}
			});
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
			connection.query("select * from " + db.tableGames, function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
				}
				response.render('tableGames.jade', {
						title: 'we♥games | Alle Spiele',
						games: rows,
						user: request.user
					});
			});

		} else {
			response.redirect('/userSetting.html');
		}
	});
	// Nutzer editieren
	app.get('/editUser.html', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			var editId = request.query.userId;
			if (editId == undefined) {
				editId = request.user.id_user;
			}
			connection.query("select * from " + db.tableUsers +" WHERE id_user='" + editId +"'", function(err, rows, fields) {
				if (rows[0] == undefined || rows[0].id_user == undefined) {
					response.redirect('/tableUsers.html');
				} else if (err) {
					console.log(JSON.stringify(err));
				} else {
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
			});	
		} else {
			response.redirect('/userSetting.html');
		}
	});

	app.get('/removeGame', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			var gameId = request.query.gameId;
			connection.query("SELECT * FROM " + db.tableGames + " WHERE id_game=" + gameId, function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					response.redirect('/');
				} else {
					var inactive = 0;
					//wenn nicht inaktiv, dann auf inaktiv setzten
					if (rows[0].inactive == 0) {
						inactive = 1;
					}
					connection.query("UPDATE " + db.tableGames + " SET inactive='" + inactive + "' WHERE id_game='" + gameId + "'", function(err) {
						if (err) {
							console.log(JSON.stringify(err));
						}
						response.redirect('/tableGames.html');
					});
				}
			});
		}
	});

	// Nutzer löschen
	app.get('/removeUser', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			var userId = request.query.userId;
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE id_user=" + userId, function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					response.redirect('/');
				} else {
					var inactive = 0;
					//wenn nicht inaktiv, dann auf inaktiv setzten
					if (rows[0].inactive == 0) {
						inactive = 1;
					}
					connection.query("UPDATE " + db.tableUsers + " SET inactive='" + inactive + "' WHERE id_user='" + userId + "'", function(err) {
						if (err) {
							console.log(JSON.stringify(err));
						}
						response.redirect('/tableUsers.html');
					});
				}
			});
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