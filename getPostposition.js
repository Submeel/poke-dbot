function getPostposition(word, first, second) {
  const lastChar = word[word.length - 1];
  const lastCharCode = lastChar.charCodeAt(0);

  // 한글 + 숫자
  if ((lastCharCode < 0xAC00 || lastCharCode > 0xD7A3) &&
    !(lastCharCode >= 48 && lastCharCode <= 57)) {
    return word + first;
  }

  const finalConsonant = (lastCharCode - 0xAC00) % 28;

  if (finalConsonant === 0 ||
    (lastCharCode >= 48 && lastCharCode <= 57)) {
    // 숫자일 경우 1,3,6,7,8,0은 first로 조사가 출력되고 나머지일 경우 second로 출력
    if (['1', '3', '6', '7', '8', '0'].includes(lastChar)) {
      return word + first;
    } else {
      return word + second;
    }
  }

  return word + first;
}

module.exports = {
  getPostposition
};

// let pkm = getPostposition(wantedPkmName, '이', '가');
// content = `앗! 야생 ${pkm} 튀어나왔다!` -> 앗! 야생 피카츄가 튀어나왔다!

//let pkm = getPostposition(target, '은', '는');
//content = `어라… ${pkm} 보이지 않는다.` -> 어라… 텐타몬은 보이지 않는다.

// let pkm = getPostposition(wantedPkmName, '을', '를');
// content = `트레이너는 ${pkm} 사용했다!` -> 트레이너는 회복약을 사용했다!