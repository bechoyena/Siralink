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

// 🖼 ምስል አመራጭ ፈንክሽን
function generateMatchedImage(productName, categoryName) {
  const name = productName.toLowerCase();
  const cat = categoryName.toLowerCase();
  if (name.includes('ጫማ') || cat.includes('ጫማ') || cat.includes('አልባሳት')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';
  if (name.includes('ልብስ') || cat.includes('አልባሳት')) return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500';
  if (name.includes('ስልክ') || cat.includes('ኤሌክትሮኒክስ')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
  if (name.includes('ቤት') || name.includes('መሬት') || cat.includes('መሬት') || cat.includes('ቤት')) return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500';
  return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500';
}

// 📢 አውቶማቲክ ብሮድካስት
async function autoBroadcastNewProduct(prodName, catName, prodPrice) {
  try {
    const { data: users } = await supabase.from('bot_users').select('chat_id');
    if (!users || users.length === 0) return;
    const broadcastText = `🔔 *አዲስ ምርት በደንበኞች ማዕከል ገብቷል!* 🔔\n\n📦 *የምርት ስም:* ${prodName}\n💰 *ዋጋ:* ${prodPrice} ብር\n🗂 *ምድብ:* ${catName}\n\n"👥 በደንበኞች የተጨመሩ" ገጽ ውስጥ በመግባት መመልከት ይችላሉ! 🛍✨`;
    for (let u of users) {
      try { await bot.telegram.sendMessage(u.chat_id, broadcastText, { parse_mode: 'Markdown' }); } catch (e) {}
    }
  } catch (err) { console.error(err); }
}

// --- ኪቦርዶች ---
const mainKeyboard = Markup.keyboard([
  ['🛍 አዳዲስ ዕቃዎች', '🏠 የቤት ኪራይ/ዶርም'],
  ['🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', '👥 ከደንበኞች የተጨመሩ'],
  ['ℹ️ ስለ እኛ']
]).resize();

const shopKeyboard = Markup.keyboard([
  ['👗 የሴቶች ልብስ', '👕 የወንዶች ልብስ'],
  ['👟 ጫማዎች', '🔌 ኤሌክትሮንክስ'],
  ['🛍 የቤት ዕቃዎች', '➕ አዲስ ዕቃ ጨምር'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

const houseKeyboard = Markup.keyboard([
  ['🎓 የተማሪዎች ዶርም', '🏢 አፓርትመንት'],
  ['🏡 ቪላ', '🏘 ሰርቪስ'],
  ['📌 የቤት/የመሬት ጥቆማ', '🔙 ወደ ዋናው ማውጫ']
]).resize();

const usedKeyboard = Markup.keyboard([
  ['📦 ዕቃዎችን እይ', '➕ የእርስዎን ጨምር'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

const customerCatKeyboard = Markup.keyboard([
  ['👔 አልባሳትና ጫማ', '🛋 የቤት ዕቃዎች ምድብ'],
  ['💻 ኤሌክትሮኒክስ ምድብ', '🗺 መሬት/ቤት'],
  ['⚙️ ያገለገሉ ዕቃዎች ምድብ', '🔙 ወደ ዋናው ማውጫ']
]).resize();

const selectCatKeyboard = Markup.keyboard([
  ['👗 የሴቶች ልብስ', '👕 የወንዶች ልብስ'],
  ['👟 ጫማዎች', '🔌 ኤሌክትሮንክስ'],
  ['🛍 የቤት ዕቃዎች']
]).resize();

const aboutKeyboard = Markup.keyboard([
  ['🛠 የምንሰጣቸው አገልግሎቶች', '📞 እኛን ያግኙ'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

// ==========================================
// 1. 🛍 አዳዲስ ዕቃዎች (የሱቆች መጋዘን)
// ==========================================
bot.hears('🛍 አዳዲስ ዕቃዎች', (ctx) => ctx.reply('🛍 የሱቆች መጋዘን ምድብ ይምረጡ፦', shopKeyboard));

const shopItems = ['👗 የሴቶች ልብስ', '👕 የወንዶች ልብስ', '👟 ጫማዎች', '🔌 ኤሌክትሮንክስ', '🛍 የቤት ዕቃዎች'];

bot.hears(shopItems, async (ctx, next) => {
  const session = userSessions[ctx.from.id];
  
  // 🔥 ዋናው ማስተካከያ፦ ተጠቃሚው በምዝገባ ስቴፕ ላይ ከሆነ የሱቆችን ዕቃ ዝርዝር አያምጣ፤ ወደ ፎርሙ ያሳልፈው!
  if (session && (session.step === 'ADD_PROD_CAT' || session.step === 'CONFIRM_CAT')) {
    return next();
  }

  const clickedText = ctx.message.text.trim();
  let category = clickedText;
  if (clickedText === '🔌 ኤሌክትሮንክስ') category = 'ኤሌክትሮንክስ';
  if (clickedText === '🛍 የቤት ዕቃዎች') category = 'የቤት ዕቃዎች';

  try {
    const { data: dbProducts } = await supabase.from('products').select('*').eq('category', category);
    if (!dbProducts || dbProducts.length === 0) {
      return ctx.reply(`በዚህ ምድብ (${clickedText}) ውስጥ በአሁኑ ሰዓት ዕቃ አልተመዘገበም።`, shopKeyboard);
    }
    
    for (let item of dbProducts) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}\n🏢 አድራሻ: ${item.shop_name_address || 'የለውም'}\n📞 ስልክ: ${item.phone || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_general_products_${item.id}`)]]);
      if (item.image_url) {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); }
        catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
      } else { 
        await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); 
      }
    }
  } catch (err) { 
    await ctx.reply('መረጃዎችን ማግኘት አልተቻለም።', shopKeyboard); 
  }
});

bot.hears('➕ አዲስ ዕቃ ጨምር', (ctx) => {
  userSessions[ctx.from.id] = { step: 'ADD_PROD_NAME' };
  return ctx.reply('📝 እሺ፣ ለመጨመር የሚፈልጉትን አዲስ *የምርት ስም* ይጻፉልኝ፦');
});

// ==========================================
// 2. 🏠 የቤት ኪራይ/ዶርም ክፍል
// ==========================================
bot.hears('🏠 የቤት ኪራይ/ዶርም', (ctx) => ctx.reply('🏠 የቤት እና የዶርም ኪራይ ማዕከል፦', houseKeyboard));

const houseCategories = ['🎓 የተማሪዎች ዶርም', '🏢 አፓርትመንት', '🏡 ቪላ', '🏘 ሰርቪስ'];
houseCategories.forEach(catKey => {
  bot.hears(catKey, async (ctx) => {
    let dbCategory = catKey;
    if (catKey === '🎓 የተማሪዎች ዶርም') dbCategory = 'የተማሪዎች ዶርም';
    if (catKey === '🏢 አፓርትመንት') dbCategory = 'አፓርትመንት';
    if (catKey === '🏡 ቪላ') dbCategory = 'ቪላ';
    if (catKey === '🏘 ሰርቪስ') dbCategory = 'ሰርቪስ';

    try {
      const { data: dbHouses } = await supabase.from('houses').select('*').eq('category', dbCategory);
      if (!dbHouses || dbHouses.length === 0) return ctx.reply('በዚህ ምድብ ውስጥ የተመዘገበ ቤት የለም።', houseKeyboard);
      
      for (let item of dbHouses) {
        const txt = `🏠 *${item.name}*\n💰 ኪራይ/ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}\n📞 ስልክ: ${item.phone || 'የለውም'}`;
        const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🔑 ለመግዛት/ለመከራየት', `order_realestate_house_${item.id}`)]]);
        if (item.image_url) {
          try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); }
          catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
        } else { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
      }
    } catch (err) { await ctx.reply('የቤት መረጃዎችን ማግኘት አልተቻለም።', houseKeyboard); }
  });
});

bot.hears('📌 የቤት/የመሬት ጥቆማ', (ctx) => {
  userSessions[ctx.from.id] = { step: 'TIP_NAME' };
  return ctx.reply('📝 የጥቆማ ቅጽ መሙያ። በመጀመሪያ *የጠቋሚውን ሙሉ ስም* ያስገቡ፦');
});

// ==========================================
// 3. 🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ
// ==========================================
bot.hears('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', (ctx) => ctx.reply('🔄 ያገለገሉ ዕቃዎች ማዕከል፦', usedKeyboard));

bot.hears('📦 ዕቃዎችን እይ', async (ctx) => {
  try {
    const { data: dbUsed } = await supabase.from('products').select('*').eq('category', 'አስተዳዳሪ ያገለገሉ');
    if (!dbUsed || dbUsed.length === 0) return ctx.reply('በአሁኑ ሰዓት በአስተዳዳሪው የተጫነ ያገለገለ ዕቃ የለም።', usedKeyboard);
    
    for (let item of dbUsed) {
      const txt = `🔄 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}\n📞 ስልክ: ${item.phone || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን ይዘዙ (Order)', `order_general_products_${item.id}`)]]);
      if (item.image_url) {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); }
        catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
      } else { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
    }
  } catch (err) { await ctx.reply('መረጃውን ማግኘት አልተቻለም።', usedKeyboard); }
});

bot.hears('➕ የእርስዎን ጨምር', (ctx) => {
  userSessions[ctx.from.id] = { step: 'ASK_SELL_NAME' };
  return ctx.reply('📝 ለመሸጥ የሚፈልጉትን ያገለገለ *ዕቃ ስም* ይጻፉልኝ፦');
});

// ==========================================
// 4. 👥 ከደንበኞች የተጨመሩ ክፍል
// ==========================================
bot.hears('👥 ከደንበኞች የተጨመሩ', (ctx) => ctx.reply('👥 በደንበኞች የተመዘገቡ ምርቶች ማውጫ፦', customerCatKeyboard));

const customerCategories = ['👔 አልባሳትና ጫማ', '🛋 የቤት ዕቃዎች ምድብ', '💻 ኤሌክትሮኒክስ ምድብ', '🗺 መሬት/ቤት', '⚙️ ያገለገሉ ዕቃዎች ምድብ'];
bot.hears(customerCategories, async (ctx) => {
  const clickedText = ctx.message.text.trim();
  try {
    const { data: items } = await supabase.from('customer_products').select('*').eq('category', clickedText);
    if (!items || items.length === 0) return ctx.reply(`በዚህ ምድብ (${clickedText}) ውስጥ የተጫነ ዕቃ የለም።`, customerCatKeyboard);
    
    for (let item of items) {
      let displayTitle = item.name;
      let cleanDesc = item.description || 'የለውም';
      
      if (cleanDesc.includes('|| टाइप:')) {
        const typePart = cleanDesc.split('|| टाइप:')[1];
        cleanDesc = cleanDesc.split('|| टाइप:')[0].trim();
        if (typePart === 'land') displayTitle = `[መሬት] ${item.name}`;
        else if (typePart === 'house_sell') displayTitle = `[የሚሸጥ ቤት] ${item.name}`;
        else if (typePart === 'house_rent') displayTitle = `[የሚከራይ ቤት] ${item.name}`;
      }

      const txt = `📦 *${displayTitle}*\n💰 ዋጋ/ኪራይ: ${item.price} ብር\nℹ️ መግለጫ: ${cleanDesc}\n🏢 አድራሻ: ${item.shop_name_address || 'የለውም'}\n📞 ስልክ: ${item.phone || 'የለውም'}`;
      
      let inlineBtn;
      if (clickedText === '🗺 መሬት/ቤት') {
        inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🔑 ለመግዛት/ለመከራየት', `order_realestate_cust_${item.id}`)]]);
      } else {
        inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን ይዘዙ (Order)', `order_general_cust_${item.id}`)]]);
      }
      
      if (item.image_url) {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); }
        catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
      } else { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
    }
  } catch (err) { await ctx.reply('መረጃውን ማግኘት አልተቻለም።', customerCatKeyboard); }
});

// ==========================================
// ℹ️ ስለ እኛ ክፍል
// ==========================================
bot.hears('ℹ️ ስለ እኛ', (ctx) => ctx.reply('ℹ️ ስለ Siralink Market ማወቅ የሚፈልጉትን መረጃ ከታች ይምረጡ፦', aboutKeyboard));

bot.hears('🛠 የምንሰጣቸው አገልግሎቶች', (ctx) => {
  const serviceText = `<b>🛍 ስለ Siralink Market ሁለገብ ገበያ</b>\n\n` +
                      `Siralink Market ነጋዴዎችን፣ ሸማቾችን፣ ያገለገሉ ዕቃ ሻጮችን እንዲሁም የቤትና መሬት አቅራቢዎችን ያለምንም መካከለኛ ደላላ በቀጥታ የሚያገናኝ ዘመናዊ መድረክ ነው።\n\n` +
                      `<b>✨ ዋና ዓላማችንና ጥቅሞች፦</b>\n` +
                      `• <b>ቀጥታ ግንኙነት፦</b> ደንበኞች ከባለሱቆችና ከጠቋሚዎች ጋር በቀጥታ በስልክና በደሊቨሪ እንዲገናኙ ያደርጋል።\n` +
                      `• <b>ቀላል ምዝገባ፦</b> ማንኛውም ደንበኛ አዳዲስ እቃዎችን፣ ያገለገሉ ቁሳቁሶችን እንዲሁም የቤት/መሬት ጥቆማዎችን በነፃ ማስገባት ይችላል።\n` +
                      `• <b>ፈጣን ትዕዛዝ፦</b> የደሊቨሪ (የማድረስ) እና የፒክአፕ (በቦታው ሄዶ የመረከብ) አማራጮችን በማቅረብ ግብይቱን ያቀልጣል።`;
  return ctx.replyWithHTML(serviceText, aboutKeyboard);
});

bot.hears('📞 እኛን ያግኙ', (ctx) => {
  const contactText = `<b>📞 እኛን ለማግኘት የሚከተሉትን አድራሻዎች ይጠቀሙ፦</b>\n\n` +
                      `<b>📱 ስልክ ቁጥሮች፦</b>\n` +
                      `• 0946662487\n` +
                      `• 0701404704\n\n` +
                      `<b>📍 አድራሻ፦</b> ሀዋሳ፣ ኢትዮጵያ\n\n` +
                      `<b>📢 የቴሌግራም ቻናል፦</b> <a href="https://t.me/SiralinkMarket">Siralink Market Channel</a>\n\n` +
                      `<b>👤 የአስተዳዳሪዎች (Admins) አድራሻ፦</b>\n` +
                      `• @ad\_is17\n` +
                      `• @ad\_is1`;
  return ctx.replyWithHTML(contactText, aboutKeyboard);
});

bot.start(async (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  try { await supabase.from('bot_users').insert([{ chat_id: ctx.from.id }], { upsert: true }); } catch (err) {}
  return ctx.reply('እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋', mainKeyboard);
});

bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል።', mainKeyboard);
});

// ==========================================
// 🛎 TEXT & PHOTO HANDLING (ቅጾች መቀበያ)
// ==========================================
bot.on(['text', 'photo'], async (ctx, next) => {
  const session = userSessions[ctx.from.id];
  if (!session) return next();

  let photoId = null;
  if (ctx.message.photo) photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  const text = ctx.message.text ? ctx.message.text.trim() : '';

  // --- 🛒 ዕቃ ማዘዣ ፎርም (ለደሊቨሪ) ---
  if (session.step === 'ASK_NAME') {
    session.name = text;
    session.step = 'ASK_PHONE';
    return ctx.reply('📞 አሁን ደግሞ *የስልክ ቁጥርዎን* ያስገቡ፦');
  } 
  if (session.step === 'ASK_PHONE') {
    session.phone = text;
    session.step = 'ASK_ADDRESS';
    return ctx.reply('📍 በመጨረሻም ዕቃው የሚረከቡበትን *ትክክለኛ አድራሻ* ይጻፉልኝ፦');
  }
  if (session.step === 'ASK_ADDRESS') {
    session.address = text;
    const prod = session.product;
    const customerUser = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
    
    const alertMessage = `🚚 [አዲስ የደሊቨሪ ትዕዛዝ] 🚚\n\n📦 ዕቃ: ${prod.name}\n💰 ዋጋ: ${prod.price} ብር\n👤 የደንበኛ ስም: ${session.name}\n📞 ስልክ ቁጥር: ${session.phone}\n📍 አድራሻ: ${session.address}\n📱 ቴሌግራም: ${customerUser}`;
    
    try {
      if (prod.shop_owner_id && !isNaN(prod.shop_owner_id) && Number(prod.shop_owner_id) !== 0) {
        try { await bot.telegram.sendMessage(Number(prod.shop_owner_id), alertMessage); } catch (e) {}
      }
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[የትዕዛዝ መቆጣጠሪያ ኮፒ]\n${alertMessage}`);
      await ctx.reply('🎉 ማረጋገጫ: የደሊቨሪ ትዕዛዝዎ በተሳካ ሁኔታ ተመዝግቧል! በቅርቡ እናገኝዎታለን።', mainKeyboard);
    } catch (err) { await ctx.reply('❌ ትዕዛዙን ማስተላለፍ ላይ ችግር አጋጥሟል።', mainKeyboard); }
    delete userSessions[ctx.from.id];
    return;
  }

  // --- 🔄 ያገለገለ እቃ መሸጫ ---
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
    const finalCat = '⚙️ ያገለገሉ ዕቃዎች ምድብ';
    const defaultImg = generateMatchedImage(session.sellName, finalCat);
    
    try {
      await supabase.from('customer_products').insert([
        { name: session.sellName, price: session.sellPrice, category: finalCat, description: `ያገለገለ ዕቃ | በባለቤቱ የተጫነ (${username})`, shop_name_address: 'በደንበኛ የቀረበ', phone: session.sellPhone, image_url: defaultImg }
      ]);
      autoBroadcastNewProduct(session.sellName, finalCat, session.sellPrice);
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, `🔄 ያገለገለ ዕቃ ምዝገባ፡ ${session.sellName}\nዋጋ፡ ${session.sellPrice} ብር\nስልክ፡ ${session.sellPhone}`);
      await ctx.reply('🎉 ያገለገለው ዕቃዎ በተሳካ ሁኔታ ተመዝግቧል! አሁን (4.5) ውስጥ ይታያል።', mainKeyboard);
    } catch (err) { await ctx.reply('❌ መረጃውን መመዝገብ አልተቻለም።', mainKeyboard); }
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
    return ctx.reply('📐 የመሬቱ ወይም የቤቱ *ያረፈበት ካሬ (m²)* ያስገቡ፦');
  }
  if (session.step === 'TIP_AREA') {
    session.tipArea = text;
    session.step = 'TIP_PRICE';
    return ctx.reply('💰 የመጨረሻ *የመሸጫ/የኪራይ ዋጋ* በብር ያስገቡ፦');
  }
  if (session.step === 'TIP_PRICE') {
    session.tipPrice = text;
    session.step = 'CHOOSE_TIP_TYPE';
    const typeKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🗺 የመሬት ጥቆማ', 'tip_type_land')],
      [Markup.button.callback('🏠 የቤት ጥቆማ', 'tip_type_house')]
    ]);
    return ctx.reply('🗂 ይህ ጥቆማ በየትኛው ካታጎሪ ውስጥ እንዲመደብ ይፈልጋሉ? ከታች ይምረጡ፦', typeKeyboard);
  }

  // --- ➕ አዲስ ምርት መመዝገቢያ (1.6) ---
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
    session.addProdPhoto = (!photoId || text.toLowerCase().includes('የለም')) ? '' : photoId;
    session.step = 'ADD_PROD_CAT';
    return ctx.reply('🗂 ይህ ምርት በየትኛው *የዕቃ ካታጎሪ* ውስጥ እንዲመደብ ይፈልጋሉ? ከታች ካለው ማውጫ ይምረጡ፦', selectCatKeyboard);
  }
  
  if (session.step === 'ADD_PROD_CAT') {
    if (!shopItems.includes(text)) {
      return ctx.reply('⚠️ እባክዎ ከታች ካሉት ማውጫዎች (ቁልፎች) አንዱን ብቻ ይጫኑ፦', selectCatKeyboard);
    }
    session.tempCat = text;
    session.step = 'CONFIRM_CAT';
    const inlineConfirm = Markup.inlineKeyboard([
      [Markup.button.callback('✅ አረጋግጥ', 'confirm_cat_yes'), Markup.button.callback('❌ ቀይር', 'confirm_cat_no')]
    ]);
    return ctx.reply(`የመረጡት ምድብ፦ *${text}* ነው። እርግጠኛ ነዎት?`, inlineConfirm);
  }
  
  if (session.step === 'ADD_PROD_ADDRESS') {
    session.addProdAddress = text;
    session.step = 'ADD_PROD_PHONE';
    return ctx.reply('📞 በመጨረሻም ደንበኞች እንዲያገኙዎት *የስልክ ቁጥርዎን* ያስገቡ፦');
  }

  if (session.step === 'ADD_PROD_PHONE') {
    session.addProdPhone = text;
    
    let targetCustomerCategory = '👔 አልባሳትና ጫማ';
    if (session.tempCat === '🛍 የቤት ዕቃዎች') targetCustomerCategory = '🛋 የቤት ዕቃዎች ምድብ';
    if (session.tempCat === '🔌 ኤሌክትሮንክስ') targetCustomerCategory = '💻 ኤሌክትሮኒክስ ምድብ';

    if (!session.addProdPhoto) session.addProdPhoto = generateMatchedImage(session.addProdName, targetCustomerCategory);

    try {
      await supabase.from('customer_products').insert([
        { name: session.addProdName, price: session.addProdPrice, category: targetCustomerCategory, description: session.addProdDesc, shop_name_address: session.addProdAddress, phone: session.addProdPhone, image_url: session.addProdPhoto }
      ]);
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, `➕ አዲስ እቃ ተጨመረ፡ ${session.addProdName}\nዋጋ፡ ${session.addProdPrice}\nምድብ፡ ${targetCustomerCategory}`);
      autoBroadcastNewProduct(session.addProdName, targetCustomerCategory, session.addProdPrice);
      await ctx.reply(`🎉 ምርትዎ በተሳካ ሁኔታ ተመዝግቧል! አሁን በ "👥 ከደንበኞች የተጨመሩ" -> "${targetCustomerCategory}" ስር ይታያል።`, mainKeyboard);
    } catch (err) { await ctx.reply('❌ ምርቱን መመዝገብ አልተቻለም።', mainKeyboard); }
    delete userSessions[ctx.from.id];
    return;
  }
});

// --- Callback Actions ለ 1.6 ምድብ ማረጋገጫ ---
bot.action('confirm_cat_yes', async (ctx) => {
  const session = userSessions[ctx.from.id];
  if (!session || session.step !== 'CONFIRM_CAT') return ctx.answerCbQuery();
  session.step = 'ADD_PROD_ADDRESS';
  await ctx.answerCbQuery();
  return ctx.reply('🏢 እሺ፣ ቀጥለው *የድርጅቱን/የሽያጩን ስም እና መገኛ አድራሻ* ይጻፉልኝ፦');
});
bot.action('confirm_cat_no', async (ctx) => {
  const session = userSessions[ctx.from.id];
  if (!session || session.step !== 'CONFIRM_CAT') return ctx.answerCbQuery();
  session.step = 'ADD_PROD_CAT';
  await ctx.answerCbQuery();
  return ctx.reply('የዕቃ ምድብ ድጋሚ ይምረጡ፦', selectCatKeyboard);
});

// ==========================================
// 🛎 INLINE BUTTON ACTIONS FOR ORDERS
// ==========================================
bot.action(/^order_general_(products|cust)_(.+)$/, async (ctx) => {
  const table = ctx.match[1] === 'products' ? 'products' : 'customer_products';
  const productId = ctx.match[2];
  try {
    const { data } = await supabase.from(table).select('*').eq('id', productId).single();
    if (!data) return ctx.reply('❌ የዕቃው መረጃ አልተገኘም!');
    
    userSessions[ctx.from.id] = { product: data, tableType: table };
    await ctx.answerCbQuery();
    
    const choiceKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🚚 Delivery', `btn_delivery_${productId}`)],
      [Markup.button.callback('🏪 Pickup', `btn_pickup_${productId}`)]
    ]);
    await ctx.reply('❓ ይህንን ዕቃ እንዴት መቀበል ይፈልጋሉ? ከታች ይምረጡ፦', choiceKeyboard);
  } catch (e) { console.error(e); }
});

bot.action(/^btn_delivery_(.+)$/, async (ctx) => {
  const session = userSessions[ctx.from.id];
  await ctx.answerCbQuery();
  if (!session || !session.product) return ctx.reply('❌ በትዕዛዝዎ ላይ ስህተት አጋጥሟል።');
  session.step = 'ASK_NAME';
  await ctx.reply('📝 በደሊቨሪ ትዕዛዝ ለመጀመር በመጀመሪያ *ትክክለኛ ሙሉ ስምዎን* ይጻፉልኝ፦');
});

bot.action(/^btn_pickup_(.+)$/, async (ctx) => {
  const session = userSessions[ctx.from.id];
  await ctx.answerCbQuery();
  if (!session || !session.product) return ctx.reply('❌ በትዕዛዝዎ ላይ ስህተት አጋጥሟል።');
  
  const prod = session.product;
  const customerUser = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
  
  const pickupGuide = `🎉 ትዕዛዝዎ በትክክል ደርሷል!\n\n🏪 በቦታው ሄደው ለመረከብ ስለመረጡ የባለቤቱን መረጃ ከታች አያይዘናል፦\n\n📍 አድራሻ: ${prod.shop_name_address || 'በቦቱ ላይ የተገለጸው'}\n📞 ስልክ ቁጥር: ${prod.phone || 'የለውም'}\n\nባለቤቱን ደውለው ማግኘት ይችላሉ። መልካም ግብይት! ✨`;
  const alertMessage = `🏪 [አዲስ የፒክአፕ (Pickup) ትዕዛዝ] 🏪\n\n🆔 የምርት መለያ: #${prod.id}\n📦 ዕቃ: ${prod.name}\n💰 ዋጋ: ${prod.price} ብር\n👤 ገዢ: ${ctx.from.first_name}\n📱 ቴሌግራም: ${customerUser}`;
  
  try {
    if (prod.shop_owner_id && !isNaN(prod.shop_owner_id) && Number(prod.shop_owner_id) !== 0) {
      try { await bot.telegram.sendMessage(Number(prod.shop_owner_id), alertMessage); } catch (e) {}
    }
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[የትዕዛዝ መቆጣጠሪያ ኮፒ - Pickup]\n${alertMessage}`);
    await ctx.reply(pickupGuide, mainKeyboard);
  } catch (err) { console.error(err); }
  delete userSessions[ctx.from.id];
});

// ለ. ለቤት/መሬት ግዢና ኪራይ ማዘዣ
bot.action(/^order_realestate_(house|cust)_(.+)$/, async (ctx) => {
  const type = ctx.match[1];
  const id = ctx.match[2];
  await ctx.answerCbQuery();
  
  try {
    let prod, alertMessage, userGuide;
    const buyerUser = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';

    if (type === 'cust') {
      const { data } = await supabase.from('customer_products').select('*').eq('id', id).single();
      if (!data) return ctx.reply('❌ መረጃው አልተገኘም!');
      prod = data;
      
      alertMessage = `📌 [የቤት/መሬት ጥቆማ ግዢ ፍላጎት] 📌\n\nየተጠቆመው ዕቃ፡ ${prod.name}\nዋጋ፡ ${prod.price} ብር\n\n👤 ፈላጊ ደንበኛ፡ ${ctx.from.first_name} (${buyerUser})`;
      userGuide = `🎉 ለመግዛት/ለመከራየት ስላሳዩት ፍላጎት እናመሰግናለን!\n\nይህ መረጃ የጥቆማ መረጃ በመሆኑ የጠቋሚውን አድራሻና ስልክ ቁጥር በመጠቀም በቀጥታ ማግኘት ይችላሉ፦\n\n📞 ስልክ ቁጥር: ${prod.phone}\n🏢 መገኛ አድራሻ: ${prod.shop_name_address}`;
      
      if (prod.owner_chat_id) {
        try { await bot.telegram.sendMessage(Number(prod.owner_chat_id), `🔔 ማሳወቂያ፡ ለእርስዎ የቤት/መሬት ጥቆማ ግዢ ፈላጊ ደንበኛ መጥቷል!`); } catch(e){}
      }
    } else {
      const { data } = await supabase.from('houses').select('*').eq('id', id).single();
      if (!data) return ctx.reply('❌ መረጃው አልተገኘም!');
      prod = data;
      
      alertMessage = `🏢 [በአስተዳዳሪው ለተመዘገበ ቤት/መሬት የትዕዛዝ ፍላጎት] 🏢\n\nቤት/መሬት፡ ${prod.name}\nዋጋ፡ ${prod.price} ብር\n👤 ፈላጊ ደንበኛ፡ ${ctx.from.first_name} (${buyerUser})`;
      userGuide = `🎉 የቤት/መሬት ግዥ/ኪራይ ፍላጎትዎ በተሳካ ሁኔታ ደርሶናል። የቤቱ/መሬቱ ባለቤት መረጃ ለማግኘት በሚከተለው ስልክ ይደውሉ፦\n\n📞 ስልክ ቁጥር፡ ${prod.phone || '0946662487'}`;
      
      if (prod.owner_chat_id) {
        try { await bot.telegram.sendMessage(Number(prod.owner_chat_id), `🔔 ማሳወቂያ፡ በሲራሊንክ ያስመዘገቡትን ቤት/መሬት የሚፈልግ ደንበኛ መጥቷል!`); } catch(e){}
      }
    }
    
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[የሪልስቴት ትዕዛዝ መቆጣጠሪያ]\n${alertMessage}`);
    await ctx.reply(userGuide, mainKeyboard);
  } catch (err) { console.error(err); }
});

// --- የጥቆማ የውስጥ አዝራሮች መቆጣጠሪያ ---
bot.action('tip_type_land', async (ctx) => {
  const session = userSessions[ctx.from.id];
  if (!session || session.step !== 'CHOOSE_TIP_TYPE') return ctx.answerCbQuery();
  await ctx.answerCbQuery();
  session.tipFinalType = 'land';
  return saveSubmittedTip(ctx, session);
});
bot.action('tip_type_house', async (ctx) => {
  const session = userSessions[ctx.from.id];
  if (!session || session.step !== 'CHOOSE_TIP_TYPE') return ctx.answerCbQuery();
  await ctx.answerCbQuery();
  session.step = 'CHOOSE_HOUSE_SUBTYPE';
  const houseSubKeyboard = Markup.inlineKeyboard([[Markup.button.callback('💰 የሚሸጥ', 'house_sub_sell')], [Markup.button.callback('🔑 የኪራይ', 'house_sub_rent')]]);
  return ctx.editMessageText('🏠 ቤቱ የሚሸጥ ነው ወይስ የሚከራይ? ከታች ይምረጡ፦', houseSubKeyboard);
});
bot.action('house_sub_sell', async (ctx) => {
  const session = userSessions[ctx.from.id];
  if (!session || session.step !== 'CHOOSE_HOUSE_SUBTYPE') return ctx.answerCbQuery();
  await ctx.answerCbQuery();
  session.tipFinalType = 'house_sell';
  return saveSubmittedTip(ctx, session);
});
bot.action('house_sub_rent', async (ctx) => {
  const session = userSessions[ctx.from.id];
  if (!session || session.step !== 'CHOOSE_HOUSE_SUBTYPE') return ctx.answerCbQuery();
  await ctx.answerCbQuery();
  session.tipFinalType = 'house_rent';
  return saveSubmittedTip(ctx, session);
});

async function saveSubmittedTip(ctx, session) {
  const username = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
  const finalCat = '🗺 መሬት/ቤት';
  const defaultImg = generateMatchedImage(session.tipAddress, finalCat);
  let typeAmharic = session.tipFinalType === 'land' ? 'መሬት' : (session.tipFinalType === 'house_sell' ? 'የሚሸጥ ቤት' : 'የሚከራይ ቤት');

  const pName = `የቀረበ ${typeAmharic} (${session.tipArea} ካሬ)`;
  const pDesc = `የጠቋሚ ስም: ${session.tipName} | ስፋት: ${session.tipArea} m² || टाइप:${session.tipFinalType}`;
  
  try {
    await supabase.from('customer_products').insert([
      { name: pName, price: session.tipPrice, category: finalCat, description: pDesc, shop_name_address: session.tipAddress, phone: session.tipPhone, image_url: defaultImg, owner_chat_id: ctx.from.id }
    ]);
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, `📌 አዲስ ጥቆማ ገብቷል፡ ${pName}\nዋጋ፡ ${session.tipPrice} ብር\nጠቋሚ፡ ${session.tipName}`);
    autoBroadcastNewProduct(pName, finalCat, session.tipPrice);
    await ctx.editMessageText(`🎉 የጥቆማ መረጃዎ በተሳካ ሁኔታ እንደ *[${typeAmharic}]* ተመዝግቧል። አሁን (4.4) ውስጥ መመልከት ይቻላል።`);
  } catch (err) { await ctx.reply('❌ ጥቆማውን መመዝገብ አልተቻለም።', mainKeyboard); }
  delete userSessions[ctx.from.id];
}

// ==========================================
// 📢 BROADCAST COMMAND FOR ADMIN
// ==========================================
bot.command('broadcast', async (ctx) => {
  if (ctx.from.id !== ADMIN_CHAT_ID) return; 
  const inputText = ctx.message.text.replace('/broadcast', '').trim();
  if (!inputText) return ctx.reply('⚠️ *እባክህ መልዕክት አስገባ!*');
  
  let finalMessage = (!inputText.includes(' ') && inputText.length <= 7) 
    ? `🔔 *አዲስ ምርት ወጥቷል!* 🔔\n\nSiralink Market ላይ በ *${inputText}* ምድብ ስር አዳዲስ ምርቶች አሁን ገብተዋል። ቦቱ ላይ በመግባት አሁኑኑ ይመልከቱ! 🛍✨`
    : inputText;
  
  try {
    const { data: users } = await supabase.from('bot_users').select('chat_id');
    if (!users || users.length === 0) return ctx.reply('📢 ተጠቃሚዎች አልተገኙም።');
    let successCount = 0;
    for (let u of users) { 
      try { await bot.telegram.sendMessage(u.chat_id, finalMessage, { parse_mode: 'Markdown' }); successCount++; } catch (e) {} 
    }
    ctx.reply(`✅ መልዕክቱ ለ ${successCount} ተጠቃሚዎች ተላልፏል!`);
  } catch (err) { ctx.reply('❌ የቴክኒክ ስህተት አጋጥሟል።'); }
});

bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Bot is Fully Active! 🚀'))
  .catch((err) => console.error(err));
