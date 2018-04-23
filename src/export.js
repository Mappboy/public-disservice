/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const fs = require("fs");
const CardGameGenerator = require("card-game-generator");

const counters = {};
for (let fname of fs.readdirSync("images/counters")) {
	if (fname.match(/\.png/)) {
		var m;
		const counter_name = fname.replace(/[\-.].*/, "");
		if (m = fname.match(/-(plus|minus)/)) {
			const side = {"plus": "obverse", "minus": "reverse"}[m[1]];
      if (counters[counter_name]) {
              counters[counter_name][side] = fname;
      } else {
        counters[counter_name] = {type: "tile"};
      }
		} else {
			counters[counter_name] = {type: "token", fname};
		}
	}
}

const cardSets = JSON.parse(fs.readFileSync("data/cards.json", "utf8"));

const cgg = new CardGameGenerator({cardSets, counters});

console.log("render cards");
cgg.renderCards({
	page: "index.html",
	cardWidth: 225,
	cardHeight: 325,
	scale: 2,
	debug: false,
	to: "images/export/"
},
	function(err){
		if (err) { throw err; }
		console.log("export Tabletop Simulator save");
		return cgg.exportTabletopSimulatorSave({
			to: "data/export/",
			saveName: "Systemocracy",
			imagesURL: "https://raw.githubusercontent.com/1j01/systemocracy/gh-pages/images",
			renderedImagesURL: "https://raw.githubusercontent.com/1j01/systemocracy/gh-pages/images/export"
		},
			function(err){
				if (err) { throw err; }
				console.log("export save to Tabletop Simulator's Chest");
				cgg.exportSaveToTabletopSimulatorChest();
				return console.log("done");
		});
});
