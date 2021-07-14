const fs = require("fs");
const express = require("express");
const app = express();

let results;
fs.readFile("results.json", (err, data) => {
	if(err) return console.log(err)
	results = JSON.parse(data);
	// console.log(results)

	app.listen(5000, () => {
		console.log("app is listening to port: 5000");
	});
})

app.use(express.json());

app.get("/results", (req, res) => {
	const { roll } = req.body;
	// const resResult = results["2016"][roll] || results["2010"][roll];
	console.log(Object.keys(results))
	Object.keys(results).forEach(probidhan => {
		if (results[probidhan][roll]) {
			const resResult = {
				roll,
				probidhan,
				results: results[probidhan][roll]
			}
			return res.json(resResult);
		}
	})
	return res.json(`Result not found for roll no: ${roll}`);
});