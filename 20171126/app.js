const http = require('http'); // 한번 할당이 되면 값을 변경할수 없는 변수(상수)
var o = require('os');

const hostname = '127.0.0.1';
const port = 1337;

console.log(o.platform());

var _ = require('underscore');
var arr = [3, 6, 9, 1, 12];

console.log(arr[0]);
console.log(_.first(arr));  // 매개변수인 arr배열의 첫번째 원소를 가져옴
console.log(_.last(arr));   // 매개변수인 arr배열의 마지막 원소를 가져옴

function a(v1, v2) {
  return v1 - v2;   // 오름차순으로 정렬
}

function b(v1, v2) {
  console.log('v1 : v2 = ', v1, v2);
  return v2 - v1;   // 내림차순으로 정렬
};

arr.sort(b);
console.log(arr);

// http서버 객체를 리턴하는 메소드 http.createServer
http.createServer((req, res) => {
  console.log('http.createServer메소드는 서버 객체를 리턴');
  res.writeHead(200, {'Content-Type' : 'text/plain'});
  res.end('Hello world!\n');
}).listen(port, hostname, () => {
  console.log('Server running at http://${hostname}:${port}/');
})

/*
위와 동일한 내용..
var server = http.createServer(function (req, res) {

});
server.listen(port, hostname, function() {
  console.log('Server running at http://${hostname}:${port}/');
});
*/
