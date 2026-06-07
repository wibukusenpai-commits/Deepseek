require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const bot = new TelegramBot(
  process.env.BOT_TOKEN,
  { polling: true }
);

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.BASE_URL
});

const memory = {};

function getHistory(chatId) {
  if (!memory[chatId]) {
    memory[chatId] = [];
  }
  return memory[chatId];
}

function cleanAnswer(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/###/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "");
}

function startTyping(chatId) {
  bot.sendChatAction(chatId, "typing");

  return setInterval(() => {
    bot.sendChatAction(chatId, "typing");
  }, 4000);
}

function stopTyping(interval) {
  clearInterval(interval);
}

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    `DeepSeek AI-reasoner,only teks.
    masukan pertanyaan mu:`
  );
});

bot.on("message", async (msg) => {
  try {
    if (msg.text?.startsWith("/"))
      return;

    if (!msg.text)
      return;

    const chatId = msg.chat.id;

    const typing = startTyping(chatId);

    const history = getHistory(chatId);

    history.push({
      role: "user",
      content: msg.text
    });

    const result =
      await client.chat.completions.create({
        model: process.env.MODEL,
        messages: history
      });

    let answer =
      result.choices[0].message.content || "";

    answer = cleanAnswer(answer);

    history.push({
      role: "assistant",
      content: answer
    });

    if (history.length > 20) {
      history.splice(
        0,
        history.length - 20
      );
    }

    stopTyping(typing);

    await bot.sendMessage(
      chatId,
      answer
    );

  } catch (err) {
    console.error(err);
  }
});
