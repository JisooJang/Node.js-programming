var express = require('express');	//express는 웹 서버를 위한 외부 모듈
var body_parser = require('body-parser');
var app = express();	//express모듈을 실행하면 객체를 리턴함

app.use(express.static('public'));	//public 폴더에 있는 파일들을 웹페이지로 보여줄수 있도록 권한 설정

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: false}));

app.get('/', function(req, res) {	//request, response
	//res.send('Hello world');	//응답 URL페이지에 메시지를 출력
	res.render('index.html');	//응답으로 index.html파일을 실행함
});

app.post('/login', function(req, res) {
	console.log(req.body.id);
	res.status(200).send({success:true});
});
app.listen(8081, function() {	//웹 서버를 실행한다.
	console.log("connect");	//웹 서버가 연결되면 동작할 내용을 콜백함수에 작성
});
