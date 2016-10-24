const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { Server } = require('http');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;


// MIDDLEWARE (transform stream)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// let collectiveCommits = 0;

// Gather all class Github Links provided in class data


let generateStudentGithubs = () => {
  const classGithubs = [];
  return new Promise(function(resolve, reject){
    const classData = JSON.parse(fs.readFileSync('data/class-info.json', 'utf8'));
    let {students} = classData;
    Object.keys(students).forEach(student => {
      classGithubs.push(students[student].github)
    })
    resolve(classGithubs)
  })
}


// Gather list of periods in order to
let periods = ["2016-01-01&to=2016-01-31", "2016-02-01&to=2016-02-28", "2016-03-01&to=2016-03-31", "2016-04-01&to=2016-04-30", "2016-05-01&to=2016-05-31", "2016-06-01&to=2016-06-30", "2016-07-01&to=2016-07-31", "2016-08-01&to=2016-08-31", "2016-09-01&to=2016-09-30", "2016-10-01&to=2016-10-31", "2016-11-01&to=2016-11-30", "2016-12-01&to=2016-12-31"]

// Gets the current month so that it will only progress that far in period array.
let currentMonth = new Date();
currentMonth = currentMonth.getMonth();

//Iterates through each of the classmembers and each given time period and scrapes the raw html data from github
const commitGenerate = new Promise(function(resolve, reject){
  generateStudentGithubs().then((classGithubs)=> {
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
               if (expectedIterateCount === iterateCount) {resolve({"collective commits": collectiveCommits, "students": classGithubs.length})}
            });
          }
      });
  })
})

const EfficientCommitGenerate = () => {
  return new Promise((resolve, reject) => {
    let collectiveCommits = 0;
    generateStudentGithubs().then(classGithubs => {
      let iterateCount = 0;
      let expectedIterateCount = classGithubs.length
      classGithubs.forEach((github)=>{
        fetch(`${github}`)
          .then(function(res) {
              return res.text();
          }).then(function(body) {
             const $ = cheerio.load(body);
             EfficientCommitNumberParser($($($(".js-contribution-graph")[0]).find("h2")[0]).html().toString()).then((number) => {collectiveCommits += number});
             iterateCount++
             if (expectedIterateCount === iterateCount) {resolve({"collectiveCommits": collectiveCommits, "students": classGithubs.length})}
          });
      })
    })
  })
}

//Uses regex to match the number of commits in that given time period
const regex = /Created\n*\s*([0-9]+)\n*\s*commit/gi;
const commitNumberParser = (string) => {
  let result = regex.exec(string);
  let returnNumber = 0;
  if (result) {
    returnNumber = Number(result[1])
  }
  return returnNumber
}

//Uses optimized regex to match the number of commits over the last year
const EfficientRegex = /\n*\s*([0-9]+\,?[0-9]+)\n*\s*contribution/;
const EfficientCommitNumberParser = (string) => {
  return new Promise(function(resolve,reject){
    let result = EfficientRegex.exec(string)
    let returnNumber = 0;
    if (result) {
      tempNum = result[1].split(",").join("");
      returnNumber = Number(tempNum)
    }
    resolve(returnNumber)
  })
}


//ROUTE FOR API CALL
app.get('/api/class-commits', (req, res, err) => {
  EfficientCommitGenerate().then((com)=> res.json({"commits": com}))
})

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
