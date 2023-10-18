
module.exports = func => { // Func is passed in.

	return (req, res, next) => { // Returns a new function that executes func and then catches any errors 

		func(req, res, next)?.catch(next);
	}
}


// module.exports = func => {
// 	return (req, res, next) => {
// 		func(req, res, next)?.catch(next);
// 	}
// }