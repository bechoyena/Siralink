const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');
const ADMIN_CHAT_ID = 5406168929;

const SUPABASE_URL = 'https://gyooossgagycyeyffjfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5b29vc3NnYWd5Y3lleWZmamZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk5ODgsImV4cCI6MjA5ODUxNTk4OH0.k85DGyIEU_wEzZhE6Qbo-ssiXbhT2gR69SH7KVOZ4NY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const userSessions = {};

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink Bot is Live!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web Server running on port ${PORT}`));

// --- STEP 1: ዋናው ማውጫ ገፅ (የነበሩት በኢሞጂያቸው) ---
const mainKeyboard = Markup.keyboard([
  ['🛍 አዳድስ እቃዎች', '🏠 የቤት ኪራይ/ዶርም'],
  ['🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', '👥 በደንበኞች የተጨመሩ'],
  ['ℹ️ ስለ እኛ']
]).resize();

// --- STEP 2: አዳድስ ዕቃዎች ማውጫ (መጀመሪያ የነበሩት በቅርጻቸው) ---
const shopKeyboard = Markup.keyboard([
  ['👗 የሴቶች ልብስ', '👕 የወንዶች ልብስ'],
  ['👟 ጫማዎች', '🔌 ኤሌክትሮንክስ'],
  ['🛍 የቤት ዕቃዎች', '➕ አዲስ ዕቃ ጨምር'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

// --- STEP 3: የቤት ኪራይና ዶርም ማውጫ ---
const houseKeyboard = Markup.keyboard([
  ['🎓 የተማሪዎች ዶርም', '🏢 አፓርትመንት'],
  ['🏡 ቪላ', '🏘 ሰርቪስ'],
  ['📌 የቤት/የመሬት ጥቆማ', '🔙 ወደ ዋናው ማውጫ']
]).resize();

// --- STEP 4: ያገለገሉ ዕቃዎችን ይግዙ ይሽጡ ማውጫ ---
const usedKeyboard = Markup.keyboard([
  ['📦 ዕቃዎችን እይ', '➕ የእርስዎን ጨምር'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

// --- STEP 5: በደንበኞች የተጨመሩ ማውጫ (ለስም ተለዋጭና ለየት ያሉ ኢሞጂዎች የተደረጉበት) ---
const customerCatKeyboard = Markup.keyboard([
  ['👔 አልባሳትና ጫማ', '🛋 የቤት ዕቃዎች ምድብ'],
  ['💻 ኤሌክትሮኒክስ ምድብ', '🗺 መሬት/ቤት'],
  ['⚙️ ያገለገሉ ዕቃዎች ምድብ', '🔙 ወደ ዋናው ማውጫ']
]).resize();

// ደንበኞች አዲስ ምርት ሲጨምሩ የሚመርጡት ኪቦርድ
const selectCatKeyboard = Markup.keyboard([
  ['👔 አልባሳትና ጫማ', '🛋 የቤት ዕቃዎች ምድብ'],
  ['💻 ኤሌክትሮኒክስ ምድብ', '🗺 መሬት/ቤት'],
  ['⚙️ ያገለገሉ ዕቃዎች ምድብ']
]).resize();

bot.telegram.setMyDescription("እንኳን ወደ Siralink የገበያ መድረክ በሰላም መጡ! 👋\n\nይህ ቦት አዳዲስና ያገለገሉ ዕቃዎችን ለመግዛትና ለመሸጥ፣ የሚከራዩ ቤቶችንና ዶርሞችን በቀላሉ ለማግኘት እንዲሁም የሚሸጡ መሬትና ቤቶችን ለመጠቆም የሚረዳ ሁለገብ የገበያ መገናኛ ቦት ነው።\n\nለመጀመር ከታች ያለውን START የሚለውን ይጫኑ! 👇").catch(console.error);

bot.start(async (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  try {
    await supabase.from('bot_users').insert([{ chat_id: ctx.from.id }], { upsert: true });
  } catch (err) { console.error('User registration error:', err); }
  return ctx.reply('እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋\n\nከታች ካለው ማውጫ የሚፈልጉትን አገልግሎት ይምረጡ፦', mainKeyboard);
});

bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል። የሚፈልጉትን ይምረጡ፦', mainKeyboard);
});

// ==========================================
// STEP 1 & 5: በደንበኞች የተጨመሩ ክፍል
// ==========================================
bot.hears('👥 በደንበኞች የተጨመሩ', (ctx) => {
  return ctx.reply('👥 በደንበኞች የተመዘገቡ የገበያ ምርቶች ማውጫ\n\nለመመልከት የሚፈልጉትን ምድብ ይምረጡ፦', customerCatKeyboard);
});

const customerCategories = ['👔 አልባሳትና ጫማ', '🛋 የቤት ዕቃዎች ምድብ', '💻 ኤሌክትሮኒክስ ምድብ', '🗺 መሬት/ቤት', '⚙️ ያገለገሉ ዕቃዎች ምድብ'];
bot.hears(customerCategories, async (ctx, next) => {
  const session = userSessions[ctx.from.id];
  if (session && (session.step === 'ADD_PROD_CAT' || session.step === 'CONFIRM_CAT')) {
    return next();
  }

  const clickedText = ctx.message.text.trim();
  // Supabase ላይ ግጭት እንዳይፈጥር ወደ ሚፈልገው መለያ ፅሁፍ ማስተካከያ
  let dbCategory = clickedText;
  if (clickedText === '🛋 የቤት ዕቃዎች ምድብ') dbCategory = 'የቤት ዕቃዎች';
  if (clickedText === '💻 ኤሌክትሮኒክስ ምድብ') dbCategory = 'ኤሌክትሮኒክስ';
  if (clickedText === '⚙️ ያገለገሉ ዕቃዎች ምድብ') dbCategory = 'ያገለገሉ ዕቃዎች';

  try {
    const { data: items, error } = await supabase.from('customer_products').select('*').eq('category', dbCategory);
    if (error || !items || items.length === 0) {
      return ctx.reply(`በዚህ ምድብ (${clickedText}) ውስጥ በአሁኑ ሰዓት በደንበኛ የተጫነ ዕቃ የለም።`, customerCatKeyboard);
    }
    for (let item of items) {
      const txt = `📦 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}\n🏢 ድርጅት/አድራሻ: ${item.shop_name_address || 'የለውም'}\n📞 ስልክ: ${item.phone || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን ይደውሉ / ይዘዙ', `order_cust_${item.id}`)]]);
      
      if (item.image_url && item.image_url.trim() !== '') {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); }
        catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
      } else {
        await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn });
      }
    }
  } catch (err) { await ctx.reply('መረጃውን ማግኘት አልተቻለም።', customerCatKeyboard); }
});

// ==========================================
// STEP 2: አዳድስ እቃዎች ክፍል (የሱቅ መጋዘን)
// ==========================================
bot.hears('🛍 አዳድስ እቃዎች', (ctx) => {
  return ctx.reply('🛍 የሱቆች መጋዘን\n\nለመግዛት የሚፈልጉትን የዕቃ ምድብ ከታች ይምረጡ፦', shopKeyboard);
});

const shopItems = ['👗 የሴቶች ልብስ', '👕 የወንዶች ልብስ', '👟 ጫማዎች', '🔌 ኤሌክትሮንክስ', '🛍 የቤት ዕቃዎች'];
bot.hears(shopItems, async (ctx, next) => {
  const session = userSessions[ctx.from.id];
  if (session && (session.step === 'ADD_PROD_CAT' || session.step === 'CONFIRM_CAT')) {
    return next();
  }

  const clickedText = ctx.message.text.trim();
  // Supabase ላይ በነበረው ፊደል እንዲያነብ ማድረጊያ
  let category = clickedText;
  if (clickedText === '🔌 ኤሌክትሮንክስ') category = 'ኤሌክትሮንክስ';
  if (clickedText === '🛍 የቤት ዕቃዎች') category = 'የቤት ዕቃዎች';

  try {
    const { data: dbProducts, error } = await supabase.from('products').select('*').eq('category', category);
    if (error || !dbProducts || dbProducts.length === 0) {
      return ctx.reply(`በዚህ ምድብ (${clickedText}) ውስጥ በአሁኑ ሰዓት ዕቃ አልተመዘገበም።`, shopKeyboard);
    }
    for (let item of dbProducts) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_item_${item.id}`)]]);
      if (item.image_url && item.image_url.trim() !== '') {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } 
        catch { await ctx.reply(txt, inlineBtn); }
      } else { await ctx.reply(txt, inlineBtn); }
    }
  } catch (err) { await ctx.reply('ይቅርታ፣ መረጃዎችን ማግኘት አልተቻለም።', shopKeyboard); }
});

bot.hears('➕ አዲስ ዕቃ ጨምር', (ctx) => {
  userSessions[ctx.from.id] = { step: 'ADD_PROD_NAME' };
  return ctx.reply('📝 እሺ፣ ለመጨመር የሚፈልጉትን አዲስ *የምርት ስም* ይጻፉልኝ፦');
});

// ==========================================
// STEP 3: የቤት ኪራይ/ዶርም ክፍል
// ==========================================
bot.hears('🏠 የቤት ኪራይ/ዶርም', (ctx) => {
  return ctx.reply('🏠 የቤት እና የዶርም ኪራይ ማዕከል\n\nየሚፈልጉትን የቤት አይነት ከታች ይምረጡ፦', houseKeyboard);
});

const houseCategories = ['🎓 የተማሪዎች ዶርም', '🏢 አፓርትመንት', '🏡 ቪላ', '🏘 ሰርቪስ'];
bot.hears(houseCategories, async (ctx) => {
  const clickedText = ctx.message.text.trim();
  let category = clickedText;
  if (clickedText === '🎓 የተማሪዎች ዶርም') category = 'የተማሪዎች ዶርም';
  if (clickedText === '🏢 አፓርትመንት') category = 'አፓርትመንት';
  if (clickedText === '🏡 ቪላ') category = 'ቪላ';
  if (clickedText === '🏘 ሰርቪስ') category = 'ሰርቪስ';

  try {
    const { data: dbHouses, error } = await supabase.from('houses').select('*').eq('category', category);
    if (error || !dbHouses || dbHouses.length === 0) {
      return ctx.reply('በዚህ ምድብ ውስጥ በአሁኑ ሰዓት የተመዘገበ ቤት የለም። እባክዎ ቆይተው ይሞክሩ።', houseKeyboard);
    }
    for (let item of dbHouses) {
      const txt = `🏠 *${item.name}*\n💰 ኪራይ: ${item.price}\nℹ️ መግለጫ: ${item.description || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('📞 አሁን ተከራይ / አግኝ', `rent_house_${item.id}`)]]);
      if (item.image_url && item.image_url.trim() !== '') {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } 
        catch { await ctx.reply(txt, inlineBtn); }
      } else { await ctx.reply(txt, inlineBtn); }
    }
  } catch (err) { await ctx.reply('ይቅርታ፣ የቤት መረጃዎችን መሳብ አልተቻለም።', houseKeyboard); }
});

bot.hears('📌 የቤት/የመሬት ጥቆማ', (ctx) => {
  userSessions[ctx.from.id] = { step: 'TIP_NAME' };
  return ctx.reply('📝 እሺ የጥቆማ ቅጽ መሙያ። በመጀመሪያ *የጠቋሚውን ሙሉ ስም* ያስገቡ፦');
});

// ==========================================
// STEP 4: ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ ክፍል
// ==========================================
bot.hears('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', (ctx) => {
  return ctx.reply('🔄 ያገለገሉ ዕቃዎች ማዕከል\n\nእቃ መግዛት ይፈልጋሉ ወይስ የራስዎን እቃ መሸጥ?', usedKeyboard);
});

bot.hears('📦 ዕቃዎችን እይ', async (ctx) => {
  try {
    const { data: dbUsed, error } = await supabase.from('used_items').select('*');
    if (error || !dbUsed || dbUsed.length === 0) {
      return ctx.reply('በአሁኑ ሰዓት ያገለገለ ዕቃ አልተመዘገበም። እባክዎ ቆይተው ይሞክሩ።', usedKeyboard);
    }
    for (let item of dbUsed) {
      const txt = `🔄 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}\n📞 ስልክ: ${item.contact || item.phone || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('📞 ለባለቤቱ ደውል', `call_owner_${item.id}`)]]);
      if (item.image_url && item.image_url.trim() !== '') {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } 
        catch { await ctx.reply(txt, inlineBtn); }
      } else { await ctx.reply(txt, inlineBtn); }
    }
  } catch (err) { await ctx.reply('መረጃውን ማግኘት አልተቻለም።', usedKeyboard); }
});

bot.hears('➕ የእርስዎን ጨምር', (ctx) => {
  userSessions[ctx.from.id] = { step: 'ASK_SELL_NAME' };
  return ctx.reply('📝 እሺ፣ ለመሸጥ የሚፈልጉትን ያገለገለ *ዕቃ ስም* ይጻፉልኝ፦');
});

// ==========================================
// ℹ️ ስለ እኛ ክፍል
// ==========================================
bot.hears('ℹ️ ስለ እኛ', (ctx) => {
  const aboutText = `✨ *Siralink Market ሁለገብ ማዕከል*\n\n❓ አገልግሎቶቻችንን ለማየት ወይም ያግኙን ለማለት ከታች ይምረጡ፦`;
  const aboutInlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('💼 የምንሰጣቸው አገልግሎት', 'about_services')],
    [Markup.button.callback('🏢 የደንበኞች ማእከል', 'about_customer_center')]
  ]);
  return ctx.reply(aboutText, aboutInlineKeyboard);
});

// ==========================================
// 🛎 TEXT & PHOTO HANDLING (ቅጾች መቀበያ)
// ==========================================
bot.on(['text', 'photo'], async (ctx, next) => {
  const session = userSessions[ctx.from.id];
  if (!session) return next();

  let photoId = null;
  if (ctx.message.photo) {
    photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  }
  const text = ctx.message.text ? ctx.message.text.trim() : '';

  // --- 🛒 እቃ ማዘዣ ፎርም ---
  if (session.step === 'ASK_NAME') {
    session.name = text;
    session.step = 'ASK_PHONE';
    return ctx.reply('📞 በጣም ጥሩ! አሁን ደግሞ ባለሱቁ እንዲያገኝዎ *የስልክ ቁጥርዎን* ያስገቡ፦');
  } 
  if (session.step === 'ASK_PHONE') {
    session.phone = text;
    session.step = 'ASK_ADDRESS';
    return ctx.reply('📍 በመጨረሻም ዕቃው የሚረከቡበትን *ትክክለኛ አድራሻ* ይጻፉልን፦');
  }
  if (session.step === 'ASK_ADDRESS') {
    session.address = text;
    const prod = session.product;
    const customerUser = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
    const alertMessage = `🛍 *አዲስ የዕቃ ትዕዛዝ ደርሷል!* 🛍\n\n🆔 *የምርት መለያ:* #${prod.id}\n📦 *ዕቃ:* ${prod.name}\n💰 *ዋጋ:* ${prod.price} ብር\n\n👤 *የደንበኛ ስም:* ${session.name}\n📞 *ስልክ ቁጥር:* ${session.phone}\n📍 *አድራሻ:* ${session.address}\n📱 *ቴሌግራም:* ${customerUser}`;
    try {
      if (prod.shop_owner_id && !isNaN(prod.shop_owner_id)) {
        try { await bot.telegram.sendMessage(Number(prod.shop_owner_id), alertMessage, { parse_mode: 'Markdown' }); } catch (e) {}
      }
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[የትዕዛዝ መቆጣጠሪያ ኮፒ]\n${alertMessage}`, { parse_mode: 'Markdown' });
      await ctx.reply('🎉 ማረጋገጫ: ትዕዛዝዎ በተሳካ ሁኔታ ተመዝግቧል! በቅርቡ እናገኝዎታለን።', mainKeyboard);
    } catch (err) { await ctx.reply('❌ ትዕዛዙን ማስተላለፍ ላይ ችግር አጋጥሟል።', mainKeyboard); }
    delete userSessions[ctx.from.id];
    return;
  }

  // --- 📤 ያገለገለ እቃ መሸጫ ፎርም ---
  if (session.step === 'ASK_SELL_NAME') {
    session.sellName = text;
    session.step = 'ASK_SELL_PRICE';
    return ctx.reply('💰 የዕቃውን *መሸጫ ዋጋ* በብር ብቻ ይጻፉልኝ፦');
  }
  if (session.step === 'ASK_SELL_PRICE') {
    session.sellPrice = text;
    session.step = 'ASK_SELL_PHONE';
    return ctx.reply('📞 ገዢዎች እንዲያገኙዎት *የስልክ ቁጥርዎን* ያስገቡ፦');
  }
  if (session.step === 'ASK_SELL_PHONE') {
    session.sellPhone = text;
    const username = ctx.message.from.username ? `@${ctx.message.from.username}` : 'የለውም';
    try {
      await supabase.from('used_items').insert([{ name: session.sellName, price: session.sellPrice, contact: session.sellPhone, phone: session.sellPhone, description: `በተጠቃሚ ${username} የተላከ` }]);
      await ctx.reply('📥 የእቃዎ መረጃ ደርሶናል። መረጃው ቀጥታ በቦቱ ላይ ተለጥፏል!', mainKeyboard);
    } catch (err) { await ctx.reply('📥 መረጃው በተለዋጭ መንገድ ተመዝግቧል።', mainKeyboard); }
    delete userSessions[ctx.from.id];
    return;
  }

  // --- 📌 የቤት/መሬት ጥቆማ መቀበያ ፎርም ---
  if (session.step === 'TIP_NAME') {
    session.tipName = text;
    session.step = 'TIP_PHONE';
    return ctx.reply('📞 በመቀጠል *የጠቋሚውን ስልክ ቁጥር* ያስገቡ፦');
  }
  if (session.step === 'TIP_PHONE') {
    session.tipPhone = text;
    session.step = 'TIP_ADDRESS';
    return ctx.reply('📍 ቤቱ ወይም መሬቱ የሚገኝበትን *ትክክለኛ ቦታ / አድራሻ* ይጻፉ፦');
  }
  if (session.step === 'TIP_ADDRESS') {
    session.tipAddress = text;
    session.step = 'TIP_AREA';
    return ctx.reply('📐 የመሬቱ ወይም የቤቱ *ያረፈበት ካሬ* ያስገቡ፦');
  }
  if (session.step === 'TIP_AREA') {
    session.tipArea = text;
    session.step = 'TIP_PRICE';
    return ctx.reply('💰 የመጨረሻ *የመሸጫ ዋጋ* በብር ያስገቡ፦');
  }
  if (session.step === 'TIP_PRICE') {
    session.tipPrice = text;
    const username = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
    const tipAlert = `📌 *አዲስ የቤት/መሬት ሽያጭ ጥቆማ ደርሷል!* 📌\n\n👤 *የጠቋሚ ስም:* ${session.tipName}\n📞 *ስልክ ቁጥር:* ${session.tipPhone}\n📍 *ቦታ/አድራሻ:* ${session.tipAddress}\n📐 *ስፋት:* ${session.tipArea} m²\n💰 *ዋጋ:* ${session.tipPrice} ብር\n📱 *ቴሌግራም:* ${username}`;
    try {
      await supabase.from('houses').insert([{ name: `የሚሸጥ መሬት/ቤት (${session.tipArea} ካሬ)`, price: session.tipPrice, category: 'ጥቆማ', description: `አድራሻ: ${session.tipAddress} | ጠቋሚ: ${session.tipName}` }]);
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, tipAlert, { parse_mode: 'Markdown' });
      await ctx.reply('🎉 እናመሰግናለን! የጥቆማ መረጃዎ በተሳካ ሁኔታ ተመዝግቧል።', houseKeyboard);
    } catch (err) { await ctx.reply('✅ ጥቆማዎ ለአስተዳዳሪው ተላልፏል። እናመሰግናለን!', houseKeyboard); }
    delete userSessions[ctx.from.id];
    return;
  }

  // --- STEP 5: ➕ አዲስ ምርት መመዝገቢያ ፎርም ---
  if (session.step === 'ADD_PROD_NAME') {
    session.addProdName = text;
    session.step = 'ADD_PROD_PRICE';
    return ctx.reply('💰 የምርቱን *የሽያጭ ዋጋ* በብር ብቻ ያስገቡ፦');
  }
  if (session.step === 'ADD_PROD_PRICE') {
    session.addProdPrice = text;
    session.step = 'ADD_PROD_DESC';
    return ctx.reply('ℹ️ ስለ ምርቱ አጭር *መግለጫ* ይጻፉ፦');
  }
  if (session.step === 'ADD_PROD_DESC') {
    session.addProdDesc = text;
    session.step = 'ADD_PROD_PHOTO';
    return ctx.reply('📸 ምርቱ *ፎቶ ካለው* አሁን ይላኩ፤ ከሌለው *ፎቶ የለም* ብለው ይጻፉ፦');
  }
  if (session.step === 'ADD_PROD_PHOTO') {
    session.addProdPhoto = photoId || '';
    session.step = 'ADD_PROD_CAT';
    return ctx.reply('🗂 ይህ ምርት በየትኛው *የዕቃ ካታጎሪ* ውስጥ እንዲመደብ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦', selectCatKeyboard);
  }
  if (session.step === 'ADD_PROD_CAT') {
    if (!customerCategories.includes(text)) {
      return ctx.reply('⚠️ እባክዎ ከታች ካሉት የምርጫ ቁልፎች አንዱን ብቻ ይጫኑ፦', selectCatKeyboard);
    }
    session.tempCat = text;
    session.step = 'CONFIRM_CAT';
    const inlineConfirm = Markup.inlineKeyboard([
      [Markup.button.callback('✅ አረጋግጥ', 'confirm_cat_yes'), Markup.button.callback('❌ ቀይር', 'confirm_cat_no')]
    ]);
    return ctx.reply(`የመረጡት ምድብ፡ *${text}* ነው።\nእርግጠኛ ነዎት?`, { parse_mode: 'Markdown', ...inlineConfirm });
  }
  if (session.step === 'ADD_PROD_ADDRESS') {
    session.addProdAddress = text;
    session.step = 'ADD_PROD_PHONE';
    return ctx.reply('📞 በመጨረሻም ደንበኞች እርስዎን ሊያገኙበት የሚችሉትን *ትክክለኛ ስልክ ቁጥር* ያስገቡ፦');
  }
  if (session.step === 'ADD_PROD_PHONE') {
    session.addProdPhone = text;
    const username = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
    
    // Supabase ላይ ከነባሮቹ ጋር ግጭት እንዳይፈጠር የስም ማስተካከያ
    let dbCatName = session.tempCat;
    if (session.tempCat === '🛋 የቤት ዕቃዎች ምድብ') dbCatName = 'የቤት ዕቃዎች';
    if (session.tempCat === '💻 ኤሌክትሮኒክስ ምድብ') dbCatName = 'ኤሌክትሮኒክስ';
    if (session.tempCat === '⚙️ ያገለገሉ ዕቃዎች ምድብ') dbCatName = 'ያገለገሉ ዕቃዎች';

    const prodAlert = `➕ *በደንበኛ አዲስ ምርት ተመዝግቧል!* ➕\n\n📦 *የምርት ስም:* ${session.addProdName}\n💰 *ዋጋ:* ${session.addProdPrice} ብር\n🗂 *ካታጎሪ:* ${dbCatName}\nℹ️ *መግለጫ:* ${session.addProdDesc}\n🏢 *ድርጅት/አድራሻ:* ${session.addProdAddress}\n📞 *ስልክ ቁጥር:* ${session.addProdPhone}\n👤 *አስመዝጋቢ:* ${ctx.from.first_name} (${username})`;
    
    try {
      await supabase.from('customer_products').insert([
        { 
          name: session.addProdName, 
          price: session.addProdPrice, 
          category: dbCatName, 
          description: session.addProdDesc, 
          shop_name_address: session.addProdAddress, 
          phone: session.addProdPhone,
          image_url: session.addProdPhoto
        }
      ]);
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, prodAlert, { parse_mode: 'Markdown' });
      if (session.addProdPhoto) {
        try { await bot.telegram.sendPhoto(ADMIN_CHAT_ID, session.addProdPhoto, { caption: `ከላይ ለተመዘገበው ምርት የተላከ ፎቶ` }); } catch (e) {}
      }
      await ctx.reply('🎉 ምርትዎ በተሳካ ሁኔታ ተመዝግቧል! በቅርቡ በደንበኞች ማውጫ ገጽ ላይ ይፋ ይሆናል።', shopKeyboard);
    } catch (err) {
      await ctx.reply('❌ ምርቱን በዳታቤዝ ላይ መመዝገብ አልተቻለም። ለአስተዳዳሪው ተላልፏል።', shopKeyboard);
    }
    delete userSessions[ctx.from.id];
    return;
  }
});

// Inline Button Actions ለካታጎሪ ማረጋገጫ
bot.action('confirm_cat_yes', async (ctx) => {
  const session = userSessions[ctx.from.id];
  if (!session || session.step !== 'CONFIRM_CAT') return ctx.answerCbQuery('ትዕዛዝ ተቋርጧል!');
  session.step = 'ADD_PROD_ADDRESS';
  await ctx.answerCbQuery('ምድብ ጸድቋል!');
  await ctx.editMessageText(`✅ ምድብ ተረጋግጧል፡ *${session.tempCat}*`, { parse_mode: 'Markdown' });
  return ctx.reply('🏢 እሺ፣ ቀጥለው *የድርጅቱን/የሽያጩን ስም እና ዕቃው የሚገኝበትን መገኛ አድራሻ* አብረው ይጻፉልኝ፦', Markup.keyboard([['🔙 ወደ ዋናው ማውጫ']]).resize());
});

bot.action('confirm_cat_no', async (ctx) => {
  const session = userSessions[ctx.from.id];
  if (!session || session.step !== 'CONFIRM_CAT') return ctx.answerCbQuery();
  session.step = 'ADD_PROD_CAT';
  await ctx.answerCbQuery('እባክዎ እንደገና ይምረጡ');
  await ctx.editMessageText('❌ ምድቡ ተሰርዟል። እባክዎ ከታች ካለው ማውጫ ትክክለኛውን ምድብ ድጋሚ ይምረጡ፦');
  return ctx.reply('የዕቃ ምድብ ይምረጡ፦', selectCatKeyboard);
});

// --- 📢 ብሮድካስት ኮማንድ ---
bot.command('broadcast', async (ctx) => {
  if (ctx.from.id !== ADMIN_CHAT_ID) return;
  const categoryInput = ctx.message.text.replace('/broadcast', '').trim();
  if (!categoryInput) return ctx.reply('⚠️ እባክህ የምድቡን ስም አብረህ ጻፍ。 ለምሳሌ፦ /broadcast የሴቶች ልብስ');
  try {
    const { data: users, error } = await supabase.from('bot_users').select('chat_id');
    if (error || !users || users.length === 0) return ctx.reply('📢 ተጠቃሚዎች አልተገኙም።');
    const notificationText = `🔔 *አዲስ ምርት ወጥቷል!* 🔔\n\nSiralink Market ላይ በ *${categoryInput}* ምድብ ስር አዳዲስ ምርቶች አሁን ገብተዋል። ቦቱ ላይ በመግባት አሁኑኑ ይመልከቱ! 🛍✨`;
    ctx.reply(`⏳ መልዕክት መላክ ተጀምሯል...`);
    for (let u of users) { try { await bot.telegram.sendMessage(u.chat_id, notificationText, { parse_mode: 'Markdown' }); } catch (e) {} }
    ctx.reply(`✅ 📢 መልዕክቱ ተላልፏል!`);
  } catch (err) { ctx.reply('❌ ማስተላለፍ ላይ ስህተት አለ።'); }
});

// --- የምንሰጣቸው አገልግሎቶች መግለጫ ---
bot.action('about_services', async (ctx) => {
  await ctx.answerCbQuery();
  const servicesText = `💼 *የ Siralink Market ዋና የሥራ መግለጫና አገልግሎቶች* 💼\n\n` +
                       `Siralink Bot ነጋዴዎችን፣ ሸማቾችን፣ ተከራዮችን እና አከራዮችን ያለምንም ደላላ በአንድ ማዕከል የሚያገናኝ ሁለገብና ዘመናዊ የዲጂታል ገበያ መድረክ ነው።\n\n` +
                       `*ዋና ዋና አገልግሎቶቻችን፦*\n` +
                       `፩. *የሱቅ ምርቶች (አዳዲስ ዕቃዎች)፦* ታዋቂ ሱቆችና ድርጅቶች አዳዲስ አልባሳትን፣ ጫማዎችን፣ ኤሌክትሮኒክስና የቤት ቁሳቁሶችን ለገበያ የሚያቀርቡበት ምድብ ነው።\n\n` +
                       `፪. *የቤትና ዶርም ኪራይ ማዕከል፦* ተማሪዎች ለትምህርት ምቹ የሆኑ ዶርሞችን፣ ግለሰቦች ደግሞ አፓርትመንት፣ ቪላ እና ሰርቪስ ቤቶችን በቀላሉ የሚከራዩበትና የሚፈልጉበት ክፍል ነው።\n\n` +
                       `፫. *የቤት/መሬት ሽያጭ ጥቆማ፦* የሚሸጡ መሬቶችንና ቤቶችን አድራሻና ስፋት በመሙላት ፈጣን የንግድ ትስስር የሚፈጥርበት ዘመናዊ አማራጭ ነው።\n\n` +
                       `፬. *ያገለገሉ ዕቃዎች ሽያጭ፦* ማንኛውም ተጠቃሚ የራሱን ያገለገሉ ዕቃዎች ዋጋና ስልክ በመጥቀስ በቀጥታ ለገዢዎች ማቅረብና መሸጥ ይችላል።\n\n` +
                       `፭. *የደንበኞች ካታጎሪ፦* ደንበኞች የራሳቸውን አዳዲስ ምርቶች በፎቶ ወይም በጽሑፍ በየምድቡ በመመዝገብ ለሺዎች የሚደርሱበት ነፃ የገበያ መድረክ ነው።`;
  return ctx.reply(servicesText, { parse_mode: 'Markdown' });
});

// --- የደንበኞች ማዕከል (የቴሌግራም ሊንኮች የተመለሱበት) ---
bot.action('about_customer_center', async (ctx) => {
  await ctx.answerCbQuery();
  const customerCenterText = `🏢 *የደንበኞች ማዕከል መረጃ* 🏢\n\n` +
                             `📍 *አድራሻ፦* ሀዋሳ፤ ኢትዮጵያ\n` +
                             `📞 *ስልክ፦* 0946662487\n\n` +
                             `🌐 *ይፋዊ የቴሌግራም ገጾቻችን፦*\n` +
                             `────────────────────\n` +
                             `📣 ቻናል: @SiralnikMarket\n` +
                             `────────────────────\n` +
                             `👤 ማናጀር 1: @ad\_is17\n` +
                             `────────────────────\n` +
                             `👤 ማናጀር 2: @ad\_is1\n` +
                             `────────────────────`;
  return ctx.reply(customerCenterText);
});

bot.action(/^order_item_(.+)$/, async (ctx) => {
  const productId = ctx.match[1];
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error || !data) return ctx.reply('❌ ይቅርታ፣ የዕቃው መረጃ አልተገኘም!');
    userSessions[ctx.from.id] = { step: 'ASK_NAME', product: data };
    await ctx.answerCbQuery();
    await ctx.reply('📝 እሺ ትዕዛዝ ለመጀመር በመጀመሪያ *ትክክለኛ ስምዎን* ይጻፉልኝ፦');
  } catch (err) { console.error(err); }
});

bot.action(/^order_cust_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply('📞 እባክዎ ምርቱ ላይ የተጠቀሰውን ስልክ ቁጥር በመጠቀም ባለቤቱን በቀጥታ ያነጋግሩ።');
});

bot.action(/^rent_house_(.+)$/, (ctx) => ctx.reply('📞 ቤቱን ለመከራየት ፍላጎትዎ ስለደረሰን በቅርቡ እናገኝዎታለን።'));
bot.action(/^call_owner_(.+)$/, (ctx) => ctx.reply('📱 እቃው ላይ በተጠቀሰው ስልክ ቁጥር በመደወል በቀጥታ መነጋገር ይችላሉ።'));

bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Bot is Fully Active! 🚀'))
  .catch((err) => console.error(err));
