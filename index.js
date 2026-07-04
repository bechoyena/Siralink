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

// 🖼 ምርቱን አይቶ ተዛማች ፎቶ በራሱ የሚመርጥ ፈንክሽን
function generateMatchedImage(productName, categoryName) {
  const name = productName.toLowerCase();
  const cat = categoryName.toLowerCase();

  if (name.includes('ጫማ') || name.includes('shoe') || name.includes('sneaker') || cat.includes('ጫማ') || cat.includes('አልባሳት')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';
  }
  if (name.includes('ልብስ') || name.includes('ቲሸርት') || name.includes('ጃኬት') || name.includes('ሱፍ') || cat.includes('አልባሳት') || cat.includes('ልብስ')) {
    return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500';
  }
  if (name.includes('ስልክ') || name.includes('ላፕቶፕ') || name.includes('ኮምፒውተር') || name.includes('comput') || cat.includes('ኤሌክትሮኒክስ')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
  }
  if (name.includes('ቤት') || name.includes('መሬት') || name.includes('ዶርም') || cat.includes('መሬት') || cat.includes('ቤት')) {
    return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500';
  }
  if (name.includes('አልጋ') || name.includes('ወንበር') || name.includes('ሶፋ') || cat.includes('ቤት ዕቃዎች')) {
    return 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500';
  }
  return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500';
}

// 📢 አዲስ ዕቃ ሲገባ ለሁሉም ደንበኞች በራሱ ጊዜ መልዕክት የሚበትን ፈንክሽን
async function autoBroadcastNewProduct(prodName, catName, prodPrice) {
  try {
    const { data: users, error } = await supabase.from('bot_users').select('chat_id');
    if (error || !users || users.length === 0) return;
    
    const broadcastText = `🔔 *አዲስ ምርት በደንበኞች ማዕከል ገብቷል!* 🔔\n\n📦 *የምርት ስም:* ${prodName}\n💰 *ዋጋ:* ${prodPrice} ብር\n🗂 *ምድብ:* ${catName}\n\n"👥 በደንበኞች የተጨመሩ" ገጽ ውስጥ በመግባት መመልከት ይችላሉ! 🛍✨`;
    
    for (let u of users) {
      try {
        await bot.telegram.sendMessage(u.chat_id, broadcastText, { parse_mode: 'Markdown' });
      } catch (e) {}
    }
  } catch (err) {
    console.error('Auto broadcast error:', err);
  }
}

// --- ዋና ማውጫ ገፅ ---
const mainKeyboard = Markup.keyboard([
  ['🛍 አዳድስ እቃዎች', '🏠 የቤት ኪራይ/ዶርም'],
  ['🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', '👥 በደንበኞች የተጨመሩ'],
  ['ℹ️ ስለ እኛ']
]).resize();

// --- አዳድስ ዕቃዎች ማውጫ (የሱቆች መጋዘን) ---
const shopKeyboard = Markup.keyboard([
  ['👗 የሴቶች ልብስ', '👕 የወንዶች ልብስ'],
  ['👟 ጫማዎች', '🔌 ኤሌክትሮንክስ'],
  ['🛍 የቤት ዕቃዎች', '➕ አዲስ ዕቃ ጨምር'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

// --- የቤት ኪራይና ዶርም ማውጫ ---
const houseKeyboard = Markup.keyboard([
  ['🎓 የተማሪዎች ዶርም', '🏢 አፓርትመንት'],
  ['🏡 ቪላ', '🏘 ሰርቪስ'],
  ['📌 የቤት/የመሬት ጥቆማ', '🔙 ወደ ዋናው ማውጫ']
]).resize();

// --- ያገለገሉ ዕቃዎችን ይግዙ ይሽጡ ማውጫ ---
const usedKeyboard = Markup.keyboard([
  ['📦 ዕቃዎችን እይ', '➕ የእርስዎን ጨምር'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

// --- 👥 በደንበኞች የተጨመሩ ማውጫ (በትክክል የተቀመጠው) ---
const customerCatKeyboard = Markup.keyboard([
  ['👔 አልባሳትና ጫማ', '🛋 የቤት ዕቃዎች ምድብ'],
  ['💻 ኤሌክትሮኒክስ ምድብ', '🗺 መሬት/ቤት'],
  ['⚙️ ያገለገሉ ዕቃዎች ምድብ', '🔙 ወደ ዋናው ማውጫ']
]).resize();

// ደንበኞች አዲስ ምርት ሲጨምሩ የሚመርጡት ኪቦርድ
const selectCatKeyboard = Markup.keyboard([
  ['👗 የሴቶች ልብስ', '👕 የወንዶች ልብስ'],
  ['👟 ጫማዎች', '🔌 ኤሌክትሮንክስ'],
  ['🛍 የቤት ዕቃዎች']
]).resize();

bot.start(async (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  try {
    await supabase.from('bot_users').insert([{ chat_id: ctx.from.id }], { upsert: true });
  } catch (err) {}
  return ctx.reply('እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋\n\nከታች ካለው ማውጫ የሚፈልጉትን አገልግሎት ይምረጡ፦', mainKeyboard);
});

bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል። የሚፈልጉትን ይምረጡ፦', mainKeyboard);
});

// ==========================================
// 👥 በደንበኞች የተጨመሩ ክፍል (የደንበኞች ምርቶች ማንበቢያ)
// ==========================================
bot.hears('👥 በደንበኞች የተጨመሩ', (ctx) => {
  return ctx.reply('👥 በደንበኞች የተመዘገቡ የገበያ ምርቶች ማውጫ\n\nለመመልከት የሚፈልጉትን ምድብ ይምረጡ፦', customerCatKeyboard);
});

const customerCategories = ['👔 አልባሳትና ጫማ', '🛋 የቤት ዕቃዎች ምድብ', '💻 ኤሌክትሮኒክስ ምድብ', '🗺 መሬት/ቤት', '⚙️ ያገለገሉ ዕቃዎች ምድብ'];
bot.hears(customerCategories, async (ctx) => {
  const clickedText = ctx.message.text.trim();
  try {
    const { data: items, error } = await supabase.from('customer_products').select('*').eq('category', clickedText);
    if (error || !items || items.length === 0) {
      return ctx.reply(`በዚህ ምድብ (${clickedText}) ውስጥ በአሁኑ ሰዓት የተጫነ ዕቃ/ጥቆማ የለም።`, customerCatKeyboard);
    }
    for (let item of items) {
      const txt = `📦 *${item.name}*\n💰 ዋጋ/ኪራይ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}\n🏢 አድራሻ: ${item.shop_name_address || 'የለውም'}\n📞 ስልክ: ${item.phone || 'የለውም'}`;
      
      let inlineBtn;
      // መሬት/ቤት ከሆነ የድሮው አዝራር ይሁን፤ ሌሎቹ በሙሉ ግን የ Delivery/Pickup ምርጫ እንዲያሳዩ አዲሱን አዝራር እንሰጣቸዋለን
      if (clickedText === '🗺 መሬት/ቤት') {
        inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን ይደውሉ / ይዘዙ', `order_cust_${item.id}`)]]);
      } else {
        inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን ይዘዙ (Order)', `order_cust_choice_${item.id}`)]]);
      }
      
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
// 🛍 አዳድስ እቃዎች ክፍል (የሱቆች መጋዘን ብቻ)
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
  let category = clickedText;
  if (clickedText === '🔌 ኤሌክትሮንክስ') category = 'ኤሌክትሮንክስ';
  if (clickedText === '🛍 የቤት ዕቃዎች') category = 'የቤት ዕቃዎች';

  try {
    const { data: dbProducts, error } = await supabase.from('products').select('*').eq('category', category);
    if (error || !dbProducts || dbProducts.length === 0) {
      return ctx.reply(`በዚህ ምድብ (${clickedText}) ውስጥ በአሁኑ ሰዓት ዕቃ አልተመዘገበም።`, shopKeyboard);
    }
    for (let item of dbProducts) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}\n🏢 አድራሻ: ${item.shop_name_address || 'የለውም'}\n📞 ስልክ: ${item.phone || 'የለውም'}`;
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
// 🏠 የቤት ኪራይ/ዶርም ክፍል
// ==========================================
bot.hears('🏠 የቤት ኪራይ/ዶርም', (ctx) => {
  return ctx.reply('🏠 የቤት እና የዶርም ኪራይ ማዕከል\n\nየሚፈልጉትን የቤት አይነት ከታች ይምረጡ፦', houseKeyboard);
});

const houseCategories = ['🎓 የተማሪዎች ዶርም', '🏢 አፓርትመንት', '🏡 ቪላ', '🏘 ሰርቪስ'];
houseCategories.forEach(catKey => {
  bot.hears(catKey, async (ctx) => {
    let dbCategory = catKey;
    if (catKey === '🎓 የተማሪዎች ዶርም') dbCategory = 'የተማሪዎች ዶርም';
    if (catKey === '🏢 አፓርትመንት') dbCategory = 'አፓርትመንት';
    if (catKey === '🏡 ቪላ') dbCategory = 'ቪላ';
    if (catKey === '🏘 ሰርቪስ') dbCategory = 'ሰርቪስ';

    try {
      const { data: dbHouses, error } = await supabase.from('houses').select('*').eq('category', dbCategory);
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
    } catch (err) { await ctx.reply('ይቅርታ፣ የቤት መረጃዎችን ማግኘት አልተቻለም።', houseKeyboard); }
  });
});

bot.hears('📌 የቤት/የመሬት ጥቆማ', (ctx) => {
  userSessions[ctx.from.id] = { step: 'TIP_NAME' };
  return ctx.reply('📝 እሺ የጥቆማ ቅጽ መሙያ። በመጀመሪያ *የጠቋሚውን ሙሉ ስም* ያስገቡ፦');
});

// ==========================================
// 🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ ክፍል
// ==========================================
bot.hears('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', (ctx) => {
  return ctx.reply('🔄 ያገለገሉ ዕቃዎች ማዕከል\n\nእቃ መግዛት ይፈልጋሉ ወይስ የራስዎን እቃ መሸጥ?', usedKeyboard);
});

bot.hears('📦 ዕቃዎችን እይ', async (ctx) => {
  try {
    const { data: dbUsed, error } = await supabase.from('customer_products').select('*').eq('category', '⚙️ ያገለገሉ ዕቃዎች ምድብ');
    if (error || !dbUsed || dbUsed.length === 0) {
      return ctx.reply('በአሁኑ ሰዓት ያገለገለ ዕቃ አልተመዘገበም። እባክዎ ቆይተው ይሞክሩ።', usedKeyboard);
    }
    for (let item of dbUsed) {
      const txt = `🔄 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}\n📞 ስልክ: ${item.phone || 'የለውም'}`;
      // ያገለገሉ ዕቃዎች ላይም የ Delivery/Pickup ምርጫ እንዲመጣ አዲሱን መለያ (order_cust_choice_) እንሰጠዋለን
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን ይዘዙ (Order)', `order_cust_choice_${item.id}`)]]);
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

bot.action('about_customer_center', async (ctx) => {
  await ctx.answerCbQuery();
  const customerCenterText = `🏢 *የደንበኞች ማዕከል መረጃ* 🏢\n\n` +
    `ስለ አገልግሎታችን ማንኛውም ጥያቄ፣ አስተያየት ወይም ቅሬታ ካለዎት ከታች ባሉት አድራሻዎች ሊያገኙን ይችላሉ።\n\n` +
    `📞 *ዋና ስልክ ቁጥር፦* 0946662487\n` +
    `💬 *የቴሌግራም ዋና ክፍል፦* @SiralinkMarket\n` +
    `📣 *የማስታወቂያ ቻናል፦* @SiralinkMarket\n\n` +
    `@ad\\_is17\n\n` +
    `@ad\\_is1\n\n` +
    `የስራ ሰዓት፡ (24/7)\n` +
    `እኛን ስለመረጡ እናመሰግናለን! 🙏`;
  return ctx.reply(customerCenterText, { parse_mode: 'Markdown' });
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
    return ctx.reply('📍 በመጨረሻም ዕቃው የሚረከቡበትን *ትክክለኛ አድራሻ* ይጻፉልኝ፦');
  }
  if (session.step === 'ASK_ADDRESS') {
    session.address = text;
    const prod = session.product;
    const customerUser = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
    
    const alertMessage = `🛍 አዲስ የዕቃ ትዕዛዝ ደርሷል! 🛍\n\n🆔 የምርት መለያ: #${prod.id}\n📦 ዕቃ: ${prod.name}\n💰 ዋጋ: ${prod.price} ብር\n🚚 የአቅርቦት ሁኔታ: Delivery (በደሊቨሪ)\n\n👤 የደንበኛ ስም: ${session.name}\n📞 ስልክ ቁጥር: ${session.phone}\n📍 አድራሻ: ${session.address}\n📱 ቴሌግራም: ${customerUser}`;
    
    try {
      if (prod.shop_owner_id && !isNaN(prod.shop_owner_id) && Number(prod.shop_owner_id) !== 0) {
        try { await bot.telegram.sendMessage(Number(prod.shop_owner_id), alertMessage); } catch (e) {}
      }
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[የትዕዛዝ መቆጣጠሪያ ኮፒ]\n${alertMessage}`);
      await ctx.reply('🎉 ማረጋገጫ: ትዕዛዝዎ በተሳካ ሁኔታ ተመዝግቧል! በቅርቡ እናገኝዎታለን።', mainKeyboard);
    } catch (err) { 
      await ctx.reply('❌ ትዕዛዙን ማስተላለፍ ላይ ችግር አጋጥሟል።', mainKeyboard); 
    }
    delete userSessions[ctx.from.id];
    return;
  }

  // --- 🔄 ያገለገለ እቃ መሸጫ ፎርም ---
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
        { 
          name: session.sellName, 
          price: session.sellPrice, 
          category: finalCat, 
          description: `ያገለገለ ዕቃ | በባለቤቱ የተጫነ (${username})`, 
          shop_name_address: 'በደንበኛ የቀረበ', 
          phone: session.sellPhone,
          image_url: defaultImg
        }
      ]);
      
      autoBroadcastNewProduct(session.sellName, finalCat, session.sellPrice);
      
      const adminNotice = `🔄 ያገለገለ ዕቃ ምዝገባ 🔄\n\n📦 ዕቃ፡ ${session.sellName}\n💰 ዋጋ፡ ${session.sellPrice} ብር\n📞 ስልክ፡ ${session.sellPhone}\n📱 ቴሌግራም፡ ${username}`;
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminNotice);

      await ctx.reply('🎉 ማረጋገጫ፡ ያገለገለው ዕቃዎ በተሳካ ሁኔታ ተመዝግቧል! አሁን "👥 በደንበኞች የተጨመሩ" ውስጥ በቀጥታ ይታያል።', mainKeyboard);
    } catch (err) { 
      await ctx.reply('❌ መረጃውን መመዝገብ አልተቻለም።', mainKeyboard); 
    }
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
    const username = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
    
    const pName = `የሚሸጥ/የሚከራይ መሬት/ቤት (${session.tipArea} ካሬ)`;
    const pDesc = `የጠቋሚ ስም: ${session.tipName} | ስፋት: ${session.tipArea} m²`;
    const finalCat = '🗺 መሬት/ቤት';
    const defaultImg = generateMatchedImage(session.tipAddress, finalCat);

    const tipAlert = `📌 አዲስ የቤት/መሬት ሽያጭ ጥቆማ በደንበኛ ገብቷል! 📌\n\n👤 የጠቋሚ ስም: ${session.tipName}\n📞 ስልክ ቁጥር: ${session.tipPhone}\n📍 ቦታ/አድራሻ: ${session.tipAddress}\n📐 ስፋት: ${session.tipArea} m²\n💰 ዋጋ: ${session.tipPrice} ብር\n📱 ቴሌግራም: ${username}`;
    
    try {
      await supabase.from('customer_products').insert([
        { 
          name: pName, 
          price: session.tipPrice, 
          category: finalCat, 
          description: pDesc, 
          shop_name_address: session.tipAddress, 
          phone: session.tipPhone,
          image_url: defaultImg
        }
      ]);

      await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[የአስተዳዳሪ ማሳወቂያ]\n${tipAlert}`);
      autoBroadcastNewProduct(pName, finalCat, session.tipPrice);

      await ctx.reply('🎉 እናመሰግናለን! የጥቆማ መረጃዎ በተሳካ ሁኔታ ተመዝግቧል። አሁን ሌሎች ደንበኞች "👥 በደንበኞች የተጨመሩ" -> "🗺 መሬት/ቤት" ውስጥ በቀጥታ መመልከት ይችላሉ።', mainKeyboard);
    } catch (err) { 
      await ctx.reply('❌ ጥቆማውን መመዝገብ አልተቻለም። እባክዎ ድጋሚ ይሞክሩ።', mainKeyboard); 
    }
    delete userSessions[ctx.from.id];
    return;
  }

  // --- ➕ አዲስ ምርት መመዝገቢያ (ለአልባሳት፣ የቤት እቃና ኤሌክትሮኒክስ) ---
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
    if (!photoId || text.toLowerCase().includes('የለም') || text.toLowerCase().includes('no')) {
      session.addProdPhoto = '';
    } else {
      session.addProdPhoto = photoId;
    }
    session.step = 'ADD_PROD_CAT';
    return ctx.reply('🗂 ይህ ምርት በየትኛው *የዕቃ ካታጎሪ* ውስጥ እንዲመደብ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦', selectCatKeyboard);
  }
  if (session.step === 'ADD_PROD_CAT') {
    if (!shopItems.includes(text)) {
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
    return ctx.reply('🏢 እሺ፣ ቀጥለው *የድርጅቱን/የሽያጩን ስም እና ዕቃው የሚገኝበትን መገኛ አድራሻ* አብረው ይጻፉልኝ፦');
  }
  if (session.step === 'ADD_PROD_PHONE') {
    session.addProdPhone = text;
    const username = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
    
    let targetCustomerCategory = '';
    if (session.tempCat === '👗 የሴቶች ልብስ' || session.tempCat === '👕 የወንዶች ልብስ' || session.tempCat === '👟 ጫማዎች') {
      targetCustomerCategory = '👔 አልባሳትና ጫማ';
    } else if (session.tempCat === '🛍 የቤት ዕቃዎች') {
      targetCustomerCategory = '🛋 የቤት ዕቃዎች ምድብ';
    } else if (session.tempCat === '🔌 ኤሌክትሮንክስ') {
      targetCustomerCategory = '💻 ኤሌክትሮኒክስ ምድብ';
    }

    if (!session.addProdPhoto || session.addProdPhoto === '') {
      session.addProdPhoto = generateMatchedImage(session.addProdName, targetCustomerCategory);
    }

    const prodAlert = `➕ በደንበኞች ማዕከል አዲስ ምርት ገብቷል! ➕\n\n📦 የምርት ስም: ${session.addProdName}\n💰 ዋጋ: ${session.addProdPrice} ብር\n🗂 የህዝብ እይታ ምድብ: ${targetCustomerCategory}\nℹ መግለጫ: ${session.addProdDesc}\n🏢 አድራሻ: ${session.addProdAddress}\n📞 ስልክ ቁጥር: ${session.addProdPhone}\n👤 አስመዝጋቢ: ${ctx.from.first_name} (${username})`;
    
    try {
      await supabase.from('customer_products').insert([
        { 
          name: session.addProdName, 
          price: session.addProdPrice, 
          category: targetCustomerCategory, 
          description: session.addProdDesc, 
          shop_name_address: session.addProdAddress, 
          phone: session.addProdPhone,
          image_url: session.addProdPhoto
        }
      ]);
      
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, prodAlert);
      autoBroadcastNewProduct(session.addProdName, targetCustomerCategory, session.addProdPrice);

      await ctx.reply(`🎉 ምርትዎ በተሳካ ሁኔታ ተመዝግቧል! አሁን በዋናው ገጽ "👥 በደንበኞች የተጨመሩ" -> "${targetCustomerCategory}" ስር ለሁሉም ተጠቃሚዎች በቀጥታ ይታያል።`, mainKeyboard);
    } catch (err) {
      console.error(err);
      await ctx.reply('❌ ምርቱን መመዝገብ አልተቻለም። እባክዎ ደግመው ይሞክሩ።', mainKeyboard);
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

// --- 📢 ሁለቱንም አማራጭ በአንድ ላይ የያዘ የተስተካከለ የብሮድካስት ኮማንድ ---
bot.command('broadcast', async (ctx) => {
  if (ctx.from.id !== ADMIN_CHAT_ID) return; // አንተ መሆንህን ያረጋግጣል
  
  // ከ /broadcast ቀጥሎ የጻፍከውን ሙሉ ጽሑፍ ይወስዳል
  const inputText = ctx.message.text.replace('/broadcast', '').trim();
  
  if (!inputText) {
    return ctx.reply(
      '⚠️ *እባክህ መልዕክት አስገባ!*\n\n' +
      '💡 *አጠቃቀም፦*\n' +
      '1️⃣ *ለምድብ ማስታወቂያ (በTemplate)፦* `/broadcast አልባሳት` ወይም `/broadcast ጫማዎች`\n' +
      '2️⃣ *ለነፃ ጽሑፍ (ያለTemplate)፦* `/broadcast ነገ ሁሉም ደንበኞች የፈለጉትን ምርት...`', 
      { parse_mode: 'Markdown' }
    );
  }
  
  let finalMessage = '';

  // 🔍 ማጣሪያ፦ የጻፍከው ጽሑፍ ክፍተት (Space) ከሌለው እና ከ 15 ፊደል ካነሰ ብቻ እንደ ምድብ ይቆጠራል
  if (!inputText.includes(' ') && inputText.length <= 7) {
    finalMessage = `🔔 *አዲስ ምርት ወጥቷል!* 🔔\n\nSiralink Market ላይ በ *${inputText}* ምድብ ስር አዳዲስ ምርቶች አሁን ገብተዋል። ቦቱ ላይ በመግባት አሁኑኑ ይመልከቱ! 🛍✨`;
  } 
  // 📝 ካለበለዚያ ግን (ረጅም ጽሑፍ ወይም ከአንድ ቃል በላይ ከሆነ) የጻፍከውን እንዳለ ይወስደዋል
  else {
    finalMessage = inputText;
  }
  
  try {
    // ሁሉንም የቦቱን ተጠቃሚዎች ከ Supabase ያወጣል
    const { data: users, error } = await supabase.from('bot_users').select('chat_id');
    if (error || !users || users.length === 0) return ctx.reply('📢 መልዕክት የሚላክላቸው ተጠቃሚዎች በዳታቤዝ ውስጥ አልተገኙም።');
    
    let successCount = 0;
    
    // ለአንድ በአንድ ለሁሉም ይልካል
    for (let u of users) { 
      try { 
        await bot.telegram.sendMessage(u.chat_id, finalMessage, { parse_mode: 'Markdown' }); 
        successCount++;
      } catch (e) {
        // ቦቱን Block ላደረጉ ሰዎች ስህተት እንዳይሰጥ
      } 
    }
    ctx.reply(`✅ 📢 መልዕክቱ በተሳካ ሁኔታ ለ ${successCount} ተጠቃሚዎች ተላልፏል!`);
  } catch (err) { 
    ctx.reply('❌ መልዕክቱን በማስተላለፍ ላይ የቴክኒክ ስህተት አጋጥሟል።'); 
  }
});
// ==========================================
// 🛒 የሱቆች መጋዘን እቃ ማዘዣ መጀመሪያ
// ==========================================
bot.action(/^order_item_(.+)$/, async (ctx) => {
  const productId = ctx.match[1];
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error || !data) return ctx.reply('❌ ይቅርታ፣ የዕቃው መረጃ አልተገኘም!');
    
    userSessions[ctx.from.id] = { product: data };
    await ctx.answerCbQuery();
    
    const choiceKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🚚 Delivery', `choose_delivery_${productId}`)],
      [Markup.button.callback('🏪 Pickup', `choose_pickup_${productId}`)]
    ]);
    
    await ctx.reply('❓ ይህንን ዕቃ እንዴት መቀበል ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦', choiceKeyboard);
  } catch (err) { console.error(err); }
});

// ==========================================
// 👥 በደንበኞች የተጨመሩ እና ያገለገሉ ዕቃዎች ማዘዣ መጀመሪያ
// ==========================================
bot.action(/^order_cust_choice_(.+)$/, async (ctx) => {
  const productId = ctx.match[1];
  try {
    const { data, error } = await supabase.from('customer_products').select('*').eq('id', productId).single();
    if (error || !data) return ctx.reply('❌ ይቅርታ፣ የዕቃው መረጃ አልተገኘም!');
    
    userSessions[ctx.from.id] = { product: data };
    await ctx.answerCbQuery();
    
    const choiceKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🚚 Delivery', `choose_delivery_${productId}`)],
      [Markup.button.callback('🏪 Pickup', `choose_pickup_${productId}`)]
    ]);
    
    await ctx.reply('❓ ይህንን ዕቃ እንዴት መቀበል ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦', choiceKeyboard);
  } catch (err) { console.error(err); }
});

// 🏪 በቦታው ሄደው መረከብ (Pickup) ሲመርጡ
bot.action(/^choose_pickup_(.+)$/, async (ctx) => {
  const session = userSessions[ctx.from.id];
  await ctx.answerCbQuery();
  
  if (!session || !session.product) return ctx.reply('❌ በትዕዛዝዎ ላይ ስህተት አጋጥሟል። እባክዎ ድጋሚ ይሞክሩ።');
  
  const prod = session.product;
  const customerUser = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
  
  // ለገዢው የሚላክ መረጃ
  const pickupGuide = `🎉 ትዕዛዝዎ በትክክል ደርሷል!\n\n🏪 በቦታው ሄደው ዕቃውን ለመረከብ ስለመረጡ እናመሰግናለን። ባለቤቱን ለማግኘት የሚከተለውን መረጃ ይጠቀሙ፦\n\n🏢 የሱቅ/ባለቤት ስም: ${prod.description ? prod.description.substring(0, 50) : 'Siralink Vendor'}\n📍 አድራሻ: ${prod.shop_name_address || 'በቦቱ ላይ የተገለጸው'}\n📞 ስልክ ቁጥር: ${prod.phone || 'የለውም'}\n\nዕቃውን ለመረከብ ሲሄዱ ይህንን መልዕክት ማሳየት ይችላሉ። መልካም ግብይት! ✨`;
  
  // ለአስተዳዳሪው የሚላክ መረጃ
  const alertMessage = `🏪 አዲስ የዕቃ ትዕዛዝ (Pickup) ደርሷል! 🏪\n\n🆔 የምርት መለያ: #${prod.id}\n📦 ዕቃ: ${prod.name}\n💰 ዋጋ: ${prod.price} ብር\n🚚 የአቅርቦት ሁኔታ: Pickup (በቦታው ሄዶ የሚረከብ)\n\n👤 ገዢ: ${ctx.from.first_name}\n📱 ቴሌግራም: ${customerUser}`;
  
  try {
    if (prod.shop_owner_id && !isNaN(prod.shop_owner_id) && Number(prod.shop_owner_id) !== 0) {
      try { await bot.telegram.sendMessage(Number(prod.shop_owner_id), alertMessage); } catch (e) {}
    }
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[የትዕዛዝ መቆጣጠሪያ ኮፒ]\n${alertMessage}`);
    await ctx.reply(pickupGuide, mainKeyboard);
  } catch (err) {
    await ctx.reply('❌ ትዕዛዙን ማስተላለፍ ላይ ችግር አጋጥሟል።', mainKeyboard);
  }
  
  delete userSessions[ctx.from.id];
});

// 🚚 ባሉበት ሆኖ እንዲመጣላቸው (Delivery) ሲመርጡ
bot.action(/^choose_delivery_(.+)$/, async (ctx) => {
  const session = userSessions[ctx.from.id];
  await ctx.answerCbQuery();
  
  if (!session || !session.product) return ctx.reply('❌ በትዕዛዝዎ ላይ ስህተት አጋጥሟል። እባክዎ ድጋሚ ይሞክሩ።');
  
  session.step = 'ASK_NAME';
  await ctx.reply('📝 እሺ በደሊቨሪ እንዲመጣልዎ ትዕዛዝ ለመጀመር በመጀመሪያ *ትክክለኛ ስምዎን* ይጻፉልኝ፦');
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
