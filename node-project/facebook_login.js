var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport')
    , facebookStrategy = require('passport-facebook').Strategy;

var app = express();

// 로그인이 성공하였을 때, 인증 후에, 세션에 사용자 정보를 저장하는 기능
// 로그인 성공후 값이 user라는 인자를 통해서 전달되는데, 이 값을 done(null,user)로 넣으면 HTTP session내에 저장됨
passport.serializeUser(function (user, done) {
  console.log('serialize');
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  console.log('deserialize');
  done(null, user);
});

passport.use(new FacebookStrategy({
  clientID: secret_config.federation.facebook.client_id,
  clientSecret: secret_config.federation.facebook.secret_id,
  callbackURL: 'http://127.0.0.1:52273/auth/facebook/callback',
   function (accessToken, refreshToken, profile, done) {
     var _profile = profile._json;

     loginByThirdparty({
       'auth_type': 'facebook',
       'auth_id': _profile.id,
       'auth_name': _profile.name,
       'auth_email': _profile.id
     }, done);
   }
}));

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.session({ secret: 'your secret here' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/login_success',
        failureRedirect: '/login_fail' }));

app.get('/login_success', ensureAuthenticated, function(req, res){
    res.send(req.user);
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});
function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/');
}

app.listen('52273', function() {
  console.log('Express server listening on port ');
);
