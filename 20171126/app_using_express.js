var express = require('express');
var app = express();  // 애플리케이션을 리턴

app.get('/', function(req,res) {
  res.send('Hello homepage!');
});

app.get('/login', function(req, res) {
  res.send('login please..');
});
app.listen(3000, function() {
  console.log('Connected 3000 port!');
});
