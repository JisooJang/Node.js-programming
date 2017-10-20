// *** 로그인 폼 + 폼 요청 처리 결과 실습 (body-parser 미들웨어 이용)


var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

var bodyParser = require('body-parser')
  , static = require('serve-static');


app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: false }));    // body-parser를 사용해 application/x-www-form-urlencoded 파싱

app.use(bodyParser.json());   // body-parser를 사용해 application/json 파싱

app.use(static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  console.log('첫 번째 미들웨어에서 요청을 처리함');
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
  res.write('<div><p>' + '사용자 입력 아이디 : ' + paramId +'</p></div>');
  res.write('<div><p>' + '사용자 입력 암호 : ' + paramPassword +'</p></div>');
  res.end();
});

app.listen(3000, function() {
  console.log('Server stating...');
});
