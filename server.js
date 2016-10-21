const fs = require('fs');

const classData = JSON.parse(fs.readFileSync('data/class-info.json', 'utf8'));
const classGithubs = [];
let {students} = classData;
Object.keys(students).forEach(student => {
  classGithubs.push(students[student].github)
})


let periods = ["2016-01-01&to=2016-01-31", "2016-02-01&to=2016-02-28", "2016-03-01&to=2016-03-31", "2016-04-01&to=2016-04-30", "2016-05-01&to=2016-05-31", "2016-06-01&to=2016-06-30", "2016-07-01&to=2016-07-31", "2016-08-01&to=2016-08-31", "2016-09-01&to=2016-09-30", "2016-10-01&to=2016-10-31", "2016-11-01&to=2016-11-30", "2016-12-01&to=2016-12-31"]
