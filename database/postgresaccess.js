/* Datenbank */
var db = require('../config/database.js');

module.exports = function(fs, bcrypt, pg) {


	/* Datenbankverbindung herstellen
	var connection = mysql.createConnection(db.connection);
	/* Datenbank erstellen 
	connection.query("CREATE DATABASE IF NOT EXISTS " + db.database, function(err, rows, fields) {
		if (err) {
			var d = new Date();
			console.log(d + "Fehler beim erstellen der Datenbank '" + db.database + "' " + JSON.stringify(err));
		} else {
			connection.query('USE ' + db.database);
			/* Datenbank-Tabellen erstellen 
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
	});*/

	//Objekte nach Anwendungsfall zurückgeben
	return {
		/*-- Passport und User Abfragen --*/
		test : function(callback) {
			pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    			client.query('SELECT * FROM test_table', function(err, result) {
      				done();
      				if (err) { 
      					callback("Error " + err); 
      				} else {
      					callback(result.rows); 
      				}
    			});
  			});
		}
	}
};

