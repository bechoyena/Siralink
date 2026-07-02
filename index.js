const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. ቦት እና ሱፓቤዝ መገናኛ
const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // የራሰህን የሱፓቤዝ URL አስገባ
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // የራሰህን ANON KEY አስገባ
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. ዌብ ሰርቨር (Render እንዳይዘጋ)
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink Main App Bot with Dynamic Photos is Active!'));
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

// ==========================================
// 🎯 4. የትዕዛዝ እና አዝራሮች ሎጂክ (BOT LOGIC)
// ==========================================
bot.start((ctx) => {
  return ctx.reply(`እንኳን ወደ Siralink መተግበሪያ ማውጫ በሰላም መጡ! 👋\n\nከታች ካለው አፕ መሰል ማውጫ የሚፈልጉትን አገልግሎት ይምረጡ፦`, mainKeyboard);
});

bot.hears('🔙 ወደ ዋናው ማውጫ', (ctx) => {
  return ctx.reply('ወደ ዋናው ማውጫ ተመልሰዋል። የሚፈልጉትን ይምረጡ፦', mainKeyboard);
});

bot.hears('🛍 አዳዲስ ዕቃዎችን ይግዙ', (ctx) => {
  return ctx.reply('🛍 የሱቆች መጋዘን\n\nለመግዛት የሚፈልጉትን የዕቃ ምድብ ከታች ይምረጡ፦', shopKeyboard);
});

// 🛍 ምርቶችን ከነፎቷቸው ከ Supabase የማንበቢያ ሎጂክ
const shopCategories = ['👗 የሴቶች ልብስ', '👔 የወንዶች ልብስ', '👟 ጫማዎች', '📱 ኤሌክትሮኒክስ'];
bot.hears(shopCategories, async (ctx) => {
  const category = ctx.message.text;

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

    try {
      // image_url ካለው በ sendPhoto ይልካል፣ ከሌለው ወይም ስህተት ከሆነ ወደ catch አልፎ በጽሑፍ ብቻ ይልካል
      if (item.image_url && item.image_url.trim() !== '') {
        await ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown', ...inlineBtn });
      } else {
        await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn });
      }
    } catch (photoError) {
      // የፎቶው ሊንክ ችግር ካለው ቦቱ እንዳይዘጋ በጽሑፍ ብቻ እንዲያልፍ ያደርገዋል
      console.error('Photo send failed, sending text instead:', photoError.message);
      await ctx.reply(txt, { parse_mode: 'Markdown', ...inlineBtn });
    }
  }
  await ctx.reply(`ሌላ ዕቃ ለማየት ምድብ ይምረጡ ወይም '🔙 ወደ ዋናው ማውጫ' ይበሉ።`, shopKeyboard);
});

// --- 🛎 የውስጥ በተን ማዘዣዎች (Inline Actions) ---
bot.action(/^order_item_(.+)$/, (ctx) => {
  const orderText = `🛍 እቃውን ለማዘዝ ስምዎትን እና ያሉበትን ትክክለኛ አድራሻ እዚህ ይጻፉልን። የሱቁ ባለቤት በውስጥ መስመር ያገኝዎታል።\n\n` +
                    `✨ *Siralink Marketን ምርጫዎ ስላደረጉ እናመሰግናለን!* ✨`;
  return ctx.reply(orderText, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 ወደ ዋናው ማውጫ', 'back_to_main_action')]]) });
});

bot.action('back_to_main_action', (ctx) => ctx.reply('የሚፈልጉትን አገልግሎት ከታች ይምረጡ፦', mainKeyboard));

// 🚀 5. ማስነሻ
bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Bot with Dynamic Photos Active! 🚀'))
  .catch((err) => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
