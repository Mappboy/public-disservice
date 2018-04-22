/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

let left;
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const async = require("async");
const google = require("googleapis");
const GoogleAuth = require("google-auth-library");
const parse_card_data = require("./parse.js");

// If modifying these scopes, delete your previously saved credentials
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_DIR = path.join(((left = process.env.HOME != null ? process.env.HOME : process.env.HOMEPATH) != null ? left : process.env.USERPROFILE), ".credentials");
const TOKEN_PATH = path.join(TOKEN_DIR, "nodejs-drive-access.json");

// The list of documents to get card data from
const document_ids = [
	"16yxrlTSXQqHBAVXlUrRW8oxwCtuEDekdVirzZU7D_XI", // Systems
	"18HHX9qU6dYGWXSrX1oYZtofsd4bNGHQLdK6qvs9T46w", // Occult
	"1TOAoNigJ40vKIuDyaDRXfzb6lfhQYBqXT56z4y2RyyI", // Corporate
	"19MkaSLF3VUOl1L3PXrjCTQqxn_fNf_EM-xgsT2vQNJw", // Military
	"1fiYz_SJ0JVQgtGQVmR7_iDZKQNDmLrvghh09AKyZVrM" // Neutral/Misc
];

// Load client secrets from a local file.
fs.readFile("data/client_id.json", function(err, content){
	if (err) {
		console.error(`Error loading client secret file: ${err}`);
		return;
	}
	
	// Authorize a client with the loaded credentials, then call the  Drive API.
	return authorize(JSON.parse(content).web, function(auth){
		const service = google.drive("v3");
		
		const fetch = function(fileId, callback){
			console.log("Fetch", fileId);
			const mimeType = "text/plain";
			return service.files.export({auth, fileId, mimeType}, function(err, document_text){
				if (err) {
					return callback(err);
				} else {
					document_text = document_text
						.replace(/\n\[\w\](.|\n|\r)+/gm, "")
						.replace(/\[\w\]/g, "");
					return callback(null, document_text);
				}
			});
		};

		return async.map(document_ids, fetch, function(err, results){
			if (err) { throw err; }
			const card_data = results.join("\n\n\n\n\n\n\n\n\n\n\n\n");
			const cards = parse_card_data(card_data);
			
			const cards_by_set_name = {};
			for (let card of cards) {
				let set_name;
				if (card.category === "system") {
					set_name = "Systems";
				} else {
					[set_name] = Array.from(card.major_types);
				}
				if (cards_by_set_name[set_name] == null) { cards_by_set_name[set_name] = []; }
				cards_by_set_name[set_name].push(card);
			}
			
			return fs.writeFile("data/cards.json", JSON.stringify(cards_by_set_name, null, "\t"), "utf8", function(err){
				if (err) { throw err; }
				return console.log("Wrote data/cards.json");
			});
		});
	});
});

/*
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
var authorize = function(credentials, callback){
	const clientSecret = credentials.client_secret;
	const clientId = credentials.client_id;
	const [redirectUrl] = Array.from(credentials.redirect_uris);
	const auth = new GoogleAuth();
	const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	return fs.readFile(TOKEN_PATH, function(err, token){
		if (err) {
			return getNewToken(oauth2Client, callback);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			return callback(oauth2Client);
		}
	});
};

/*
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized client.
 */
var getNewToken = function(oauth2Client, callback){
	
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES
	});
	
	console.log(`Authorize this app by visiting this url: ${authUrl}`);
	
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	return rl.question("Enter the code from that page here: ", function(code){
		rl.close();
		return oauth2Client.getToken(code, function(err, token){
			if (err) {
				console.error("Error while trying to retrieve access token", err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			return callback(oauth2Client);
		});
	});
};


/*
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
var storeToken = function(token){
	try {
		fs.mkdirSync(TOKEN_DIR);
	} catch (err) {
		if (err.code !== "EEXIST") {
			throw err;
		}
	}
	
	fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	return console.log(`Token stored to ${TOKEN_PATH}`);
};
