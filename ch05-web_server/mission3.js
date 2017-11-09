var express = require('express')
  , http = require('http')
  , path = require('path');

var bodyParser = require('body-parser'), static = require('serve-static');
var cookieParser = require('cookie-parser');
//var errorHandler = require('errorHandler');

var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');

var multer = require('multer'); // 파일업로드 모듈
var fs = require('fs');

var cors = require('cors'); // 클라이언트에서 ajax로 요청햇을 때 다중 서버 접속 지원
// 라우팅 사용하여 라우팅 함수 등록
var router = express.Router();

var app = express();

// app.use()...   미들웨어에 추가하는 과정
app.use(cookieParser());
app.use(expressSession({    // 세션 객체 호출 시 반환되는 객체 전달
  secret: 'my key',
  resave: true,
  saveUninitialized: true
}));

app.use('/public', static(path.join(__dirname, 'public')));  // 'public' 폴더에 있는 파일들을 static 미들웨어를 이용하여 특정 패스로 접근 가능하게 함
app.use('/uploads', static(path.join(__dirname, 'uploads')));

app.use(bodyParser.urlencoded({ extended: false }));    // body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.json());

app.use(cors());
app.use('/', router);   // 라우터 객체를 app 객체에 등록

// multer 미들웨어 사용 : 미들웨어 사용 순서 중요 body-parser -> multer -> router
var storage = multer.diskStorage({
  destination: function (req, file, callback) {   // 업로드한 파일이 저장될 폴더를 지정
    callback(null, 'uploads');
  },
  filename: function (req, file, callback) {    // 업로드한 파일의 이름을 바꿈
    var extension = path.extname(file.originalname);
    var basename = path.basename(file.originalname, extension);
    callback(null, basename + Date.now() + extension);
  }
});

// 파일 제한 : 10개, 1G
var upload = multer({
  storage: storage,
  limits: {   // 파일 크리 깇 개수 등의 제한 속성 설정
    files: 10,
    fileSize: 1024 * 1024 * 1024
  }
});

router.route('/memo/submit').post(upload.array('photo', 1), function(req, res) {
  console.log('/memo/submit 처리');

  var paramId = req.body.id || req.query.id;  // 폼 입력값에 저장된 값들을 가져온다.
  var paramPassword = req.body.pwd;
  var name = req.body.member_name;
  var sex = req.body.sex;
  var birth = req.body.birth;
  var phone = req.body.phone;
  var email = req.body.email;
  var info = req.body.content;
  var profile_image = req.body.photo;

  console.log(paramId + ", " + paramPassword + ", " + name + ", " + sex + ", " + birth + ", " + phone);
  try {
    var files = req.files;

    console.dir('#===== 업로드된 파일 정보 =====#');
    console.dir(req.files[0]);
    console.dir('#=====#');

    var originalname = '',
    filename = '',
    mimetype = '',
    size = 0;

    if(Array.isArray(files)){
      console.log('배열에 들어있는 파일 갯수 : %d ', files.length);

      for(var index = 0; index < files.length; index++) {
        originalname = files[index].originalname;
        filename = files[index].filename;
        mimetype = files[index].mimetype;
        size = files[index].size;
      }
    } else {
      console.log('파일 갯수 : 1');

      originalname = files[0].originalname;
      filename = files[0].filename;
      mimetype = files[0].mimetype;
      size = files[0].size;
    }

    console.log('현재 파일 정보 : ' + originalname + ', ' + filename, + ', ' + mimetype + ', ' + size);

    res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
    res.write('<h3>메모가 저장되었습니다.</h3>');
    res.write('<h3>서버에 저장된 사진</h3>');
    res.write('<div>');
    res.write('<p>' + paramId + '</p>');
    res.write('<p>' + paramPassword + '</p>');
    res.write('</div>');
    res.write('<img src="http://localhost:3000/uploads/' + filename +'"><br>');
    res.write('<p>http://localhost:3000/uploads/' + filename + '</p>');
    res.write('<br><br><a href="/public/memo.html">다시 작성</a>');
    res.end();

  } catch(err) {
    console.dir(err.stack);
  }
});

app.all('*', function(req, res) {   // 등록되지 않은 경로에 대해 페이지 오류 응답
  res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});

app.listen(3000, function() {
  console.log('Server stating...');
});
