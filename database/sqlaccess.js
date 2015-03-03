/* Datenbank */
var db = require('../config/database.js');

module.exports = function(app, passport, fs, multiparty, bcrypt, mysql) {
	// Datenbankverbindung herstellen
	var connection = mysql.createConnection(db.connection);
	connection.config.database = db.database;

	return {
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
		getOwnUser : function(request, callback) {
			connection.query("select * from " + db.tableGames +" WHERE user='" + request.user.id_user +"'", function(err, rows, fields) {
				if (err) {
					console.log(JSON.stringify(err));
					callback(null, err);
				} else {
					callback(rows, request, null);
				}
			});
		}
	}

};

