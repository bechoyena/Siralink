const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');
const ADMIN_CHAT_ID = 5406168929;

const SUPABASE_URL = 'https://gyooossgagycyeyffjfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5b29vc3NnYWd5Y3lleWZmamZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk5ODgsImV4cCI6MjA5ODUxNTk4OH0.k85DGyIEU_wEzZhE6Qbo-ssiXbhT2gR69SH7KVOZ4NY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const userSessions = {};

const app = reportExpressErrors(express());
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink Bot is Live!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web Server running on port ${PORT}`));

function reportExpressErrors(expressApp) {
  return expressApp;
}

// 📱 ኪቦርዶች
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

bot.start(async (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  try {
    // ተጠቃሚውን መመዝገብ (ለብሮድካስት እንዲሆን)
    await supabase.from('bot_users').insert([{ chat_id: ctx.from.id }], { upsert: true });
  } catch (err) { console.error('User registration error:', err); }
  return ctx.reply('እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋\n\nከታች ካለው ማውጫ የሚፈልጉትን አገልግሎት ይምረጡ፦', mainKeyboard);
});

bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል። የሚፈልጉትን ይምረጡ፦', mainKeyboard);
});

// --- 🛍 4.1 አዳዲስ ዕቃዎች ክፍል ---
bot.hears('🛍 አዳዲስ ዕቃዎችን ይግዙ', (ctx) => {
  return ctx.reply('🛍 የሱቆች መጋዘን\n\nለመግዛት የሚፈልጉትን የዕቃ ምድብ ከታች ይምረጡ፦', shopKeyboard);
});

const shopCategories = ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ', '👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'];
bot.hears(shopCategories, async (ctx) => {
  const category = ctx.message.text.trim();
  try {
    const { data: dbProducts, error } = await supabase.from('products').select('*').eq('category', category);
    
    if (error || !dbProducts || dbProducts.length === 0) {
      return ctx.reply(`በዚህ ምድብ (${category}) ውስጥ በአሁኑ ሰዓት ዕቃ አልተመዘገበም። እባክዎ ቆይተው ይሞክሩ።`, shopKeyboard);
    }

    for (let item of dbProducts) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_item_${item.id}`)]]);
      
      if (item.image_url && item.image_url.trim() !== '') {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } 
        catch (err) { await ctx.reply(`🛍 ${item.name}\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`, inlineBtn); }
      } else {
        await ctx.reply(`🛍 ${item.name}\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`, inlineBtn);
      }
    }
  } catch (err) { 
    await ctx.reply('ይቅርታ፣ መረጃዎችን ከዳታቤዝ ላይ መሳብ አልተቻለም።', shopKeyboard); 
  }
});

// --- 🏠 4.2 የሚከራይ ቤትና ዶርም ክፍል ---
bot.hears('🏠 የሚከራይ ቤትና ዶርም ፈልግ', (ctx) => {
  return ctx.reply('🏠 የቤት እና የዶርም ኪራይ ማዕከል\n\nየሚፈልጉትን የቤት አይነት ከታች ይምረጡ፦', houseKeyboard);
});

const houseCategories = ['🛏 የተማሪዎች ዶርም', '🏢 ስቱዲዮ አፓርትመንት', '🏡 ቪላ / ሰርቪስ ቤት'];
bot.hears(houseCategories, async (ctx) => {
  const category = ctx.message.text.trim();
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
        catch { await ctx.reply(`🏠 ${item.name}\n💰 ኪራይ: ${item.price}\nℹ️ መግለጫ: ${item.description || 'የለውም'}`, inlineBtn); }
      } else {
        await ctx.reply(`🏠 ${item.name}\n💰 ኪራይ: ${item.price}\nℹ️ መግለጫ: ${item.description || 'የለውም'}`, inlineBtn);
      }
    }
  } catch (err) { await ctx.reply('ይቅርታ፣ የቤት መረጃዎችን መሳብ አልተቻለም።', houseKeyboard); }
});

// --- 🔄 4.3 ያገለገሉ ዕቃዎች ክፍል ---
bot.hears('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', (ctx) => {
  return ctx.reply('🔄 ያገለገሉ ዕቃዎች ማዕከል\n\nእቃ መግዛት ይፈልጋሉ ወይስ የራስዎን እቃ መሸጥ?', usedKeyboard);
});

bot.hears('📥 ዕቃዎች ለመመልከት', async (ctx) => {
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
        catch { await ctx.reply(`🔄 ${item.name}\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`, inlineBtn); }
      } else {
        await ctx.reply(`🔄 ${item.name}\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`, inlineBtn);
      }
    }
  } catch (err) { await ctx.reply('መረጃውን ማግኘት አልተቻለም።', usedKeyboard); }
});

bot.hears('📤 የራሴን ዕቃ ለመሸጥ', (ctx) => {
  userSessions[ctx.from.id] = { step: 'ASK_SELL_NAME' };
  return ctx.reply('📝 እሺ፣ ለመሸጥ የሚፈልጉትን ያገለገለ *ዕቃ ስም* (ለምሳሌ፡ HP ላፕቶፕ) ይጻፉልኝ፦');
});

bot.hears('ℹ️ ስለ እኛ', (ctx) => {
  const aboutText = `✨ *Siralink Market ሁለገብ ማዕከል*\n\n❓ አገልግሎቶቻችንን ለማየት ከታች ይምረጡ፦`;
  const aboutInlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('💼 የምንሰጣቸው አገልግሎት', 'about_services')],
    [Markup.button.callback('🏢 የደንበኞች ማእከል', 'about_customer_center')]
  ]);
  return ctx.reply(aboutText, aboutInlineKeyboard);
});

// ==========================================
// 🛎 5. የጽሑፍ መልዕክቶች መከታተያ ፎርም (TEXT HANDLING)
// ==========================================
bot.on('text', async (ctx, next) => {
  const session = userSessions[ctx.from.id];
  if (!session) return next();
  const text = ctx.message.text.trim();

  if (session.step === 'ASK_NAME') {
    session.name = text;
    session.step = 'ASK_PHONE';
    return ctx.reply('📞 በጣም ጥሩ! አሁን ደግሞ ባለሱቁ እንዲያገኝዎ *የስልክ ቁጥርዎን* ያስገቡ፦');
  } 
  if (session.step === 'ASK_PHONE') {
    session.phone = text;
    session.step = 'ASK_ADDRESS';
    return ctx.reply('📍 በመጨረሻም ዕቃው የሚረከቡበትን *ትክክለኛ አድራሻ (ሰፈር/ክፍለ ከተማ)* ይጻፉልን፦');
  }
  if (session.step === 'ASK_ADDRESS') {
    session.address = text;
    const prod = session.product;
    const customerUser = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';
    
    // 🔥 እዚህ ጋ ትዕዛዙ የማን እንደሆነ በትክክል ይለያል! (የምርት ስም እና የሱቅ ID ይላካል)
    const alertMessage = `🛍 *አዲስ የዕቃ ትዕዛዝ ደርሷል!* 🛍\n\n🆔 *የምርት መለያ (ID):* #${prod.id}\n📦 *ዕቃ:* ${prod.name}\n💰 *ዋጋ:* ${prod.price} ብር\n🏪 *የባለሱቅ ID:* ${prod.shop_owner_id || 'የለውም'}\n\n👤 *የደንበኛ ስም:* ${session.name}\n📞 *ስልክ ቁጥር:* ${session.phone}\n📍 *አድራሻ:* ${session.address}\n📱 *ቴሌግራም:* ${customerUser}`;

    try {
      let sentToOwner = false;
      // ለባለሱቁ መላኪያ ማረጋገጫ (ትክክለኛ ቁጥር ከሆነና ቦቱን ካስነሳው ብቻ)
      if (prod.shop_owner_id && !isNaN(prod.shop_owner_id)) {
        try {
          await bot.telegram.sendMessage(Number(prod.shop_owner_id), alertMessage, { parse_mode: 'Markdown' });
          sentToOwner = true;
        } catch (e) { console.log("ባለሱቁ ቦቱን ስላላስነሳ መልዕክት አልደረሰውም"); }
      }
      
      // ላንተ ሁልጊዜ ኮፒ እንዲደርስህ ማድረጊያ (የደህንነት ማስተማመኛ)
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[የትዕዛዝ መቆጣጠሪያ ኮፒ]\n${alertMessage}`, { parse_mode: 'Markdown' });
      
      await ctx.reply('🎉 ማረጋገጫ: ትዕዛዝዎ በተሳካ ሁኔታ ተመዝግቧል! በቅርቡ እናገኝዎታለን። እናመሰግናለን! 🙏', mainKeyboard);
    } catch (err) {
      console.error(err);
      await ctx.reply('❌ ትዕዛዙን ማስተላለፍ ላይ ችግር አጋጥሟል። እባክዎ ለባለቤቱ በውስጥ መስመር ያሳውቁ።', mainKeyboard);
    }
    delete userSessions[ctx.from.id];
    return;
  }

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
      // ⚠️ በ Supabase ላይ አምዱ 'contact' ወይም 'phone' መሆኑን አይቶ ሁለቱንም ይሞክራል
      await supabase.from('used_items').insert([
        { name: session.sellName, price: session.sellPrice, contact: session.sellPhone, phone: session.sellPhone, description: `በተጠቃሚ ${username} የተላከ` }
      ]);
      const adminAlert = `🚨 *አዲስ ያገለገለ ዕቃ ሽያጭ ጥያቄ መጥቷል!* 🚨\n\n👤 *ላኪ:* ${ctx.message.from.first_name} (${username})\n📦 *ዕቃ:* ${session.sellName}\n💰 *ዋጋ:* ${session.sellPrice} ብር\n📞 *ስልክ:* ${session.sellPhone}`;
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminAlert, { parse_mode: 'Markdown' });
      await ctx.reply('📥 የእቃዎ መረጃ ደርሶናል። መረጃው ቀጥታ በቦቱ ላይ ተለጥፏል! እናመሰግናለን።', mainKeyboard);
    } catch (err) {
      await ctx.reply('📥 መረጃው በተለዋጭ መንገድ ተመዝግቧል። እናመሰግናለን።', mainKeyboard);
    }
    delete userSessions[ctx.from.id];
  }
});

// --- 📢 6. አዲስ ዕቃ ሲኖር ለሁሉም ደንበኞች ማስተላለፊያ ኮማንድ (የተስተካከለ) ---
bot.command('broadcast', async (ctx) => {
  if (ctx.from.id !== ADMIN_CHAT_ID) return;
  const categoryInput = ctx.message.text.replace('/broadcast', '').trim();
  if (!categoryInput) {
    return ctx.reply('⚠️ እባክህ የምድቡን ስም አብረህ ጻፍ። ለምሳሌ፦ /broadcast 👔 የወንዶች ልብስ');
  }
  try {
    const { data: users, error } = await supabase.from('bot_users').select('chat_id');
    if (error || !users || users.length === 0) {
      return ctx.reply('📢 መልዕክት የሚላክላቸው ተጠቃሚዎች በዳታቤዙ (bot_users) ላይ አልተገኙም።');
    }
    const notificationText = `🔔 *አዲስ ምርት ወጥቷል!* 🔔\n\nSiralink Market ላይ በ *${categoryInput}* ምድብ ስር አዳዲስ ምርቶች አሁን ገብተዋል። ቦቱ ላይ በመግባት አሁኑኑ ይመልከቱ! 🛍✨`;
    ctx.reply(`⏳ ለ ${users.length} ተጠቃሚዎች መልዕክት መላክ ተጀምሯል...`);
    for (let u of users) {
      try { await bot.telegram.sendMessage(u.chat_id, notificationText, { parse_mode: 'Markdown' }); } catch (e) {}
    }
    ctx.reply(`✅ 📢 መልዕክቱ ተላልፏል!`);
  } catch (err) { ctx.reply('❌ ማስተላለፍ ላይ ስህተት አለ።'); }
});

bot.action('about_services', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply(`ይህ ቦት ደንበኞችን እና ነጋዴዎችን በቀጥታ የሚያገናኝ ዘመናዊ የገበያ መድረክ ነው።`);
});

bot.action('about_customer_center', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply(`🏢 የደንበኞች ማዕከል መረጃ\n\n📍 አድራሻ፦ ሀዋሳ፤ ኢትዮጵያ\n📞 ስልክ፦ 0946662487`);
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

bot.action(/^rent_house_(.+)$/, (ctx) => ctx.reply('📞 ቤቱን ለመከራየት ፍላጎትዎ ስለደረሰን በቅርቡ እናገኝዎታለን።'));
bot.action(/^call_owner_(.+)$/, (ctx) => ctx.reply('📱 እቃው ላይ በተጠቀሰው ስልክ ቁጥር በመደወል በቀጥታ መነጋገር ይችላሉ።'));

bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Bot is Fully Active! 🚀'))
  .catch((err) => console.error(err));
