const fs = require("fs");
const pdf = require("pdf-parse");
const express = require("express");
const app = express();
const { subjects } = require("./subjects")
// console.log(subjects)
const results = {}
const fileName = "8th_Irr_result_book_2000"
// let dataBuffer = fs.readFileSync(`results/${fileName}.pdf`);
let dataBuffer = fs.readFileSync("testfile/18B/8th_Irr_result_book_2000.pdf");
pdf(dataBuffer).then(function (data) {
    // number of pages
    // console.log(data.numpages);
    // number of rendered pages
    // console.log(data.numrender);
    // PDF info
    // console.log(data.info);
    // PDF metadata
    // console.log(data.metadata);
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    // console.log(data.version);
    // PDF text
    // console.log(data.text);
    // const failed = data.text.match(/((\d{6}) (\{.?.?(\d{5}\(\w\),? ?\n?\}?)+))/g);
    // console.log(failed.length)
    // const newArry = failed.map(value => value.replace(/\n/g, ""))
    // console.log(newArry.length)

    // const modifiedText = await data.text.match(/(\\nBangladesh Technical Education Board\\nOffice of the Controller of Examinations\\nAgargaon, Sherebangla Nagar, Dhaka-1207\\nNOTICE\\nMemo No. (\d{2,4}\.?)+)\\nDate : (\d{2,4}\-?)+\\n\\nPage \d{1,4} of \d{1,4}/g)
    // await console.log(modifiedText)
    // return await getAllResults(data.text)
    // console.log(data.text)
    getAllResults(data.text)
});

app.use(express.json());

//let text = fs.readFileSync("newfile.txt");
//console.log(text);

function getAllResults(text) {
    // const resultReg = /((?<rollP>\d{6}) \((?<gpa>\d.\d\d)\))|(?<rollF>\d{6}) (?<subjects>\{.+?(\d{5}\((\w,?.?){1,3}\),? ?(?:\n)?\}?)+)/g;
	// const splitSubs = /(?<subCode>\d{5})\((?<type>\w,?.?){1,3}\)/g;

    // const resultReg = /((?<rollP>\d{6}) \((?<gpa>\d.\d\d)\))|((?<rollF>\d{6}) ?(?<subjects>\{ ? ?((\w{10,20}-)? ?(\\n)?\d{5}\n? ?(\((\w,?)+\))?,?;? ?\n?)+\}?))/g;
	// const splitSubs = /(?<subCode>\d{5}) ?\((?<type>\w,?.?){1,3}\)/g;
	// const splitSubs = /(?<subCode>\d{5}) ?\n?\((?<type>\w,?.?){1,3}\)/g;

    const resultReg =
    /((?<rollP>\d{6}) \((?<gpa>\d.\d\d)\))|((?<rollF>\d{6}) ?(?<subjects>\{ ? ?((\w{10,20}-)? ?\n?(\\n)?\d{4,5}\n? ?(\\n)?(\((\w,?)+\))?,?;? ?\n?)+\}?))/g;
    const splitSubs = /(?<subCode>\d{4,5}) ?\n?(\\n)?\((?<type>\w,?.?){1,3}\)/g;
    
	let matches = []
	// const results = {}
	while ((matches = resultReg.exec(text))) {
        const { rollP, gpa, rollF, subjects } = matches.groups;
        // console.log(matches)
        if(rollF) {
            let matchesSub,
            resultSub = [];
            // console.log(subjects)
            while ((matchesSub = splitSubs.exec(subjects))) {
                const { subCode, type } = matchesSub.groups;
                resultSub.push({ subCode, type });
            }
            results[rollF]= resultSub;
        } else if(rollP) {
            results[rollP]= { gpa };
        }
	}
    // console.log(matches.length)
    
    fs.writeFile(`results/${fileName}.json`, JSON.stringify(results), function (err) {
        if (err) throw err;
		console.log("File is created successfully.");
	});
    fs.writeFile(`results/${fileName}.txt`, JSON.stringify(text), function (err) {
        if (err) throw err;
		console.log("File is created successfully.");
	});
}

app.get("/", (req, res) => res.send(`Total results in "${fileName}" : ${Object.keys(results).length}`))

app.get("/result", (req, res) => {
    const {roll, rollList} = req.body;
    const resResult = {}
    console.log(req.body)
    if(rollList) {
        rollList.forEach(roll => {
            const result = results[roll];
            if(result) {
                if(!result.gpa) {
                    console.log({result})
                    const failedAt = []
                    result.forEach(sub => {
                        const { subCode, type } = sub;
                        failedAt.push({
                            subjectName: subjects[subCode],
                            subCode,
                            type
                        })
                    })
                    console.log({failedAt})
                    resResult[roll] = failedAt;
                } else {
                    resResult[roll] = result;
                }
            }
        });
        return res.json(resResult)
    }
    if(results[roll]) {
        return res.json(results[roll])
    }
    return res.sendStatus(404).json("Roll Number not found")
})

app.listen(4000, () => {
    console.log("app is listing to port 4000")
})