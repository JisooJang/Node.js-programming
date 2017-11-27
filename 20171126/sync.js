var fs = require('fs');

console.log(1);
var data = fs.readFileSync('./data.txt', {encoding:'utf8'});    // 파일을 비동기적으로 읽음
console.log(data);
