const valueChanges = function () {
	let gradeOptions = document.getElementById('gradeOptions');
	let sectionOptions = document.getElementById('sectionOptions');
	let defOption = document.getElementById('defOption');
	const sections = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H' ]

	// const gradeText = gradeOptions.options[ gradeOptions.selectedIndex ].text
	const gradeNum = gradeOptions.value
	if (gradeNum) {
		$("#sectionOptions").empty(); // Deletes all the options in the sectionOptions select
		sectionOptions.add(defOption);
		if (gradeNum < 8) {
			for (let index = 0; index < sections.length; index++) {
				let option = new Option(sections[ index ], sections[ index ]); // Creates option with text 'A' and value 'A' (Till H)
				sectionOptions.add(option);
			}
		}
		else if (gradeNum < 10) {
			for (let index = 0; index < 2; index++) {
				let option = new Option('IC ' + sections[ index ], sections[ index ]);
				sectionOptions.add(option); // Creates option with text 'IC A' and value 'A' (Till B)
			}

			for (let index = 0; index < 2; index++) {
				let option = new Option('IG ' + sections[ index ], sections[ index ]);
				sectionOptions.add(option); // Creates option with text 'IG A' and value 'A' (Till B)
			}
		}
		else if (gradeNum == 10) {
			let option = new Option('IC', 'IC');
			sectionOptions.add(option); // Creates option with text 'IC A' and value 'A' (Till B)
			option = new Option('IG', 'IG');
			sectionOptions.add(option); // Creates option with text 'IG' and value 'IG
		}
		else {
			let option = new Option('ISC', 'ISC'); // Creates option with text 'ISC' and value 'ISC'
			sectionOptions.add(option);
			if (gradeNum < 12) {
				option = new Option('AS', 'AS');
				sectionOptions.add(option);
			} else {
				option = new Option('AL', 'AL')
				sectionOptions.add(option);
			}
		}
	}
}
document.getElementById('gradeOptions').addEventListener('change', valueChanges);
// And run the function on page load as well, as until now
valueChanges();
