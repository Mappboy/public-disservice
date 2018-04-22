/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const $cards = $("<main class='cards'/>").appendTo("body");

const render_$card = function({name, description, flavor_text, category, attack, defense, cost, major_types, minor_types, arrows, source}){
	const $card = $("<div class='card'/>");
	
	const arrow_order = ["place", "any", "force"];
	const minor_types_order = ["income", "revolutionary", "flying", "naval", "electronic", "human", "single"];
	
	minor_types.sort((a, b)=> minor_types_order.indexOf(a) - minor_types_order.indexOf(b));
	
	const major_types_text = major_types.join(" ");
	const minor_types_text = minor_types.join(", ");
	
	$card.addClass(category);
	
	const money_symbol = (match, money)=> `<span class='money'><span>${money}</span></span>`;
	
	const damage_symbol = (match, damage)=> `<span class='damage-counter'><span>${damage}</span></span>`;
	
	const revolution_symbol = (match, revolutions)=> `<span class='revolution-counter'><span>${revolutions}</span></span>`;
	
	const bold = (match, text)=> `<b>${text}</b>`;
	
	$card.html(`\
<div class='header'>
	${(cost != null) ? `<span class='money'><span>${cost}</span></span>` : ""}
	<span class='name'>${name}</span>
</div>
<div class='categorical-bar'>
	<div class='category'>${category}</div>
	<div class='major-types'>${major_types_text}</div>
</div>
<div class='image'>
	<img class='img' src='images/cards/${name}.jpg'>
</div>
<div class='flavor-text'>${
			flavor_text
		}</div>
<div class='description'>${
			description
				.replace(/\b(Condition:|(?:Economy )?Action:|Stability:)/gi, bold)
				.replace(new RegExp(`\
\\b(\
\
Unblockable|Untargetable|Hidden|\
\
Upkeep|Child(ren)?|(?:Economy )?Actions?|\
\
At the (beginning|end) of your (next )?turn|\
\
Immediate(ly)?|Gain(s|ed)?|Remove(s|d)?|Spend(s|ed)?|Destroy(s|ed)?|Target(s|ed)?|\
\
Revolution|Forces?|Places?|Events?|Permanents?|Systems?|\
\
-?Types?|Occult|Military|Corporate|Electronic|Single|Human|Flying|Naval|Income|Revolutionary|Drug|\
\
If|Else|Or|Not|Unless|Non-\
)\\b\
`, 'gi'), bold)
				// Attack/defense
				.replace(/\b(X|\d*)m\b/gi, money_symbol)
				.replace(/\b(X|\d*)d\b/gi, damage_symbol)
				.replace(/\b(X|\d*)r\b/gi, revolution_symbol)
				.replace(/(\ [+-]?\d+(?:\ \/\ [+-]?\d+)?)/g, bold)
		}</div>
<div class='lower'>
	${(attack != null) ? `<div class='attack-defense'>${attack}/${defense}</div>` : ""}
	<div class='minor-types'>${minor_types_text}</div>
</div>
<div class='arrows'></div>\
`
	);
	
	for (let arrow_category of Array.from(arrows.sort((a, b)=> arrow_order.indexOf(a) - arrow_order.indexOf(b)))) {
		$card.find(".arrows").append(`<div class='arrow ${arrow_category}'>`);
	}
	
	$card.attr("data-source", source);
	return $card;
};


$.getJSON("data/cards.json", function(cards){
	
	const export_only = location.hash.replace(/#/, "");
	
	for (let set_name in cards) {
		const sorted_cards = cards[set_name];
		if ((!export_only) || (export_only === set_name)) {
			$("<h2>").text(set_name).appendTo($cards);
			for (let card of Array.from(sorted_cards)) {
				render_$card(card).appendTo($cards);
			}
			if (export_only) {
				for (let i = sorted_cards.length, end = 10*7, asc = sorted_cards.length <= end; asc ? i < end : i > end; asc ? i++ : i--) { $("<div class='card back'/>").appendTo($cards); }
			}
		}
	}
	if ((!export_only) || (export_only === "Back")) {
		$("<h2>").text("Back").appendTo($cards);
		return $("<div class='card back'/>").appendTo($cards);
	}
});
