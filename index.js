const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

const SUPABASE_URL = 'https://gyooossgagycyeyffjfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5b29vc3NnYWd5Y3lleWZmamZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Mzk5ODgsImV4cCI6MjA5ODUxNTk4OH0.k85DGyIEU_wEzZhE6Qbo-ssiXbhT2gR69SH7KVOZ4NY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

bot.start((ctx) => {
  return ctx.reply('እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋\n\nከታች ካለው አፕ መሰል ማውጫ የሚፈልጉትን አገልግሎት ይምረጡ፦', mainKeyboard);
});

bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል። የሚፈልጉትን ይምረጡ፦', mainKeyboard);
});

bot.hears('🛍 አዳዲስ ዕቃዎችን ይግዙ', (ctx) => {
  return ctx.reply('🛍 የሱቆች መጋዘን\n\nለመግዛት የሚፈልጉትን የዕቃ ምድብ ከታች ይምረጡ፦', shopKeyboard);
});

const shopCategories = ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ', '👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'];
bot.hears(shopCategories, async (ctx) => {
  const category = ctx.message.text;
  try {
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);

    if (error || !dbProducts || dbProducts.length === 0) {
      return ctx.reply('በዚህ ምድብ ውስጥ በአሁኑ ሰዓት ዕቃ አልተመዘገበም። እባክዎ ቆይተው ይሞክሩ።', shopKeyboard);
    }

    for (let item of dbProducts) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}`;
      const inlineBtn = Markup.inlineKeyboard([[Markup.button.callback('🛒 አሁን እዘዝ (Order)', `order_item_${item.id}`)]]);

      if (item.image_url && item.image_url.trim() !== '') {
        try {
          await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn });
        } catch (photoError) {
          await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn });
        }
      } else {
        await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn });
      }
    }
    await ctx.reply('ሌላ ዕቃ ለማየት ምድብ ይምረጡ ወይም "🔙 ወደ ዋናው ማውጫ" ይበሉ።', shopKeyboard);
  } catch (err) {
    await ctx.reply('ይቅርታ፣ መረጃዎችን ከዳታቤዝ ላይ መሳብ አልተቻለም።', shopKeyboard);
  }
});

bot.action(/^order_item_(.+)$/, (ctx) => {
  const orderText = `🛍 እቃውን ለማዘዝ ስምዎትን እና ያሉበትን ትክክለኛ አድራሻ እዚህ ይጻፉልን። የሱቁ ባለቤት በውስጥ መስመር ያገኝዎታል።\n\n✨ *Siralink Marketን ምርጫዎ ስላደረጉ እናመሰግናለን!* ✨`;
  return ctx.reply(orderText, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 ወደ ዋናው ማውጫ', 'back_to_main_action')]]) });
});

bot.action('back_to_main_action', (ctx) => ctx.reply('የሚፈልጉትን አገልግሎት ከታች ይምረጡ፦', mainKeyboard));

bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Bot is Fully Active! 🚀'))
  .catch((err) => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
