const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// 1. ቦት መክፈቻ ቶከን
const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

// 2. ዌብ ሰርቨር (Render እንዳይዘጋ)
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink Main App Bot is Active!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web Server running on port ${PORT}`));

// ==========================================
// 🛍 3. የውሂብ መጋዘን (DATA)
// ==========================================
const products = [
  { id: 1, name: 'ያማረ የሴቶች የሐበሻ ቀሚስ', price: 3500, description: 'በእጅ ጥልፍ የተሰራ፣ ጥራት ካለው ማግ የተዘጋጀ።', category: '👗 የሴቶች ልብስ' },
  { id: 2, name: 'የወንዶች ዘመናዊ ሱፍ', price: 6000, description: 'ለሰርግ እና ለተለያዩ ፕሮግራሞች የሚሆን ሙሉ ሱፍ።', category: '👔 የወንዶች ልብስ' },
  { id: 3, name: 'የወንዶች ስፖርት ጫማ (Sneakers)', price: 2800, description: 'ለረጅም መንገድ እና ለስፖርት የሚሆን ምቹ ጫማ።', category: '👟 ጫማዎች' },
  { id: 4, name: 'ስማርት ሰዓት (Smart Watch Series 9)', price: 2500, description: 'ቻርጅ ለረጅም ጊዜ የሚይዝ፣ የልብ ትርታ የሚለካ።', category: '📱 ኤሌክትሮኒክስ' }
];

const houses = [
  { id: 101, name: 'ለተማሪዎች የሚሆን ምቹ ዶርም', price: '1,500 በወር', description: 'ዋይፋይ እና ውሃ የተሟላለት፣ ግቢው ሰላማዊ የሆነ ዶርም ከነአልጋው።', category: '🛏 የተማሪዎች ዶርም' },
  { id: 102, name: 'ዘመናዊ ስቱዲዮ አፓርትመንት (Studio)', price: '12,000 በወር', description: 'የራሱ ክላስ፣ ኪችን እና ባዝሩም ያለው ለአንድ ወይም ለሁለት ሰው የሚሆን።', category: '🏢 ስቱዲዮ አፓርትመንት' },
  { id: 103, name: 'ቪላ / ሰርቪስ ቤት (Villa)', price: '25,000 በወር', description: 'ሰፊ ግቢ ያለው፣ 3 መኝታ ክፍል ከትልቅ ሳሎን ጋር። ለመኖሪያ በጣም ምቹ።', category: '🏡 ቪላ / ሰርቪስ ቤት' }
];

const usedItems = [
  { id: 201, name: 'ያገለገለ ላፕቶፕ (HP Core i5)', price: 18000, description: '8GB RAM, 256GB SSD። ባትሪው 3 ሰዓት ይይዛል፣ ምንም አይነት ችግር የሌለበት።', contact: '0911223344' },
  { id: 202, name: 'ባጃጅ (በጥሩ ሁኔታ ላይ ያለ)', price: 220000, description: 'ሞተሩ ያልተፈታ፣ ጥቂት ጊዜ ብቻ የሰራ ንፁህ ባጃጅ።', contact: '0912345678' }
];

// ==========================================
// 📱 4. ከታች የሚቀመጡ ኪቦርዶች (REPLY KEYBOARDS)
// ==========================================
const mainKeyboard = Markup.keyboard([
  ['🛍 አዳዲስ ዕቃዎችን ይግዙ', '🏠 የሚከራይ ቤትና ዶርም ፈልግ'],
  ['🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', 'ℹ️ ስለ እኛ']
]).resize();

const shopKeyboard = Markup.keyboard([
  ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ'],
  ['👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

const houseKeyboard = Markup.keyboard([
  ['🛏 የተማሪዎች ዶርም', '🏢 ስቱዲዮ አፓርትመንት'],
  ['🏡 ቪላ / ሰርቪስ ቤት', '🔙 ወደ ዋናው ማውጫ']
]).resize();

const usedKeyboard = Markup.keyboard([
  ['📥 ዕቃዎች ለመመልከት', '📤 የራሴን ዕቃ ለመሸጥ'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

// ==========================================
// 🎯 5. የትዕዛዝ እና አዝራሮች ሎጂክ (BOT LOGIC)
// ==========================================
bot.start((ctx) => {
  return ctx.reply(`እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋\n\nከታች ካለው አፕ መሰል ማውጫ የሚፈልጉትን አገልግሎት ይምረጡ፦`, mainKeyboard);
});

// ወደ ዋናው ማውጫ መመለሻ
bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል። የሚፈልጉትን ይምረጡ፦', mainKeyboard);
});

// --- 🛍 የሱቆች ምድብ ---
bot.hears('🛍 አዳዲስ ዕቃዎችን ይግዙ', (ctx) => {
  return ctx.reply('🛍 የሱቆች መጋዘን\n\nለመግዛት የሚፈልጉትን የዕቃ ምድብ ከታች ይምረጡ፦', shopKeyboard);
});

const shopCategories = ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ', '👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'];
bot.hears(shopCategories, async (ctx) => {
  const category = ctx.message.text;
  const filtered = products.filter(p => p.category === category);
  
  for (let item of filtered) {
    const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}`;
    await ctx.reply(txt, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_item_${item.id}`)]]) });
  }
  await ctx.reply(`✨ *Siralink Marketን ምርጫዎ ስላደረጉ እናመሰግናለን!* ✨\n\nሌላ ዕቃ ለማየት ምድብ ይምረጡ ወይም '🔙 ወደ ዋናው ማውጫ' ይበሉ።`, shopKeyboard);
});

// --- 🏠 የቤት ኪራይ ምድብ ---
bot.hears('🏠 የሚከራይ ቤትና ዶርም ፈልግ', (ctx) => {
  return ctx.reply('🏠 የቤት እና የዶርም ኪራይ ማዕከል\n\nየሚፈልጉትን የቤት አይነት ከታች ይምረጡ፦', houseKeyboard);
});

const houseCategories = ['🛏 የተማሪዎች ዶርም', '🏢 ስቱዲዮ አፓርትመንት', '🏡 ቪላ / ሰርቪስ ቤት'];
bot.hears(houseCategories, async (ctx) => {
  const category = ctx.message.text;
  const filtered = houses.filter(h => h.category === category);

  for (let item of filtered) {
    const txt = `🏠 *${item.name}*\n💰 ኪራይ: ${item.price}\nℹ️ መግለጫ: ${item.description}`;
    await ctx.reply(txt, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('📞 አሁን ተከራይ / አግኝ', `rent_house_${item.id}`)]]) });
  }
  await ctx.reply(`✨ *Siralink Marketን ምርጫዎ ስላደረጉ እናመሰግናለን!* ✨\n\nተጨማሪ የቤት አማራጭ ለማየት ከታች ይምረጡ።`, houseKeyboard);
});

// --- 🔄 ያገለገሉ ዕቃዎች ምድብ ---
bot.hears('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', (ctx) => {
  return ctx.reply('🔄 ያገለገሉ ዕቃዎች ማዕከል\n\nእቃ መግዛት ይፈልጋሉ ወይስ የራስዎን እቃ መሸጥ?', usedKeyboard);
});

bot.hears('📥 ዕቃዎች ለመመልከት', async (ctx) => {
  for (let item of usedItems) {
    const txt = `🔄 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}\n📞 ስልክ: ${item.contact}`;
    await ctx.reply(txt, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('📞 ለባለቤቱ ደውል', `call_owner_${item.id}`)]]) });
  }
  await ctx.reply(`✨ *Siralink Marketን ምርጫዎ ስላደረጉ እናመሰግናለን!* ✨`, usedKeyboard);
});

bot.hears('📤 የራሴን ዕቃ ለመሸጥ', (ctx) => {
  return ctx.reply('📤 የራስዎን ያገለገለ እቃ ለመመዝገብ በቀጥታ በቦቱ ላይ /sell ብለው ይጻፉ። ለምሳሌ፦\n\n/sell HP ላፕቶፕ - 25000 - 0911223344', usedKeyboard);
});

bot.command('sell', (ctx) => {
  const sellText = `📥 የእቃዎ መረጃ ደርሶናል። መረጃው ተገምግሞ በቅርቡ በቦቱ ላይ ይለጠፋል።\n\n` +
                   `✨ *Siralink Marketን ምርጫዎ ስላደረጉ እናመሰግናለን!* ✨`;
  ctx.reply(sellText, { parse_mode: 'Markdown', ...mainKeyboard });
});

// --- ℹ️ ስለ እኛ ክፍል ---
bot.hears('ℹ️ ስለ እኛ', (ctx) => {
  const aboutText = `ℹ️ *ስለ Siralink ሁለገብ ማርኬት*\n\n🏗 እኛ ከፍተኛ ጥራት ያላቸውን ማሽነሪዎች፣ አልባсах እና የቤት ኪራይ መረጃዎችን የምናቀርብ ታማኝ ድርጅት ነን።\n\n📍 *አድራሻ:* አዲስ አበባ፣ ኢትዮጵያ\n📞 *ስልክ:* +2519xxxxxxxx\n🌐 *ቻናል:* @SiralinkMarket`;
  return ctx.reply(aboutText, { parse_mode: 'Markdown', ...mainKeyboard });
});

// --- 🛎 የውስጥ በተን ማዘዣዎች (Inline Actions) ---
bot.action(/^order_item_(.+)$/, (ctx) => ctx.reply('🛍 እቃውን ለማዘዝ ስምዎትን እና ያሉበትን ትክክለኛ አድራሻ እዚህ ይጻፉልን። የሱቁ ባለቤት በውስጥ መስመር ያገኝዎታል።'));
bot.action(/^rent_house_(.+)$/, (ctx) => ctx.reply('📞 ቤቱን ለመከራየት አድራሻዎን እና ስልክዎን እዚህ ይተዉልን። ደላላው ወይም ባለቤቱ በውስጥ መስመር ያገኝዎታል።'));
bot.action(/^call_owner_(.+)$/, (ctx) => ctx.reply('📱 እቃው ላይ በተጠቀሰው ስልክ ቁጥር በመደወል በቀጥታ ከባለቤቱ ጋር መነጋገር ይችላሉ።'));

// 🚀 6. አስተማማኝ ማስነሻ
bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Main App Keyboard Bot Active! 🚀'))
  .catch((err) => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
