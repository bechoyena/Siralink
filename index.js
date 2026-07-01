const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');

// ቦት እና ዳታቤዝ ኮኔክሽን መክፈቻ
const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Render እንዳይዘጋ መከላከያ ዌብ ሰርቨር
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('ሁለገብ ማርኬት ቦት በንቃት እየሰራ ነው!'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web Server is running on port ${PORT}`);
});

// ==========================================
// 🚀 1. ዋናው ማውጫ (MAIN MENU)
// ==========================================
// ናርዶስ፣ እዚህ ጋር "ስለ እኛ" በተንን ጨምሬዋለሁ
const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🛍 አዳዲስ ዕቃዎችን ይግዙ (ከሱቆች)', 'shop_main')],
  [Markup.button.callback('🏠 የሚከራይ ቤትና ዶርም ፈልግ', 'house_main')],
  [Markup.button.callback('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', 'used_main')],
  [Markup.button.callback('ℹ️ ስለ እኛ', 'about_us_main')] // አዲሱ በተን
]);

bot.start((ctx) => {
  return ctx.reply(
    `እንኳን ወደ Siralink ሁለገብ የገበያ እና መረጃ ቦት በሰላም መጡ! 👋\n\nምን ማድረግ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦`,
    mainKeyboard
  );
});

// ወደ ዋናው ማውጫ መመለሻ በተን
const backToMain = [Markup.button.callback('🔙 ወደ ዋናው ማውጫ', 'back_to_main')];

bot.action('back_to_main', (ctx) => {
  return ctx.editMessageText(`ምን ማድረግ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦`, mainKeyboard);
});


// ==========================================
// 🛍 2. የሱቆች ክፍል (E-COMMERCE)
// ==========================================
bot.action('shop_main', (ctx) => {
  return ctx.editMessageText(
    `🛍 የሱቆች መጋዘን\n\nለመግዛት የሚፈልጉትን የዕቃ ምድብ ይምረጡ፦`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👗 የሴቶች ልብስ', 'get_prod_clothes'), Markup.button.callback('👔 የወንዶች ልብስ', 'get_prod_men')],
      [Markup.button.callback('👟 ጫማዎች', 'get_prod_shoes'), Markup.button.callback('📱 ኤሌክትሮኒክስ', 'get_prod_elec')],
      backToMain
    ])
  );
});

// ከዳታቤዝ ላይ ዕቃዎችን ስቦ ማሳያ
// 💡 አዳዲስ የምርት ምድቦችን በኮድህ ለመጨመር ከፈለግክ እዚህ በታች ባለው 'clothes', 'men' ወዘተ አጠገብ አዲስ ስም መጨመር ትችላለህ
bot.action(/^get_prod_(.+)$/, async (ctx) => {
  const category = ctx.match[1];
  try {
    const res = await pool.query('SELECT * FROM products WHERE category = $1', [category]);
    if (res.rows.length === 0) {
      return ctx.reply('በዚህ ምድብ ውስጥ በአሁኑ ሰዓት ምንም ዕቃ የለም።', Markup.inlineKeyboard([backToMain]));
    }

// ዕቃዎችን በፎቶ እና በዝርዝር ማሳየት
    for (let item of res.rows) {
      const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}`;
      
      // ፎቶ ካለው በፎቶ፣ ከሌለው በጽሁፍ ብቻ ይልካል
      if (item.image_url) {
        await ctx.replyWithPhoto(item.image_url, {
          caption: txt,
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback(`🛒 አሁን እዘዝ (Order)`, `order_item_${item.id}`)]])
        });
      } else {
        await ctx.reply(txt, Markup.inlineKeyboard([
          [Markup.button.callback(`🛒 አሁን እዘዝ (Order)`, `order_item_${item.id}`)]
        ]));
      }
    }
  } catch (err) {
    console.error(err);
    ctx.reply('ስህተት አጋጥሟል፣ እባክዎ ቆይተው ይሞክሩ።');
  }
});


// ==========================================
// 🏠 3. የቤት ኪራይ ክፍል (REAL ESTATE)
// ==========================================
bot.action('house_main', (ctx) => {
  return ctx.editMessageText(
    `🏠 የቤት እና የዶርም ኪራይ ማዕከል\n\nየሚፈልጉትን የቤት አይነት ይምረጡ፦`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🛏 የተማሪዎች ዶርም', 'get_house_dorm')],
      [Markup.button.callback('🏢 ስቱዲዮ አፓርትመንት', 'get_house_studio')],
      [Markup.button.callback('🏡 ቪላ / ሰርቪስ ቤት', 'get_house_villa')],
      backToMain
    ])
  );
});

bot.action(/^get_house_(.+)$/, async (ctx) => {
  const type = ctx.match[1];
  try {
    const res = await pool.query('SELECT * FROM houses WHERE type = $1', [type]);
    if (res.rows.length === 0) {
      return ctx.reply('በዚህ ምድብ የሚከራይ ቤት በአሁኑ ሰዓት የለም።', Markup.inlineKeyboard([backToMain]));
    }

    for (let house of res.rows) {
      const txt = `🏠 የቤት አይነት: ${house.type}\n📍 አድራሻ: ${house.location}\n💰 የኪራይ ዋጋ: ${house.price} ብር/በወር`;
      await ctx.reply(txt, Markup.inlineKeyboard([
        [Markup.button.callback('📞 የአከራዩን ስልክ ቁጥር እይ', `unlock_house_${house.id}`)]
      ]));
    }
  } catch (err) {
    console.error(err);
  }
});


// ==========================================
// 🔄 4. ያገለገሉ ዕቃዎች ክፍል (CLASSIFIEDS)
// ==========================================
bot.action('used_main', (ctx) => {
  return ctx.editMessageText(
    `🔄 ያገለገሉ ዕቃዎች ማዕከል\n\nእቃ መግዛት ይፈልጋሉ ወይስ የራስዎን እቃ መሸጥ?`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📥 ዕቃዎችን ለመመልከት', 'view_used')],
      [Markup.button.callback('📤 የራሴን ዕቃ ለመሸጥ (/sell)', 'sell_instruction')],
      backToMain
    ])
  );
});

bot.action('view_used', async (ctx) => {
  try {
    const res = await pool.query('SELECT * FROM used_items ORDER BY created_at DESC LIMIT 10');
    if (res.rows.length === 0) {
      return ctx.reply('ምንም ያገለገሉ እቃዎች አልተመዘገቡም።', Markup.inlineKeyboard([backToMain]));
    }

    for (let item of res.rows) {
      const txt = `🔄 ያገለገለ ዕቃ: ${item.title}\n💰 ዋጋ: ${item.price} ብር\n📱 የሻጭ ስልክ: ${item.phone}`;
      await ctx.reply(txt);
    }
  } catch (err) {
    console.error(err);
  }
});

bot.action('sell_instruction', (ctx) => {
  return ctx.reply('📤 የራስዎን ያገለገለ እቃ ለመሸጥ በቀጥታ በቦቱ ላይ /sell ብለው ይጻፉ።');
});

bot.command('sell', (ctx) => {
  ctx.reply('እባክዎን እቃዎን ለመመዝገብ መረጃውን በዚህ መልክ ይላኩ፦\n\n*የዕቃው ስም - ዋጋ - ስልክ ቁጥር*\n\nለምሳሌ፦ HP ላፕቶፕ - 25000 - 0911223344');
});


// ==========================================
// ℹ️ 5. አዲሱ "ስለ እኛ" በተን ምላሽ (ABOUT US)
// ==========================================
bot.action('about_us_main', (ctx) => {
  const aboutText = `ℹ️ *ስለ Siralink ሁለገብ ማርኬት*\n\n` +
                    `🏗 እኛ ከፍተኛ ጥራት ያላቸውን የኮንስትራክሽን ማሽነሪዎች፣ የኢንዱስትሪ እቃዎች፣ አልባሳት እና የቤት ኪራይ መረጃዎችን በተመጣጣኝ ዋጋ ለደንበኞቻችን የምናቀርብ ታማኝ ድርጅት ነን።\n\n` +
                    `📍 *አድራሻ:* አዲስ አበባ፣ ኢትዮጵያ\n` +
                    `📞 *ስልክ:* +2519xxxxxxxx\n` +
                    `🌐 *ቴሌግራም ቻናል:* @SiralinkMarket\n\n` +
                    `ምርጫችሁ ስላደረጋችሁን እናመሰግናለን! 🙏`;

  return ctx.editMessageText(aboutText, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([backToMain])
  });
});


// ==========================================
// 💳 6. የክፍያ እና የትዕዛዝ ማረጋገጫዎች (LOGIC)
// ==========================================
bot.action(/^order_item_(.+)$/, (ctx) => {
  ctx.reply('🛍 እቃውን ለማዘዝ ስምዎትን እና ያሉበትን ትክክለኛ አድራሻ ይጻፉልን። የሱቁ ባለቤት በውስጥ መስመር ያገኝዎታል።');
});

bot.action(/^unlock_house_(.+)$/, (ctx) => {
  ctx.reply('🔒 የአከራዩን ስልክ ቁጥር ለማየት 10 ብር በCBE ባንክ (1000686191668) ከፍለው የደረሰኙን ፎቶ (Screenshot) @ad_is17 @ad_is1 ይላኩ።');
});

// ቦቱን ማስነሳት
bot.launch({
  polling: {
    dropPendingUpdates: true
  }
}).then(() => {
  console.log('ሁለገብ ማርኬት ቦት 100% አዲሱን ገጽታ ይዞ ተነስቷል! 🚀');
}).catch((err) => {
  console.error('ቦቱን በማስነሳት ላይ ስህተት፦', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
