const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');

// 1. ቦት እና የ Supabase ዳታቤዝ ማገናኛ
const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

// ናርዶስ፣ ከ Supabase ያመጣኸውን ሊንክ እዚህ በታች ባለው ነጠላ ሰረዝ ውስጥ አስገባው!
const supabaseUrl = 'postgresql://postgres:[XybhLpvaazMchPHd]@db.gyooossgagycyeyffjfr.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: supabaseUrl,
  ssl: { rejectUnauthorized: false }
});

// 2. Render እንዳይዘጋ መከላከያ ዌብ ሰርቨር
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink ቦት በSupabase በንቃት እየሰራ ነው!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web Server running on port ${PORT}`));

// ==========================================
// 🚀 ዋናው ማውጫ (MAIN MENU)
// ==========================================
const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🛍 አዳዲስ ዕቃዎችን ይግዙ (ከሱቆች)', 'shop_main')],
  [Markup.button.callback('🏠 የሚከራይ ቤትና ዶርም ፈልግ', 'house_main')],
  [Markup.button.callback('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', 'used_main')],
  [Markup.button.callback('ℹ️ ስለ እኛ', 'about_us_main')]
]);

bot.start((ctx) => ctx.reply(`እንኳን ወደ Siralink ማርኬት ቦት በሰላም መጡ! 👋`, mainKeyboard));
const backToMain = [Markup.button.callback('🔙 ወደ ዋናው ማውጫ', 'back_to_main')];
bot.action('back_to_main', (ctx) => ctx.editMessageText(`ምን ማድረግ ይፈልጋሉ?`, mainKeyboard));

// ==========================================
// 🛍 የሱቆች ክፍል (E-COMMERCE)
// ==========================================
bot.action('shop_main', (ctx) => {
  return ctx.editMessageText(`🛍 የሱቆች መጋዘን\n\nየዕቃ ምድብ ይምረጡ፦`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👗 የሴቶች ልብስ', 'get_prod_clothes'), Markup.button.callback('👔 የወንዶች ልብስ', 'get_prod_men')],
      [Markup.button.callback('👟 ጫማዎች', 'get_prod_shoes'), Markup.button.callback('📱 ኤሌክትሮኒክስ', 'get_prod_elec')],
      backToMain
    ])
  );
});

// ከ Supabase ዳታቤዝ ላይ ዕቃዎችን ስቦ በፎቶ ማሳያ
bot.action(/^get_prod_(.+)$/, async (ctx) => {
  const category = ctx.match[1];
  try {
    const res = await pool.query('SELECT * FROM products WHERE category = $1', [category]);
    if (res.rows.length === 0) {
      return ctx.reply('በዚህ ምድብ ውስጥ በአሁኑ ሰዓት ምንም ዕቃ የለም።', Markup.inlineKeyboard([backToMain]));
    }

    for (let item of res.rows) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}`;
      if (item.image_url) {
        await ctx.replyWithPhoto(item.image_url, {
          caption: txt,
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback(`🛒 አሁን እዘዝ (Order)`, `order_item_${item.id}`)]])
        });
      } else {
        await ctx.reply(txt, Markup.inlineKeyboard([[Markup.button.callback(`🛒 አሁን እዘዝ (Order)`, `order_item_${item.id}`)]]));
      }
    }
  } catch (err) {
    console.error(err);
    ctx.reply('ችግር አጋጥሟል፣ እባክዎ ቆይተው ይሞክሩ።');
  }
});

// ==========================================
// 🏠 ሌሎች በተኖች ምላሽ
// ==========================================
bot.action('house_main', (ctx) => ctx.reply('በአሁኑ ሰዓት የተመዘገበ ቤት የለም።', Markup.inlineKeyboard([backToMain])));
bot.action('used_main', (ctx) => ctx.reply('ምንም ያገለገሉ እቃዎች አልተመዘገቡም።', Markup.inlineKeyboard([backToMain])));

bot.action('about_us_main', (ctx) => {
  const aboutText = `ℹ️ *ስለ Siralink ሁለገብ ማርኬት*\n\n🏗 እኛ ከፍተኛ ጥራት ያላቸውን ማሽነሪዎች እና አልባሳት የምናቀርብ ታማኝ ድርጅት ነን።\n\n📍 አድራሻ: አዲስ አበባ\n📞 ስልክ: +2519xxxxxxxx`;
  return ctx.editMessageText(aboutText, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([backToMain]) });
});

bot.action(/^order_item_(.+)$/, (ctx) => ctx.reply('🛍 እቃውን ለማዘዝ ስምዎትንና ያሉበትን አድራሻ ይጻፉልን።'));

// 🚀 ቦቱን ማወካከቢያ ሳይኖር በቀጥታ ማስነሻ (Clean Long Polling)
bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('ቦቱ በSupabase 100% በተሳካ ሁኔታ ተነስቷል! 🚀'))
  .catch((err) => console.error('ስህተት፦', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
