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
function getHistory(chatId){
 if(!memory[chatId]){
  memory[chatId] = [];
 }
 return memory[chatId];
}
bot.onText(/\/start/, async(msg)=>{
 await bot.sendMessage(
  msg.chat.id,
deepseek-reasoner, only teks.
masukan pertanyaan mu:
 );
});
bot.on("message", async(msg)=>{
 try{
  if(msg.text?.startsWith("/"))
   return;
  const chatId = msg.chat.id;
  if(!msg.text)
   return;
  const history =
  getHistory(chatId);
  history.push({
   role:"user",
   content:msg.text
  });
  const waitMsg =
  await bot.sendMessage(
   chatId,
   "⚡  Menganalisis pertanyaan..."
  );
  const result =
await client.chat.completions.create({
 model: process.env.MODEL,
 messages: [
  {
   role: "system",
   content: `
Kamu adalah deepseek yang ramah dan profesional.
Aturan format:
- Jangan gunakan markdown.
- Jangan gunakan ** atau ***.
- Jangan gunakan heading markdown seperti ##.
- Jangan gunakan code block kecuali user meminta kode.
Gunakan format Telegram yang rapi`
  },
  ...history
 ]
});
  const answer =
  result
  .choices[0]
  .message
  .content;
  history.push({
   role:"assistant",
   content:answer
  });
  if(history.length > 20){
   history.splice(
    0,
    history.length - 20
   );
  }
  await bot.deleteMessage(
   chatId,
   waitMsg.message_id
  );
  await bot.sendMessage(
   chatId,
   answer
  );
 }catch(err){
  console.error(err);
 }
});
