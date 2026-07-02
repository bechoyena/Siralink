const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// 1. ቦት መክፈቻ ቶከን
const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

// 2. ዌብ ሰርቨር (Render እንዳይዘጋ)
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink Ultimate Bot is Active!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web Server running on port ${PORT}`));

// ==========================================
// 🛍 3. የሱቅ ዕቃዎች መጋዘን (PRODUCTS DATA)
// ==========================================
const products = [
  { id: 1, name: 'ያማረ የሴቶች የሐበሻ ቀሚስ', price: 3500, description: 'በእጅ ጥልፍ የተሰራ፣ ጥራት ካለው ማግ የተዘጋጀ።', category: 'clothes' },
  { id: 2, name: 'የወንዶች ዘመናዊ ሱፍ', price: 6000, description: 'ለሰርግ እና ለተለያዩ ፕሮግራሞች የሚሆን ሙሉ ሱፍ።', category: 'men' },
  { id: 3, name: 'የወንዶች ስፖርት ጫማ (Sneakers)', price: 2800, description: 'ለረጅም መንገድ እና ለስፖርት የሚሆን ምቹ ጫማ።', category: 'shoes' },
  { id: 4, name: 'ስማርት ሰዓት (Smart Watch Series 9)', price: 2500, description: 'ቻርጅ ለረጅም ጊዜ የሚይዝ፣ የልብ ትርታ የሚለካ።', category: 'elec' }
];

// ==========================================
// 🏠 4. የኪራይ ቤቶችና ዶርሞች መረጃ (HOUSES DATA)
// ==========================================
const houses = [
  { id: 101, name: 'ለተማሪዎች የሚሆን ምቹ ዶርም', price: '1,500 በወር', description: 'ዋይፋይ እና ውሃ የተሟላለት፣ ግቢው ሰላማዊ የሆነ ዶርም ከነአልጋው።', category: 'dorm' },
  { id: 102, name: 'ዘመናዊ ስቱዲዮ አፓርትመንት (Studio)', price: '12,000 በወር', description: 'የራሱ ክላስ፣ ኪችን እና ባዝሩም ያለው ለአንድ ወይም ለሁለት ሰው የሚሆን።', category: 'studio' },
  { id: 103, name: 'ቪላ / ሰርቪስ ቤት (Villa)', price: '25,000 በወር', description: 'ሰፊ ግቢ ያለው፣ 3 መኝታ ክፍል ከትልቅ ሳሎን ጋር። ለመኖሪያ በጣም ምቹ።', category: 'villa' }
];

// ==========================================
// 🔄 5. ያገለገሉ ዕቃዎች መረጃ (USED ITEMS DATA)
// ==========================================
const usedItems = [
  { id: 201, name: 'ያገለገለ ላፕቶፕ (HP Core i5)', price: 18000, description: '8GB RAM, 256GB SSD። ባትሪው 3 ሰዓት ይይዛል፣ ምንም አይነት ችግር የሌለበት።', contact: '0911223344' },
  { id: 202, name: 'ባጃጅ (በጥሩ ሁኔታ ላይ ያለ)', price: 220000, description: 'ሞተሩ ያልተፈታ፣ ጥቂት ጊዜ ብቻ የሰራ ንፁህ ባጃጅ።', contact: '0912345678' }
];

// ==========================================
// 🚀 6. የቁልፎች ሰሌዳዎች (KEYBOARDS)
// ==========================================
const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🛍 አዳዲስ ዕቃዎችን ይግዙ (ከሱቆች)', 'shop_main')],
  [Markup.button.callback('🏠 የሚከራይ ቤትና ዶርም ፈልግ', 'house_main')],
  [Markup.button.callback('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', 'used_main')],
  [Markup.button.callback('ℹ️ ስለ እኛ', 'about_us_main')]
]);

const backToMain = [Markup.button.callback('🔙 ወደ ዋናው ማውጫ', 'back_to_main')];

// ==========================================
// 🎯 7. የትዕዛዝ እና አዝራሮች ሎጂክ (BOT LOGIC)
// ==========================================
bot.start((ctx) => {
  return ctx.reply(`እንኳን ወደ Siralink ሁለገብ የገበያ እና መረጃ ቦት በሰላም መጡ! 👋\n\nምን ማድረግ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦`, mainKeyboard);
});

bot.action('back_to_main', async (ctx) => {
  try {
    await ctx.editMessageText(`ምን ማድረግ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦`, mainKeyboard);
  } catch (err) {
    await ctx.reply(`ምን ማድረግ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦`, mainKeyboard);
  }
});

// --- 🛍 የሱቆች ምድብ ---
bot.action('shop_main', (ctx) => {
  return ctx.editMessageText(`🛍 የሱቆች መጋዘን\n\nለመግዛት የሚፈልጉትን የዕቃ ምድብ ይምረጡ፦`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👗 የሴቶች ልብስ', 'get_prod_clothes'), Markup.button.callback('👔 የወንዶች ልብስ', 'get_prod_men')],
      [Markup.button.callback('👟 ጫማዎች', 'get_prod_shoes'), Markup.button.callback('📱 ኤሌክትሮኒክስ', 'get_prod_elec')],
      backToMain
    ])
  );
});

bot.action(/^get_prod_(.+)$/, async (ctx) => {
  const category = ctx.match[1];
  const filtered = products.filter(p => p.category === category);
  if (filtered.length === 0) return ctx.reply('በዚህ ምድብ ውስጥ በአሁኑ ሰዓት ዕቃ አልተመዘገበም።', Markup.inlineKeyboard([backToMain]));

  for (let item of filtered) {
    const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}`;
    await ctx.reply(txt, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_item_${item.id}`)]]) });
  }
  await ctx.reply('ሌላ ዕቃ መመልከት ይፈልጋሉ?', Markup.inlineKeyboard([backToMain]));
});

// --- 🏠 የቤት ኪራይ ምድብ ---
bot.action('house_main', (ctx) => {
  return ctx.editMessageText(`🏠 የቤት እና የዶርም ኪራይ ማዕከል\n\nየሚፈልጉትን የቤት አይነት ይምረጡ፦`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🛏 የተማሪዎች ዶርም', 'get_house_dorm')],
      [Markup.button.callback('🏢 ስቱዲዮ አፓርትመንት', 'get_house_studio')],
      [Markup.button.callback('🏡 ቪላ / ሰርቪስ ቤት', 'get_house_villa')],
      backToMain
    ])
  );
});

bot.action(/^get_house_(.+)$/, async (ctx) => {
  const category = ctx.match[1];
  const filtered = houses.filter(h => h.category === category);
  if (filtered.length === 0) return ctx.reply('በዚህ ምድብ ተከራይ ቤት የለም።', Markup.inlineKeyboard([backToMain]));

  for (let item of filtered) {
    const txt = `🏠 *${item.name}*\n💰 ኪራይ: ${item.price}\nℹ️ መግለጫ: ${item.description}`;
    await ctx.reply(txt, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('📞 አሁን ተከራይ / አግኝ', `rent_house_${item.id}`)]]) });
  }
  await ctx.reply('ሌላ የቤት አማራጭ ማየት ይፈልጋሉ?', Markup.inlineKeyboard([backToMain]));
});

// --- 🔄 ያገለገሉ ዕቃዎች ምድብ ---
bot.action('used_main', (ctx) => {
  return ctx.editMessageText(`🔄 ያገለገሉ ዕቃዎች ማዕከል\n\nእቃ መግዛት ይፈልጋሉ ወይስ የራስዎን እቃ መሸጥ?`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📥 ዕቃዎች ለመመልከት (የሽያጭ ዕቃዎች)', 'view_used')],
      [Markup.button.callback('📤 የራሴን ዕቃ ለመሸጥ (/sell)', 'sell_instruction')],
      backToMain
    ])
  );
});

bot.action('view_used', async (ctx) => {
  for (let item of usedItems) {
    const txt = `🔄 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}\n📞 ስልክ: ${item.contact}`;
    await ctx.reply(txt, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('📞 ለባለቤቱ ደውል', `call_owner_${item.id}`)]]) });
  }
  await ctx.reply('ተጨማሪ ያገለገሉ ዕቃዎችን መፈለግ ይፈልጋሉ?', Markup.inlineKeyboard([backToMain]));
});

bot.action('sell_instruction', (ctx) => {
  return ctx.reply('📤 የራስዎን ያገለገለ እቃ ለመመዝገብ በቀጥታ በቦቱ ላይ /sell ብለው ይጻፉ። ለምሳሌ፦\n\n/sell HP ላፕቶፕ - 25000 - 0911223344', Markup.inlineKeyboard([backToMain]));
});

bot.command('sell', (ctx) => {
  ctx.reply('📥 የእቃዎ መረጃ ደርሶናል። መረጃው ተገምግሞ በቅርቡ በቦቱ ላይ ይለጠፋል። እናመሰግናለን!');
});

// --- ℹ️ ስለ እኛ እና ማዘዣዎች ---
bot.action('about_us_main', (ctx) => {
  const aboutText = `ℹ️ *ስለ Siralink ሁለገብ ማርኬት*\n\n🏗 እኛ ከፍተኛ ጥራት ያላቸውን ማሽነሪዎች፣ አልባሳት እና የቤት ኪራይ መረጃዎችን የምናቀርብ ታማኝ ድርጅት ነን።\n\n📍 *አድራሻ:* አዲስ አበባ፣ ኢትዮጵያ\n📞 *ስልክ:* +2519xxxxxxxx\n🌐 *ቻናል:* @SiralinkMarket`;
  return ctx.editMessageText(aboutText, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([backToMain]) });
});

bot.action(/^order_item_(.+)$/, (ctx) => ctx.reply('🛍 እቃውን ለማዘዝ ስምዎትን እና አድራሻዎን ይጻፉልን። የሱቁ ባለቤት ያገኝዎታል።'));
bot.action(/^rent_house_(.+)$/, (ctx) => ctx.reply('📞 ቤቱን ለመከራየት አድራሻዎን እና ስልክዎን ይተዉልን። ደላላው/ባለቤቱ በውስጥ መስмер ያገኝዎታል።'));
bot.action(/^call_owner_(.+)$/, (ctx) => ctx.reply('📱 እቃው ላይ በተጠቀሰው ስልክ ቁጥር በመደወል በቀጥታ ከባለቤቱ ጋር መነጋገር ይችላሉ።'));

// 🚀 8. አስተማማኝ ማስነሻ (Clean Long Polling)
bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Bot 100% Fully Functional Active! 🚀'))
  .catch((err) => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
