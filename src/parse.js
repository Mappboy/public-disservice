/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

module.exports = function(all_card_data){
	
	const major_type_names = {
		C: "Corporate",
		O: "Occult",
		M: "Military",
		N: "Neutral",
		F: "Fantastic"
	};
	
	const category_class_names = {
		a: "any",
		p: "place",
		f: "force",
		e: "event"
	};
	
	const parse_card = function(card_data){
		let type_major_char;
		let name = "";
		let description = "";
		let flavor_text = "";
		let major_types = [];
		let minor_types = [];
		const arrows = [];
		let attack = undefined;
		let defense = undefined;
		let category = undefined;
		let cost = undefined;
		
		const lines = card_data.trim().split("\n");
		let lwt = 0;
		for (var line of Array.from(lines)) {
			line = line.trim();
			lwt += 1;
			
			const from_content_context = function() {
				let m;
				if (line === "") { return; }
				if (m = line.match(/^(\d+) \/ (\d+)$/)) {
					// Attack / Defense
					attack = parseFloat(m[1]);
					return defense = parseFloat(m[2]);
				} else if (line.match(/^(([a-z]+, )*[a-z]+)$/)) {
					// Minor Types
					minor_types = line.split(/,\s?/);
					return minor_types = minor_types.filter(function(mt){
						for (type_major_char in major_type_names) {
							const major_type_name = major_type_names[type_major_char];
							if (mt.toLowerCase() === major_type_name.toLowerCase()) {
								return false;
							}
						}
						return true;
					});
				} else if ((m = line.match(/^["“](.*)["”]$/))) {
					// Flavor Text
					return flavor_text = `<p><q>${m[1]}</q></p>`;
				} else {
					// Description
					return description += `<p>${line}</p>`;
				}
			};
			
			switch (lwt) {
				case 1:
					if ((line.indexOf(" - ")) !== -1) {
						var cost_str, type_major_str;
						[name, cost_str, type_major_str] = Array.from(line.split(" - "));
						if (!cost_str.match(/n\/a/i)) {
							cost = parseFloat(cost_str);
							if (isNaN(cost)) { cost = cost_str.replace(/m/, ""); }
						}
						major_types = (() => {
							const result = [];
							for (type_major_char of Array.from(type_major_str)) {
								result.push(major_type_names[type_major_char]);
							}
							return result;
						})();
					} else {
						// Name
						name = line;
					}
					break;
				case 2:
					// Category
					category = line.toLowerCase();
					break;
				case 3:
					// Arrows
					if (line === "") {
						lwt += 1;
					} else {
						if (!line.match(/none|n\/a/i)) {
							for (let arrow_def of Array.from(line.split(","))) {
								const match = arrow_def.match(/(\d+)(f|p|a)/i);
								if (match) {
									const [_, n_arrows, arrow_category] = Array.from(match);
									for (let i = 0, end = parseInt(n_arrows), asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) { arrows.push(category_class_names[arrow_category]); }
								} else {
									console.error(`Arrow definitions for ${name} don't jive: ${line}`);
								}
							}
						}
					}
					break;
				default:
					from_content_context();
			}
		}
		
		__guardMethod__(console, 'assert', o => o.assert((category != null), "no category"));
		
		return {name, description, flavor_text, category, attack, defense, cost, major_types, minor_types, arrows, source: card_data};
	};
	
	
	const card_datas = all_card_data.split(/\f|________________/);
	return (() => {
		const result = [];
		for (let card_data of Array.from(card_datas)) {
			if (card_data.trim().match(/\n/im)) {
				result.push(parse_card(card_data));
			}
		}
		return result;
	})();
};

function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}