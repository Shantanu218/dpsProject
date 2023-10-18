const previewMultiple = function (event) {
	let form = document.querySelector('#formFile');
	let formSpan = document.querySelector('#formFileSpan');
	form.innerHTML = ''; formSpan.innerText = '';
	let images = document.querySelector("#images");
	let number = images.files.length;
	// console.log(images);
	for (i = 0; i < number; i++) {
		let urls = URL.createObjectURL(event.target.files[ i ]);
		form.innerHTML += `<img src='${urls}' class='form-file-image'>`;
		let fileObj = event.target.files[ i ];
		// console.log('fileObj => ', fileObj);
		let name = fileObj.name;
		formSpan.innerHTML += `${name}&#160;&#160;`;
	}
}
