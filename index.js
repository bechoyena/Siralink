const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

// ⚠️ ያንተ የቴሌግራም ID (እንደ ዋና ቁጥጥር)
const ADMIN_CHAT_ID = 5406168929; 

const SUPABASE_URL = 'https://gyooossgagycyeyffjfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5b29vc3NnYWd5Y3lleWZmamZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk5ODgsImV4cCI6MjA5ODUxNTk4OH0.k85DGyIEU_wEzZhE6Qbo-ssiXbhT2gR69SH7KVOZ4NY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// የትዕዛዝ መረጃዎችን ጊዜያዊ ማቀፊያ (In-memory state)
const userSessions = {};

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink Advanced Order Bot!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web Server running on port ${PORT}`));

// Keyboards
const mainKeyboard = Markup.keyboard([
  ['🛍 አዳዲስ ዕቃዎችን ይግዙ', '🏠 የሚከራይ ቤትና ዶርም ፈልግ'],
  ['🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', 'ℹ️ ስለ እኛ']
]).resize();

const shopKeyboard = Markup.keyboard([
  ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ'],
  ['👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'],
  ['🔙 ወደ ዋናው ማውጫ']
]).resize();

// Bot Commands & Hears
bot.start((ctx) => ctx.reply('እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋', mainKeyboard));
bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል። የሚፈልጉትን ይምረጡ፦', mainKeyboard);
});

bot.hears('🛍 አዳዲስ ዕቃዎችን ይግዙ', (ctx) => ctx.reply('🛍 ለመግዛት የሚፈልጉትን የዕቃ ምድብ ከታች ይምረጡ፦', shopKeyboard));

const shopCategories = ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ', '👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'];
bot.hears(shopCategories, async (ctx) => {
  const cat = ctx.message.text;
  try {
    const { data, error } = await supabase.from('products').select('*').eq('category', cat);
    if (error || !data || data.length === 0) return ctx.reply(`በዚህ ምድብ እስካሁን የተመዘገበ ዕቃ የለም።`, shopKeyboard);

    for (let item of data) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_item_${item.id}`)]]);
      if (item.image_url) { try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); } }
      else { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
    }
  } catch (err) { ctx.reply('ችግር አጋጥሟል፤ ቆይተው ይሞክሩ።', shopKeyboard); }
});

// 🛒 --- የትዕዛዝ አቀባበል መስመር (Order Form Workflow) ---
bot.action(/^order_item_(.+)$/, async (ctx) => {
  const productId = ctx.match[1];
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error || !data) return ctx.reply('❌ ይቅርታ፣ የዕቃው መረጃ አልተገኘም!');

    // የተጠቃሚውን የትዕዛዝ ሂደት ማስጀመር
    userSessions[ctx.from.id] = {
      step: 'ASK_NAME',
      product: data
    };

    await ctx.answerCbQuery();
    await ctx.reply('📝 እሺ ትዕዛዝ ለመጀመር በመጀመሪያ *ትክክለኛ ስምዎን* ይጻፉልኝ፦', { parse_mode: 'Markdown' });
  } catch (err) { console.error(err); }
});

// የደንበኛውን መልዕክት ተከታትሎ መረጃ መሙያ
bot.on('text', async (ctx, next) => {
  const session = userSessions[ctx.from.id];
  if (!session) return next(); // ትዕዛዝ ላይ ካልሆነ ወደ ሌላው ሎጂክ ይለፈው

  const text = ctx.message.text;

  if (session.step === 'ASK_NAME') {
    session.name = text;
    session.step = 'ASK_PHONE';
    return ctx.reply('📞 በጣም ጥሩ! አሁን ደግሞ ባለሱቁ እንዲያገኝዎ *የስልክ ቁጥርዎን* ያስገቡ፦');
  } 
  
  if (session.step === 'ASK_PHONE') {
    session.phone = text;
    session.step = 'ASK_ADDRESS';
    return ctx.reply('📍 በመጨረሻም ዕቃው የሚረከቡበትን *ትክክለኛ አድራሻ (ከተማ/ክፍለ ከተማ/ሰፈር)* ይጻፉልን፦');
  }

  if (session.step === 'ASK_ADDRESS') {
    session.address = text;
    const prod = session.product;
    const customerUser = ctx.from.username ? `@${ctx.from.username}` : 'የለውም';

    // ለባለሱቁ እና ላንተ የሚላክ ሙሉ መረጃ
    const alertMessage = `🛍 *አዲስ የዕቃ ትዕዛዝ ደርሷል!* 🛍\n\n` +
                         `📦 *ዕቃ:* ${prod.name}\n` +
                         `💰 *ዋጋ:* ${prod.price} ብር\n\n` +
                         `👤 *የደንበኛ ስም:* ${session.name}\n` +
                         `📞 *ስልክ ቁጥር:* ${session.phone}\n` +
                         `📍 *አድራሻ:* ${session.address}\n` +
                         `📱 *ቴሌግራም:* ${customerUser}`;

    try {
      // 1. ለባለሱቁ መላክ (በ Supabase ላይ የተመዘገበው id ካለ)
      if (prod.shop_owner_id) {
        await bot.telegram.sendMessage(prod.shop_owner_id, alertMessage, { parse_mode: 'Markdown' });
      }
      
      // 2. ላንተ (ለዋናው አድሚን) ኮፒ መላክ (ሁሉንም ትዕዛዝ እንድታይ)
      if (prod.shop_owner_id !== ADMIN_CHAT_ID) {
        await bot.telegram.sendMessage(ADMIN_CHAT_ID, `[ኮፒ ለአድሚን]\n${alertMessage}`, { parse_mode: 'Markdown' });
      }

      // ደንበኛውን ማመስገንና ፕሮሰሱን መዝጋት
      await ctx.reply('🎉 ማረጋገጫ: ትዕዛዝዎ በተሳካ ሁኔታ ለሱቁ ባለቤት ተላልፏል! ባለሱቁ በቅርቡ በስልክ ወይም በውስጥ መስመር ያገኝዎታል። እናመሰግናለን! 🙏', mainKeyboard);
      delete userSessions[ctx.from.id];

    } catch (sendError) {
      console.error('Notification failed:', sendError.message);
      await ctx.reply('❌ ትዕዛዙን ለባለሱቁ ማስተላለፍ ላይ ችግር አጋጥሟል። እባክዎ ቆይተው ይሞክሩ።');
      delete userSessions[ctx.from.id];
    }
  }
});

// (ሌሎቹ የቤት ኪራይ እና ያገለገሉ እቃዎች ሎጂኮች ከታች ይቀጥላሉ...)
bot.hears('🏠 የሚከራይ ቤትና ዶርም ፈልግ', (ctx) => ctx.reply('🏠 የቤት ኪራይ ማዕከል', mainKeyboard));
bot.hears('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', (ctx) => ctx.reply('🔄 ያገለገሉ ዕቃዎች ማዕከል', mainKeyboard));
bot.hears('ℹ️ ስለ እኛ', (ctx) => ctx.reply('ℹ️ ስለ Siralink ሁለገብ ማርኬት', mainKeyboard));

bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Order Engine Active! 🚀'))
  .catch((err) => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
