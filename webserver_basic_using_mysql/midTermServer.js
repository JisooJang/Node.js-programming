var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var url = require('url');

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
    var resultCode = "0";// 상태코드: 1(성공), 0(실패)

    // midTermModule내 getItem을 이용하여 데이터 조회 
    var obj = myModule.getItem(items, "stdno", stdno); //구문 완성 필요!!! 
    console.log("obj==>%j", obj);

    /*
     빈객체가 아니고 조회된 객체의 비밀번호와 입력된 비밀번호가 일치하는 경우
     쿠키 세팅
     - 빈 객체 검사 함수 : midTermModule내 isNotEmptyObj 함수
     - 쿠키 세팅: 쿠키 키(stdno)에 학번 세팅, 만료일은 설정후 50초
     - 응답데이터 예시 {code:1, nm:'홍길동'}     
    */
    if ( myModule.isNotEmptyObj(obj)  && pw == obj.pw) {
        console.log("쿠키 세팅...");
        var date = new Date();
        //date.setDate(...); //50초후 쿠키 삭제
        res.writeHead(200, {
            'Content-Type': 'text/html;charset=utf-8',
            'Set-Cookie': ['stdno = '+stdno+';Expires ='+date.toUTCString()]
            });

        resultCode = "1";
        item.nm = obj.nm;      
    } 

    // 응답 데이터 세팅
    item.code = resultCode; 
    res.end(JSON.stringify(item));    
});

/*
문제3. 응시자 등록 관련
*/
app.post("/regist", function(req,res){
    console.log('=====응시자등록===== '+ (new Date()).toLocaleString());

    // parameter setting, 기본값(stdno: '0', nm/pw/intro: '')     
    var stdno = req.body.stdno;
    var pw = req.body.pw;
    var nm = req.body.nm;
    var intro = req.body.intro;
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
        var curDate = (new Date()).toLocaleString();
        
        // 입력된 객체 생성
        var item =  {
            stdno: stdno,
            pw: pw,
            nm: nm,
            intro: intro,
            dt: curDate
        };
        

        console.log('item==>%j', item);
        // 객체 추가
        items.push(item);
    } 
    
    // 응답 데이터
    res.send(result);
});

/*
문제4. 로그아웃 처리

app.get("/logout", function(req,res){
    console.log('=====로그아웃===== '+ (new Date()).toLocaleString());
    
    // 쿠키 지움
    res.clearCookie( ..... ); 
  
    // 메인화면으로 redirect
    res.redirect('http://127.0.0.1:8080');
});
*/


/*
문제5. 응시자 목록 조회

app.get("/list.json", function(req,res){
    console.log('=====응시자 목록===== '+ (new Date()).toLocaleString());

    // 정렬 최근순
    ...........
    
    res.send(items); 
});
*/

/*
문제6. 응시자 정보를 팝업창

app.get("/infopop/:stdno", function(req,res){
    console.log('=====응시자정보팝업===== '+ (new Date()).toLocaleString());
    var stdno = req..........; // 기본값: '0'
    
    // 쿠키가 존재하는 경우는 로그인한 경우로 처리
    if ( ......... ) { // 쿠키 존재하는 경우
        // 쿠키를 추출하고 분해
        console.log("cookie: ", req.headers.cookie);
        var cookie = req.headers.cookie.split(';').map(function (element) {
            var element = element.split('=');
            return {
                key: element[0],
                value: element[1]
            };
        });
        console.log(JSON.stringify(cookie));
        
        // midTermModule내 getItem 함수 사용
        var cookieObj = .......getItem(cookie, "key", "stdno");
        if (......isNotEmptyObj(cookieObj)) { // midTermModule내 isNotEmptyObj 함수 사용
           console.log("정보 조회.....");

            // 요청된 학번에 해당하는 정보 조회: midTermModule내 getItem 함수 사용
            var obj = ......getItem(items, "stdno", stdno);
            if (......isNotEmptyObj(obj)) {// midTermModule내 isNotEmptyObj 함수 사용
                /*
                midTermPop.html 파일을 읽어들인 후, html내 데이터 값 치환
                - 제공된 midTermModule.js에 있는 bindSimpleData 함수 사용
                */
                /*
                .........
                    // midTermModule내 isNotEmptyObj 함수 사용
                    var replacedHtml = .......bindSimpleData( ...., obj);

                    res.send(replacedHtml);
                .........
            } else {
                res.send("<h3>조회된 정보가 존재하지 않습니다.</h3");
            }
        } else {
            res.send("<h3>로그인 후 이용하세요.</h3");
        }
    } else {
        res.send("<h3>로그인 후 이용하세요.</h3");
    }
});
*/

/*
공통 사항: 기타 화면 
*/
 app.use(function(req, res){
    console.log('=====기타 화면===== '+ (new Date()).toLocaleString());
    res.redirect('http://127.0.0.1:8080');
});

/* 
공통사항: 서버 실행
*/
app.listen(8082, function() {
    console.log('Server Running at http://127.0.0.1:8080  Date:'+ (new Date()).toLocaleString());
    //console.log("------ 학번: 이름: ------", , ); // 완성하시오.

    /*
    초기 데이터 
    {stdno: '17002451', pw: '123', nm: '홍길순1', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.05'}
    {stdno: '17002452', pw: '123', nm: '홍길순2', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.04'}
    {stdno: '17002453', pw: '123', nm: '홍길순3', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.03'}
    {stdno: '17002454', pw: '123', nm: '홍길순4', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.02'}
    {stdno: '17002455', pw: '123', nm: '홍길순5', intro: '안녕하세요. 저는 컴퓨터학과입니다.', dt: '2017.11.01'}
    */
    // items에 초기 데이터 추가 
    
});