/*
var require = function(path) {
  var exports = {
    getUser : function() {
      return {id: 'test01', name: '소녀시대'};
    },
    group : {id: 'group01', name: '친구'}
  }

  return exports;
}
*/

var user1 = require('./user1');   // require() 메소드는 exports 객체를 반환함
var user2  = require('./user2');
var user8 = require('./user8');

var User = require('./user9');
var user9 = new User('test09', '소녀시대9');

function showUser1() {
  return user1.getUser().name + ', ' + user1.group.name;
}

function showUser2() {
  return user2.getUser().name + ', ' + user2.group.name;
}

console.log('user1 사용자 정보 : %s', showUser1());
console.log('user2 사용자 정보 : %s', showUser2());
user8.printUser();
user9.printUser();
