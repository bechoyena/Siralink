const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// ቦት መክፈቻ ቶከን
const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

// ዌብ ሰርቨር
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Siralink ቦት በንቃት እየሰራ ነው!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web Server running on port ${PORT}`));

// ምርቶች (ከተፈለገ በኋላ ላይ እቃ መጨመር ይቻላል)
const products = [
  { id: 1, name: 'ያማረ የሴቶች የሐበሻ ቀሚስ', price: 3500, description: 'በእጅ ጥልፍ የተሰራ።', category: 'clothes', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c' }
];

const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🛍 አዳዲስ ዕቃዎችን ይግዙ (ከሱቆች)', 'shop_main')],
  [Markup.button.callback('🏠 የሚከራይ ቤትና ዶርም ፈልግ', 'house_main')],
  [Markup.button.callback('ℹ️ ስለ እኛ', 'about_us_main')]
]);

bot.start((ctx) => ctx.reply(`እንኳን ወደ Siralink ማርኬት ቦት በሰላም መጡ! 👋`, mainKeyboard));
const backToMain = [Markup.button.callback('🔙 ወደ ዋናው ማውጫ', 'back_to_main')];
bot.action('back_to_main', (ctx) => ctx.editMessageText(`ምን ማድረግ ይፈልጋሉ?`, mainKeyboard));

bot.action('shop_main', (ctx) => {
  return ctx.editMessageText(`🛍 የሱቆች መጋዘን\n\nየዕቃ ምድብ ይምረጡ፦`,
    Markup.inlineKeyboard([[Markup.button.callback('👗 የሴቶች ልብስ', 'get_prod_clothes')], backToMain])
  );
});

bot.action('get_prod_clothes', async (ctx) => {
  const item = products[0];
  const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}`;
  return ctx.replyWithPhoto(item.image_url, { caption: txt, parse_mode: 'Markdown' });
});

bot.action('house_main', (ctx) => ctx.reply('በአሁኑ ሰዓት የተመዘገበ ቤት የለም።', Markup.inlineKeyboard([backToMain])));
bot.action('about_us_main', (ctx) => ctx.reply('Siralink ማርኬት በአዲስ አበባ የሚገኝ ታማኝ ድርጅት ነው።', Markup.inlineKeyboard([backToMain])));

// አስተማማኝ ማስነሻ (Long Polling)
bot.launch({ polling: { dropPendingUpdates: true } })
  .then(() => console.log('Siralink Bot is running... 🚀'))
  .catch((err) => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
