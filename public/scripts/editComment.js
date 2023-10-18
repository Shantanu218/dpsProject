const editFunction = function (event) {
	event.preventDefault(); // Prevents button from submitting
	// console.dir(event.target)

	const editForm = event.target.form; // Selects edit form
	const deleteForm = event.target.form.nextSibling.nextSibling; // Selects delete form
	// console.log(deleteForm)

	console.dir(event.target.form)

	const starFieldset = event.target.form[ 0 ] // Selects input stars fieldset div
	starFieldset.style.display = "block" // Shows the fieldset for stars input

	const starsDiv = editForm.children.starsData; // Selects the div that contains the previous stars paragraph
	const starsPara = starsDiv.children[ 0 ] // Selects the stars paragraph with the stars images
	starsPara.remove() // Deletes the previous input fieldset
	starsDiv.remove() // Deletes the previous input div

	starFieldset.onclick = function (event) { // If the input is clicked then it selects the value of previous label and assigns the value to it
		const inputStar = event.target.previousElementSibling
		inputStar.checked = true
	}

	const editTextarea = event.target.form[ 6 ]; // Selects text area
	const editButton = event.target.form[ 7 ]; // Selects edit button

	editTextarea.readOnly = false; // Makes textarea editable
	editTextarea.selectionStart = editTextarea.value.length; // Moves cursor to the end of the textarea's text
	editTextarea.focus(); // Sets focus on textarea

	editButton.innerText = 'Save comment' // Changes inner text of edit button
	editButton.onclick = function (event) { // Function when button is clicked again
		editTextarea.readOnly = true; // Makes textarea read-only
		editButton.innerText = 'Edit comment' // Changes inner text of edit button
		// Form is submitted to the update comments route
	}
}

const deleteFunction = function (event) {
	event.preventDefault(); // Prevents button from submitting
	const deleteForm = event.target.form; // Selects delete form
	// console.dir(event.target)

	const deleteButton = event.target.form[ 0 ]; // Selects delete button
	deleteButton.innerText = 'Confirm by clicking again'
	deleteButton.onclick = function (event) { // Submits form and deletes comment
		// deleteButton.submit();
	}
}