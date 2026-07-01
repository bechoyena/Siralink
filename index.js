const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// ቦት መክፈቻ
const bot = new Telegraf('8577893575:AAE0YpDFrK8GgYBP46uqTRsdM6zGkpec1kU');

// Render እንዳይዘጋ መከላከያ ዌብ ሰርቨር
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('ሁለገብ ማርኬት ቦት በንቃት እየሰራ ነው!'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web Server is running on port ${PORT}`);
});

// ==========================================
// 🛍 2. የእቃዎች መጋዘን (PRODUCTS DATA)
// ናርዶስ፣ አዲስ እቃ ለመጨመር እዚህ በታች ባሉት ቅንፎች { } ውስጥ ጨምር
// የምድብ (category) ስሞች መሆን ያለባቸው፦ 'clothes', 'men', 'shoes', ወይም 'elec' ነው
// ==========================================
const products = [
  {
    id: 1,
    name: 'ያማረ የሴቶች የሐበሻ ቀሚስ',
    price: 3500,
    description: 'በእጅ ጥልፍ የተሰራ፣ ጥራት ካለው ማግ የተዘጋጀ።',
    category: 'clothes',
    image_url: 'https://postimages.org/ የምታገኘውን የፎቶ ሊንክ እዚህ ታስገባለህ.jpg'
  },
  {
    id: 2,
    name: 'የወንዶች ዘመናዊ ሱፍ',
    price: 6000,
    description: 'ለሰርግ እና ለተለያዩ ፕሮግራሞች የሚሆን ሙሉ ሱፍ።',
    category: 'men',
    image_url: 'https://example.com/suit.jpg'
  },
  {
    id: 3,
    name: 'ስማርት ሰዓት (Smart Watch Series 9)',
    price: 2500,
    description: 'ቻርጅ ለረጅም ጊዜ የሚይዝ፣ የልብ ትርታ የሚለካ።',
    category: 'elec',
    image_url: 'https://example.com/watch.jpg'
  }
];

// ==========================================
// 🚀 1. ዋናው ማውጫ (MAIN MENU)
// ==========================================
const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🛍 አዳዲስ ዕቃዎችን ይግዙ (ከሱቆች)', 'shop_main')],
  [Markup.button.callback('🏠 የሚከራይ ቤትና ዶርም ፈልግ', 'house_main')],
  [Markup.button.callback('🔄 ያገለገሉ ዕቃዎችን ይግዙ/ይሽጡ', 'used_main')],
  [Markup.button.callback('ℹ️ ስለ እኛ', 'about_us_main')]
]);

bot.start((ctx) => {
  return ctx.reply(
    `እንኳን ወደ Siralink ሁለገብ የገበያ እና መረጃ ቦት በሰላም መጡ! 👋\n\nምን ማድረግ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦`,
    mainKeyboard
  );
});

const backToMain = [Markup.button.callback('🔙 ወደ ዋናው ማውጫ', 'back_to_main')];

bot.action('back_to_main', (ctx) => {
  return ctx.editMessageText(`ምን ማድረግ ይፈልጋሉ? ከታች ካሉት አማራጮች አንዱን ይምረጡ፦`, mainKeyboard);
});


// ==========================================
// 🛍 2. የሱቆች ክፍል (E-COMMERCE RESPONSE)
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

// ከተቀመጠው ዝርዝር ላይ ዕቃዎችን ፈልጎ በፎቶ ማሳያ
bot.action(/^get_prod_(.+)$/, async (ctx) => {
  const category = ctx.match[1];
  
  // ከተቀመጠው ዝርዝር ውስጥ ከተመረጠው ምድብ ጋር እኩል የሆኑትን መምረጥ
  const filteredProducts = products.filter(p => p.category === category);

  if (filteredProducts.length === 0) {
    return ctx.reply('በዚህ ምድብ ውስጥ በአሁኑ ሰዓት ምንም ዕቃ አልተመዘገበም።', Markup.inlineKeyboard([backToMain]));
  }

  // እቃዎቹን በፎቶ እና በዝርዝር መላክ
  for (let item of filteredProducts) {
    const txt = `🛍 *${item.name}*\n💰 ዋጋ: ${item.price} ብር\nℹ️ መግለጫ: ${item.description}`;
    
    // የፎቶ ሊንክ ካለው በፎቶ፣ ከሌለው በፅሁፍ ብቻ ይልካል
    if (item.image_url && item.image_url.startsWith('http')) {
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

// ለጊዜው ቤቶች በኮድ ስለሌሉ የሚሰጠው ምላሽ
bot.action(/^get_house_(.+)$/, (ctx) => {
  return ctx.reply('በአሁኑ ሰዓት በዚህ ምድብ የተመዘገበ ተከራይ ቤት የለም። አከራዮች መረጃ እንዲያስገቡ እየተደረገ ነው።', Markup.inlineKeyboard([backToMain]));
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

bot.action('view_used', (ctx) => {
  return ctx.reply('ምንም ያገለገሉ እቃዎች አልተመዘገቡም።', Markup.inlineKeyboard([backToMain]));
});

bot.action('sell_instruction', (ctx) => {
  return ctx.reply('📤 የራስዎን ያገለገለ እቃ ለመሸጥ በቀጥታ በቦቱ ላይ /sell ብለው ይጻፉ።');
});

bot.command('sell', (ctx) => {
  ctx.reply('እባክዎን እቃዎን ለመመዝገብ መረጃውን በዚህ መልክ ይላኩ፦\n\n*የዕቃው ስም - ዋጋ - ስልክ ቁጥር*\n\nለምчнее፦ HP ላፕቶፕ - 25000 - 0911223344');
});


// ==========================================
// ℹ️ 5. "ስለ እኛ" በተን ምላሽ (ABOUT US)
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

// ==========================================
// 🚀 የቦት ማስነሻ በዌብሁክ (WEBHOOK CONFIGURATION FOR RENDER)
// ==========================================

// Render የሚሰጠንን ዌብሳይት ሊንክ እና የቦቱን ቶከን አገናኝቶ በዌብሁክ ያስነሳዋል
const secretPath = `/telegraf/${bot.secretWithToken()}`;
app.use(bot.webhookCallback(secretPath));

// የ Render ሊንክህን እዚህ ጋር በራስ-ሰር ያገኘዋል
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://siralink-pro.onrender.com';

bot.telegram.setWebhook(`${RENDER_URL}${secretPath}`)
  .then(() => {
    console.log(`ዌብሁክ በተሳካ ሁኔታ ተገናኝቷል! 🌐 ሊንክ፦ ${RENDER_URL}`);
  })
  .catch((err) => {
    console.error('ዌብሁክን በማገናኘት ላይ ስህተት አጋጥሟል፦', err);
  });

// የድሮውን bot.launch() ሙሉ በሙሉ አጥፍተነዋል!
// ሰርቨሩ Render ላይ እንዳይዘጋ መከላከያ
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));;

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
