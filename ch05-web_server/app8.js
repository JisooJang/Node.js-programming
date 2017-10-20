// *** 로그인 폼 + 폼 요청 처리 결과 실습 (router 미들웨어 이용)

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

var bodyParser = require('body-parser')
  , static = require('serve-static');

var router = express.Router();

app.use(static(path.join(__dirname, 'public')));  // 'public' 폴더에 있는 파일들을 static 미들웨어를 이용하여 특정 패스로 접근 가능하게 함

app.use(bodyParser.urlencoded({ extended: false }));    // body-parser를 사용해 application/x-www-form-urlencoded 파싱

router.route('/process/login/:name').post(function(req, res) {  //  /process/login 뒤에 오는 name값을 파라미터로 처리
  console.log('/process/login/:name 처리함. ');

  var paramName = req.parmas.name;  // URL 파라미터
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
  res.write('<div><p>' + '사용자 이름 : ' + paramName + '</p></div>');
  res.write('<div><p>' + '사용자 입력 아이디 : ' + paramId +'</p></div>');
  res.write('<div><p>' + '사용자 입력 암호 : ' + paramPassword +'</p></div>');
  res.write('<br><br><a href="/login2.html">로그인 페이지로 돌아가기</a>');
  res.end();
});


router.route('/process/users/:id').get(function(req, res) {
    console.log('/process/users/:id 처리함.');

    var paramId = req.params.id;    // URL 파라미터 확인
    res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
    res.write('<div><p>' + 'Param ID : ' + paramId +'</p></div>');
    res.end();
});

app.use('/', router);   // 라우터 객체를 app 객체에 등록

/*
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: false }));    // body-parser를 사용해 application/x-www-form-urlencoded 파싱

app.use(bodyParser.json());   // body-parser를 사용해 application/json 파싱




app.use(function (req, res, next) {
  console.log('첫 번째 미들웨어에서 요청을 처리함');
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
  res.write('<div><p>' + '사용자 입력 아이디 : ' + paramId +'</p></div>');
  res.write('<div><p>' + '사용자 입력 암호 : ' + paramPassword +'</p></div>');
  res.end();
});
*/

app.all('*', function(req, res) {   // 등록되지 않은 경로에 대해 페이지 오류 응답
  res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});

app.listen(3000, function() {
  console.log('Server stating...');
});
