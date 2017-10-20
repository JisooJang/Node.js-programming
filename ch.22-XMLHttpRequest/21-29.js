var express = require('express'); //express 모듈을 추출

var items = [{
  name: '우유',
  price: '2000'
}, {
  name: '홍차',
  price: '5000'
}, {
  name: '커피',
  price: '5000'
}];

var app = express();  //웹 서버를 생성
app.use(express.static('public'));


app.all('/data.html', function (request, response) {
  var output = '';
  output += '<!DOCTYPE html>';
  output += '<html>';
  output += '<head>';
  output += ' <title>Data HTML</title>';
  output += '</head>';
  output += '<body>';
  items.forEach(function (item) {
    output += '<div>';
    output += '   <h1>' + item.name + '</h1>';
    output += '   <h2>' + item.price + '</h2>';
    output += '</div>';
  });

  output += '</body>';
  output += '</html>';
  response.send(output);
});

app.all('/data.json', function (request, response) {
  response.send(items);
});

app.all('/data.xml', function (request, response) {
  var output = '';
  output += '<?xml version="1.0" encoding="UTF-8" ?>';
  output += '<products>';
  items.forEach(function (item) {
    output += '<product>';
    output += '   <name>' + item.name + '</name>';
    output += '   <price>' + item.price + '</price>';
    output += '</product>';
  });
  output += '</products>';
  response.type('text/xml');
  response.send(output);
});

app.all('/parameter', function (request, response) {  // URL의 키=값 형식으로 넘어오는 일반 요청 매개변수 추출
  var name = request.params.name;
  var region = request.params.region;

  response.send('<h1>' + name + ':' + region + '</h1>');
});

app.all('/parameter/:id', function (request, response) {  // 동적 라우트에서 사용한 식별자를 추출
  var id = request.params.id;
  response.send('<h1>' + id + '</h1>');
});

app.listen(52273, function () { // 웹 서버를 실행
  console.log('Server Running at http://127.0.0.1:52273');
});
