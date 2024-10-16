class Chatbox {
  constructor() {
    this.args = {
      openButton: document.querySelector(".chatbox__button"),
      chatBox: document.querySelector(".chatbox__support"),
      sendButton: document.querySelector(".send__button"),
    };

    this.state = false;
    this.messages = [];

    this.cards = [];
    this.loadCardData();
  }
  createTitle() {
    let htmlString = `
		<div class="messages__item messages__item--visitor">
			<p>
				Hi! I'm
				<span
					style="
						font-family: 'Great Vibes', cursive;
						font-size: 1.5em;
						color: #6a1b9a;
						text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
						letter-spacing: 0.05em;
					"
				>
					Tarot's Echo
				</span>, your personal tarot card reader. I can help you uncover the
				meanings behind tarot cards and guide you on your journey. Feel
				free to generate the card of your day!
			</p>
		</div>`;
    const placeholder = document.createElement("div");

    const chatmessage = document.querySelector(".chatbox__messages");
    placeholder.innerHTML = htmlString;
    chatmessage.appendChild(placeholder);
  }
  loadCardData() {
    fetch("card_data.json")
      .then((response) => response.json())
      .then((data) => {
        this.cards = data.cards;
      })
      .catch((error) => console.error("Error loading card data:", error));
  }
  display() {
    const { openButton, chatBox, sendButton } = this.args;

    openButton.addEventListener("click", () => this.toggleState(chatBox));

    sendButton.addEventListener("click", () => this.onSendButton(chatBox));

    const node = chatBox.querySelector("input");
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton(chatBox);
      }
    });
  }

  toggleState(chatbox) {
    this.state = !this.state;

    // show or hides the box
    if (this.state) {
      chatbox.classList.add("chatbox--active");
    } else {
      chatbox.classList.remove("chatbox--active");
    }
  }

  getRandomCardList() {
    var arr = [];
    while (arr.length < 3) {
      var r = Math.floor(Math.random() * 78) + 1;
      if (arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
  }
  convertString(s) {
    // 定义数字到英文的映射
    const numDict = {
      0: "Zero",
      1: "One",
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
    };

    // 使用正则表达式匹配数字并替换为英文
    return s.replace(/\d/g, function (match) {
      return numDict[match];
    });
  }
  onSendButton(chatbox) {
    // console.log("🚀 ~ file: app.js:107 ~ chatbox:", chatbox);
    // this function should finish with 3 numbers

    // Check the console to see that this is an array of 3 numbers

    // change updateChatImage to receive an array

    var textField = chatbox.querySelector("input");
    let text = textField.value;

    if (text === "") {
      return;
    }

    // 显示加载指示器
    this.loading = true;
    document.getElementById("loading-indicator").style.display = "block";

    let text1 = this.convertString(text);
    // this.convertString(text1) 是指转换后的，你可以铺到页面上或者只在接口内用
    let msg1 = { name: "User", message: text1 };
    this.messages.push(msg1);

    let demo = this.hasData(text1);
    if (demo && !demo.includes("Sorry, no matching tarot card found")) {
      this.updateChatText(chatbox);
      const placeholder = document.createElement("div");
      placeholder.innerHTML = demo;
      const chatmessage = chatbox.querySelector(
        ".chatbox__messages > div:last-child"
      );
      setTimeout(function () {
        chatmessage.appendChild(placeholder);
        placeholder.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
      // console.log(123);
      // 隐藏加载指示器
      this.loading = false;
      document.getElementById("loading-indicator").style.display = "none";

      textField.value = ""; // 清空输入框
    } else {
      fetch("http://49.232.237.78:1273/api/audiostreaming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: textField.value,
          messages: [],
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setTimeout(() => {
            let msg2 = {
              name: "Sam",
              message: data.message,
            };
            const audioElement = document.getElementById("audioElement");
            audioElement.src = data.url; // 访问后端的流式传输端点
            audioElement.play();
            this.messages.push(msg2);
            // 更新聊天框
            this.updateChatText(chatbox);
            // this.updateChatImage(chatbox);

            // 隐藏加载指示器
            this.loading = false;
            document.getElementById("loading-indicator").style.display = "none";

            textField.value = ""; // 清空输入框
          }, 1000); // 假设2秒后 AI 回复生成完毕
          // 处理返回数据，将结果显示在页面上
          // document.getElementById("resultOutput").textContent = ;
        })
        .catch((error) => {
          textField.value = "";
          console.error("请求失败:", error);
          // document.getElementById("resultOutput").textContent =
          //   "请求失败，请检查控制台日志。";
        });
    }
  }

  updateChatText(chatbox) {
    const chatmessage = chatbox.querySelector(".chatbox__messages > div");

    // 先清空聊天框
    chatmessage.innerHTML = "";

    // 循环生成消息并插入
    this.messages.forEach((item) => {
      let messageHtml;
      if (item.name === "Sam") {
        // 对方消息，左侧显示
        messageHtml =
          '<div class="messages__item messages__item--visitor">' +
          item.message +
          "</div>";
      } else {
        // 用户消息，右侧显示
        messageHtml =
          '<div class="messages__item messages__item--operator">' +
          item.message +
          "</div>";
      }
      chatmessage.innerHTML += messageHtml; // 使用 += 来追加消息
    });
  }
  hasData(name) {
    let htmlString;
    try {
      htmlString =
        '<div class="messages__item messages__item--visitor">' +
        '<div class="tarot-card-container">' +
        '<img class="card__item--tarot auto-flip" src="./cards/' +
        name +
        '.jpg" alt="Card 1">' +
        `<p class="card-description">${generateText(name)}</p>` +
        "</div>";
      return htmlString;
    } catch (error) {
      console.log("🚀 ~ file: app.js:205 ~ error:", error);
    }

    // return htmlString;
  }
  testDemo(retries = 20) {
    let cardList = this.getRandomCardList();

    // 如果递归次数超过 20 次，返回错误
    if (retries <= 0) {
      console.error("Failed to generate cards after maximum retries.");
      // return "<p> Error: Failed to generate cards after multiple attempts.</p > ";
      return (
        '<div class="messages__item messages__item--visitor">' +
        "<p> Error: Failed to generate cards after multiple attempts.</p > " +
        "</div>"
      );
    }

    let htmlString = "";
    try {
      let arr = cardList.map((e) => this.cards[e + 1]).filter(Boolean); // Filter out undefined values
      if (arr.length < 3) throw new Error("Invalid card list");
      let txt = generateText(card.name);
      htmlString =
        '<div class="messages__item messages__item--visitor">' +
        arr
          .map(
            (card, i) =>
              `<div class="tarot-card-container">
								<img class="card__item--tarot" src="./cards/${card.name}.jpg" alt="Card ${
                i + 1
              }">
								<p class="card-description">${txt}</p>
							</div>`
          )
          .join("") +
        "</div>";
      // console.log(txt);
      return htmlString;
    } catch (error) {
      return this.testDemo(retries - 1); // 递归调用时减少 retries 参数
    }
  }
  updateChatImage(chatbox) {
    const htmlString = this.testDemo();
    const placeholder = document.createElement("div");
    placeholder.innerHTML = htmlString;
    const chatmessage = chatbox.querySelector(
      ".chatbox__messages > div:last-child"
    );
    setTimeout(function () {
      chatmessage.appendChild(placeholder);
      placeholder.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }
}
// generateText("THE HIGH PRIESTESS");

const chatbox = new Chatbox();
chatbox.display();
chatbox.createTitle();
// 检查浏览器是否支持 Web Speech API
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US"; // 设置语言为英语
  recognition.continuous = false; // 非连续识别
  recognition.interimResults = false; // 不返回临时结果
  const voiceButton = document.getElementById("voice-button");
  const messageInput = document.getElementById("message-input");

  // 按住按钮开始录音
  voiceButton.addEventListener("mousedown", () => {
    recognition.start();
    voiceButton.classList.add("recording"); // 添加录音样式，触发动画
  });

  // 松开按钮停止录音
  voiceButton.addEventListener("mouseup", () => {
    recognition.stop();
    voiceButton.classList.remove("recording"); // 移除录音样式，动画结束
  });

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript; // 将识别的文本填入输入框

    let chatbox__support = document.querySelector(".chatbox__support");
    chatbox.onSendButton(chatbox__support);
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    voiceButton.classList.remove("recording"); // 在错误时移除录音样式
  };

  recognition.onend = function () {
    console.log("Speech recognition ended.");
    voiceButton.classList.remove("recording"); // 在录音结束时移除录音样式
  };
} else {
  console.warn("Web Speech API is not supported in this browser.");
}
function scrollToLatestMessage() {
  const chatboxMessages = document.querySelector(".chatbox__messages");
  const latestMessage = chatboxMessages.firstElementChild; // 获取最新的消息（最后添加的消息）

  if (latestMessage) {
    latestMessage.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}
