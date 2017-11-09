// *** 로그인 폼 + 폼 요청 처리 결과 실습 (router 미들웨어 이용)

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

var bodyParser = require('body-parser')
  , static = require('serve-static');
var cookieParser = require('cookie-parser');
var router = express.Router();


var expressSession = require('express-session');


// app.use()...   미들웨어에 추가하는 과정
app.use(cookieParser());
app.use(expressSession({    // 세션 객체 호출 시 반환되는 객체 전달
  secret: 'my key',
  resave: true,
  saveUninitialized: true
}));

app.use(static(path.join(__dirname, 'public')));  // 'public' 폴더에 있는 파일들을 static 미들웨어를 이용하여 특정 패스로 접근 가능하게 함

app.use(bodyParser.urlencoded({ extended: false }));    // body-parser를 사용해 application/x-www-form-urlencoded 파싱

app.use('/', router);   // 라우터 객체를 app 객체에 등록



// 라우터 객체의 route 메소드를 이용하여 각 url 경로에 대한 요청을 처리함
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


router.route('/process/showCookie').get(function(req, res) {
    console.log('process/showCookie 호출됨.');

    res.send(req.cookies);
});


router.route('/process/setUserCookie').get(function(req, res) {   //
    console.log('process/setUserCookie 호출됨.');

    // 쿠키 설정
    res.cookie('user', {    // 쿠키 객체 user를 생성하여 응답으로 보냄
      id: 'mike',
      name: '소녀시대',
      authorized: true
    });

    res.redirect('/process/showCookie');    // redirect로 응답
});

router.route('/process/product').get(function(req, res) {
    console.log('/process/product 호출됨.');

    if(req.session.user) {
      res.redirect('/product.html');
    } else {
      res.redirect('/login2.html');
    }
});

router.route('/process/login').post(function(req, res) {  // login2.html에서 로그인버튼 클릭 시 경로
    console.log('/process/login 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    if(req.session.user) {
      // 이미 로그인된 상태. 세션에 user객체가 존재하는 경우
      console.log('이미 로그인되어 상품 페이지로 이동합니다.');
      res.redirect('/product.html');
    } else {
      // 세션 저장
      req.session.user = {
        id: paramId,
        password: paramPassword,
        name: '홍길동',
        authorized: true
      };

      res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
      res.write('<h1>로그인 성공</h1>')
      res.write('<div><p>' + '사용자 아이디 : ' + paramId +'</p></div>');
      res.write('<div><p>' + '사용자 암호 : ' + paramPassword +'</p></div>');
      res.write('<br><br><a href="/process/product">상품 페이지로 이동하기</a>');
      res.write('<br><a href="/process/logout">로그아웃하기</a>')
      res.end();
    }
});

router.route('/process/logout').get(function(req, res) {
    console.log('/process/logout 호출됨.');

    if(req.session.user) {
      console.log('로그아웃 합니다.');
      req.session.destroy(function(err) {
        if(err) { throw err; }

        console.log('세션을 삭제하고 로그아웃되었습니다.');
        res.redirect('/login2.html');
      });
    } else {  // 로그인이 안 된 상태
      console.log('아직 로그인되어 있지 않습니다.');
      res.redirect('/public/login2.html');
    }
});
/*
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
