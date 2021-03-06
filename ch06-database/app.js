// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , static = require('serve-static');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

// 오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');
var errorHandler = expressErrorHandler({
  static: {
    '404': './public/404.html'
  }
});

var cors = require('cors'); // 클라이언트에서 ajax로 요청햇을 때 다중 서버 접속 지원
// 라우팅 사용하여 라우팅 함수 등록

// 몽고디비 모듈 사용
var MongoClient = require('mongodb').MongoClient;

var app = express();

var multer = require('multer'); // 파일업로드 모듈
var fs = require('fs');


//app.set('port', process.env.PORT || 3500);

app.use(bodyParser.urlencoded({ extended: false }));    // body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.json());   // application/json 파싱

app.use('/public', static(path.join(__dirname, 'public')));  // 'public' 폴더에 있는 파일들을 static 미들웨어를 이용하여 특정 패스로 접근 가능하게 함
app.use('/uploads', static(path.join(__dirname, 'uploads')));

app.use(cookieParser());
app.use(expressSession({    // 세션 객체 호출 시 반환되는 객체 전달
  secret: 'my key',
  resave: true,
  saveUninitialized: true
}));

var router = express.Router();

var database; // 데이터베이스 객체를 위한 변수

// 데이터베이스 연결 메소드
function connectDB() {
  var databaseUrl = 'mongodb://localhost:27017/local';  // db 연결 정보

  // 데이터베이스 연결
  MongoClient.connect(databaseUrl, function(err, db) {
    if(err) throw err;

    console.log('database에 연결됨: ' + databaseUrl);

    //database 변수에 할당
    database = db;
  });
}


// 사용자 추가 함수
var addUser = function(database, id, password, name, callback) {
  console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);

  // db의 users 컬렉션 참조
  var users = database.collection('users');

  // id, password, username을 사용해 사용자 추가
  users.insertMany([{"id":id, "password":password, "name":name}], function(err, result) {
    if(err) {
      callback(err, null);
      return;
    }

    if(result.insertCount > 0) {
      console.log('사용자 레코드 추가됨 : ' + result.insertedCount);
    } else {
      console.log('추가된 레코드가 없음.');
    }

    callback(null, result);
  });
}

var addUser2 = function(database, id, password, name, sex, birth, phone, email, info, profile_image, callback) {
  console.log('addUser2 호출됨 : ' + id + ', ' + password + ', ' + name, + ', ' + sex);

  // db의 users 컬렉션 참조
  var users = database.collection('users2');

  // id, password, username을 사용해 사용자 추가
  users.insertMany([{"id":id, "password":password, "name":name, "sex":sex, "birth":birth, "phone":phone,
   "email":email, "info":info, "profile_image":profile_image }], function(err, result) {
    if(err) {
      callback(err, null);
      return;
    }

    if(result.insertCount > 0) {
      console.log('사용자 레코드 추가됨 : ' + result.insertedCount);
    } else {
      console.log('추가된 레코드가 없음.');
    }

    callback(null, result);
  });
}

// 사용자 인증 함수
var authUser = function(database, id, password, callback) {
  console.log('authUser 호출됨.');

  // users 컬렉션 참조
  //var users = database.collection('users');
  var users = database.collection('users2');    //db에서 users2 이름의 콜렉션 정보를 가져온다.

  // 아이디와 비밀번호를 사용해 검색
  users.find({"id" : id, "password" : password}).toArray(function(err, docs) {
    if(err) {
      callback(err, null);  // 콜백함수에 err객체와 null값을 보냄
      return;
    }

    if(docs.length > 0) { // 검색 결과 값이 존재하면
      console.log('아이디 [%s], 비밀번호 [%s]가 일치하는 사용자 찾음.', id, password);
      callback(null, docs);   // 콜백함수에 db 검색결과인 docs배열을 전달
    } else {  // 검색 결과 값이 존재하지 않으면
      console.log('일치하는 사용자 찾지 못함.');
      callback(null, null);
    }
  });
}

// 사용자 검색 함수
var findUser = function(database, value, search_option, callback) {
  console.log('findUser 호출됨.');
  console.log(search_option + " : " + value);
  var users = database.collection('users2');   //db에서 users2 이름의 콜렉션 정보를 가져온다.
  var find_json = {};
  find_json[search_option + ""] = value;  // json객체에서 key값을 문자열로 표시하기 위한 방법

  console.log(find_json);

  users.find(find_json).toArray(function(err, docs) {
    if(err) {
      callback(err, null);    // 콜백함수에 err객체와 null값을 보냄
      return;
    }

    if(docs.length > 0) {
      console.log(search_option + " : " + value + " ===== 일치하는 사용자 찾음 ");
      callback(null, docs);   // 콜백함수에 db 검색결과인 docs배열을 전달
    } else {
      console.log('일치하는 사용자 찾지 못함.');
      callback(null, null);
    }
  });

}


// 로그인 라우팅 함수
router.route('/process/login').post(function(req, res) {
  var paramId = req.param('id');
  var paramPassword = req.param('password');

  console.log(paramId + ', ' + paramPassword);

  if(database) {
    authUser(database, paramId, paramPassword, function(err, docs) {
      if(err) { throw err; }
      if(docs) {
        console.dir(docs);
        var username = docs[0].name;

        res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
        res.write('<h1>로그인 성공</h1>');
        res.write('<div><p>' + '사용자 이름 : ' + username + '</p></div>');
        res.write('<div><p>' + '사용자 입력 아이디 : ' + paramId +'</p></div>');
        res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
        res.end();
      } else {
        res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
        res.write('<h1>로그인 실패</h1>')
        res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>');
        res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
        res.end();
      }

    });
  } else {
    res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
    res.write('<h1>데이터베이스 연결 실패</h1>')
    res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>');
    res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
    res.end();
  }
});

router.route('/process/adduser').post(function(req, res) {
  console.log('/process/adduser 호출됨.');

  var paramName = req.param('name');
  var paramId = req.param('id');
  var paramPassword = req.param('password');

  console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);

  if(database) {
    addUser(database, paramId, paramPassword, paramName, function(err, result) {
      if(err) { throw err; }

      if(result && result.insertedCount > 0) {
        console.dir(result);

        res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
        res.write('<h1>사용자 추가 성공</h1>')
        res.end();
      } else {
        res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
        res.write('<h1>사용자 추가 실패</h1>')
        res.end();
      }
    });
  } else {
    res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
    res.write('<h1>데이터베이스 연결 실패</h1>')
    res.end();
  }
});

router.route('/process/adduser2').post(function (req, res) {

  var paramId = req.param('member_id');
  var paramPassword = req.param('pwd');
  var name = req.param('member_name');
  var sex =  req.param('sex');
  var birth =  req.param('birth');
  var phone =  req.param('phone');
  var email =  req.param('email');
  var info =  req.param('content');
  var profile_image = 'image';

  console.log(req.body);
  //console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + name + ', ' + sex + ', ' + birth + ', ' + profile_image);

  if(database) {
    addUser2(database, paramId, paramPassword, name, sex, birth, phone, email, info, profile_image, function(err, result) {
      if(err) { throw err; }

      if(result && result.insertedCount > 0) {
        console.dir(result);

        res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
        res.write('<h1>사용자 추가 성공</h1>')
        res.end();
      } else {
        res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
        res.write('<h1>사용자 추가 실패</h1>')
        res.end();
      }
    });
  } else {
    res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
    res.write('<h1>데이터베이스 연결 실패</h1>')
    res.end();
  }
});


router.route('/process/finduser').post(function (req, res) {
  var search_option = req.body.search_option;   // 사용자가 회원 검색시 select 태그로 선택한 조건 값을 불러온다
  var value = req.body.keyword;
  console.log(search_option);

  if(database) {
    findUser(database, value, search_option, function(err, docs) {
      if(err) { throw err; }
      if(docs) {
        console.log(docs);
        res.send(docs);
      }
      else {  // 검색 결과 데이터가 존재하지 않을 때
        res.send("검색 결과가 존재하지 않습니다.");
      }
    });
  }
});

app.use('/', router);

app.use(expressErrorHandler.httpError(404));

app.use(errorHandler);

// 3000번 포트에 웹서버 시작
app.listen(3500, function() {
  console.log('Server starting...');
  connectDB();  // DB 연결 메소드 호출
});
