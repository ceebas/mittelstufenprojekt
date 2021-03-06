var userTemp = {};
module.exports = function(app, passport, multiparty, nodemailer, accessDb, zip, fs) {
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
		accessDb.getGameAndHighscores(gameId,request, render);
		function render(rowsGame, rowsScore, err) {
			if (rowsGame[0] == undefined || request.user == null && rowsGame[0].inactive == 1||request.user != null && (request.user.id_user != rowsGame[0].user && rowsGame[0].inactive == 1)) {
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
		if (searchString == "" || searchString == "'" || searchString == " " || searchString.indexOf("´") != -1) {
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
	app.get('/login', function(request, response) {
		response.render('login.jade', { 
			title: 'we♥games | Login',
			message: request.flash('loginMessage'),
			user: request.user
		});
	});
	
	app.post('/login', passport.authenticate('login-local', {
		successRedirect: '/loginSuccess', 
		failureRedirect: '/login' 
	}));

	/* Wenn Nutzer vor Login auf bestimmter Seite war, wird er daruf zurückgebracht */
	app.get('/loginSuccess', isLoggedIn, function(request, response) {
		var userIp = request.connection.remoteAddress;
		if (userTemp[userIp] == undefined) {
			userTemp[userIp] = '/';
		}
		response.redirect(userTemp[userIp]);
		delete userTemp[userIp];
	});

	app.get('/impressum', function(request, response) {
		response.render('impressum.jade', {
			title: 'we♥games | Impressum',
			user: request.user
		});
	});
	
	/* Bearbeiten von Nutzerangaben */	
	app.get('/userSetting',isLoggedIn, function(request, response) {
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

	/* Bearbeiten von Nutzerangaben */	
	app.get('/myGames',isLoggedIn, function(request, response) {
		accessDb.getOwnUser(request, render);
		function render(rows, request, err) {
			response.render('myGames.jade', { 
				title: 'we♥games | Meine Spiele',
				user: request.user,
				edituser: request.user,
				results: rows,
				message: request.flash('message')
			});
		}	
	});

	/* Seite zum hochladen */
	app.get('/upload', isLoggedIn, function(request, response) {
		response.render('upload.jade', { 
			title: 'we♥games | Upload',
			user: request.user
		});
	});
	app.get('/uploadDoneGame', isLoggedIn, function(request, response) {
		response.render('uploadDoneGame.jade', { 
			title: 'we♥games | Upload',
			user: request.user
		});
	});
	/* ----- CREATE GAME ----- */
	app.get('/createGame', isLoggedIn, function(request, response) {
		response.render('createGame.jade', { 
			title: 'we♥games | CREATE NOW',
			user: request.user
		});
	});

	app.post('/createGame', isLoggedIn, function(request, response) {
		var requestObj = request.body;
		var form = new multiparty.Form();
		var gameObj = {
			"gamedata": {
				"name": requestObj.game_name,
				"description": requestObj.game_description
			},
			"gameParameter": {
				"scrolldirection": requestObj.scroll_direction,
				"scrollspeed": requestObj.scroll_speed,
				"borders": {},
				"foes": {},
				"player": {
					"speed": requestObj.player_speed,
					"gravity": requestObj.player_gravity,
					"shoot": {},
					"size": {
						"width": requestObj.player_width,
						"height": requestObj.player_height
					},
					"shape": requestObj.player_shape,
				},
				"images":{}
			}
		}
		if (requestObj.selfscroll) {
			gameObj.gameParameter.selfscroll = requestObj.selfscroll;
		}
		if (requestObj.border_top) {
			gameObj.gameParameter.borders.top = requestObj.border_top;
		}
		if (requestObj.border_bottom) {
			gameObj.gameParameter.borders.bottom = requestObj.border_bottom;
		}
		if (requestObj.border_left) {
			gameObj.gameParameter.borders.left = requestObj.border_left;
		}
		if (requestObj.border_right) {
			gameObj.gameParameter.borders.right = requestObj.border_right;
		}
		gameObj.gameParameter.foes = {
			"enabled": "true",
			"speed": requestObj.foes_speed,
			"active": requestObj.foes_enabled,
			"shape": requestObj.foes_shape,
			"SpawnIntervall": requestObj.foes_intervall,
			"spawn": requestObj.foes_spawn,
			"size": {
				"width": requestObj.foes_width,
				"height": requestObj.foes_height
			}
		}
		if (requestObj.foes_shape != "eigene") {
			gameObj.gameParameter.foes.color = requestObj.foes_color;
			gameObj.gameParameter.images.foe = "newImage()";
		}
		if (requestObj.player_shoot_enabled) {
			gameObj.gameParameter.player.shoot = {
				"enabled": requestObj.player_shoot_enabled,
				"speed": requestObj.shoot_speed,
				"interval": requestObj.shoot_interval,
				"shape": requestObj.player_shoot_shape,
				"color": requestObj.player_shoot_color
			}

			if (requestObj.player_shoot_shape != "eigene") {
				gameObj.gameParameter.images.shoot = "newImage()";
			}
		}
		if (requestObj.player_shape != "eigene") {
			gameObj.gameParameter.player.color = requestObj.player_color;
			gameObj.gameParameter.images.player = "newImage()";
		}

		form.parse(request, function(err) {
			accessDb.createGameFolder(request, gameObj, render);
		});
		function render(status, err) {
			response.render('uploadGameFiles.jade', { 
				title: 'we♥games | Dateien hochladen',
				user: request.user,
				gameObj: gameObj
			});
		}
	});

	app.post('/submitScore', function(request, response) {
		if (request.user != undefined) {
			accessDb.setHighscore(request, render);
			function render(status, err) {
				response.status(status).send();
			}
		}
	});

	/* Registrierung eines neuen Benutzers */
	app.post('/signUp', passport.authenticate('local-signup', {
			//request.flash('signUp', 'User erfolgreich angelegt!');
			successRedirect : '/sendEmail',
			failureRedirect : '/signUp',
	}));

	app.get('/sendEmail', function(request, response) {
		var emailHash = request.param("email");
		if (emailHash != undefined && emailHash.length == 60) {
			response.render('activateUser.jade', { 
				title: 'we♥games | Accout aktivieren',
				message: "Bitte gib Deine Daten zur Überprüfung ein",
				emailhash: emailHash
			});
		} else if (request.user.isAdmin == 1){
			request.flash('message', 'Es wurde eine Aktivierungsmail an die angegebene Emailadresse gesendet.');
			response.redirect('/tableUsers');
		} else {
			request.flash('message', 'Dir wurde eine Email geschickt, bitte folge den Anweisungen darin um deine Anmeldung abzuschließen!');
			response.redirect('/logout');
		}
	});

	app.post('/activateUser', function(request, response) {
		if (request.body.emailhash.length == 60) {
			accessDb.validateUser(request, login);
			function login (request, success) {
				if (success) {
					request.flash('loginMessage', 'Melde dich nun zum ersten Mal an!');
				} else {
					request.flash('loginMessage', 'Fehler bei der Aktivierung! Bitte versuche es noch einmal!');
				}
				response.redirect('login');
			}
		} else {
			response.redirect('/');
		}  
	});

	/* Änderung von eigenen Benutzerdaten */
	app.post('/userSetting', isLoggedIn, function(request,response) {
		accessDb.updateUser(request, render);
		function render(request, redirect) {
			request = this.request;
			response.redirect(redirect);
		}
	});

	/* Uploadhandling */
	app.post('/uploads',isLoggedIn, function(request, response) {
		var form = new multiparty.Form();
		var gameId;

		form.parse(request, function(err, fieldsObject, filesObject, fieldsList, filesList) {
			accessDb.uploadGame(request, err, fieldsObject, filesObject, fieldsList, filesList, render);
			function render(redirect, err) {
				if (err) {
					response.status(500).send(redirect);
				} else {
					response.status(200).send(redirect);
				}
			}
		});
	});

	app.post('/uploadGameFiles', function(request, response) {
		var form = new multiparty.Form();
		form.parse(request, function(err, fieldsObject, filesObject, fieldsList, filesList) {
			accessDb.createGameFiles(request, fieldsObject, filesObject, fieldsList, filesList, render);
			function render(redirect, err) {
				if(err) {
					response.status(500).send(redirect);
				} else {
					response.status(200).send(redirect);
				}
			}
		});
	});

	/* Logout */
	app.get('/logout', function(request, response){
		request.logout();
		response.redirect('/');
	});

	/*----- Admin Ansicht -----*/
	app.get('/tableUsers', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1) {
			accessDb.getAllUsers(request, render);
			function render(users, admins, err) {
				response.render('tableUsers.jade', { 
					title: 'we♥games | Alle Benutzer',
					user: request.user,
					users: users,
					admins: admins,
					message: request.flash('message')
				});
			}
		} else {
			response.redirect('/userSetting');
		}
	});

	/* Neuen Nutzer anmelden */
	app.get('/signUp', function(request, response) {
		response.render('signUp.jade', { 
			title: 'we♥games | Benutzer registrieren',
			user: request.user,
			message: request.flash('signUpMessage')
		});
	});
	app.get('/tableGames', isLoggedIn, function(request, response) {
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
			response.redirect('/userSetting');
		}
	});

	app.get('/becomeAdmin', isLoggedIn, function(request, response) {
		if (request.user.isAdmin == 1 && request.user.id_user != request.query.userId) {
			accessDb.becomeAdmin(request, render);
			function render(succsess, err) {
				if (!succsess) {
					request.flash('message', 'Es ist ein Fehler aufgetreten!');
				}
				response.redirect('/tableUsers');
			}
		} else {
			response.redirect('/userSetting');
		}
	});

	// Nutzer editieren
	app.get('/editUser', isLoggedIn, function(request, response) {
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
			response.redirect('/userSetting');
		}
	});

	app.get('/removeGame', isLoggedIn, function(request, response) {
			accessDb.removeGame(request, render);
			function render(redirect, err) {
				//Timeout, damit unsere wunderschönen Animationen überhaupt angezeigt werden
				setTimeout(function() {
					response.redirect(redirect);
				}, 1000);

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
	/*
	app.get('/download', isLoggedIn, function(request, response) {
		var gameId = request.param("gameId");
		accessDb.getGame(gameId, request, validate);
		function validate (rows, err) {
			console.log(rows);
			var game = rows[0];
			if (request.user.isAdmin == 1 || request.user.id_user == game.user) {
				//has right to download
				var data = getAllFilesFromFolder(__dirname + '/../uploads/' + game.user + '/' + game.id_game + "." + game.gamename);
				for (var i = data.length - 1; i >= 0; i--) {
					zip.file(data[i], data[i]);
				};
				var zipData = zip.generate({base64:false,compression:'DEFLATE'});
				fs.writeFileSync('test.zip', zipData, 'binary');
				console.log(zipData);
				response.status(200).send(data);
			} else {
				request.flash('message', 'Du hast nicht die nötigen Rechte dieses Spiel runterzuladen!');
				response.redirect('/');
			}
		}
	});
	*/
};

//alle Dateien eines Ordners lesen
var getAllFilesFromFolder = function(dir) {

	var fs = require("fs");
    var results = [];

    fs.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

};

/* Prüft ob Nutzer eingeloggt ist */
function isLoggedIn(request, response, next) {
	if (request.isAuthenticated()) {
		return next();
	}
	var clientIp = request.connection.remoteAddress;
	userTemp[clientIp] = request.path;
	request.flash('loginMessage', 'Du musst angemeldet sein, um diese Seite aufrufen zu können!');
	response.redirect('/login');
}