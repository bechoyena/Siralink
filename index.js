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

// የኢሞጂ ጽሑፎችን ወደ ቁጥር መቀየሪያ ማፒንግ (ስህተትን ለመከላከል)
const categoryMapping = {
  '👗 የሴቶች ልብስ': '0',
  '👔 የወንዶች ልብስ': '1',
  '👟 ጫማዎች': '2',
  '📱 ኤሌክትሮኒክስ': '3'
};

bot.start(async (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  try {
    await supabase.from('bot_users').insert([{ chat_id: ctx.from.id }], { upsert: true });
  } catch (err) { console.error(err); }
  return ctx.reply('እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋', mainKeyboard);
});

bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  if(userSessions[ctx.from.id]) delete userSessions[ctx.from.id];
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል።', mainKeyboard);
});

bot.hears('🛍 አዳዲስ ዕቃዎችን ይግዙ', (ctx) => {
  return ctx.reply('🛍 ለመግዛት የሚፈልጉትን የዕቃ ምድብ ከታች ይምረጡ፦', shopKeyboard);
});

const shopCategories = ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ', '👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'];
bot.hears(shopCategories, async (ctx) => {
  const userChoice = ctx.message.text.trim();
  const categoryId = categoryMapping[userChoice]; // ለምሳሌ '1' ያገኛል

  try {
    // በጽሑፍ ፈንታ በቁጥር መለያው ይፈልጋል
    const { data: dbProducts, error } = await supabase.from('products').select('*').eq('category', categoryId);
    
    if (error) return ctx.reply('ይቅርታ፣ ከዳታቤዝ ላይ መረጃ ሲፈለግ ስህተት አጋጥሟል።', shopKeyboard);

    if (!dbProducts || dbProducts.length === 0) {
      return ctx.reply(`በዚህ ምድብ ውስጥ በአሁኑ ሰዓት ዕቃ አልተመዘገበም።`, shopKeyboard);
    }

    for (let item of dbProducts) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_item_${item.id}`)]]);
      
      if (item.image_url && item.image_url.trim() !== '') {
        try { await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn }); } 
        catch { await ctx.reply(`🛍 ${item.name}\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`, inlineBtn); }
      } else {
        await ctx.reply(`🛍 ${item.name}\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description || 'የለውም'}`, inlineBtn);
      }
    }
  } catch (err) { 
    await ctx.reply('ይቅርታ፣ ችግር አጋጥሟል።', shopKeyboard); 
  }
});

// --- ሌሎቹ ክፍሎች እንዳሉ ይቀጥላሉ ---
bot.hears('🏠 የሚከራይ ቤትና ዶርም ፈልግ', (ctx) => ctx.reply('🏠 የቤት ማዕከል', houseKeyboard));
bot.hears('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', (ctx) => ctx.reply('🔄 ያገለገሉ ዕቃዎች', usedKeyboard));
bot.hears('ℹ️ ስለ እኛ', (ctx) => ctx.reply('Siralink Market ማዕከል'));

bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Bot is Live! 🚀'))
  .catch((err) => console.error(err));
