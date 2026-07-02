const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

const SUPABASE_URL = 'https://gyooossgagycyeyffjfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5b29vc3NnYWd5Y3lleWZmamZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk5ODgsImV4cCI6MjA5ODUxNTk4OH0.k85DGyIEU_wEzZhE6Qbo-ssiXbhT2gR69SH7KVOZ4NY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink Fully Active Bot!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web Server running on port ${PORT}`));

// ==========================================
// 📱 3. ከታች የሚቀመጡ ኪቦርዶች (REPLY KEYBOARDS)
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
// 🎯 4. የትዕዛዝ ሎጂክ (BOT LOGIC)
// ==========================================
bot.start((ctx) => {
  return ctx.reply('እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋\n\nከታች ካለው አፕ መሰል ማውጫ የሚፈልጉትን አገልግሎት ይምረጡ፦', mainKeyboard);
});

bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል። የሚፈልጉትን ይምረጡ፦', mainKeyboard);
});

// --- 🛍 አዳዲስ ዕቃዎች ክፍል ---
bot.hears('🛍 አዳዲስ ዕቃዎችን ይግዙ', (ctx) => {
  return ctx.reply('🛍 የሱቆች መጋዘን\n\nለመግዛት የሚፈልጉትን የዕቃ ምድብ ከታች ይምረጡ፦', shopKeyboard);
});

const shopCategories = ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ', '👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'];
bot.hears(shopCategories, async (ctx) => {
  const category = ctx.message.text;
  try {
    const { data, error } = await supabase.from('products').select('*').eq('category', category);
    if (error || !data || data.length === 0) return ctx.reply('በዚህ ምድብ ውስጥ በአሁኑ ሰዓት ዕቃ አልተመዘገበም።', shopKeyboard);

    for (let item of data) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_item_${item.id}`)]]);
      if (item.image_url) { try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); } }
      else { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
    }
  } catch (err) { await ctx.reply('ችግር አጋጥሟል፣ እባክዎ ቆይተው ይሞክሩ።', shopKeyboard); }
});

// --- 🏠 የቤት ኪራይ ክፍል (አሁን ንቁ ሆነ!) ---
bot.hears('🏠 የሚከራይ ቤትና ዶርም ፈልግ', (ctx) => {
  return ctx.reply('🏠 የቤት እና የዶርም ኪራይ ማዕከል\n\nየሚፈልጉትን የቤት አይነት ከታች ይምረጡ፦', houseKeyboard);
});

const houseCategories = ['🛏 የተማሪዎች ዶርም', '🏢 ስቱዲዮ አፓርትመንት', '🏡 ቪላ / ሰርቪስ ቤት'];
bot.hears(houseCategories, async (ctx) => {
  const category = ctx.message.text;
  try {
    const { data, error } = await supabase.from('houses').select('*').eq('category', category);
    if (error || !data || data.length === 0) return ctx.reply('በዚህ ምድብ ውስጥ በአሁኑ ሰዓት የተመዘገበ ቤት የለም።', houseKeyboard);

    for (let item of data) {
      const txt = `🏠 *${item.name}*\n💰 ኪራይ: ${item.price}\nℹ️ መግለጫ: ${item.description}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('📞 አሁን ተከራይ / አግኝ', `rent_house_${item.id}`)]]);
      if (item.image_url) { try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); } }
      else { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
    }
  } catch (err) { await ctx.reply('የቤት መረጃዎችን መሳብ አልተቻለም።', houseKeyboard); }
});

// --- 🔄 ያገለገሉ ዕቃዎች ክፍል (አሁን ንቁ ሆነ!) ---
bot.hears('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', (ctx) => {
  return ctx.reply('🔄 ያገለገሉ ዕቃዎች ማዕከል\n\nእቃ መግዛት ይፈልጋሉ ወይስ የራስዎን እቃ መሸጥ?', usedKeyboard);
});

bot.hears('📥 ዕቃዎች ለመመልከት', async (ctx) => {
  try {
    const { data, error } = await supabase.from('used_items').select('*');
    if (error || !data || data.length === 0) return ctx.reply('በአሁኑ ሰዓት ያገለገለ ዕቃ አልተመዘገበም።', usedKeyboard);

    for (let item of data) {
      const txt = `🔄 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}\n📞 ስልክ: ${item.contact}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('📞 ለባለቤቱ ደውል', `call_owner_${item.id}`)]]);
      if (item.image_url) { try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } catch { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); } }
      else { await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn }); }
    }
  } catch (err) { await ctx.reply('መረጃውን ማግኘት አልተቻለም።', usedKeyboard); }
});

bot.hears('📤 የራሴን ዕቃ ለመሸጥ', (ctx) => {
  return ctx.reply('📤 የራስዎን ያገለገለ እቃ ለመመዝገብ በቀጥታ በቦቱ ላይ /sell ብለው ይጻፉ። ለምሳሌ፦\n\n/sell HP ላፕቶፕ - 25000 - 0911223344', usedKeyboard);
});

bot.command('sell', (ctx) => {
  ctx.reply('📥 የእቃዎ መረጃ ደርሶናል። መረጃው ተገምግሞ በቅርቡ በቦቱ ላይ ይለጠፋል።\n\n✨ *Siralink Marketን ምርጫዎ ስላደረጉ እናመሰግናለን!* ✨', mainKeyboard);
});

// --- ℹ️ ስለ እኛ ክፍል ---
bot.hears('ℹ️ ስለ እኛ', (ctx) => {
  const aboutText = `ℹ️ *ስለ Siralink ሁለገብ ማርኬት*\n\n🏗 እኛ ከፍተኛ ጥራት ያላቸውን ማሽነሪዎች፣ አልባсах እና የቤት ኪራይ መረጃዎችን የምናቀርብ ታማኝ ድርጅት ነን።\n\n📍 *አድራሻ:* አዲስ አበባ፣ ኢትዮጵያ\n🌐 *ቻናል:* @SiralinkMarket`;
  return ctx.reply(aboutText, { parse_mode: 'Markdown', ...mainKeyboard });
});

// --- 🛎 Inline Actions ---
bot.action(/^order_item_(.+)$/, (ctx) => ctx.reply('🛍 እቃውን ለማዘዝ ስምዎትን እና ያሉበትን ትክክለኛ አድራሻ እዚህ ይጻፉልን። የሱቁ ባለቤት ያገኝዎታል።'));
bot.action(/^rent_house_(.+)$/, (ctx) => ctx.reply('📞 ቤቱን ለመከራየት አድራሻዎን እና ስልክዎን እዚህ ይተዉልን። ባለቤቱ በውስጥ መስመር ያገኝዎታል።'));
bot.action(/^call_owner_(.+)$/, (ctx) => ctx.reply('📱 እቃው ላይ በተጠቀሰው ስልክ ቁጥር በመደወል በቀጥታ ከባለቤቱ ጋር መነጋገር ይችላሉ።'));

bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Fully Active Bot Active! 🚀'))
  .catch((err) => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
