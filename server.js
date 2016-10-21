const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { Server } = require('http');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000

let collectiveCommits = 0;

// Gather all class Github Links provided in class data
const classData = JSON.parse(fs.readFileSync('data/class-info.json', 'utf8'));
const classGithubs = [];
let {students} = classData;
Object.keys(students).forEach(student => {
  classGithubs.push(students[student].github)
})

// Gather list of periods in order to
let periods = ["2016-01-01&to=2016-01-31", "2016-02-01&to=2016-02-28", "2016-03-01&to=2016-03-31", "2016-04-01&to=2016-04-30", "2016-05-01&to=2016-05-31", "2016-06-01&to=2016-06-30", "2016-07-01&to=2016-07-31", "2016-08-01&to=2016-08-31", "2016-09-01&to=2016-09-30", "2016-10-01&to=2016-10-31", "2016-11-01&to=2016-11-30", "2016-12-01&to=2016-12-31"]

// Gets the current month so that it will only progress that far in period array.
let currentMonth = new Date();
currentMonth = currentMonth.getMonth();

//Iterates through each of the classmembers and each given time period and scrapes the raw html data from github
const commitGenerate = new Promise(function(resolve, reject){
  const expectedIterateCount = (currentMonth + 1) * (classGithubs.length) - 1
  let iterateCount = 0;
    classGithubs.forEach((github)=>{
      for (var i = 0; i <= currentMonth; i++){
        fetch(`${github}?tab=overview&from=${periods[i]}`)
          .then(function(res) {
              return res.text();
          }).then(function(body) {
             const $ = cheerio.load(body);
             collectiveCommits += commitNumberParser($($("#js-contribution-activity").find("h4.m-0")[0]).html().toString());
             iterateCount++
             if (expectedIterateCount === iterateCount) {resolve(collectiveCommits)}
          });
        }
    });
})

//Uses regex to match the number of commits in that given time period
const regex = /Created\n*\s*([0-9]+)\n*\s*commit/gi;
const commitNumberParser = (string) => {
  let result = regex.exec(string)
  let returnNumber = 0;
  if (result) {
    returnNumber = Number(result[1])
  }
  return returnNumber
}

//ROUTE FOR API CALL
app.get('/api/class-commits', (req, res, err) => {
  console.log(req)
  commitGenerate.then((com)=> res.json({"commits": com}))
})

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
