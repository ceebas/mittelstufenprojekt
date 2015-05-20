/* Datenbank */
var db = require('../config/database.js');

module.exports = function(fs, bcrypt, mysql, accessEmail) {
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
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE id_user = ? ", [id], function(err, rows){
            	callback(err, rows[0]);
        	});
		},
		login : function(request, username, password, callback) {
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE username = ?", [username] ,function(err, rows){
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
                    return callback(null, false, request.flash('loginMessage', 'Dein Account ist inaktiv, bitte klicke erst auf deinen Aktivierungslink, den du per Mail erhalten hast!'))
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
                var path = __dirname + "/../uploads/" + userid;
                fs.exists(path, function(exists) {
                    if(!exists) {
                        fs.mkdir(path, 0777, function (err) {
                            if (err) {
                                console.log("Uploads/User Ordner ##### " + err);
                            }
                        });
                    }
                });
                return callback(null, rows[0]);
            });
		},
		signup : function(request, username, password, callback) {
			var newUser;
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE username = ? ", [username], function(err, rows) {
				if (err) {
					console.log("SELECT ######" + err);
			    	return callback(err, null);
				}
                if (rows.length) {
                    return callback(null, null);
                } else {
                    // Neuen Benutzer erstellen, falls noch nicht vorhanden
                    newUser = {
                        username: username,
                        email: request.body.email,
                        password: bcrypt.hashSync(password, null, null)
                    };
                    var insertQuery = "INSERT INTO " + db.tableUsers + " ( username, email, password, inactive ) values ( ?, ?, ?, 1)";

                    connection.query(insertQuery, [newUser.username, newUser.email, newUser.password] ,function(err, rows) {
                        if (err) {
                        	console.log("Insert Error ##### " + err);
                            return callback(err, null);
                        } 
                        //Ordner für Uploads wird erstellt
                        connection.query("SELECT LAST_INSERT_ID() as userid", function(err, rows, fields){
                            var userid = rows[0].userid;
                            newUser.id_user = userid;
                            //request.user = newUser;
                            var path = __dirname + "/../uploads/" + userid;
                            fs.mkdir(path, 0777, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            accessEmail.sendEmail(newUser);
                            if (request.user != undefined && request.user.isAdmin == 1) {
                            	callback(null, request.user);
                            } else {
                            	return callback(null, newUser);
                            }
                        });
                    });
                }
            });
		},
		validateUser : function (request, callback) {
			var user = request.body;
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE username = ?", [user.username],function(err, rows) {
				if (err) {
					console.log(err);
					return callback(request, false);
				} else if (!rows.length) {
					console.log(err);
					return callback(request, false);
				}
				if (bcrypt.compareSync(rows[0].email, user.emailhash) && bcrypt.compareSync(user.password, rows[0].password)) {
					connection.query("UPDATE " + db.tableUsers + " SET inactive='0' WHERE id_user= ? ", [rows[0].id_user], function(err) {
						if (err) {
							console.log(err);
						}
						return callback(request, true);
					});
				} else {
					return callback(request, false);
				}
			});
		},
		getUser : function(request, callback) {
			var editId = request.query.userId;
			if (editId == undefined) {
				editId = request.user.id_user;
			}
			connection.query("SELECT * FROM " + db.tableUsers +" WHERE id_user= ?", [editId], function(err, rows, fields) {
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
			connection.query("SELECT * FROM " + db.tableGames +" WHERE user= ? ", [request.user.id_user], function(err, rows, fields) {
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
								callback(request, '/tableUsers');
							} else {
								if (request.user.isAdmin == 0) {
									request.logout();
									request.flash('loginMessage', 'Melde dich mit deinen neuen Daten an!');
									callback(request, '/login');
								} else if (request.user.isAdmin == 1 && newData.id_user == undefined) {
									callback(request, "/");
								} else {
									callback(request, '/tableUsers');
								}
							}
						});
					}
				});
			}
		},
		getAllUsers : function(request, callback) {
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE isAdmin != 1", function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, null, err);
				} else {
					var users = rows;
					connection.query("SELECT * FROM " + db.tableUsers + " WHERE isAdmin ='1' AND id_user != ? AND id_user !='1'", [request.user.id_user], function(err, rows, fields) {
						if (err) {
							console.log(JSON.stringify(err));
							callback(null, null, err);
						} else {
							callback(users, rows, null);
						}
					});
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
		getGameAndHighscores : function(gameId, request, callback) {
			connection.query("SELECT * FROM " + db.tableGames + " WHERE id_game = ?", [gameId], function(err, rowsGame, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, null, err);
				} 
				else {
					connection.query("SELECT high.*, user.username FROM " + db.tableHighscores + " high left join " + db.tableUsers + " user ON high.user = user.id_user WHERE game = ? ORDER BY score DESC LIMIT 10", [gameId], function(err, rowsScore, fileds) {
						if (err) {
							console.log(err);
							callback(null, null, err);
						}
						else{
							callback(rowsGame, rowsScore, null);
						}
					});
				}
			});
		},
		getGame : function(gameId, request, callback) {
			connection.query("SELECT * FROM " + db.tableGames + " WHERE id_game = ?", [gameId], function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, null, err);
				} 
				else {
					callback(rows, request, null);	
				}
			});
		},
		searchGames : function(searchString, callback) {
			connection.query("SELECT * FROM " + db.tableGames + "WHERE (gamename LIKE '%" + searchString + "%' or description LIKE '%" + searchString + "%') AND inactive LIKE 0 ", function(err, rows, fields) {
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
			var userid = request.user.id_user;
			connection.query("SELECT * FROM " + db.tableGames + " WHERE id_game= ?", [gameId], function(err, rows, fields) {
				if (err || rows.length == 0) {
					console.log(JSON.stringify(err));
					callback("/", err);
				} else {
					var inactive = 0;
					//wenn nicht inaktiv, dann auf inaktiv setzten

					if (rows[0] != null && rows[0].inactive == 0) {
						inactive = 1;
					}
					if(request.user.isAdmin == 1 || rows[0].user == request.user.id_user){
						connection.query("UPDATE " + db.tableGames + " SET inactive= ? WHERE id_game= ?", [inactive, gameId], function(err) {
							if (err) {
								console.log(JSON.stringify(err));
								callback("/", err);
							} else if(request.user.isAdmin == 1){
								callback('/tableGames', null);
							} else{
								callback('/myGames', null);
							}
						});
					} else{
						callback('/', null);
					}	
				}
			});
		},
		removeUser : function(request, callback) {
			var userId = request.query.userId;
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE id_user= ?", [userId], function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback('/', err);
				} else {
					var inactive = 0;
					//wenn nicht inaktiv, dann auf inaktiv setzten
					if (rows[0].inactive == 0) {
						inactive = 1;
					}
					connection.query("UPDATE " + db.tableUsers + " SET inactive= ? WHERE id_user= ?", [inactive, userId], function(err) {
						if (err) {
							console.log(JSON.stringify(err));
							callback('/', err);
						} else {
							callback('/tableUsers', null);
						}
					});
				}
			});
		},
		becomeAdmin : function(request, callback) {
			var userId = request.query.userId;
			connection.query("SELECT * FROM " + db.tableUsers + " WHERE id_user= ? AND id_user !='1' AND inactive='0'", [userId], function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(false, err);
				} else if (!rows.length) {
					console.log("ungültige userId ( " + userId + " ) in becomeAdmin");
					callback(false, null);
				}else {
					var isAdmin = 0;
					//wenn nicht inaktiv, dann auf inaktiv setzten
					if (rows[0].isAdmin == 0) {
						isAdmin = 1;
					}
					connection.query("UPDATE " + db.tableUsers + " SET isAdmin= ? WHERE id_user= ?", [isAdmin, userId], function(err) {
						if (err) {
							console.log(JSON.stringify(err));
							callback(false, err);
						} else {
							callback(true, null);
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
							var path = __dirname + "/../uploads/" + request.user.id_user + "/" + gameId + "." + fieldsObject.gamename;
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
												connection.query("UPDATE " + db.tableGames + " SET imageEnc= ? WHERE id_game= ?", [fileEnc, gameId], function(err, rows, fields) {
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
												connection.query("UPDATE " + db.tableGames + " SET javascript= ? WHERE id_game= ?", [originalFilename, gameId], function(err, rows, fields) {
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
					callback("upload", err);
				}
			});
		},
		createGameFolder : function(request, gameObj, callback) {
			// Legt den Ordner für das Spiel an
			if(gameObj.gamedata.name != undefined) {
				connection.query("INSERT INTO " + db.tableGames + "(gamename, description, user, inactive) VALUES (?, ?, ?, 1)", [gameObj.gamedata.name, gameObj.gamedata.description, request.user.id_user], function(err, rows, fields) {			
	    			if (!err) {
						// Gibt die ID des des zuvor erstellten Datensatzes aus
						connection.query("SELECT LAST_INSERT_ID() as id_game", function(err, rows, fields){
							if (!err) {
								// ID für das Spiel wird in der Datenbank festgelegt und Pfad vervollständigt
								gameId = rows[0].id_game;
								var path = __dirname + "/../uploads/" + request.user.id_user + "/" + gameId + "." + gameObj.gamedata.name;
		    					// Ordner für das Spiel wird erstellt
								if(typeof gameObj.gamedata.name != undefined) {
				    				fs.mkdir(path, 0777, function (err) {
										if (err) {
											console.log(JSON.stringify(err));
											callback("/", err);
										}
									});
								}

						//________________________		
						//Speichern des JSON Objektes
						var path_json = __dirname + "/../uploads/" + request.user.id_user + "/" + gameId +"."+gameObj.gamedata.name + "/parameter.js";
						fs.writeFile(path_json, "var options = " + JSON.stringify(gameObj), function(err){
							if(err){
								return console.log(err);
							}
						});
						//___________________


							} else {
								console.log("SubmitError " + JSON.stringify(err));
								return;
							}
						});
					} else {
						console.log("INSERT ERROR ------ " + JSON.stringify(err));
						callback(null, err);
					}
				});
			}
			callback(null,null);
		},
		createGameFiles : function(request, fieldsObject, filesObject, fieldsList, filesList, callback) {
			if(filesObject != undefined) {
				var gameId;
				connection.query("SELECT LAST_INSERT_ID() as id_game", function(err, rows, fields){
					if (!err) {
						// ID für das Spiel wird in der Datenbank festgelegt und Pfad vervollständigt
						gameId = rows[0].id_game;
						var path = __dirname + "/../uploads/" + request.user.id_user + "/" + gameId + ".";
						var extension = ".png";
						connection.query("SELECT gamename FROM " + db.tableGames + " WHERE id_game = " + gameId, function(err, rows, fields) {
							if(!err) {
								path += rows[0].gamename;
								// Preview
								if(filesObject.preview != undefined) {
									if(filesObject.preview[0].size > 0) {
										fs.readFile(filesObject.preview[0].path, function(err, data) {
											if(!err) {
												fs.writeFile(path + "/" + "image" + extension, data, function() {
													fs.unlink(filesObject.preview[0].path, function() {
														if(err) {
															console.log(JSON.stringify(err));
														}
													});
												});
											}
										});
									} 
								} else {
									fs.createReadStream(__dirname + '/../img/placeholder.png').pipe(fs.createWriteStream(path + "/" + "image" + extension));
								}
								if(filesObject.background != undefined) {
									if(filesObject.background[0].size > 0) {
										fs.readFile(filesObject.background[0].path, function(err, data) {
											fs.writeFile(path + "/" + filesObject.background[0].fieldName + extension, data, function() {
												fs.unlink(filesObject.background[0].path, function() {
													if(err) {
														console.log(JSON.stringify(err));
													}
												});
											});
										});
									}
								}
								/*// Spielerform - player
								if(filesObject.player != undefined) {
									if(filesObject.player[0].size > 0) {
										fs.readFile(filesObject.player[0].path, function(err, data) {
											fs.writeFile(path + "/" + filesObject.player[0].fieldName + extension, data, function() {
												fs.unlink(filesObject.player[0].path, function() {
													if(err) {
														console.log(JSON.stringify(err));
													}
												});
											});
										});
									}
								}
								// Schussform - shoot
								if(filesObject.shoot != undefined) {
									if(filesObject.shoot[0].size > 0) {
										fs.readFile(filesObject.shoot[0].path, function(err, data) {
											fs.writeFile(path + "/" + filesObject.shoot[0].fieldName + extension, data, function() {
												fs.unlink(filesObject.shoot[0].path, function() {
													if(err) {
														console.log(JSON.stringify(err));
													}
												});
											});
										});
									}
								}
								// Gegnerform - foes		
								if(filesObject.foes != undefined) {
									if(filesObject.foes[0].size > 0) {
										fs.readFile(filesObject.foes[0].path, function(err, data) {
											fs.writeFile(path + "/" + filesObject.foes[0].fieldName + extension, data, function() {
												fs.unlink(filesObject.foes[0].path, function() {
													if(err) {
														console.log(JSON.stringify(err));
													}
												});
											});
										});
									}
								}*/
							} else {
								console.log(err);
							}
						});
					} else {
						console.log(err);
					}
				});				
			}
			callback(null,null);
		}
	}

};