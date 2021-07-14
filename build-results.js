const fs = require("fs");
const pdf = require("pdf-parse");

// const resultsDir = "all-results"
const resultsDir = "testfile"
const results = {}

function readDirs(targetDir) {
	fs.readdir(targetDir, (err, dirs) => {
		if (err) console.log(err);
		// console.log({dirs, dirSort: dirs.sort()})
		console.log({targetDir, dirs})
	
		dirs.sort().forEach((dir) => {
			// console.log(dir)

			function readPdfs(targetSubDir) {
				fs.readdir(`${targetSubDir}`, (err, files) => {
					console.log({files});
					files.forEach((file) => {
						const filePath = `${targetSubDir}/${file}`;
						fs.stat(filePath, (err, stats) => {
							console.log(stats.isFile());
							if (stats.isFile()) {
								console.log(file);
								const semester = file.match(/\d(th|rd)/i)[0].toLowerCase();
								const probidhan = file.match(/\d{4}/)[0] || "2016";
								const dataBuffer = fs.readFileSync(filePath);
								pdf(dataBuffer)
									.then((data) => {
										console.log({ semester, probidhan });
										addResults(data.text, semester, probidhan, dir);
									})
									.catch((err) => {
										console.log({ err, filePath });
									});
								// result[probidhan] = results[probidhan] || {}
								// results[probidhan][]
							} else if(stats.isDirectory()) {
								fs.readdir(filePath, (err, files) => {
									console.log(files)
									readPdfs(filePath)
								})
							}
						});
					});
				});
			}
			readPdfs(`${targetDir}/${dir}`)
		});
	});
}

readDirs(resultsDir)

function addResults(text, semester, probidhan, exam) {
	const resultReg =
		/((?<rollP>\d{6}) \((?<gpa>\d.\d\d)\))|((?<rollF>\d{6}) ?(?<subjects>\{ ? ?((\w{10,20}-)? ?\n?(\\n)?\d{4,5}\n? ?(\\n)?(\((\w,?)+\))?,?;? ?\n?)+\}?))/g;
	// const splitSubs = /(?<subCode>\d{5}) ?\((?<type>\w,?.?){1,3}\)/g;
	const splitSubs = /(?<subCode>\d{4,5}) ?\n?(\\n)?\((?<type>\w,?.?){1,3}\)/g;

	let matches = [];
	// const results = {}
	while ((matches = resultReg.exec(text))) {
		if(!matches.groups) {
			console.log({matches})
		}
		const { rollP, gpa, rollF, subjects } = matches.groups;
		// console.log(matches)
		if (rollF) {
			let matchesSub,
				resultSub = [];
			// console.log(subjects)
			while ((matchesSub = splitSubs.exec(subjects))) {
				const { subCode, type } = matchesSub.groups;
				// resultSub.push({ subCode, type });
				resultSub.push(subCode + "-" + type);
			}
			results[probidhan] = results[probidhan] || {};
			results[probidhan][rollF] = results[probidhan][rollF] || {};
			results[probidhan][rollF][semester] = results[probidhan][rollF][semester]|| {};
			// if(results[probidhan][rollF][semester]) {
			// 	results[probidhan][rollF][semester] = {}
			// }
			results[probidhan][rollF][semester][exam] = resultSub;
		} else if (rollP) {
			// console.log(gpa)
			results[probidhan] = results[probidhan] || {};
			results[probidhan][rollP] = results[probidhan][rollP] || {};
			results[probidhan][rollP][semester] = results[probidhan][rollP][semester]|| {};
			results[probidhan][rollP][semester][exam] = gpa;
			// results[rollP]= { gpa };
		} else {
			console.log({ rollP, gpa, rollF, subjects })
		}
	}

	// console.log(
	// 	Object.keys(results["2016"]).length + Object.keys(results["2010"]).length
	// );
	fs.writeFile(
		"results.json",
		JSON.stringify(results),
		function (err) {
			if (err) throw err;
			console.log("File is created successfully.");
		}
	);
}
