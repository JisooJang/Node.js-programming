var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var url = require('url');

// 데이터베이스 mysql 모듈 사용
var mysql = require('mysql');
var client = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '1234',
    database: 'Member'
}); 

// express-session 모듈 사용
var session = require('express-session');

// midTermModule.js 추출
var myModule = require('./midTermModule.js'); 

var app = new express();
var items = [];

// 파비콘 무시
app.get('/favicon.ico', function(req, response){
    response.sendStatus(204);
});
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(session({
    secret: 'w9w5t8a',
    cookie: { expires: new Date (Date.now() + 1800000) },     // 만료시간
    resave: 'false',
    saveUninitialized: true
}));

/*
문제2. 로그인 관련 내용
*/
app.post("/login", function(req,res){
    console.log('=====로그인===== '+ (new Date()).toLocaleString());

    // parameter setting, 기본값(stdno: '0', pw: '')  
    var stdno = req.body.stdno;
    var pw = req.body.pw;
    console.log("stdno[%s] pw[%s]", stdno, pw);

    var item = {};
    var resultCode = "0";// 상태코드: 1(성공), 0(실패 - 비밀번호 오류), -1(실패 - 등록된 학번 없음)

    var query = "SELECT stdno, pw, nm FROM member_info WHERE stdno = " + stdno;
    client.query(query, function(error, rows, fields) {
        if(error) {
            throw new Error(error);
        }
        
        if(rows.length != 0) { 
            if(rows[0].pw == pw) {
                console.log('로그인 성공. 아이디 및 비밀번호 일치');
                resultCode = "1";
                item.nm = rows[0].nm;
                
                req.session.stdno = stdno;
            }
            else {
                console.log('로그인 실패. 비밀번호가 일치하지 않음');
                resultCode = "0";
            }
        } else {
            console.log('로그인 실패. 등록된 학번이 아님');
            resultCode = "-1";
        }

        item.code = resultCode;
        console.log("item.code : " + item.code);
        res.end(JSON.stringify(item));  // 응답객체에 item객체를 실어 보냄

    });
 
});

/*
문제3. 응시자 등록 관련
*/
app.post("/regist", function(req,res){
    console.log('=====응시자등록===== '+ (new Date()).toLocaleString());

    // parameter setting, 기본값(stdno: '0', nm/pw/intro: '')     
    var stdno = req.body.Istdno;
    var pw = req.body.Ipw;
    var nm = req.body.Inm;
    var intro = req.body.Iintro;

    console.log('stdno[%s] pw[%s] nm[%s] intro[%s]', stdno, pw, nm, intro);

    var result = {code:"1"}; //성공:1, 실패:0, 중복:2

    /* 각 parameter validation check
       서버에서도 각 parameter 유효성을 검사해야 하지만 시간관계상 문제에서는 생략
       현장에서는 반드시 해야 함 !!!
    */

    // stdno 중복 check: midTermModule내 getItem 함수 사용    
    var obj = myModule.getItem(items, "stdno", stdno);
    if (myModule.isNotEmptyObj(obj)) {// midTermModule내 isNotEmptyObj 함수 사용 
        result.code = "2";
    } else {
        // 입력된 데이터 items에 추가
        //var curDate = (new Date()).toLocaleString();
        var curDate = new Date();
        var curDate2 = curDate.getYear() + '.' + curDate.getMonth() + 1 + '.' + curDate.getDate();
        
        var query = 'INSERT INTO member_info VALUES (?, ?, ?, ?, ?)';   // 데이터베이스 insert 쿼리문

        client.query(query, [stdno, pw, nm, intro, curDate], function(error, data) {
            if(error) {
                throw new Error(error);
            }
            
            console.log("데이터베이스에 등록 : " + data);
        });

        // 입력된 객체 생성
        var item =  {
            stdno: stdno,
            pw: pw,
            nm: nm,
            intro: intro,
            dt: curDate2
        };
        
        console.log('item==>%j', item);
        // 객체 추가
    } 
    
    // 응답 데이터
    res.send(result);
});

/*
문제4. 로그아웃 처리
*/ 
app.get("/logout", function(req,res) {
    console.log('=====로그아웃=====' + (new Date()).toLocaleString());
    
    // 쿠키 지움
    /*
    res.clearCookie('stdno');
    res.clearCookie('Expires');
    */ 

    // 세션 제거
    if(req.session.stdno) {
        req.session.destroy(function(err){
            // cannot access session here
            console.log('세션 제거 완료');
        });
    }

    // 메인화면으로 redirect
    res.redirect('http://127.0.0.1:8087');
});

/*
문제5. 응시자 목록 조회
*/
app.get("/list.json", function(req,res){
    console.log('=====응시자 목록===== '+ (new Date()).toLocaleString());
    
    var query = 'SELECT * FROM member_info';
    client.query(query, function(error, data) {
        res.send(data); 
    });
    
});

/*
문제6. 응시자 정보를 팝업창
*/
app.get("/infopop/:stdno", function(req,res) {
    console.log('=====응시자정보팝업===== '+ (new Date()).toLocaleString());
    var stdno = req.params.stdno; // 기본값: '0'
    
    // 세션이 존재하는 경우는 로그인한 경우로 처리
    if ( req.session.stdno ) { 
        console.log("session: ", req.session.stdno);
        
        var query = "SELECT * FROM member_info WHERE stdno = " + stdno;

        client.query(query, function(error, rows, fields) {
            if(error) {
                throw new Error(error);
            }
            
            if(rows.length != 0) { 
                console.log("회원정보를 데이터베이스에서 찾음 : " + rows[0]);

                var midTermPop;
                
                fs.readFile('./midTermPop.html', function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        midTermPop = data;
                        // midTermModule내 bindSimpleData 함수 사용
                        var replacedHtml = myModule.bindSimpleData(midTermPop, {
                            stdno: rows[0].stdno,
                            nm: rows[0].nm,
                            intro: rows[0].intro
                        });
                        res.send(replacedHtml);
                    }
                });
                
            } else {
                console.log('회원정보가 데이터베이스에 존재하지 않음');
                res.send("<h3>조회된 정보가 존재하지 않습니다.</h3");
            }


        });

    } else {
        res.send("<h3>로그인 후 이용하세요.</h3");
    }

});

/*
공통 사항: 기타 화면 
*/
 app.use(function(req, res){
    console.log('=====기타 화면===== '+ (new Date()).toLocaleString());
    res.redirect('http://127.0.0.1:8087');
});

/* 
공통사항: 서버 실행
*/
app.listen(8087, function() {
    console.log('Server Running at http://127.0.0.1:8087  Date:'+ (new Date()).toLocaleString());
    console.log("%s 학번: 이름: %s", "20131114", "장지수"); // 완성하시오.

    /*
    초기 데이터 
    {stdno: '17002451', pw: '123', nm: '홍길순1', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.05'}
    {stdno: '17002452', pw: '123', nm: '홍길순2', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.04'}
    {stdno: '17002453', pw: '123', nm: '홍길순3', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.03'}
    {stdno: '17002454', pw: '123', nm: '홍길순4', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.02'}
    {stdno: '17002455', pw: '123', nm: '홍길순5', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.01'}
    */
});