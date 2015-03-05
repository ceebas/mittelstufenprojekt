/* Datenbank */
var db = require('../config/database.js');

module.exports = function(fs, bcrypt, mysql) {
	// Datenbankverbindung herstellen
	var connection = mysql.createConnection(db.connection);
	/* Datenbank erstellen */
	connection.query("CREATE DATABASE IF NOT EXISTS " + db.database, function(err, rows, fields) {
		if (err) {
			var d = new Date();
			console.log(d + "Fehler beim erstellen der Datenbank '" + db.database + "' " + JSON.stringify(err));
		} else {
			connection.query('USE ' + db.database);
			/* Datenbank-Tabellen erstellen */
			//Tabelle fuer Benutzer
			connection.query("CREATE TABLE IF NOT EXISTS " + db.tableUsers + "(id_user INT NOT NULL AUTO_INCREMENT, username VARCHAR (45) UNIQUE NOT NULL, password VARCHAR (200) NOT NULL, email VARCHAR (100), inactive INT DEFAULT '0', isAdmin INT DEFAULT '0', PRIMARY KEY (id_user))", function(err, rows, fields) {
				if (err) {
					var d = new Date();
					console.log(d + "Fehler beim erstellen der Tabelle '" + db.tableUsers + "' " + JSON.stringify(err));
				}
				//Prüfen ob Usertabelle leer ist - wenn leer: Erstellung von Standarduser 'admin' 
				connection.query("SELECT * FROM " + db.tableUsers, function(err, rows) {
					if (err) {
						console.log(JSON.stringify(err));
					} else {
						if (rows[0] == undefined) {
							connection.query("INSERT INTO " + db.tableUsers + " ( username, email, password, inactive, isAdmin ) values ('admin','info@i2dm.de','$2a$10$Lh4XtzJW2UuTy/dacCQCR.kbXVpETvscQ8VGDufF5gICchOHpt0nW', '0', '1')", function(err, rows) {
								if (err) {
									console.log(JSON.stringify(err));
								}
							});
						}
					}
				});
			});
			//Tabelle fuer Spiel
			connection.query("CREATE TABLE IF NOT EXISTS " + db.tableGames + "(id_game INT NOT NULL AUTO_INCREMENT, gamename VARCHAR (20), description VARCHAR (150),  user INT, imageEnc VARCHAR (5), javascript VARCHAR (30), inactive INT DEFAULT '0', FOREIGN KEY (user) REFERENCES " + db.tableUsers + " (id_user), PRIMARY KEY (id_game))", function(err, rows, fields) {
				if (err) {
					var d = new Date();
					console.log(d + "Fehler beim erstellen der Tabelle '" + db.tableGames + "' " + JSON.stringify(err));
				}
			});
			// Tabelle fuer Spielstaende
			connection.query("CREATE TABLE IF NOT EXISTS " + db.tableHighscores + "(id_highscore INT NOT NULL AUTO_INCREMENT, user INT, game INT, score INT, tStamp DATETIME, FOREIGN KEY (user) REFERENCES " + db.tableUsers + " (id_user), FOREIGN KEY (game) REFERENCES " + db.tableGames + " (id_game), PRIMARY KEY (id_highscore))", function(err, rows, fields) {
				if (err) {
					var d = new Date();
					console.log(d + "Fehler beim erstellen der Tabelle '" + db.tableHighscores + "' " + JSON.stringify(err));
				}
			});
		}
	});

	//Objekte nach Anwendungsfall zurückgeben
	return {
		/*-- Passport und User Abfragen --*/
		deserializeUser : function(id, callback) {
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE id_user = "+ id, function(err, rows){
            	callback(err, rows[0]);
        	});
		},
		login : function(request, username, password, callback) {
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE username = '" + username + "'",function(err, rows){
                if (err) {
                    return callback(err);
                }
                if (!rows.length) {
                    return callback(null, false, request.flash('loginMessage', 'Falscher Benutzername oder falsches Passwort!'));
                }
                if (!bcrypt.compareSync(password, rows[0].password)) {
                    return callback(null, false, request.flash('loginMessage', 'Falscher Benutzername oder falsches Passwort!'));
                }
                if (rows[0].inactive == 1) {
                    return callback(null, false, request.flash('loginMessage', 'Dein Account ist inaktiv, bitte wende dich an einen Admin!'))
                }
                //Benutzerordner wird erstellt, wenn nicht vorhanden
                fs.exists("uploads", function(exists) {
                	if (!exists) {
                		fs.mkdir("uploads", 0777, function (err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                	}
                });
                var userid = rows[0].id_user;
                var path = "uploads/" + userid;
                fs.exists(path, function(exists) {
                    if(!exists) {
                        fs.mkdir(path, 0777, function (err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
                return callback(null, rows[0]);
            });
		},
		signup : function(request, username, password, callback) {
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE username = '" + username + "'", function(err, rows) {
				if (err) {
			    	return callback(err);
				}
                if (rows.length) {
                    return callback(null, false, request.flash('signUpMessage', 'Benutzername schon vergeben!'));
                } else {
                    // Neuen Benutzer erstellen, falls noch nicht vorhanden
                    var newUser = {
                        username: username,
                        email: request.body.email,
                        password: bcrypt.hashSync(password, null, null)
                    };
                    var insertQuery = "INSERT INTO " + db.tableUsers + " ( username, email, password ) values ('" + newUser.username + "','" + newUser.email +"','" + newUser.password + "')";

                    connection.query(insertQuery,function(err, rows) {
                        if (err) {
                            return callback(err);
                        } 
                        //Ordner für Uploads wird erstellt
                        connection.query("SELECT LAST_INSERT_ID() as userid", function(err, rows, fields){
                            var userid = rows[0].userid;
                            var path = "uploads/" + userid;
                            fs.mkdir(path, 0777, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                        return callback(null);
                    });
                }
            });
		},
		getUser : function(request, callback) {
			var editId = request.query.userId;
			if (editId == undefined) {
				editId = request.user.id_user;
			}
			connection.query("select * from " + db.tableUsers +" WHERE id_user='" + editId +"'", function(err, rows, fields) {
				if (rows[0] == undefined || rows[0].id_user == undefined) {
					callback(null, null, "User does not exist!");
				} else if (err) {
					console.log(JSON.stringify(err));
					callback(null, null, err);
				} else {
					callback(rows, request, null);	
				}
			});	
		},
		getOwnUser : function(request, callback) {
			connection.query("select * from " + db.tableGames +" WHERE user='" + request.user.id_user +"'", function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, err);
				} else {
					callback(rows, request, null);
				}
			});
		},
		updateUser : function(request, callback) {
			var newData = request.body;
			var sqlUpdate = '';
			var userString;
			if (newData.passwordControl != newData.newPassword) {
				request.flash('message', 'Passwörter stimmen nicht überein');
				callback(request, 'back');
			} else {
				sqlUpdate = "UPDATE " + db.tableUsers + " SET email='" + newData.email + "'";
				if (newData.newPassword !== '') {
					newData.newPassword = bcrypt.hashSync(newData.newPassword, null, null);
					sqlUpdate += ", password='" + newData.newPassword + "'";
				}
				if(newData.id_user != undefined && request.user.isAdmin == 1) {
					sqlUpdate +=  " WHERE id_user='" + newData.id_user + "'";
					userString = newData.id_user;
				} else {
					sqlUpdate += " WHERE id_user='" + request.user.id_user + "'";
					userString = request.user.id_user;
				}
				connection.query("SELECT * FROM " + db.tableUsers + " WHERE username='" + userString + "'", function(err, rows, fields) {
					if (err) {
						console.log(JSON.stringify(err))
					} else {
						connection.query(sqlUpdate, function(err, rows, fields) {
							if (err) {
								console.log(JSON.stringify(err));
								request.flash('message', err);
								callback(request, '/tableUsers.html');
							} else {
								if (request.user.isAdmin == 0) {
									request.logout();
									request.flash('loginMessage', 'Melde dich mit deinen neuen Daten an!');
									callback(response, '/login.html');
								} else if (request.user.isAdmin == 1 && newData.id_user == undefined) {
									callback(request, "/");
								} else {
									callback(request, '/tableUsers.html');
								}
							}
						});
					}
				});
			}
		},
		getAllUsers : function(callback) {
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE isAdmin NOT LIKE 1", function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, err);
				} else {
					callback(rows, null);
				}
			});
		},
		/*-- Content Abfragen --*/
		getAllActiveGames : function(callback) {
			connection.query("SELECT * FROM " + db.tableGames + " WHERE inactive = 0", function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, err);
				} else {
					callback(rows, null);
				}
			});
		},
		getGameAndHighscores : function(gameId, callback) {
			connection.query("SELECT * FROM " + db.tableGames + " WHERE id_game LIKE '" + gameId + "' AND inactive = 0", function(err, rowsGame, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, null, err);
				} else {
					connection.query("SELECT high.*, user.username FROM " + db.tableHighscores + " high left join " + db.tableUsers + " user ON high.user = user.id_user WHERE game LIKE '" + gameId + "'ORDER BY score DESC LIMIT 10", function(err, rowsScore, fileds) {
						if (err) {
							console.log(err);
							callback(null, null, err);
						} else {
							callback(rowsGame, rowsScore, null);
						}
					});
				}
			});
		},
		searchGames : function(searchString, callback) {
			connection.query("SELECT * FROM " + db.tableGames + " WHERE (gamename LIKE '%" + searchString + "%' or description LIKE '%" + searchString + "%')", function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, err);
				} else {
					callback(rows, searchString, null);
				}
				
			});
		},
		setHighscore : function(request, callback) {
			var gameData = request.body;
			connection.query("INSERT INTO " + db.tableHighscores + " (user, game, score, tStamp) VALUES (?, ?, ?, NOW())", [request.user.id_user, gameData.gameId, gameData.score], function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(500, err);
				} else {
					callback(200, null);
				}
			});
		},
		getAllGames : function(callback) {
			connection.query("SELECT * FROM " + db.tableGames, function(err, rows, fields) {
				if (err) {
					callback(null, err);
				} else {
					callback(rows, null);
				}
			});
		},
		removeGame : function(request, callback) {
			var gameId = request.query.gameId;
			connection.query("SELECT * FROM " + db.tableGames + " WHERE id_game=" + gameId, function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback("/", err);
				} else {
					var inactive = 0;
					//wenn nicht inaktiv, dann auf inaktiv setzten
					if (rows[0].inactive == 0) {
						inactive = 1;
					}
					connection.query("UPDATE " + db.tableGames + " SET inactive='" + inactive + "' WHERE id_game='" + gameId + "'", function(err) {
						if (err) {
							console.log(JSON.stringify(err));
							callback("/", err);
						} else {
							callback('/tableGames.html', null);
						}
					});
				}
			});
		},
		removeUser : function(request, callback) {
			var userId = request.query.userId;
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE id_user=" + userId, function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback('/', err);
				} else {
					var inactive = 0;
					//wenn nicht inaktiv, dann auf inaktiv setzten
					if (rows[0].inactive == 0) {
						inactive = 1;
					}
					connection.query("UPDATE " + db.tableUsers + " SET inactive='" + inactive + "' WHERE id_user='" + userId + "'", function(err) {
						if (err) {
							console.log(JSON.stringify(err));
							callback('/', err);
						} else {
							callback('/tableUsers.html', null);
						}
					});
				}
			});
		},
		/*-- UPLOAD OBJEKTE --*/
		uploadGame : function(request, err, fieldsObject, filesObject, fieldsList, filesList, callback) {
			connection.query("INSERT INTO " + db.tableGames + "(gamename, description, user, inactive) VALUES (?, ?, ?, 0)", [fieldsObject.gamename, fieldsObject.gamedescription, request.user.id_user], function(err, rows, fields) {			
    			if (!err) {
					// Gibt die ID des des zufor erstellten Datensatzes aus
					connection.query("SELECT LAST_INSERT_ID() as id_game", function(err, rows, fields){
						if (!err) {
							// ID für das Spiel wird in der Datenbank festgelegt und Pfad vervollständigt
							gameId = rows[0].id_game;
							var path = "uploads/" + request.user.id_user + "/" + gameId + "." + fieldsObject.gamename;
	    					// Ordner für das Spiel wird erstellt
							if(typeof fieldsObject.gamename != undefined) {
			    				fs.mkdir(path, 0777, function (err) {
									if (err) {
										console.log(JSON.stringify(err));
										callback("/", err);
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
										callback("/play?game=" + gameId, null);
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
					callback("upload.html", err);
				}
			});
		}
	}

};

