let n = 3;
let numSentences = 5;
let markov;
let source;
let tarotCards = {};
function preload() {
  source = loadStrings("search/source.txt");
}
function setup() {
  // 提取塔罗牌数据
  tarotCards = extractTarotCardData(source);

  // 初始化 Markov 链
  markov = RiTa.markov(n);
}
function filterSourceByKeywords(input) {
  let cardName = input.trim().toLowerCase(); // 获取输入的塔罗牌名字
  let filteredText = [];

  if (tarotCards[cardName]) {
    filteredText.push(tarotCards[cardName]); // 根据牌名提取相应内容
  }
  return filteredText;
}
// 解析source.txt，提取塔罗牌名字和解释
function extractTarotCardData(sourceText) {
  let cardData = {};
  let currentCard = "";
  let cardInterpretation = "";

  sourceText.forEach((line) => {
    let splitIndex = line.indexOf(":");
    if (splitIndex !== -1) {
      if (currentCard) {
        // 把上一张牌的数据存入
        cardData[currentCard.toLowerCase()] = cardInterpretation.trim();
      }

      // 开始新一张牌
      currentCard = line.substring(0, splitIndex).trim();
      cardInterpretation = line.substring(splitIndex + 1).trim();
    } else {
      // 继续累积当前卡片的解释内容
      cardInterpretation += " " + line.trim();
    }
  });

  // 把最后一张牌的数据存入
  if (currentCard) {
    cardData[currentCard.toLowerCase()] = cardInterpretation.trim();
  }

  return cardData;
}
function generateText(input) {
  let displayText = "";
  let filteredText = filterSourceByKeywords(input);
  if (filteredText.length > 0) {
    // 将筛选后的文本添加到 Markov 链中生成
    markov = RiTa.markov(n);
    markov.addText(filteredText.join(" "));
    displayText = markov.generate(numSentences);
  } else {
    displayText = ["Sorry, no matching tarot card found."];
  }
  return displayText;
}
