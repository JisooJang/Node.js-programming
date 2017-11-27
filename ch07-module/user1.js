// exports 전역 변수에 속성을 추가하면 다른 파일에서도 이를 참조 가능
// exports 객체 속성으로 함수 추가
exports.getUser = function() {
  return {id : 'test01', name : '소녀시대'};
}

exports.group = {id : 'group01', name : '친구'};  // exports 객체 속성으로 객체 추가
