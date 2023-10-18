const validateSize = function (event) {
	document.querySelector('#clearDiv').style.display = 'block';
	let indices = []; // Indices of images that are greater than 10 MB

	let fileCount = 0;
	if (event.target && event.target.files)
		fileCount = event.target.files.length;

	if (fileCount + imageCount > 6) {
		alert('You cannot have more than 6 files for one project, please delete some!');
		event.value = "";
		document.querySelector('#formFile').innerHTML = '';
		document.querySelector('#formFileSpan').innerText = '';
		document.querySelector('#clearDiv').style.display = 'none';
		document.querySelector('#images').value = '';
	} else {
		if (fileCount !== 0) {
			for (let a = 0; a < event.target.files.length; a++) {
				let sizeEvent = event.target.files[ a ].size / 1024 / 1024; // Checks if file uploaded is under 200 MB
				if (sizeEvent > 200) { // Checks if file is under 200 MB
					indices.push(a + 1);
				}
			}
			if (indices.length) {
				if (indices.length === 1)
					alert(`File uploaded ${indices} exceeds 200 MB`);
				else
					alert(`Files uploaded (${indices}) exceed 200 MB`);
				event.value = "";
				document.querySelector('#formFile').innerHTML = '';
				document.querySelector('#formFileSpan').innerText = '';
				document.querySelector('#clearDiv').style.display = 'none';
				document.querySelector('#images').value = '';
			}
		}
	}
}

function clearAll(event) {
	event.value = "";
	document.querySelector('#formFile').innerHTML = '';
	document.querySelector('#formFileSpan').innerText = '';
	document.querySelector('#clearDiv').style.display = 'none';
	document.querySelector('#images').value = '';
}