const closeAlerts = function () {
	// this function will add 'd-none' class to all alerts, which will remove them from the page
	const alerts = document.querySelectorAll('.alert-dismissible').forEach(el => el.classList.add('d-none'));
}

const fadeAlerts = function () {
	// this function will fade all alerts over 2.25 seconds. Then calls closeAlerts()

	document.querySelectorAll('.alert-dismissible').forEach(el => {
		el.style.transition = "opacity 2.25s linear 0s";
		el.style.opacity = 0;
	});
	setTimeout(closeAlerts, 2250); // Closes alerts after 2.25 seconds
}

setTimeout(fadeAlerts, 3000);
// initiate fade-close sequence 4 seconds after a page is loaded
