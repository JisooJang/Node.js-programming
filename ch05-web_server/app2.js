var express = require('express')
, http = require('http');

var app = express();

app.use(function(req, res, next) {
  console.log('첫 번째 미들웨어에서 요청을 처리함');

  //res.send({name: '소녀시대', age: 20});
  var userAgent = req.header('User-Agent');
  var paramName = req.query.name;

  res.writeHead('200', {'Content-type' : 'text/html;charset=utf8'});
  res.write('<div><p>User-Agent : ' + userAgent + '</p></div>');
  res.write('<div><p>Param name : ' + paramName + '</p></div>');
  res.end();
  
  next(); //다음 미들웨어 호출
});

app.use(function(req, res, next) {
  console.log('두 번째 미들웨어에서 요청을 처리함');
  req.user = 'mike';  // 다음 미들웨어세어 변수 공유 가능!
  next(); //다음 미들웨어 호출
});

app.use('/', function(req, res, next) {
  console.log('세 번째 미들웨어에서 요청을 처리함');
  //res.writeHead('200', {'Content-type' : 'text/html;charset=utf8'});
  //res.end('<h1>Expres서버에서 ' + req.user + '가 응답한 결과입니다.</h1>');
});

http.createServer(app).listen(3000, function() {
  console.log('Express서버가 3000번 포트에서 시작됨.');
});
