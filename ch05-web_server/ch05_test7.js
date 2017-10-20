var http = require('http');

var options = {
  host: 'www.google.com',
  port: 80,
  path: '/'
};

var req = http.get(options, function(res) { //GET요청. 다른 사이트에 요청을 보내고 응답을 받아 처리
  var resData = '';
  res.on('data', function(chunk) {  //데이터를 받고 있는 상태에서는 'data'이벤트 발생
    resData += chunk;
  });

  res.on('end', function() {  //데이터를 모두 수신 완료 후 'end'이벤트 발생
    console.log(resData);
  });
});

req.on('error', function(err) {
  console.log('오류 발생 : ' + err.message);
});
