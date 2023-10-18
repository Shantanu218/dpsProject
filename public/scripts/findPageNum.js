const findPage = (event) => {
	let pageNum;
	const url = window.location.href.slice();
	const index = url.indexOf('?');
	if (index == -1) // On the first page
		pageNum = 0;
	else {
		slicedString = url.slice(index + 1);
		const params = new URLSearchParams(slicedString);
		const obj = Object.fromEntries(params.entries());
		console.log(slicedString)
		console.log(obj)
		console.log(obj.page)
		pageNum = obj.page
	}
	return pageNum
}