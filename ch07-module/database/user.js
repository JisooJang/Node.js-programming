var database;
var UserSchema;
var UserModel;

// 데이터베이스 객체, 스키마 객체, 모델 객체를 이 모듈에서 사용할 수 있도록 전달
var init = function(db, schema, model) {
  console.log('init 호출됨.');

  database = db;
  UserSchema = schema;
  UserModel = model;
}


var addUser = function(database, id, password, name, callback) {
  console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);

  // UserModel의 인스턴스 생성
  var user = new UserModel({"id":id, "password":password, "name":name});

  // save() 메소드로 저장
  user.save(function(err) {
    if(err) {
      callback(err, null);
      return;
    }
    console.log('사용자 데이터 추가함.');
    callback(null, user);
  });

  /*
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
  */
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


var authUser = function(database, id, password, callback) {
  console.log('authUser 호출됨 :' + id + ', ' + password);

  /*
  //아이디와 비밀번호를 사용해 검색
  UserModel.find({"id" : id, "password" : password}, function(err, results) {
    if(err) {
      callback(err, null);  // 콜백함수에 err객체와 null값을 보냄
      return;
    }

    console.log('아이디 [%s], 비밀번호 [%s]로 사용자 검색 결과', id, password);
    console.dir(results);

    if(results.length > 0) {
      console.log('일치하는 사용자 찾음.', id, password);
      callback(null, results);
    }
    else {
      console.log('일치하는 사용자 찾지 못함.');
      callback(null, null);
    }

  });
  */

  // 1. 아이디를 사용해 검색
  UserModel.findById(id, function(err, results) {
    if(err) {
      callback(err, null);
      return;
    }

    console.log('아이디 [%s]로 사용자 검색 결과', id);
    console.dir(results);

    if(results.length > 0) {
      console.log('일치하는 사용자 찾음.', id, password);

      // 2. 비밀번호 확인
      if(results[0]._doc.password == password) {
        console.log('비밀번호 일치함');
        callback(null, results);
      }
      else {
        console.log('비밀번호 일치하지 않음');
        callback(null, null);
      }

    }
    else {
      console.log('아이디와 일치하는 사용자 찾지 못함');
      cal;back(null, null);
    }
  });

};

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

// 외부에서 모듈에서 사용가능하도록 각 사용자 함수를 module.exports에 저장
module.exports.init = init;
module.exports.authUser = authUser;
module.exports.addUser = addUser;
module.exports.addUser2 = addUser2;
module.exports.findUser = findUser;
