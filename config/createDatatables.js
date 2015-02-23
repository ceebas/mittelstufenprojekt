var mysql = require('pg');
var dbconfig = require('./database');
//var connection = mysql.connect(dbconfig.connection);

module.exports = function() {
	/* Datenbank-Tabellen erstellen */
	/* Datenbank-Tabellen erstellen */
	//Tabelle fuer Benutzer
	mysql.connect(dbconfig.connection.host, function(err, client, done) {

		client.query("CREATE TABLE IF NOT EXISTS " + dbconfig.tableUsers + "(id_user INT NOT NULL AUTO_INCREMENT, username VARCHAR (45) UNIQUE NOT NULL, password VARCHAR (200) NOT NULL, email VARCHAR (100), inactive INT, isAdmin INT, PRIMARY KEY (id_user))", function(err, rows, fields) {
		if (err) {
			var d = new Date();
			console.log(d + "Fehler beim erstellen der Tabelle '" + dbconfig.tableUsers + "' " + JSON.stringify(err));
		} 
		client.query("SELECT * FROM " + dbconfig.tableUsers, function(err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
			} else {
				if (rows[0] == undefined) {
					client.query("INSERT INTO " + dbconfig.tableUsers + " ( username, email, password, isAdmin ) values ('admin','info@i2dm.de','$2a$10$Lh4XtzJW2UuTy/dacCQCR.kbXVpETvscQ8VGDufF5gICchOHpt0nW','1')", function(err, rows) {
						if (err) {
							console.log(JSON.stringify(err));
						}
					});
				}
			}
		});
	});
	//Tabelle fuer Spiel
	client.query("CREATE TABLE IF NOT EXISTS " + dbconfig.tableGames + "(id_game INT NOT NULL AUTO_INCREMENT, gamename VARCHAR (20), description VARCHAR (150),  user INT, imageEnc VARCHAR (5), javascript VARCHAR (30), inactive INT, FOREIGN KEY (user) REFERENCES " + dbconfig.tableUsers + " (id_user), PRIMARY KEY (id_game))", function(err, rows, fields) {
		if (err) {
			var d = new Date();
			console.log(d + "Fehler beim erstellen der Tabelle '" + dbconfig.tableGames + "' " + JSON.stringify(err));
		}
	});
	// Tabelle fuer Spielstaende
	client.query("CREATE TABLE IF NOT EXISTS " + dbconfig.tableHighscores + "(id_highscore INT NOT NULL AUTO_INCREMENT, user INT, game INT, score INT, tStamp DATETIME, FOREIGN KEY (user) REFERENCES " + dbconfig.tableUsers + " (id_user), FOREIGN KEY (game) REFERENCES " + dbconfig.tableGames + " (id_game), PRIMARY KEY (id_highscore))", function(err, rows, fields) {
		if (err) {
			var d = new Date();
			console.log(d + "Fehler beim erstellen der Tabelle '" + dbconfig.tableHighscores + "' " + JSON.stringify(err));
		}
	});

	})
	
}