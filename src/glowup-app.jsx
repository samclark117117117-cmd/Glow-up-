import { useState, useEffect, useRef } from 'react';

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPA_URL = 'https://ivguvfbzexmkblnbpzcn.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Z3V2ZmJ6ZXhta2JsbmJwemNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDMzODYsImV4cCI6MjA5MDgxOTM4Nn0.IESf5I3I9Sg2BBGNk1dvUn9asBV9o4NZjRGJx8o1MM0';

async function supaLoad() {
  try {
    var r = await fetch(SUPA_URL + '/rest/v1/glowup_data?id=eq.shared', { headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY } });
    var rows = await r.json();
    if (rows && rows[0] && rows[0].data) {
      var remote = rows[0].data;
      var localTs = localStorage.getItem('glowup-ts');
      var remoteTs = remote.savedAt || '0';
      if (!localTs || remoteTs > localTs) return remote;
    }
  } catch(e) {}
  return null;
}

async function supaSave(data) {
  try {
    data.savedAt = new Date().toISOString();
    localStorage.setItem('glowup-ts', data.savedAt);
    await fetch(SUPA_URL + '/rest/v1/glowup_data', { method: 'POST', headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' }, body: JSON.stringify({ id: 'shared', data: data, updated_at: data.savedAt }) });
  } catch(e) {}
}

const SK = 'glowup-v7';
const GLOW_PER_CHALLENGE = 10;
const GRIND_GYM = 25;
const GRIND_RIDE = 20;
const PERFECT_WEEK_MULTIPLIER = 1.5;

const GRIND_LEVELS = [
  {level:1,title:'Beginner',emoji:'🌱',color:'#90caf9',threshold:0},
  {level:2,title:'Rookie',emoji:'⚡',color:'#ffb347',threshold:100},
  {level:3,title:'Athlete',emoji:'🔥',color:'#ff80cc',threshold:250},
  {level:4,title:'Strong',emoji:'💪',color:'#ff4db8',threshold:500},
  {level:5,title:'Beast',emoji:'👊',color:'#ff3d9a',threshold:900},
  {level:6,title:'Elite',emoji:'💎',color:'#e600ac',threshold:1400},
];

const GLOW_LEVELS = [
  {level:1,title:'Rising Star',emoji:'🌸',color:'#ffb3d9',threshold:0},
  {level:2,title:'Glitter Girl',emoji:'✨',color:'#e8a0ff',threshold:60},
  {level:3,title:'That Girl',emoji:'🔥',color:'#ff80cc',threshold:150},
  {level:4,title:'Main Character',emoji:'👑',color:'#ff4db8',threshold:280},
  {level:5,title:'Icon',emoji:'💎',color:'#e600ac',threshold:450},
];

const THEMES = {
  pink:{bg:'#0f0008',a1:'#ff3d9a',a2:'#c77dff',name:'Rose Pink'},
  gold:{bg:'#0a0800',a1:'#ffb347',a2:'#ffd700',name:'Rose Gold'},
  lilac:{bg:'#08000f',a1:'#c77dff',a2:'#ff80cc',name:'Lilac Dream'},
  noir:{bg:'#050505',a1:'#ff6eb4',a2:'#e0e0e0',name:'Noir'},
};

const CATS = ['Beauty','Style','Glam','Confidence','Devotion','Self-Care','Dare','Flirty','Naughty'];
const CAT_COLOR = {Beauty:'#ff6eb4',Style:'#c77dff',Glam:'#ffb347',Confidence:'#ff4db8',Devotion:'#ff9bd2','Self-Care':'#90caf9',Dare:'#ff3d9a',Flirty:'#ff80cc',Naughty:'#ff4444'};
const CAT_ICON = {Beauty:'💄',Style:'👗',Glam:'✨',Confidence:'🦋',Devotion:'🩷','Self-Care':'💆',Dare:'📸',Flirty:'💋',Naughty:'😈'};
const CONF_EMOJI = ['💖','✨','🌸','💅','👑','🦋','💗','⭐','🎀','💎','🌟','🩷'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ctx tags: any=any day, gym=Mon/Wed/Fri only, out=any non-rest day, home=any day, ride=Tue/Sat/Sun, weekend=Sat/Sun, weekday=Mon-Fri
// Day map: mon=gym, tue=ride, wed=gym, thu=rest, fri=gym, sat=ride, sun=ride
const DAY_CONTEXTS = {mon:['gym','out','any','weekday'],tue:['ride','out','any','weekday'],wed:['gym','out','any','weekday'],thu:['home','any','weekday'],fri:['gym','out','any','weekday'],sat:['ride','out','any','weekend'],sun:['ride','out','any','weekend']};

const ONBOARDING_SLIDES = [
  {emoji:'💖',title:'Welcome to Glow Up',body:'This is your personal daily challenge app — built just for you by Sam. Every day you will get three challenges designed to help you become the most confident beautiful version of yourself. Open it every morning. Do the work. Watch yourself change.',btn:'Next'},
  {emoji:'✨',title:'Glow Points and Levels',body:'Every challenge you complete earns you Glow Points. Points unlock levels — from Rising Star all the way up to Icon. As you level up you unlock harder challenges and bigger rewards. This is your journey and every point you earn is yours.',btn:'Next'},
  {emoji:'💪',title:'Training and Nutrition',body:'The Training tab has your full weekly programme — gym sessions and rides. Complete sessions to earn Grind Points. The Nutrition tab has your full meal plan and water tracker. Together these tabs and your challenges build the whole picture.',btn:'Next'},
  {emoji:'✅',title:'Your Daily Rules',body:'The Rules tab has 12 non-negotiables — things like making your bed being in bed by 10:30 and hitting your water target. These are not optional. Tick them off every day. They build the foundation that everything else sits on.',btn:'Next'},
  {emoji:'🎁',title:'Rewards',body:'Earn enough Glow or Grind Points and you can spend them on rewards Sam has set for you. Some rewards are locked until you reach a certain level — work toward them. You have earned every single one.',btn:'Start my glow up 💖'},
];

const MILESTONE_MESSAGES = {
  streak7: {emoji:'🔥',title:'One Week Straight',msg:'Seven days in a row. Do you know how many people start something and give up before day 7? You did not. Sam is so proud of you. Keep going.'},
  streak14: {emoji:'💫',title:'Two Week Queen',msg:'Fourteen days. This is not a streak anymore — this is a habit. This is who you are becoming. Sam sees every single one of these days and he could not be more proud.'},
  streak30: {emoji:'👑',title:'Thirty Days Strong',msg:'Thirty days. A whole month of showing up for yourself every single day. You are not the same girl who started this. Sam loves you and he is watching you become incredible.'},
  glowLevel2: {emoji:'✨',title:'Glitter Girl',msg:'You have earned your first level up. Rising Star to Glitter Girl. You are building something real here — Sam can see it and it is beautiful. New challenges unlocked.'},
  glowLevel3: {emoji:'🔥',title:'That Girl',msg:'That Girl. You have actually become That Girl. Sam knew you would. Keep going — you are only getting better from here.'},
  glowLevel4: {emoji:'👑',title:'Main Character',msg:'Main Character energy. You have earned this completely. Sam is beyond proud of you. You show up every day and it shows. Icon is next.'},
  glowLevel5: {emoji:'💎',title:'Icon',msg:'Icon. You did it. From Rising Star to Icon — you built this with every challenge every rule every session. Sam loves you and he is so proud of the woman you are becoming.'},
  perfectWeek1: {emoji:'🏆',title:'Perfect Week',msg:'A perfect week. Every challenge every session every rule. Sam set this up hoping you would achieve something like this and you absolutely smashed it. Your points have been multiplied. You deserve every single one.'},
  challenges100: {emoji:'⭐',title:'100 Challenges',msg:'One hundred challenges completed. Every single one was a choice you made to show up for yourself. Sam notices every one of them. You are building something extraordinary.'},
  grindLevel3: {emoji:'🔥',title:'Athlete',msg:'Athlete level on Grind Points. Your body is changing because you are doing the work. Sam is proud of you every single session. Keep going.'},
  grindLevel6: {emoji:'💎',title:'Elite',msg:'Elite. The highest Grind level. You have done the sessions done the rides done the work. Sam is in awe of you. You are elite in every sense of the word.'},
};

const CHALLENGES = [
  // ── BEAUTY (48) ─────────────────────────────────────────────────────────────
  {id:'b01',emoji:'💄',title:'Lipgloss Before You Leave',description:'Apply lipgloss before you leave the house today. Every single time you go out — gloss on no exceptions.',category:'Beauty',level:1,ctx:'out'},
  {id:'b02',emoji:'💄',title:'Lipgloss Every Two Hours',description:'Set a reminder and reapply your lip product every two hours today. Glossy lips all day long.',category:'Beauty',level:1,ctx:'any'},
  {id:'b03',emoji:'💄',title:'Bold Lip Today',description:'Wear your boldest most pigmented lip colour today. All day. Do not wipe it off.',category:'Beauty',level:1,ctx:'any'},
  {id:'b04',emoji:'💄',title:'Lip Gloss All Day',description:'Your lip gloss stays on all day — reapply constantly. Glossy full feminine lips from morning to night.',category:'Beauty',level:1,ctx:'any'},
  {id:'b05',emoji:'💄',title:'Lip Liner First',description:'Before your lipgloss today apply lip liner first. Fuller more defined more polished. See the difference.',category:'Beauty',level:2,ctx:'any'},
  {id:'b06',emoji:'💄',title:'Red Lip Day',description:'Wear a red lip today — classic bold non-negotiable. The world is your runway. Own it.',category:'Beauty',level:2,ctx:'out'},
  {id:'b07',emoji:'💄',title:'Try a New Lip Colour',description:'Wear a lip colour you have never worn out before. Something sitting unused. Today is the day.',category:'Beauty',level:2,ctx:'any'},
  {id:'b08',emoji:'💄',title:'Winged Eyeliner Today',description:'Do a winged eyeliner look today — sharp precise and confident. Take your time and make it count.',category:'Beauty',level:2,ctx:'any'},
  {id:'b09',emoji:'💄',title:'Gloss Check Phone Check',description:'Every time you check your phone today reapply your lipgloss first. Phone check equals gloss check.',category:'Beauty',level:3,ctx:'any'},
  {id:'b10',emoji:'💄',title:'Perfect Your Wing',description:'Spend extra time perfecting your eyeliner wing today. One side then the other until they match beautifully.',category:'Beauty',level:3,ctx:'any'},
  {id:'b11',emoji:'👁',title:'False Lashes Today',description:'Apply false lashes today — natural strip or individual your choice. Put them on and own every moment.',hint:'Clean your lash band with micellar water first. Apply a thin layer of lash glue wait 30 seconds until tacky then press down from the centre outward. Tweezers help with placement.',category:'Beauty',level:3,ctx:'out'},
  {id:'b12',emoji:'👁',title:'Lashes and Liner Together',description:'Full lashes and a winged liner today. The classic combination. Spend time getting both right.',category:'Beauty',level:3,ctx:'out'},
  {id:'b13',emoji:'🌟',title:'Full Face Before Anything',description:'Do your full makeup look before you do anything else this morning. It sets the tone for the whole day.',category:'Beauty',level:1,ctx:'any'},
  {id:'b14',emoji:'🌟',title:'Makeup Even If Staying In',description:'Full face today even if you have nowhere to go. You are doing it for you not for anyone else.',category:'Beauty',level:1,ctx:'home'},
  {id:'b15',emoji:'🌟',title:'Mascara Non Negotiable',description:'Mascara goes on today before you do anything else. Even on a lazy day — mascara stays.',category:'Beauty',level:1,ctx:'any'},
  {id:'b16',emoji:'🌟',title:'Spend 30 Minutes on Makeup',description:'No rushing today — spend a full 30 minutes on your makeup. Enjoy every single step of it.',category:'Beauty',level:2,ctx:'any'},
  {id:'b17',emoji:'🌟',title:'Blush Placement Challenge',description:'Apply blush higher than usual today — more lifted more flushed. Notice how it lifts your whole face.',hint:'Smile lightly and apply blush to the apples but then blend upward toward your temples rather than outward. Higher placement lifts and looks more editorial than traditional application.',category:'Beauty',level:2,ctx:'any'},
  {id:'b18',emoji:'🌟',title:'Setting Spray to Finish',description:'Finish your makeup with a setting spray today. Glowy long-lasting polished. Never skip this step.',category:'Beauty',level:2,ctx:'any'},
  {id:'b19',emoji:'🌟',title:'Full Contour Today',description:'Foundation is not enough today. Contour highlight blush — the full sculpted look.',hint:'Use a matte bronzer two shades darker than your skin in the hollows of your cheeks temples and jawline. Blend upward. Then highlight on the tops of cheekbones bridge of nose and cupids bow.',category:'Beauty',level:3,ctx:'any'},
  {id:'b20',emoji:'🌟',title:'Highlighter Everywhere',description:'Apply highlighter to every point today — cheekbones inner corners tip of nose brow bone cupids bow.',category:'Beauty',level:3,ctx:'any'},
  {id:'b21',emoji:'🧴',title:'Skincare Routine Tonight',description:'Full skincare routine tonight — cleanser toner serum moisturiser eye cream. No skipping a single step.',category:'Beauty',level:1,ctx:'any'},
  {id:'b22',emoji:'🧴',title:'Morning Skincare First',description:'Full morning skincare routine before anything else today. Cleanser vitamin C serum moisturiser SPF. All of it.',category:'Beauty',level:1,ctx:'any'},
  {id:'b23',emoji:'🧴',title:'Face Mask Tonight',description:'Do a face mask tonight. Put on music lie down and spend real time on it. You deserve this.',category:'Beauty',level:1,ctx:'home'},
  {id:'b24',emoji:'🧴',title:'Gua Sha Ritual Tonight',description:'Do a 10 minute gua sha facial massage tonight after your skincare. Depuff sculpt and glow.',hint:'Apply facial oil first so the tool glides. Hold at a 15 degree angle and use upward outward strokes — never back and forth. Under jaw upward on cheeks outward on forehead. 5 strokes per area minimum.',category:'Beauty',level:3,ctx:'home'},
  {id:'b25',emoji:'🧴',title:'Eye Cream Morning and Night',description:'Apply eye cream morning and night today. Tap it in gently with your ring finger — never rub. Start the habit.',category:'Beauty',level:2,ctx:'any'},
  {id:'b26',emoji:'🧴',title:'Full Body Exfoliation Tonight',description:'Full body exfoliation in the shower tonight then moisturise all over while skin is still slightly damp. Wake up glowing.',category:'Beauty',level:2,ctx:'home'},
  {id:'b27',emoji:'💅',title:'Nails Done Today',description:'Your nails must always be painted and presentable. If they are not done right now fix that today. Bare nails are not an option.',category:'Beauty',level:1,ctx:'any'},
  {id:'b28',emoji:'💅',title:'Fresh Set Today',description:'Full fresh manicure today — remove old polish file shape base coat colour top coat. Take your time. Perfect finish.',category:'Beauty',level:2,ctx:'home'},
  {id:'b29',emoji:'💅',title:'French Tips Today',description:'Do a French tip manicure today — classic clean and ultra-feminine.',hint:'Use a thin brush or nail guides for the white tip. Apply in one curved stroke starting from one side. Two thin coats of white are better than one thick coat. Finish with a shiny top coat.',category:'Beauty',level:2,ctx:'home'},
  {id:'b30',emoji:'💅',title:'Nails and Lips Match',description:'Make sure your nails and lips are in the same colour family today. Head to toe intentionality.',category:'Beauty',level:3,ctx:'any'},
  {id:'b31',emoji:'💅',title:'Nail Care Today',description:'Nail oil on every nail morning and night today. File any rough edges. Cuticle oil applied every time you wash your hands.',category:'Beauty',level:1,ctx:'any'},
  {id:'b32',emoji:'🎀',title:'Brows Properly Done',description:'Spend real time on your brows today — fill shape and set them properly. Brows frame everything.',hint:'Brush hairs upward first. Use light feathery strokes with a brow pencil to fill sparse areas — never draw a solid line. Set with a clear or tinted brow gel brushed upward. Less is more.',category:'Beauty',level:1,ctx:'any'},
  {id:'b33',emoji:'🎀',title:'Blowdry Today',description:'Properly blowdry and style your hair today. No air drying no default bun. Give it the full treatment.',category:'Beauty',level:2,ctx:'any'},
  {id:'b34',emoji:'🎀',title:'Try a New Hairstyle',description:'Look up a style you have been meaning to try and do it today. It does not have to be perfect. Just do it.',category:'Beauty',level:2,ctx:'any'},
  {id:'b35',emoji:'🎀',title:'Hair Accessory Today',description:'Add a hair accessory today — a bow clip claw or headband. Cute intentional feminine.',category:'Beauty',level:1,ctx:'any'},
  {id:'b36',emoji:'🎀',title:'Curls or Waves Today',description:'Curl or wave your hair today — no straight or flat styles allowed. Bouncy voluminous beautiful.',category:'Beauty',level:2,ctx:'out'},
  {id:'b37',emoji:'🎀',title:'Hair Mask Tonight',description:'Put a deep conditioning hair mask in tonight. Leave it for 20 minutes then rinse. Silky healthy beautiful.',category:'Beauty',level:2,ctx:'home'},
  {id:'b38',emoji:'🎀',title:'Sleep Protective Style',description:'Sleep with your hair in a protective style tonight — plait braid or wrap. Your hair will thank you in the morning.',category:'Beauty',level:1,ctx:'any'},
  {id:'b39',emoji:'🌸',title:'Perfume Before You Leave',description:'Apply your perfume before you leave today. Wrists neck and hair. Every single time without exception.',category:'Beauty',level:1,ctx:'out'},
  {id:'b40',emoji:'🌸',title:'Reapply After Lunch',description:'Reapply your perfume after lunch today. Leave a trail wherever you go.',category:'Beauty',level:2,ctx:'any'},
  {id:'b41',emoji:'✨',title:'Moisturise Your Body',description:'After your shower today moisturise your entire body — arms legs everywhere. Take your time doing it.',category:'Beauty',level:1,ctx:'any'},
  {id:'b42',emoji:'✨',title:'Body Glow Today',description:'Apply a shimmer body lotion or oil to your arms and legs today. Catch the light everywhere you go.',category:'Beauty',level:3,ctx:'out'},
  {id:'b43',emoji:'✨',title:'Fake Tan Today',description:'Apply fake tan today — legs arms wherever needs it. You deserve to glow even when the sun is not out.',hint:'Exfoliate and shave the day before — never same day. Apply moisturiser to knees elbows and ankles first. Use a mitt and work in circular motions. Blend edges thoroughly. Wait 10 minutes before dressing.',category:'Beauty',level:2,ctx:'home'},
  {id:'b44',emoji:'🌟',title:'Primer Before Foundation',description:'Apply primer before your foundation today and let it set for 2 minutes. Watch how much longer your makeup lasts.',hint:'Use a silicone primer for pores and longevity or a hydrating primer if your skin is dry. Apply a pea-sized amount all over and wait 2 minutes. Your makeup will look better all day.',category:'Beauty',level:2,ctx:'any'},
  {id:'b45',emoji:'🌟',title:'Bake Your Under Eyes',description:'Bake your under eyes today for a flawless finish that lasts all day.',hint:'Apply concealer and pat dry loose setting powder generously under your eyes. Leave it to bake for 5 minutes while you do the rest of your face then dust off with a fluffy brush. Crease-proof all day.',category:'Beauty',level:3,ctx:'any'},
  {id:'b46',emoji:'🌟',title:'Eyeshadow Today',description:'Wear eyeshadow today even if just a wash of colour. Your eyes deserve attention beyond mascara.',hint:'A wash of shimmer on your lid with a slightly deeper shade in the crease takes 2 minutes. Blend blend blend — there are no harsh lines in good eyeshadow. Start lighter than you think you need.',category:'Beauty',level:2,ctx:'any'},
  {id:'b47',emoji:'🌟',title:'Lip Scrub Then Gloss',description:'Use a lip scrub before your lip product today. Smooth plump and ready for colour.',hint:'Mix a tiny bit of sugar with coconut oil or honey and scrub gently in circles for 30 seconds. Rinse off then apply a hydrating balm. Wait 2 minutes then apply your lip product over the top.',category:'Beauty',level:1,ctx:'any'},
  {id:'b48',emoji:'🌟',title:'Try a Completely New Look',description:'Try a completely new makeup look today — something outside your usual. Be bold. Be different. Have fun.',category:'Beauty',level:4,ctx:'any'},
  // ── STYLE (22) ───────────────────────────────────────────────────────────────
  {id:'s01',emoji:'👗',title:'Always Feminine',description:'Wear something feminine today — skirt dress or something unmistakably girly. No default jeans unless they are tight and cute.',category:'Style',level:1,ctx:'out'},
  {id:'s02',emoji:'👗',title:'Skirt or Dress Today',description:'No trousers today — wear a skirt or dress. Full stop.',category:'Style',level:1,ctx:'out'},
  {id:'s03',emoji:'👗',title:'Your Favourite Outfit Today',description:'Wear your absolute favourite outfit today for no reason at all. Today is reason enough.',category:'Style',level:1,ctx:'any'},
  {id:'s04',emoji:'👗',title:'Prettiest Underwear',description:'Wear your nicest matching underwear set today even if no one sees it. This one is just for you — and that is the point.',category:'Style',level:1,ctx:'any'},
  {id:'s05',emoji:'👗',title:'Dress Like You Might Run Into Someone',description:'Get dressed today like you might run into someone important — because you might. No leaving the house looking anything less than incredible.',category:'Style',level:1,ctx:'out'},
  {id:'s06',emoji:'👗',title:'Add One Accessory',description:'Add one accessory you would usually skip — a necklace bracelet hair clip or belt. Always one more thing.',category:'Style',level:1,ctx:'any'},
  {id:'s07',emoji:'👗',title:'Wear Something Sparkly',description:'Sequins shimmer sparkle — wear something that catches the light today. No occasion is too small.',category:'Style',level:2,ctx:'out'},
  {id:'s08',emoji:'👗',title:'Wear Your Nicest Shoes',description:'Choose your prettiest or most feminine shoes today even for the most ordinary tasks.',category:'Style',level:2,ctx:'out'},
  {id:'s09',emoji:'👗',title:'Activewear Ban',description:'No activewear outside the gym today. Get dressed properly. Leggings are not an outfit unless you are training.',category:'Style',level:2,ctx:'out'},
  {id:'s10',emoji:'👗',title:'Wear a Bow',description:'Put a bow in your hair or on your outfit today. Fully committed fully cute.',category:'Style',level:2,ctx:'any'},
  {id:'s11',emoji:'👗',title:'Outfit Planned the Night Before',description:'Before you go to bed tonight lay out your complete outfit for tomorrow — clothes shoes accessories underwear. All of it.',category:'Style',level:2,ctx:'any'},
  {id:'s12',emoji:'👗',title:'Show Off Your Figure',description:'No hiding today. Wear something that shows off your shape and feel completely amazing in it.',category:'Style',level:3,ctx:'out'},
  {id:'s13',emoji:'👗',title:'Heels All Day',description:'Wear heels or your most feminine shoes for a full outing today. No switching to flats.',category:'Style',level:3,ctx:'out'},
  {id:'s14',emoji:'👗',title:'Jewellery Stack Today',description:'Stack your rings layer your necklaces pile on the bracelets. More is more today.',category:'Style',level:3,ctx:'any'},
  {id:'s15',emoji:'👗',title:'All One Colour',description:'Wear all one colour today — all pink all cream all white all black. Committed and intentional.',category:'Style',level:3,ctx:'out'},
  {id:'s16',emoji:'👗',title:'Wear Something You Have Been Saving',description:'That piece you are waiting for a special occasion to wear. Today is the occasion. Stop waiting.',category:'Style',level:3,ctx:'out'},
  {id:'s17',emoji:'👗',title:'Everything Fits Perfectly',description:'Every single thing you wear today fits perfectly — nothing baggy nothing hiding nothing you settled for.',category:'Style',level:3,ctx:'out'},
  {id:'s18',emoji:'👗',title:'Most Daring Outfit',description:'The outfit that feels like too much — wear it today for the most ordinary task on your list.',category:'Style',level:4,ctx:'out'},
  {id:'s19',emoji:'👗',title:'Mini Skirt Day',description:'Mini skirt today — with tights boots or heels whatever works. Short feminine and completely confident.',category:'Style',level:3,ctx:'out'},
  {id:'s20',emoji:'👗',title:'Corset or Waist Cincher',description:'Wear a corset or waist-cinching piece today — define that waist. Wear it proudly.',category:'Style',level:3,ctx:'out'},
  {id:'s21',emoji:'👗',title:'Monochrome Pink',description:'All pink today — top to bottom as much as possible. Different shades textures whatever you have. Fully committed.',category:'Style',level:3,ctx:'out'},
  {id:'s22',emoji:'👗',title:'Buy Something New',description:'Buy one new piece of clothing today that makes you feel incredible. Something that makes your heart do a little thing when you put it on.',category:'Style',level:4,ctx:'out'},
  // ── GLAM (14) ────────────────────────────────────────────────────────────────
  {id:'g01',emoji:'✨',title:'Full Package Before You Leave',description:'Hair done makeup done outfit intentional perfume on nails done. Every single time you leave the house. All five. Non-negotiable.',category:'Glam',level:2,ctx:'out'},
  {id:'g02',emoji:'✨',title:'One More Thing',description:'Before you leave the house look in the mirror and add one extra thing. A necklace a spritz a lip liner. Always one more.',category:'Glam',level:1,ctx:'out'},
  {id:'g03',emoji:'✨',title:'Lipgloss After Every Meal',description:'Touch up your lip product after every single meal today without fail. Gloss on before you leave the table.',category:'Glam',level:2,ctx:'any'},
  {id:'g04',emoji:'✨',title:'Never Be Caught Undone',description:'You will not be caught looking undone today. Hair lips outfit — check everything before you go anywhere.',category:'Glam',level:2,ctx:'out'},
  {id:'g05',emoji:'✨',title:'Good Jewellery Today',description:'Do not wear the everyday studs — wear the good jewellery. The pieces you save for occasions. Today is the occasion.',category:'Glam',level:3,ctx:'any'},
  {id:'g06',emoji:'✨',title:'Shimmer Somewhere',description:'Add a shimmer glitter or metallic product somewhere in your look today. Catch the light everywhere.',category:'Glam',level:2,ctx:'any'},
  {id:'g07',emoji:'✨',title:'Smell Incredible All Day',description:'Before any interaction today — shop coffee friend anyone — make sure you smell completely incredible. Reapply every time.',category:'Glam',level:2,ctx:'any'},
  {id:'g08',emoji:'✨',title:'Hair Always Done',description:'You do not leave the house with your hair undone. Ever. Today is a reminder. Blowdry style set — then go.',category:'Glam',level:2,ctx:'out'},
  {id:'g09',emoji:'✨',title:'Glam on a Weekday',description:'Today is not a special day. Do full glam anyway. Because you feel like it and because you can.',category:'Glam',level:3,ctx:'weekday'},
  {id:'g10',emoji:'✨',title:'Touch Up in Public',description:'Touch up your makeup mid-day in public today — lipgloss powder whatever. Openly confidently without hiding.',category:'Glam',level:4,ctx:'out'},
  {id:'g11',emoji:'✨',title:'Full Glam for Something Ordinary',description:'Grocery run coffee walk — full glam for the most ordinary task on your list. Dressed like you are going somewhere important.',category:'Glam',level:4,ctx:'out'},
  {id:'g12',emoji:'✨',title:'Lashes and Lips Every Day',description:'Full lashes and a proper lip product today. The two things that transform a face instantly. Never skip them.',category:'Glam',level:3,ctx:'any'},
  {id:'g13',emoji:'✨',title:'Mirror Check Every Room',description:'Every time you pass a mirror today check yourself — hair lips outfit. Fix anything that needs fixing. Always polished.',category:'Glam',level:3,ctx:'any'},
  {id:'g14',emoji:'✨',title:'You Are Always Camera Ready',description:'Walk around today as if someone might photograph you at any moment. Look that good all day long. Every moment.',category:'Glam',level:5,ctx:'out'},
  // ── CONFIDENCE (20) ──────────────────────────────────────────────────────────
  {id:'c01',emoji:'🦋',title:'Mirror Moment',description:'Spend 10 minutes looking at yourself in the mirror and find 5 things you genuinely love about what you see. Say them out loud.',category:'Confidence',level:1,ctx:'any'},
  {id:'c02',emoji:'🦋',title:'Wear Something That Shows Your Figure',description:'Wear something that shows your figure today and catch every reflection confidently. Do not adjust it or cover up once.',category:'Confidence',level:1,ctx:'out'},
  {id:'c03',emoji:'🦋',title:'Own Every Room',description:'Today you walk into every space knowing you are the most attractive woman in it. Not arrogant. Just certain.',category:'Confidence',level:2,ctx:'out'},
  {id:'c04',emoji:'🦋',title:'Enjoy Being Looked At',description:'Every time you notice someone look at you today let yourself enjoy it. Do not shrink. Do not look away first. You look beautiful and you know it.',category:'Confidence',level:3,ctx:'out'},
  {id:'c05',emoji:'🦋',title:'No Hiding Today',description:'Wear something that shows skin or your shape and do not pull it down cross your arms or apologise for it once.',category:'Confidence',level:3,ctx:'out'},
  {id:'c06',emoji:'🦋',title:'Wear the Outfit You Talked Yourself Out Of',description:'You know the one. The one you decided was too much. Wear it today for something completely ordinary and notice how nothing bad happens.',category:'Confidence',level:2,ctx:'out'},
  {id:'c07',emoji:'🦋',title:'Post a Photo Without Overthinking',description:'Take a photo post it and do not spend 30 minutes deciding. You look good. Post it. Move on.',category:'Confidence',level:3,ctx:'any'},
  {id:'c08',emoji:'🦋',title:'Walk In Like You Own It',description:'Every room you walk into today — pause at the door for one beat then walk in like you belong there more than anyone.',category:'Confidence',level:2,ctx:'out'},
  {id:'c09',emoji:'🦋',title:'Get Ready Like Someone Will See You',description:'Get ready this morning like you are going to be seen — even if you are staying in. The act of showing up for yourself changes everything.',category:'Confidence',level:1,ctx:'any'},
  {id:'c10',emoji:'🦋',title:'Gym Without Caring',description:'Go to the gym today and do not think once about what anyone thinks of you. You are there to build your body. That is all that matters.',category:'Confidence',level:2,ctx:'gym'},
  {id:'c11',emoji:'🦋',title:'Do It Without Asking',description:'Do one thing today that you would normally ask for reassurance about first. Make the decision yourself. Trust yourself completely.',category:'Confidence',level:3,ctx:'any'},
  {id:'c12',emoji:'🦋',title:'Stop the Spiral',description:'The next time you catch yourself overthinking today — stop. Take one breath. Make a choice. Move on. Confidence is a decision not a feeling.',category:'Confidence',level:2,ctx:'any'},
  {id:'c13',emoji:'🦋',title:'Wear Something Powerful',description:'Wear something today that makes you feel completely powerful and go about your day totally normally. Let the confidence come from inside.',category:'Confidence',level:2,ctx:'out'},
  {id:'c14',emoji:'🦋',title:'Body Ritual',description:'Moisturise your entire body slowly and deliberately after your shower today. Touch every part of yourself with care. You are beautiful.',category:'Confidence',level:1,ctx:'any'},
  {id:'c15',emoji:'🦋',title:'Compliment Yourself Out Loud',description:'Every time you pass a mirror today say something genuinely complimentary about yourself out loud. Not in your head. Out loud.',category:'Confidence',level:1,ctx:'any'},
  {id:'c16',emoji:'🦋',title:'Sit With It',description:'The next time you feel uncomfortable or anxious today do not reach for your phone. Sit with the feeling for 5 minutes. Let it pass.',category:'Confidence',level:3,ctx:'any'},
  {id:'c17',emoji:'🦋',title:'Dress to Be Undressed',description:'Choose your outfit today with one thought — looking incredible when it comes off. Matching underwear everything deliberate. Just for you.',category:'Confidence',level:4,ctx:'any'},
  {id:'c18',emoji:'🦋',title:'Take Up Space',description:'Sit spread out speak clearly hold eye contact take your time. You are not too much. You are not in the way. Take up all the space you deserve.',category:'Confidence',level:3,ctx:'any'},
  {id:'c19',emoji:'🦋',title:'Crop Top at the Gym',description:'Wear a crop top or something revealing to the gym today. Train in it. Do not think about it once. Your body is working and it deserves to be seen.',category:'Confidence',level:3,ctx:'gym'},
  {id:'c20',emoji:'🦋',title:'Introduce Yourself',description:'Introduce yourself to someone new today — at the gym the coffee shop anywhere. Smile make eye contact say your name. That is all it takes.',category:'Confidence',level:3,ctx:'out'},
  // ── DARE (18) ────────────────────────────────────────────────────────────────
  {id:'da01',emoji:'📸',title:'Go to the Gym Alone',description:'Go to the gym completely alone today and do your full session without needing anyone there. You do not need company to show up for yourself.',category:'Dare',level:1,ctx:'gym'},
  {id:'da02',emoji:'📸',title:'Take a Confident Selfie',description:'Take 10 selfies and keep your favourite without deleting them all. At least one stays. You look good and you know it.',category:'Dare',level:1,ctx:'any'},
  {id:'da03',emoji:'📸',title:'Wear Bold to Do the Boring',description:'Wear your most glamorous outfit for the most boring task today. Grocery run petrol post office. The supermarket is your runway.',category:'Dare',level:2,ctx:'out'},
  {id:'da04',emoji:'📸',title:'Post a Confident Photo',description:'Post a photo today without a heavy filter without checking it 50 times and without deleting it an hour later.',category:'Dare',level:2,ctx:'any'},
  {id:'da05',emoji:'📸',title:'Go Somewhere Alone',description:'Go somewhere today completely alone — a coffee shop a walk a restaurant. No phone in your hand. Just you comfortable in your own company.',category:'Dare',level:2,ctx:'out'},
  {id:'da06',emoji:'📸',title:'Wear What You Normally Talk Yourself Out Of',description:'Too short too tight too much too bright. Whatever you always put back. Wear it today. Notice how nothing bad happens.',category:'Dare',level:3,ctx:'out'},
  {id:'da07',emoji:'📸',title:'Fully Glam for Something Ordinary',description:'Get completely glam and go somewhere completely ordinary. Act like this is perfectly normal. Because it is.',category:'Dare',level:3,ctx:'out'},
  {id:'da08',emoji:'📸',title:'Speak First',description:'In every group situation today be the first one to speak. Start the conversation ask the question give the opinion. Your voice goes first.',category:'Dare',level:2,ctx:'out'},
  {id:'da09',emoji:'📸',title:'Do the Thing You Have Been Avoiding',description:'You know exactly what it is. The thing you have been pushing back for days. Do it today all of it before anything else.',category:'Dare',level:3,ctx:'any'},
  {id:'da10',emoji:'📸',title:'Home Photoshoot',description:'Set up a photoshoot at home — 5 different outfits photographed properly. Keep every single photo. No deleting.',category:'Dare',level:3,ctx:'home'},
  {id:'da11',emoji:'📸',title:'Order Without Looking at the Menu',description:'Order your food or coffee today without looking at the menu. Know what you want say it clearly make eye contact smile.',category:'Dare',level:2,ctx:'out'},
  {id:'da12',emoji:'📸',title:'Do It Uncomfortable',description:'Do one thing today that you do not feel ready for. Do not wait until you feel ready. You never will. Just go.',category:'Dare',level:3,ctx:'any'},
  {id:'da13',emoji:'📸',title:'Strut Everywhere Today',description:'Walk with a deliberate confident strut everywhere you go today. Every corridor car park shop aisle. All of it.',category:'Dare',level:3,ctx:'out'},
  {id:'da14',emoji:'📸',title:'Make a Decision in 60 Seconds',description:'Every decision you face today gets 60 seconds maximum. Decide. Commit. Move on. No going back no second guessing.',category:'Dare',level:3,ctx:'any'},
  {id:'da15',emoji:'📸',title:'Ask for Exactly What You Want',description:'In every situation today where you want something ask for it directly. No hinting no hedging. Just ask. Directly.',category:'Dare',level:4,ctx:'any'},
  {id:'da16',emoji:'📸',title:'Gym Selfie Mid Session',description:'Take a gym selfie mid-session and post it. You showed up you are doing the work. Let it be seen.',category:'Dare',level:2,ctx:'gym'},
  {id:'da17',emoji:'📸',title:'No Social Media All Day',description:'Go a full day without opening any social media at all. Be in your own life. Notice how much more present you feel.',category:'Dare',level:3,ctx:'any'},
  {id:'da18',emoji:'📸',title:'Eat Alone in a Restaurant',description:'Go to a restaurant or cafe today completely alone and sit in. No phone on the table. Just you enjoying your own company.',category:'Dare',level:4,ctx:'out'},
  // ── SELF-CARE (12) ───────────────────────────────────────────────────────────
  {id:'e01',emoji:'💆',title:'Treat Yourself Today',description:'Buy yourself something small and lovely today — a nice coffee fresh flowers chocolate. You do not need a reason.',category:'Self-Care',level:1,ctx:'out'},
  {id:'e02',emoji:'💆',title:'Pamper Night Tonight',description:'Tonight face mask candles favourite playlist. Full princess treatment for at least an hour. No rushing no phone.',category:'Self-Care',level:1,ctx:'home'},
  {id:'e03',emoji:'💆',title:'Full Skincare Before Bed',description:'Clean skin full routine bed feeling gorgeous. Do not skip a single step tonight.',category:'Self-Care',level:1,ctx:'any'},
  {id:'e04',emoji:'💆',title:'Journal Tonight',description:'Write without stopping for 10 minutes tonight about whatever is in your head. Do not edit yourself. Just write.',category:'Self-Care',level:1,ctx:'home'},
  {id:'e05',emoji:'💆',title:'Slow Luxurious Morning',description:'Give yourself a slow luxurious morning today. Favourite playlist no rushing full routine. Today you take your time.',category:'Self-Care',level:2,ctx:'any'},
  {id:'e06',emoji:'💆',title:'Proper Bath Tonight',description:'Bubbles candles oils music. At least 30 minutes. Phone in another room. Just you. Fully present in it.',category:'Self-Care',level:2,ctx:'home'},
  {id:'e07',emoji:'💆',title:'Rest Without Guilt',description:'Take a real rest today — nap lie down be still. No guilt. No productivity. Just rest. You have earned it.',category:'Self-Care',level:2,ctx:'home'},
  {id:'e08',emoji:'💆',title:'Light a Candle Today',description:'Light your favourite candle while you get ready or relax today. Make the ordinary feel like something.',category:'Self-Care',level:1,ctx:'any'},
  {id:'e09',emoji:'💆',title:'Solo Date',description:'Take yourself somewhere nice today — a cafe a walk a beautiful shop. Dressed up. Alone. Enjoying your own company.',category:'Self-Care',level:4,ctx:'out'},
  {id:'e10',emoji:'💆',title:'30 Minutes of Stretching',description:'Spend 30 minutes stretching tonight — full body properly held stretches. Your body does so much for you. Give back to it.',category:'Self-Care',level:2,ctx:'home'},
  {id:'e11',emoji:'💆',title:'Read Tonight',description:'Read for 30 minutes tonight instead of scrolling. Something you have been meaning to start. Phone in another room.',category:'Self-Care',level:1,ctx:'home'},
  {id:'e12',emoji:'💆',title:'Fresh Flowers Today',description:'Buy yourself fresh flowers today — for no reason other than you deserve beautiful things around you.',category:'Self-Care',level:1,ctx:'out'},
  // ── DEVOTION (15) ────────────────────────────────────────────────────────────
  {id:'dv01',emoji:'🩷',title:'Good Morning First',description:'Send him a good morning message before you look at anything else on your phone today. He gets the first thing you do.',category:'Devotion',level:1,ctx:'any'},
  {id:'dv02',emoji:'🩷',title:'Tell Him Your Plans',description:'Before you start your day tell him what you are doing today. All of it. Let him feel like he is part of your day even from a distance.',category:'Devotion',level:1,ctx:'any'},
  {id:'dv03',emoji:'🩷',title:'Photo Before You Leave',description:'Send him a photo of how you look before you leave the house today. He should see you looking beautiful every single day.',category:'Devotion',level:1,ctx:'out'},
  {id:'dv04',emoji:'🩷',title:'Check In Every 2 Hours',description:'Send him a message every 2 hours today just to let him know what you are doing and that you are thinking about him.',category:'Devotion',level:1,ctx:'any'},
  {id:'dv05',emoji:'🩷',title:'Tell Him Three Times',description:'Tell him three times today that you are thinking about him. Unprompted specific genuine. Not just an emoji.',category:'Devotion',level:1,ctx:'any'},
  {id:'dv06',emoji:'🩷',title:'Ask What to Wear',description:'Ask him what he wants you to wear today and wear it without question. No negotiating. His choice your body.',category:'Devotion',level:2,ctx:'any'},
  {id:'dv07',emoji:'🩷',title:'Reply Within 10 Minutes',description:'Reply to every single one of his messages within 10 minutes today. No exceptions. He is your priority.',category:'Devotion',level:2,ctx:'any'},
  {id:'dv08',emoji:'🩷',title:'Complete Everything Today',description:'Complete every single challenge today and send him proof. All of them. Show him you are taking this seriously.',category:'Devotion',level:2,ctx:'any'},
  {id:'dv09',emoji:'🩷',title:'Do Not Question It',description:'If he gives you any instruction today do it without questioning it once. Trust him. That is what devotion looks like.',category:'Devotion',level:2,ctx:'any'},
  {id:'dv10',emoji:'🩷',title:'Cook or Prepare Something',description:'Cook or prepare something for him before his next visit. Something he will love. Think about him the whole time you make it.',category:'Devotion',level:2,ctx:'home'},
  {id:'dv11',emoji:'🩷',title:'Voice Note',description:'Send him a voice note today instead of a text. Let him hear your voice. Tell him something you would only ever say to him.',category:'Devotion',level:2,ctx:'any'},
  {id:'dv12',emoji:'🩷',title:'Something You Have Never Said',description:'Tell him something today that you have never told him before. Something real. Something that took courage to say.',category:'Devotion',level:3,ctx:'any'},
  {id:'dv13',emoji:'🩷',title:'Plan Your Next Visit',description:'Send him dates ideas and plans for your next visit today. Be specific. Show him you are as excited to see him as he is to see you.',category:'Devotion',level:2,ctx:'any'},
  {id:'dv14',emoji:'🩷',title:'Remind Yourself Who You Belong To',description:'Three times today say out loud that you are his. In the mirror alone. Mean it every time.',category:'Devotion',level:3,ctx:'any'},
  {id:'dv15',emoji:'🩷',title:'His Permission',description:'Ask his permission before making any decision today — even small ones. Let him be in control. See how it feels.',category:'Devotion',level:4,ctx:'any'},
  // ── FLIRTY (12) ──────────────────────────────────────────────────────────────
  {id:'f01',emoji:'💋',title:'Send Something He Cannot Forget',description:'Send him a photo today that he will not be able to stop thinking about. You decide what that means. Make it count.',category:'Flirty',level:2,ctx:'any'},
  {id:'f02',emoji:'💋',title:'Tell Him What You Want',description:'Text him exactly what you want him to do to you the next time you see him. In detail. Do not be shy about it.',category:'Flirty',level:2,ctx:'any'},
  {id:'f03',emoji:'💋',title:'Wear Something Dangerous',description:'Wear something today that would make him completely lose focus if he saw you in it. Then tell him what you are wearing.',category:'Flirty',level:2,ctx:'out'},
  {id:'f04',emoji:'💋',title:'Go Quiet Then Come Back',description:'Be completely unavailable for one hour today — no replies. Then come back looking incredible and act like nothing happened.',category:'Flirty',level:3,ctx:'any'},
  {id:'f05',emoji:'💋',title:'No Words Just a Photo',description:'Send him one message today with absolutely no words. Just a photo. Let him figure out the rest.',category:'Flirty',level:3,ctx:'any'},
  {id:'f06',emoji:'💋',title:'Red Everything',description:'Wear as much red as possible today — lips nails outfit whatever you can. Red is a message. Send it.',category:'Flirty',level:2,ctx:'out'},
  {id:'f07',emoji:'💋',title:'Think About Him Every Hour',description:'Think about him every single hour today. At the end of the day tell him that you did and what you were thinking.',category:'Flirty',level:2,ctx:'any'},
  {id:'f08',emoji:'💋',title:'Make Him Feel Lucky',description:'Make him feel like the luckiest man alive in one message before midday. Mean every word of it.',category:'Flirty',level:2,ctx:'any'},
  {id:'f09',emoji:'💋',title:'Wear His Favourite',description:'Wear his favourite thing on you today — the outfit the perfume the underwear. Whatever makes him lose his mind.',category:'Flirty',level:2,ctx:'any'},
  {id:'f10',emoji:'💋',title:'Send Proof Before You Leave',description:'Do your full hair and makeup and send him proof before you leave. He should see what everyone else gets to see.',category:'Flirty',level:1,ctx:'out'},
  {id:'f11',emoji:'💋',title:'Eye Contact Too Long',description:'Maintain eye contact with someone today a beat longer than feels natural. Hold it. Smile slowly. Walk away first.',category:'Flirty',level:3,ctx:'out'},
  {id:'f12',emoji:'💋',title:'Leave While You Are Winning',description:'If you are out today leave before the night ends while you are still the most interesting person there.',category:'Flirty',level:4,ctx:'out'},
  // ── NAUGHTY (25) — only shown when admin activates naughty mode ───────────────
  {id:'n01',emoji:'😈',title:'Wear Matching Lingerie All Day',description:'Wear a matching lingerie set under your outfit today and do not tell him until the end of the day. Then tell him exactly what you were wearing.',category:'Naughty',level:1,ctx:'any'},
  {id:'n02',emoji:'😈',title:'Sleep in Nothing',description:'Sleep in absolutely nothing tonight. Tell him before you go to bed.',category:'Naughty',level:1,ctx:'any'},
  {id:'n03',emoji:'😈',title:'Send a Photo With No Caption',description:'Take a mirror selfie in just your underwear and send it to him with absolutely no caption. Let him respond.',category:'Naughty',level:2,ctx:'any'},
  {id:'n04',emoji:'😈',title:'Tell Him Your Fantasies',description:'Write out your three biggest fantasies and send them to him today. All three. Do not leave anything out.',category:'Naughty',level:2,ctx:'any'},
  {id:'n05',emoji:'😈',title:'Nothing Under Your Outfit',description:'Wear nothing under your outfit today. Go about your day completely normally. Tell him at the end of the day.',category:'Naughty',level:2,ctx:'out'},
  {id:'n06',emoji:'😈',title:'Voice Note',description:'Record a voice note telling him in detail what you are thinking about right now. Send it. Do not re-record it.',category:'Naughty',level:2,ctx:'any'},
  {id:'n07',emoji:'😈',title:'Send a Video',description:'Send him a video today — face included. Just for him. Something he will want to watch more than once.',category:'Naughty',level:3,ctx:'any'},
  {id:'n08',emoji:'😈',title:'Edge Yourself',description:'Edge yourself thinking about him today and do not finish without his permission. Tell him what you did.',category:'Naughty',level:3,ctx:'home'},
  {id:'n09',emoji:'😈',title:'Ask Permission',description:'Ask his permission before you orgasm today. If you cannot reach him you wait. No exceptions.',category:'Naughty',level:3,ctx:'any'},
  {id:'n10',emoji:'😈',title:'Do Not Touch Yourself',description:'Do not touch yourself today unless he says you can. Tell him at the end of the day that you did not.',category:'Naughty',level:3,ctx:'any'},
  {id:'n11',emoji:'😈',title:'Send Something Every Hour',description:'Send him a photo every hour for 3 hours today. Each one slightly more than the last.',category:'Naughty',level:3,ctx:'any'},
  {id:'n12',emoji:'😈',title:'His Task This Morning',description:'Ask him to set you a task first thing this morning and complete it before midday. No excuses. No negotiating.',category:'Naughty',level:3,ctx:'any'},
  {id:'n13',emoji:'😈',title:'Write What You Want Him to Do',description:'Write out in detail exactly what you want him to do to you next time you see him and send it. Every detail.',category:'Naughty',level:3,ctx:'any'},
  {id:'n14',emoji:'😈',title:'Call Tonight',description:'Have a phone call with him tonight where you do exactly what he tells you to do. No questions.',category:'Naughty',level:4,ctx:'home'},
  {id:'n15',emoji:'😈',title:'Stay on the Phone',description:'Stay on the phone with him tonight until he says you can go. However long that is.',category:'Naughty',level:3,ctx:'home'},
  {id:'n16',emoji:'😈',title:'Do Not Touch All Week',description:'Do not touch yourself at all until he visits. Tell him every day that you have not. Let the anticipation build.',category:'Naughty',level:4,ctx:'any'},
  {id:'n17',emoji:'😈',title:'Call Him Sir',description:'Refer to him as sir in every single message today. Every one. Do not break it once.',category:'Naughty',level:3,ctx:'any'},
  {id:'n18',emoji:'😈',title:'Yes to Everything',description:'Whatever he asks for tonight the answer is yes. No hesitation. No negotiating.',category:'Naughty',level:4,ctx:'home'},
  {id:'n19',emoji:'😈',title:'He Picks Your Outfit',description:'He picks your outfit for today including your underwear. You wear exactly what he says without question.',category:'Naughty',level:3,ctx:'out'},
  {id:'n20',emoji:'😈',title:'24 Hours of Yes',description:'For the next 24 hours you do exactly what he asks without questioning it once. Trust him completely.',category:'Naughty',level:5,ctx:'any'},
  {id:'n21',emoji:'😈',title:'Send Proof',description:'Send him proof of every single challenge completed today. Every one. Show him you are taking this seriously.',category:'Naughty',level:2,ctx:'any'},
  {id:'n22',emoji:'😈',title:'Touch Yourself Thinking of Him',description:'Touch yourself thinking about him today and tell him about it afterwards in detail.',category:'Naughty',level:3,ctx:'home'},
  {id:'n23',emoji:'😈',title:'Buy Something New',description:'Buy something new to wear for him before his next visit. Send him a photo of it. Let him look forward to it.',category:'Naughty',level:2,ctx:'out'},
  {id:'n24',emoji:'😈',title:'You Belong to Him',description:'Say out loud every time you look in the mirror today that you belong to him. Every single time.',category:'Naughty',level:3,ctx:'any'},
  {id:'n25',emoji:'😈',title:'His Orgasms This Week',description:'Ask him to own your orgasms for the rest of this week. He decides when. You ask every time.',category:'Naughty',level:5,ctx:'any'},
];

const ACHIEVEMENTS = [
  {id:'a1',emoji:'🌸',title:'First Step',desc:'Complete your first challenge',check:function(s){return s.glowPoints>=10;}},
  {id:'a2',emoji:'💅',title:'Getting Into It',desc:'100 Glow Points earned',check:function(s){return s.glowPoints>=100;}},
  {id:'a3',emoji:'✨',title:'On a Roll',desc:'250 Glow Points earned',check:function(s){return s.glowPoints>=250;}},
  {id:'a4',emoji:'👑',title:'Glow Queen',desc:'500 Glow Points earned',check:function(s){return s.glowPoints>=500;}},
  {id:'a5',emoji:'🔥',title:'On Fire',desc:'3 day challenge streak',check:function(s){return s.streak>=3;}},
  {id:'a6',emoji:'🌟',title:'Week Warrior',desc:'7 day challenge streak',check:function(s){return s.streak>=7;}},
  {id:'a7',emoji:'💖',title:'Two Week Queen',desc:'14 day challenge streak',check:function(s){return s.streak>=14;}},
  {id:'a8',emoji:'💄',title:'Beauty Habit',desc:'10 Beauty challenges done',check:function(s){return (s.cats.Beauty||0)>=10;}},
  {id:'a9',emoji:'🦋',title:'Body Queen',desc:'10 Confidence challenges done',check:function(s){return (s.cats.Confidence||0)>=10;}},
  {id:'a10',emoji:'📸',title:'Dare Devil',desc:'5 Dare challenges done',check:function(s){return (s.cats.Dare||0)>=5;}},
  {id:'a11',emoji:'💪',title:'First Session',desc:'Complete your first training session',check:function(s){return s.grindPoints>=20;}},
  {id:'a12',emoji:'🏋',title:'Gym Regular',desc:'250 Grind Points earned',check:function(s){return s.grindPoints>=250;}},
  {id:'a13',emoji:'⭐',title:'Perfect Week',desc:'Complete a perfect week',check:function(s){return (s.perfectWeeks||0)>=1;}},
  {id:'a14',emoji:'🎯',title:'Unstoppable',desc:'3 perfect weeks',check:function(s){return (s.perfectWeeks||0)>=3;}},
  {id:'a15',emoji:'🩷',title:'Devoted',desc:'10 Devotion challenges done',check:function(s){return (s.cats.Devotion||0)>=10;}},
  {id:'a16',emoji:'💋',title:'Flirt',desc:'5 Flirty challenges done',check:function(s){return (s.cats.Flirty||0)>=5;}},
  {id:'a17',emoji:'😈',title:'Naughty Girl',desc:'5 Naughty challenges done',check:function(s){return (s.cats.Naughty||0)>=5;}},
  {id:'a18',emoji:'✅',title:'Rule Keeper',desc:'Complete all daily rules 3 days running',check:function(s){return (s.rulesStreak||0)>=3;}},
  {id:'a19',emoji:'💎',title:'Perfect Girl',desc:'All rules and all challenges done in one day',check:function(s){return (s.perfectDays||0)>=1;}},
  {id:'a20',emoji:'💯',title:'Century',desc:'100 challenges completed',check:function(s){return Math.floor(s.glowPoints/GLOW_PER_CHALLENGE)>=100;}},
];


// ─── DAILY RULES ─────────────────────────────────────────────────────────────
const DAILY_RULES = [
  {id:'r01',emoji:'⏰',title:'No Snooze',description:'When your alarm goes off you get up immediately. Not in 5 minutes. Right now. The habit starts the second it goes off.'},
  {id:'r02',emoji:'💧',title:'Water Before Your Phone',description:'Before you look at your phone this morning drink a full glass of water. Your body needs it first. Your phone can wait.'},
  {id:'r03',emoji:'📵',title:'No Phone for the First 30 Minutes',description:'Do not touch your phone for the first 30 minutes after waking up. Get up get moving be a person before you let the world in.'},
  {id:'r04',emoji:'🛏',title:'Make Your Bed',description:'Make your bed the moment you get out of it. Before anything else. Two minutes. It sets the tone for everything that follows.'},
  {id:'r05',emoji:'💄',title:'Full Appearance Before Leaving',description:'Hair makeup nails outfit perfume — all done before you leave the house. Every single time. No exceptions ever.'},
  {id:'r06',emoji:'💅',title:'Nails Always Done',description:'Your nails must always be painted and presentable. Bare chipped or undone nails are not an option. Keep on top of this.'},
  {id:'r07',emoji:'💧',title:'2.5 Litres of Water',description:'Hit your full 2.5 litre water target today. Not almost — the full amount. Track it and make it happen.'},
  {id:'r08',emoji:'🥗',title:'Protein at Every Meal',description:'Every meal today has a proper protein source on the plate. No meal without it. This is non-negotiable for your progress.'},
  {id:'r09',emoji:'💪',title:'Show Up for Your Session',description:'Whatever your scheduled session is today you show up for it fully. No half effort no cutting it short. Start to finish.'},
  {id:'r10',emoji:'🌙',title:'In Bed by 10:30',description:'Lights out by 10:30. Sleep is when your body rebuilds and your mind resets. Everything else can wait. This cannot.'},
  {id:'r11',emoji:'📋',title:'Plan Tomorrow Tonight',description:'Before bed spend 5 minutes planning tomorrow. Wake time meals training. Know what the day looks like before it starts.'},
  {id:'r12',emoji:'🌸',title:'Skincare Morning and Night',description:'Full skincare routine every morning and every night. Cleanser moisturiser SPF in the morning. Full routine at night. No skipping.'},
];


// ─── TRAINING DATA ────────────────────────────────────────────────────────────
const TRAINING_DAYS = [
  {id:'mon',short:'MON',label:'Monday',type:'gym',session:'Lower A',subtitle:'Posterior Chain'},
  {id:'tue',short:'TUE',label:'Tuesday',type:'ride',session:'Easy Ride',subtitle:'60 mins'},
  {id:'wed',short:'WED',label:'Wednesday',type:'gym',session:'Upper',subtitle:'Upper + Core'},
  {id:'thu',short:'THU',label:'Thursday',type:'rest',session:'Rest',subtitle:'Recovery'},
  {id:'fri',short:'FRI',label:'Friday',type:'gym',session:'Lower B',subtitle:'Quad Lead'},
  {id:'sat',short:'SAT',label:'Saturday',type:'ride',session:'Main Ride',subtitle:'75-90 mins'},
  {id:'sun',short:'SUN',label:'Sunday',type:'ride',session:'Easy Spin',subtitle:'60 mins'},
];

const ACTIVE_TRAINING_DAYS = ['mon','tue','wed','fri','sat','sun'];

const WARMUP_LOWER = ['Glute bridges x 15','Clamshells x 15 each side','Leg swings x 10 each leg','Hip circles x 10 each direction','Bodyweight goblet squat x 10 — slow'];
const KNEE_RULES = ['Never push through sharp knee pain','Warm up every lower session','BSS — form before weight, always','If knees flare, posterior chain only for a week','85-95 rpm on the bike — always','Knee tracks over toes on all single leg work'];
const PROGRESSION = [
  {phase:'WEEKS 1-4',desc:'Bodyweight only on BSS. Focus on form. Build the habit.'},
  {phase:'WEEKS 5-8',desc:'Add weight when 4x10 feels easy. Light dumbbell on BSS.'},
  {phase:'WEEKS 9-12',desc:'Progressive overload every 1-2 weeks. Barbell on hip thrust.'},
];

const SESSIONS = {
  mon:{title:'Lower A',tag:'Posterior Chain · Monday',isGym:true,warmup:WARMUP_LOWER,showKneeRules:true,exercises:[{name:'Hip Thrust',sets:'4 x 8-10',note:'Drive through heels, squeeze glutes hard at top'},{name:'Romanian Deadlift',sets:'4 x 8-10',note:'Hinge at hips, soft knee, feel the hamstring stretch'},{name:'Seated Leg Curl',sets:'3 x 12',note:'3 sec eccentric — slow on the way down'},{name:'Leg Press (feet high)',sets:'3 x 10',note:'Feet high and wide, 90 degrees max depth'},{name:'Step-Ups',sets:'3 x 10 ea',note:'Controlled step down, knee tracks over toes'}]},
  tue:{title:'Easy Ride',tag:'Tuesday · 60 mins',isRide:true,rideDetails:[{label:'Duration',value:'60 minutes'},{label:'Terrain',value:'Flat routes only to start'},{label:'Intensity',value:'Zone 2 — conversational pace throughout'},{label:'Cadence',value:'85-95 rpm — small gears always'},{label:'Purpose',value:'Build your aerobic base'}]},
  wed:{title:'Upper Body',tag:'Upper + Core · Wednesday',isGym:true,exercises:[{name:'Lat Pulldown',sets:'4 x 10',note:'Pull to chest, elbows drive down and back'},{name:'Seated Cable Row',sets:'4 x 10',note:'Squeeze shoulder blades together at the end'},{name:'DB Shoulder Press',sets:'3 x 10',note:'Controlled — do not flare elbows outward'},{name:'DB Chest Press',sets:'3 x 10',note:'Full range of motion, controlled descent'},{name:'Face Pulls',sets:'3 x 15',note:'Posture and shoulder health — never skip this'},{name:'Cable Crunch',sets:'3 x 15',note:'Feel your abs — do not pull with your neck'},{name:'Plank Hold',sets:'3 x 40s',note:'Brace everything, hips level'}]},
  thu:{title:'Rest Day',tag:'Recovery · Thursday',isRest:true,restTips:['Muscle is built at rest — this day matters','Hit your protein target even today','Light walk is fine if you feel like it','8 hours sleep tonight','Magnesium glycinate before bed']},
  fri:{title:'Lower B',tag:'Quad Lead · Friday',isGym:true,warmup:WARMUP_LOWER,showKneeRules:true,exercises:[{name:'Leg Press',sets:'4 x 10',note:'Feet high and wide, controlled descent'},{name:'Bulgarian Split Squat',sets:'4 x 8 ea',note:'Bodyweight first — shin vertical, no knee cave'},{name:'Hip Thrust',sets:'3 x 10',note:'Repeat for frequency — key to building glutes'},{name:'Romanian Deadlift',sets:'3 x 10',note:'Same cues as Monday'},{name:'Seated Leg Curl',sets:'3 x 12',note:'Controlled eccentric on every rep'}]},
  sat:{title:'Main Ride',tag:'Saturday · Build Fitness',isRide:true,rideDetails:[{label:'Weeks 1-4',value:'75-90 mins easy'},{label:'Weeks 5-8',value:'90 mins, gentle hills OK'},{label:'Weeks 9+',value:'Add tempo efforts if knees allow'},{label:'Cadence',value:'85-95 rpm at all times'},{label:'Purpose',value:'Primary fitness builder ride'}]},
  sun:{title:'Easy Spin',tag:'Sunday · 60 mins',isRide:true,rideDetails:[{label:'Duration',value:'60 minutes'},{label:'Intensity',value:'Genuinely relaxed — below Zone 2'},{label:'Cadence',value:'85-95 rpm'},{label:'Goal',value:'Spin legs out after Saturday'},{label:'Vibe',value:'No targets — enjoy it'}]},
};

// ─── NUTRITION DATA ───────────────────────────────────────────────────────────
const NUT_TARGETS = {kcal:2550,protein:115,carbs:260,fat:70,fibre:30};
const WATER_STEPS = [500,1000,1500,2000,2500];

const WEEKDAY_MEALS = [
  {id:'breakfast',time:'BREAKFAST',emoji:'🍓',name:'Protein Yoghurt Bowl',items:[{amount:'250g',ingredient:'Greek yoghurt 0%'},{amount:'25g',ingredient:'Vanilla whey protein'},{amount:'40g',ingredient:'Granola almond and raisin'},{amount:'half cup',ingredient:'Frozen mixed berries'},{amount:'1 tbsp',ingredient:'Ground flaxseed'}],kcal:490,protein:51,carbs:50,fat:8,fibre:6,note:'Never skip this. Biggest protein hit of the day.'},
  {id:'lunch',time:'LUNCH',emoji:'🍗',name:'Chicken, Peri Rice and Veg',items:[{amount:'200g',ingredient:'Raw chicken breast'},{amount:'300g',ingredient:'Aldi peri rice'},{amount:'160g',ingredient:'Mixed veg plus big handful of spinach'}],kcal:720,protein:59,carbs:80,fat:9,fibre:9,note:'Meal prep Sunday to Friday. Double the spinach always.'},
  {id:'snack',time:'POST GYM',emoji:'🥜',name:'Post Gym Snack',items:[{amount:'25g',ingredient:'Vanilla whey in 300ml whole milk'},{amount:'1',ingredient:'Banana'},{amount:'30g',ingredient:'Peanut butter on 2 rice cakes'}],kcal:480,protein:35,carbs:45,fat:18,fibre:4,note:'Within 1 hour of finishing the gym session.'},
  {id:'evening',time:'EVENING',emoji:'🍓',name:'Greek Yoghurt with Fruit',items:[{amount:'150g',ingredient:'Greek yoghurt 0%'},{amount:'',ingredient:'Mixed berries or banana'},{amount:'drizzle',ingredient:'Honey (optional)'}],kcal:210,protein:19,carbs:22,fat:1,fibre:3,note:'Good protein before bed. Helps overnight muscle recovery.'},
  {id:'dinner',time:'DINNER',emoji:'🍽',name:'Dinner',items:[{amount:'',ingredient:'Home cooked — meat, carbs and veg'},{amount:'',ingredient:'Add a protein shake if protein looks low'}],kcal:650,protein:30,carbs:70,fat:20,fibre:8,note:'Flexible. Make sure there is a protein source on the plate.',flexible:true},
];

const WEEKEND_MEALS = [
  {id:'we-breakfast',time:'BREAKFAST',emoji:'🥑',name:'Scrambled Eggs, Avo and Toast',items:[{amount:'3',ingredient:'Large eggs, scrambled'},{amount:'half',ingredient:'Avocado'},{amount:'2 slices',ingredient:'Sourdough bread'},{amount:'2 slices',ingredient:'Smoked salmon'}],kcal:650,protein:42,carbs:36,fat:34,fibre:7,note:'Higher fat from eggs and avo — good for hormones.'},
  {id:'we-lunch',time:'LUNCH',emoji:'🍗',name:'Chicken, Peri Rice and Veg',items:[{amount:'200g',ingredient:'Raw chicken breast'},{amount:'300g',ingredient:'Aldi peri rice'},{amount:'160g',ingredient:'Mixed veg plus spinach'}],kcal:720,protein:59,carbs:80,fat:9,fibre:9,note:'Same as weekdays — keep it consistent.'},
  {id:'we-snack',time:'SNACK',emoji:'🍯',name:'Greek Yoghurt and Nuts',items:[{amount:'150g',ingredient:'Greek yoghurt'},{amount:'1 tbsp',ingredient:'Honey'},{amount:'30g',ingredient:'Mixed nuts'}],kcal:380,protein:18,carbs:28,fat:20,fibre:3,note:'Good fats from nuts. Keeps you full between meals.'},
  {id:'we-evening',time:'EVENING',emoji:'🍓',name:'Greek Yoghurt with Fruit',items:[{amount:'150g',ingredient:'Greek yoghurt 0%'},{amount:'',ingredient:'Mixed berries or banana'},{amount:'drizzle',ingredient:'Honey (optional)'}],kcal:210,protein:19,carbs:22,fat:1,fibre:3,note:'Same as weekdays.'},
  {id:'we-dinner',time:'DINNER',emoji:'🍽',name:'Flexible Dinner',items:[{amount:'',ingredient:'Whatever the weekend brings'},{amount:'',ingredient:'Aim to have protein on the plate'}],kcal:700,protein:35,carbs:75,fat:22,fibre:7,note:'Enjoy it. Just do not skip protein entirely.',flexible:true},
];

const GUT_HEALTH = [
  {emoji:'🌱',item:'1 tbsp ground flaxseed in yoghurt bowl daily'},
  {emoji:'💧',item:'1 tsp psyllium husk in water once daily'},
  {emoji:'🥬',item:'Big spinach portion at every lunch'},
  {emoji:'💊',item:'Magnesium glycinate before bed every night'},
];

const GOLDEN_RULES = [
  'Never skip meals — easy to undereat at 53kg',
  'Protein shake within 1hr of every gym session',
  'Eat in a surplus — food is what builds muscle',
  'Carbs fuel your sessions — do not cut them',
  'Track on MyFitnessPal for the first 2-3 weeks',
  'The 6 pack comes after you build muscle — eat',
];


// ─── DAILY RULES ─────────────────────────────────────────────────────────────
// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getGlowLvl(pts) { return [...GLOW_LEVELS].reverse().find(function(l){return pts>=l.threshold;}) || GLOW_LEVELS[0]; }
function getGlowNext(pts) { var i=GLOW_LEVELS.findIndex(function(l){return pts>=l.threshold;}); return GLOW_LEVELS[Math.min(i+1,GLOW_LEVELS.length-1)]; }
function getGrindLvl(pts) { return [...GRIND_LEVELS].reverse().find(function(l){return pts>=l.threshold;}) || GRIND_LEVELS[0]; }
function getGrindNext(pts) { var i=GRIND_LEVELS.findIndex(function(l){return pts>=l.threshold;}); return GRIND_LEVELS[Math.min(i+1,GRIND_LEVELS.length-1)]; }

function getWeekStart(date) {
  var d = new Date(date || Date.now());
  var day = d.getDay();
  var diff = d.getDate() - day + (day === 0 ? -6 : 1);
  var mon = new Date(d.setDate(diff));
  mon.setHours(0,0,0,0);
  return mon.toDateString();
}

function getWeekDates(weekStart) {
  var start = new Date(weekStart);
  var dates = [];
  for (var i=0; i<7; i++) {
    var d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toDateString());
  }
  return dates;
}

function loadLocal() { try { return JSON.parse(localStorage.getItem(SK)) || {}; } catch(e) { return {}; } }
function saveLocal(d) { localStorage.setItem(SK, JSON.stringify(d)); }

function pickChallenges(seen, glowPoints, ovr, custom) {
  var today = new Date().toDateString();
  var dow = new Date().getDay();
  var all = CHALLENGES.concat(custom || []);
  var lvl = getGlowLvl(glowPoints).level;
  var pinned = all.filter(function(c) {
    var o = ovr[c.id] || {};
    if (o.disabled) return false;
    return o.rt === 'daily' || (o.rt === 'days' && (o.days||[]).indexOf(dow) >= 0) || (o.rt === 'date' && o.date === today);
  }).slice(0,3);
  if (pinned.length >= 3) return pinned.slice(0,3);
  var pids = pinned.map(function(c){return c.id;});
  var pool = all.filter(function(c) { var o=ovr[c.id]||{}; return !o.disabled && pids.indexOf(c.id)<0 && c.level<=lvl && c.category!=='Naughty'; });
  var unseen = pool.filter(function(c){ return seen.indexOf(c.id)<0; });
  var src = unseen.length>=(3-pinned.length) ? unseen : unseen.concat(pool.filter(function(c){return seen.indexOf(c.id)>=0;}));
  var cats = src.map(function(c){return c.category;}).filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(){return Math.random()-.5;});
  var picked=pinned.slice(); var used=pids.slice();
  cats.forEach(function(cat){ if(picked.length>=3)return; var cp=src.filter(function(c){return c.category===cat&&used.indexOf(c.id)<0;}); if(cp.length){var p=cp[Math.floor(Math.random()*cp.length)];picked.push(p);used.push(p.id);} });
  var rem=src.filter(function(c){return used.indexOf(c.id)<0;});
  while(picked.length<3&&rem.length){var i=Math.floor(Math.random()*rem.length);picked.push(rem[i]);rem.splice(i,1);}
  return picked.slice(0,3);
}

// Check if a week is a perfect week — requires ALL 3 challenges per day + all training sessions
function checkPerfectWeek(weekData, weekDatesArr) {
  if (!weekData) return false;
  var todayStr = new Date().toDateString();
  for (var i=0; i<weekDatesArr.length; i++) {
    var dateStr = weekDatesArr[i];
    if (new Date(dateStr) > new Date(todayStr)) continue;
    var dayChallenges = weekData.challenges[dateStr] || [];
    var doneChallenges = dayChallenges.filter(function(c){return c.done;}).length;
    if (doneChallenges < 3) return false;
  }
  for (var j=0; j<ACTIVE_TRAINING_DAYS.length; j++) {
    var dayId = ACTIVE_TRAINING_DAYS[j];
    var dayIndex = ['mon','tue','wed','thu','fri','sat','sun'].indexOf(dayId);
    var weekDate = weekDatesArr[dayIndex === -1 ? 0 : dayIndex];
    if (weekDate && new Date(weekDate) > new Date(todayStr)) continue;
    if (!weekData.trainingSessions[dayId]) return false;
  }
  return true;
}

export default function App() {
  var today = new Date().toDateString();
  var currentWeekStart = getWeekStart();
  var dayMap = {1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat',0:'sun'};
  var todayDayId = dayMap[new Date().getDay()] || 'mon';
  var s = loadLocal();

  var [splash, setSplash] = useState(true);
  var [onboardDone, setOnboardDone] = useState(s.onboardDone || false);
  var [onboardSlide, setOnboardSlide] = useState(0);
  var [tab, setTab] = useState('home');
  var [syncing, setSyncing] = useState(false);
  var [showPerfectWeek, setShowPerfectWeek] = useState(false);
  var [showWeekWrap, setShowWeekWrap] = useState(false);
  var [milestone, setMilestone] = useState(null);

  var [st, setSt] = useState({
    glowPoints: s.glowPoints || 0,
    grindPoints: s.grindPoints || 0,
    ch: s.ch || [], lgd: s.lgd || null, seen: s.seen || [],
    seenDates: s.seenDates || {},
    hist: s.hist || {}, streak: s.streak || 0, lsd: s.lsd || null,
    graceUsedWeek: s.graceUsedWeek || null,
    cats: s.cats || {}, earned: s.earned || [],
    msg: s.msg || '', reaction: s.reaction || '',
    theme: s.theme || 'pink', wplan: s.wplan || {},
    view: 'her', htab: 'Today', atab: 'Today',
    pinSet: s.pinSet || false, pin: s.pin || '', unlocked: false,
    showPin: false, pi: '', pe: '',
    custom: s.custom || [], ovr: s.ovr || {},
    form: {emoji:'😈',title:'',desc:'',category:'Naughty',level:1}, ferr: '',
    bulk: '', bcat: 'Naughty', blvl: 1, bemoji: '😈', bres: '',
    schedId: null, msgd: s.msg || '', reactd: '',
    noteId: null, noted: '', diffId: null,
    wpexp: null, qpin: null,
    fcat: 'All', fsearch: '',
    celebId: null, confetti: [], lvlUp: false, allDone: false, newAch: null,
    weeklyData: s.weeklyData || {},
    perfectWeeks: s.perfectWeeks || 0,
    pb: s.pb || {bestGlowWeek:0,bestGrindWeek:0,bestPerfectStreak:0,mostChallengesDay:0},
    weekGoal: s.weekGoal || {glowTarget:0,grindTarget:0},
    challengeNudgeTime: s.challengeNudgeTime || '21:00',
    trainingNudgeTime: s.trainingNudgeTime || '19:00',
    rewards: s.rewards || [],
    rewardForm: {emoji:'🎁',title:'',desc:'',pointType:'glow',cost:50,minLevel:0},
    rewardFormErr: '',
    rulesChecked: s.rulesChecked || {},
    rulesStreak: s.rulesStreak || 0,
    rulesLastDate: s.rulesLastDate || null,
    perfectDays: s.perfectDays || 0,
    customRules: s.customRules || [],
    rulesOvr: s.rulesOvr || {},
    ruleForm: {emoji:'✅',title:'',description:''}, ruleFormErr: '',
    nutDaysLogged: s.nutDaysLogged || {},
    naughtyActive: s.naughtyActive || false,
    naughtyDate: s.naughtyDate || null,
    swapUsedDate: s.swapUsedDate || null,
    herMessages: s.herMessages || [],
    herMsgDraft: '',
    adminSeenDate: s.adminSeenDate || null,
    specialDates: s.specialDates || [],
    milestoneMessages: s.milestoneMessages || {},
    shownMilestones: s.shownMilestones || [],
  });

  var [tDay, setTDay] = useState(todayDayId);
  var [tChecked, setTChecked] = useState(s.tChecked || {});
  var [tWarmup, setTWarmup] = useState({});
  var [showProg, setShowProg] = useState(false);
  var [ridesDone, setRidesDone] = useState(s.ridesDone || {});
  var [nutView, setNutView] = useState('weekday');
  var [nutChecked, setNutChecked] = useState(s.nutChecked || {});
  var [waterMl, setWaterMl] = useState(s.waterMl || 0);
  var [expandedMeal, setExpandedMeal] = useState(null);

  // Reset naughty if it was set on a different day
  var naughtyActive = st.naughtyActive && st.naughtyDate === today;

  var T = THEMES[st.theme] || THEMES.pink;
  var glowLvi = getGlowLvl(st.glowPoints);
  var glowNext = getGlowNext(st.glowPoints);
  var glowPct = glowLvi.level<5 ? Math.min(100,((st.glowPoints-glowLvi.threshold)/(glowNext.threshold-glowLvi.threshold))*100) : 100;
  var grindLvi = getGrindLvl(st.grindPoints);
  var grindNext = getGrindNext(st.grindPoints);
  var grindPct = grindLvi.level<6 ? Math.min(100,((st.grindPoints-grindLvi.threshold)/(grindNext.threshold-grindLvi.threshold))*100) : 100;
  var doneT = st.ch.filter(function(c){return c.done;}).length;
  var allCh = CHALLENGES.concat(st.custom);
  var currentWeekDates = getWeekDates(currentWeekStart);
  var currentWeekData = st.weeklyData[currentWeekStart] || {challenges:{},trainingSessions:{},glowEarned:0,grindEarned:0,perfectWeekApplied:false};
  var allRules = DAILY_RULES.concat(st.customRules||[]).filter(function(r){return !(st.rulesOvr[r.id]&&st.rulesOvr[r.id].disabled);});
  var rulesTodayDone = allRules.filter(function(r){return !!st.rulesChecked[today+'-'+r.id];}).length;
  var weekGlowBase = currentWeekData.glowEarned || 0;
  var weekGrindBase = currentWeekData.grindEarned || 0;
  var weekGlowTotal = currentWeekData.perfectWeekApplied ? Math.round(weekGlowBase*1.5) : weekGlowBase;
  var weekGrindTotal = currentWeekData.perfectWeekApplied ? Math.round(weekGrindBase*1.5) : weekGrindBase;
  var canSwap = st.swapUsedDate !== today;
  // Grace: used this week if graceUsedWeek === currentWeekStart
  var graceAvailable = st.graceUsedWeek !== currentWeekStart;

  // ── Splash ──
  useEffect(function(){var t=setTimeout(function(){setSplash(false);},2000);return function(){clearTimeout(t);};}, []);

  // ── Supabase load ──
  useEffect(function(){
    setSyncing(true);
    supaLoad().then(function(data){
      if (data) {
        setSt(function(p){ return Object.assign({},p,{
          glowPoints:data.glowPoints||p.glowPoints, grindPoints:data.grindPoints||p.grindPoints,
          ch:data.ch||p.ch, lgd:data.lgd||p.lgd, seen:data.seen||p.seen, seenDates:data.seenDates||p.seenDates,
          hist:data.hist||p.hist, streak:data.streak||p.streak, lsd:data.lsd||p.lsd,
          graceUsedWeek:data.graceUsedWeek||p.graceUsedWeek,
          cats:data.cats||p.cats, earned:data.earned||p.earned,
          msg:data.msg||p.msg, reaction:data.reaction||p.reaction, theme:data.theme||p.theme,
          wplan:data.wplan||p.wplan, pinSet:data.pinSet||p.pinSet, pin:data.pin||p.pin,
          custom:data.custom||p.custom, ovr:data.ovr||p.ovr,
          weeklyData:data.weeklyData||p.weeklyData, perfectWeeks:data.perfectWeeks||p.perfectWeeks,
          pb:data.pb||p.pb, weekGoal:data.weekGoal||p.weekGoal,
          challengeNudgeTime:data.challengeNudgeTime||p.challengeNudgeTime,
          trainingNudgeTime:data.trainingNudgeTime||p.trainingNudgeTime,
          rewards:data.rewards||p.rewards, rulesChecked:data.rulesChecked||p.rulesChecked,
          rulesStreak:data.rulesStreak||p.rulesStreak, rulesLastDate:data.rulesLastDate||p.rulesLastDate,
          perfectDays:data.perfectDays||p.perfectDays, customRules:data.customRules||p.customRules,
          rulesOvr:data.rulesOvr||p.rulesOvr, nutDaysLogged:data.nutDaysLogged||p.nutDaysLogged,
          naughtyActive:data.naughtyActive||p.naughtyActive, naughtyDate:data.naughtyDate||p.naughtyDate,
          swapUsedDate:data.swapUsedDate||p.swapUsedDate,
          herMessages:data.herMessages||p.herMessages, adminSeenDate:data.adminSeenDate||p.adminSeenDate,
          specialDates:data.specialDates||p.specialDates, milestoneMessages:data.milestoneMessages||p.milestoneMessages,
          shownMilestones:data.shownMilestones||p.shownMilestones,
          msgd:data.msg||p.msg,
        }); });
        if (data.tChecked) setTChecked(data.tChecked);
        if (data.ridesDone) setRidesDone(data.ridesDone);
        if (data.nutChecked) setNutChecked(data.nutChecked);
        if (data.waterMl) setWaterMl(data.waterMl);
      }
      setSyncing(false);
    });
  }, []);

  // ── Save ──
  useEffect(function(){
    var data = {
      glowPoints:st.glowPoints, grindPoints:st.grindPoints, ch:st.ch, lgd:st.lgd, seen:st.seen,
      seenDates:st.seenDates, hist:st.hist, streak:st.streak, lsd:st.lsd,
      graceUsedWeek:st.graceUsedWeek,
      cats:st.cats, earned:st.earned, msg:st.msg, reaction:st.reaction, theme:st.theme,
      wplan:st.wplan, pinSet:st.pinSet, pin:st.pin, custom:st.custom, ovr:st.ovr,
      weeklyData:st.weeklyData, perfectWeeks:st.perfectWeeks, pb:st.pb, weekGoal:st.weekGoal,
      challengeNudgeTime:st.challengeNudgeTime, trainingNudgeTime:st.trainingNudgeTime,
      rewards:st.rewards, rulesChecked:st.rulesChecked, rulesStreak:st.rulesStreak,
      rulesLastDate:st.rulesLastDate, perfectDays:st.perfectDays, customRules:st.customRules,
      rulesOvr:st.rulesOvr, nutDaysLogged:st.nutDaysLogged,
      naughtyActive:st.naughtyActive, naughtyDate:st.naughtyDate, swapUsedDate:st.swapUsedDate,
      herMessages:st.herMessages, adminSeenDate:st.adminSeenDate,
      specialDates:st.specialDates, milestoneMessages:st.milestoneMessages, shownMilestones:st.shownMilestones,
      onboardDone:onboardDone,
      tChecked:tChecked, ridesDone:ridesDone, nutChecked:nutChecked, waterMl:waterMl,
    };
    saveLocal(data);
    var t = setTimeout(function(){supaSave(data);}, 800);
    return function(){clearTimeout(t);};
  }, [st.glowPoints,st.grindPoints,st.ch,st.lgd,st.seen,st.seenDates,st.hist,st.streak,st.lsd,st.graceUsedWeek,st.cats,st.earned,st.msg,st.reaction,st.theme,st.wplan,st.pinSet,st.pin,st.custom,st.ovr,st.weeklyData,st.perfectWeeks,st.pb,st.weekGoal,st.challengeNudgeTime,st.trainingNudgeTime,st.rewards,st.rulesChecked,st.rulesStreak,st.rulesLastDate,st.perfectDays,st.customRules,st.rulesOvr,st.nutDaysLogged,st.naughtyActive,st.naughtyDate,st.swapUsedDate,st.herMessages,st.adminSeenDate,st.specialDates,st.milestoneMessages,st.shownMilestones,onboardDone,tChecked,ridesDone,nutChecked,waterMl]);

  // ── Notifications ──
  useEffect(function(){
    if ('Notification' in window && Notification.permission==='default') Notification.requestPermission();
  }, []);
  useEffect(function(){
    var interval = setInterval(function(){
      var now = new Date();
      var hhmm = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
      if (hhmm===st.challengeNudgeTime && localStorage.getItem('lastChallengeNudge')!==today && Notification.permission==='granted') {
        if (doneT<3){new Notification('Time to glow up! ✨',{body:'You still have challenges to complete today 💖'});localStorage.setItem('lastChallengeNudge',today);}
      }
      var tSess = SESSIONS[todayDayId];
      if (hhmm===st.trainingNudgeTime && localStorage.getItem('lastTrainingNudge')!==today && Notification.permission==='granted') {
        if ((tSess.isGym||tSess.isRide)&&!isSessionDone(todayDayId)){new Notification('Training reminder 💪',{body:'Your '+tSess.title+' session is not done yet!'});localStorage.setItem('lastTrainingNudge',today);}
      }
    },60000);
    return function(){clearInterval(interval);};
  }, [st.challengeNudgeTime,st.trainingNudgeTime,doneT,tChecked,ridesDone]);

  // ── Milestone checker ──
  useEffect(function(){
    var toCheck = [
      {key:'streak7',cond:st.streak>=7},
      {key:'streak14',cond:st.streak>=14},
      {key:'streak30',cond:st.streak>=30},
      {key:'glowLevel2',cond:glowLvi.level>=2},
      {key:'glowLevel3',cond:glowLvi.level>=3},
      {key:'glowLevel4',cond:glowLvi.level>=4},
      {key:'glowLevel5',cond:glowLvi.level>=5},
      {key:'perfectWeek1',cond:(st.perfectWeeks||0)>=1},
      {key:'challenges100',cond:Math.floor(st.glowPoints/GLOW_PER_CHALLENGE)>=100},
      {key:'grindLevel3',cond:grindLvi.level>=3},
      {key:'grindLevel6',cond:grindLvi.level>=6},
    ];
    for (var i=0;i<toCheck.length;i++) {
      var item = toCheck[i];
      if (item.cond && st.shownMilestones.indexOf(item.key)<0 && MILESTONE_MESSAGES[item.key]) {
        var custom = (st.milestoneMessages||{})[item.key];
        var base = MILESTONE_MESSAGES[item.key];
        setMilestone(Object.assign({},base,custom||{},{key:item.key}));
        setSt(function(p){return Object.assign({},p,{shownMilestones:p.shownMilestones.concat([item.key])});});
        break;
      }
    }
  }, [st.streak,st.glowPoints,st.grindPoints,st.perfectWeeks]);

  // ── Generate challenges ──
  function gen(base) {
    var b = base || st;
    var all = CHALLENGES.concat(b.custom);
    var plan = b.wplan[today];
    var picked;
    if (plan && plan.length > 0) picked = plan.map(function(id){return all.find(function(c){return c.id===id;});}).filter(Boolean).slice(0,3);
    if (!picked||picked.length===0) picked = pickChallenges(b.seen, b.seenDates||{}, b.glowPoints, b.ovr, b.custom, b.naughtyActive&&b.naughtyDate===today, todayDayId);
    setSt(function(p){return Object.assign({},p,{ch:picked.map(function(c,i){return Object.assign({},c,{uid:today+'-'+i,done:false,note:'',diff:null});}),lgd:today});});
  }
  useEffect(function(){if(st.lgd!==today||st.ch.length===0)gen();}, []);

  // ── Perfect week check ──
  useEffect(function(){
    if (currentWeekData && !currentWeekData.perfectWeekApplied) checkAndApplyPerfectWeek(currentWeekData);
  }, [JSON.stringify(currentWeekData)]);

  function checkAndApplyPerfectWeek(weekData) {
    if (!weekData || weekData.perfectWeekApplied) return;
    if (!checkPerfectWeek(weekData, currentWeekDates)) return;
    setSt(function(p){
      var wd = Object.assign({},p.weeklyData);
      wd[currentWeekStart] = Object.assign({},wd[currentWeekStart],{perfectWeekApplied:true});
      var newPerfectWeeks = (p.perfectWeeks||0)+1;
      var newGlow = p.glowPoints + Math.round((wd[currentWeekStart].glowEarned||0)*(PERFECT_WEEK_MULTIPLIER-1));
      var newGrind = p.grindPoints + Math.round((wd[currentWeekStart].grindEarned||0)*(PERFECT_WEEK_MULTIPLIER-1));
      var newPb = Object.assign({},p.pb,{bestPerfectStreak:Math.max(p.pb.bestPerfectStreak||0,newPerfectWeeks)});
      var ns = Object.assign({},p,{weeklyData:wd,perfectWeeks:newPerfectWeeks,glowPoints:newGlow,grindPoints:newGrind,pb:newPb});
      return Object.assign({},ns,checkAch(ns));
    });
    setShowPerfectWeek(true);
    setTimeout(function(){setShowPerfectWeek(false);},5000);
  }

  function checkAch(ns) {
    var ne = ACHIEVEMENTS.filter(function(a){return ns.earned.indexOf(a.id)<0&&a.check(ns);});
    if (ne.length>0) return {earned:ns.earned.concat(ne.map(function(a){return a.id;})),newAch:ne[0]};
    return {};
  }

  function complete(uid) {
    setSt(function(p){
      var ch = p.ch.find(function(c){return c.uid===uid;}); if(!ch)return p;
      var nd = !ch.done;
      var nc = p.ch.map(function(c){return c.uid===uid?Object.assign({},c,{done:nd}):c;});
      var an = nc.every(function(c){return c.done;});
      var doneCount = nc.filter(function(c){return c.done;}).length;
      var gpDelta = nd?GLOW_PER_CHALLENGE:-GLOW_PER_CHALLENGE;
      var newGlow = Math.max(0,p.glowPoints+gpDelta);
      var lu = nd && getGlowLvl(newGlow).level>getGlowLvl(p.glowPoints).level;
      var newSeenDates = Object.assign({},p.seenDates||{});
      if (nd) newSeenDates[ch.id] = today;
      var ns2 = nd&&p.seen.indexOf(ch.id)<0?p.seen.concat([ch.id]):p.seen;
      var ncc = Object.assign({},p.cats); ncc[ch.category]=(ncc[ch.category]||0)+(nd?1:-1);
      // Streak with grace day
      var str=p.streak, lsd=p.lsd, graceUsedWeek=p.graceUsedWeek;
      if (nd&&an) {
        var yest=new Date(); yest.setDate(yest.getDate()-1);
        var twoDaysAgo=new Date(); twoDaysAgo.setDate(twoDaysAgo.getDate()-2);
        if (p.lsd===yest.toDateString()||p.lsd===today) {
          str = p.lsd===today?p.streak:p.streak+1; lsd=today;
        } else if (p.lsd===twoDaysAgo.toDateString()&&p.graceUsedWeek!==currentWeekStart) {
          // Grace day — missed yesterday but had a day off this week
          str = p.streak+1; lsd=today; graceUsedWeek=currentWeekStart;
        } else {
          str=1; lsd=today;
        }
      }
      var wd=Object.assign({},p.weeklyData);
      if(!wd[currentWeekStart])wd[currentWeekStart]={challenges:{},trainingSessions:{},glowEarned:0,grindEarned:0,perfectWeekApplied:false};
      var weekGlowEarned=(wd[currentWeekStart].glowEarned||0)+gpDelta;
      wd[currentWeekStart]=Object.assign({},wd[currentWeekStart],{challenges:Object.assign({},wd[currentWeekStart].challenges,{[today]:nc}),glowEarned:Math.max(0,weekGlowEarned)});
      var newPb=Object.assign({},p.pb,{mostChallengesDay:Math.max(p.pb.mostChallengesDay||0,doneCount),bestGlowWeek:Math.max(p.pb.bestGlowWeek||0,wd[currentWeekStart].glowEarned)});
      var conf=nd?Array.from({length:18},function(_,i){return{id:Date.now()+'-'+i,x:8+Math.random()*84,y:10+Math.random()*80,e:CONF_EMOJI[Math.floor(Math.random()*CONF_EMOJI.length)],d:Math.random()*0.7};}):[];
      var ns=Object.assign({},p,{ch:nc,glowPoints:newGlow,seen:ns2,seenDates:newSeenDates,celebId:nd?uid:null,confetti:conf,lvlUp:lu,hist:Object.assign({},p.hist,{[today]:nc}),streak:str,lsd:lsd,graceUsedWeek:graceUsedWeek,allDone:an&&nd,cats:ncc,weeklyData:wd,pb:newPb});
      return Object.assign({},ns,checkAch(ns));
    });
    setTimeout(function(){setSt(function(p){return Object.assign({},p,{celebId:null,confetti:[],lvlUp:false,allDone:false,newAch:null});});},3200);
  }

  function swapChallenge(uid) {
    if (!canSwap) return;
    setSt(function(p){
      var swap = pickSwap(p.ch, uid, p.seen, p.seenDates||{}, p.glowPoints, p.ovr, p.custom, naughtyActive, todayDayId);
      if (!swap) return p;
      var nc = p.ch.map(function(c){return c.uid===uid?Object.assign({},swap,{uid:uid,done:false,note:'',diff:null}):c;});
      return Object.assign({},p,{ch:nc,swapUsedDate:today});
    });
  }

  function completeTrainingSession(dayId) {
    var sess = SESSIONS[dayId]; if(!sess)return;
    var isRide = sess.isRide;
    var points = isRide?GRIND_RIDE:GRIND_GYM;
    var rideKey = today+'-'+dayId;
    if (isRide&&ridesDone[rideKey]) return;
    if (isRide) setRidesDone(function(p){return Object.assign({},p,{[rideKey]:true});});
    setSt(function(p){
      var alreadyAwarded=!!(currentWeekData&&currentWeekData.trainingSessions&&currentWeekData.trainingSessions[dayId]);
      if(alreadyAwarded)return p;
      var newGrind=p.grindPoints+points;
      var wd=Object.assign({},p.weeklyData);
      if(!wd[currentWeekStart])wd[currentWeekStart]={challenges:{},trainingSessions:{},glowEarned:0,grindEarned:0,perfectWeekApplied:false};
      var sessions=Object.assign({},wd[currentWeekStart].trainingSessions,{[dayId]:true});
      var weekGrindEarned=(wd[currentWeekStart].grindEarned||0)+points;
      wd[currentWeekStart]=Object.assign({},wd[currentWeekStart],{trainingSessions:sessions,grindEarned:weekGrindEarned});
      var newPb=Object.assign({},p.pb,{bestGrindWeek:Math.max(p.pb.bestGrindWeek||0,weekGrindEarned)});
      var ns=Object.assign({},p,{grindPoints:newGrind,weeklyData:wd,pb:newPb});
      return Object.assign({},ns,checkAch(ns));
    });
  }

  function isSessionDone(dayId) {
    var sess=SESSIONS[dayId]; if(!sess)return false;
    if(currentWeekData&&currentWeekData.trainingSessions&&currentWeekData.trainingSessions[dayId])return true;
    if(sess.isGym){var exCount=sess.exercises?sess.exercises.length:0;var doneCount=sess.exercises?sess.exercises.filter(function(_,i){return tChecked[dayId+'-'+i];}).length:0;return exCount>0&&doneCount===exCount;}
    return false;
  }

  var tSession=SESSIONS[tDay];
  var tTotalExs=tSession.exercises?tSession.exercises.length:0;
  var tDoneExs=tSession.exercises?tSession.exercises.filter(function(_,i){return tChecked[tDay+'-'+i];}).length:0;
  var tAllDone=tTotalExs>0&&tDoneExs===tTotalExs;
  var tProgress=tTotalExs>0?tDoneExs/tTotalExs:0;
  var prevAllDone=useRef(false);
  useEffect(function(){
    var alreadyAwarded=!!(currentWeekData&&currentWeekData.trainingSessions&&currentWeekData.trainingSessions[tDay]);
    if(tAllDone&&!prevAllDone.current&&tSession.isGym&&!alreadyAwarded)completeTrainingSession(tDay);
    prevAllDone.current=tAllDone;
  },[tAllDone,tDay]);

  function setOv(id,patch){setSt(function(p){var o=Object.assign({},p.ovr);o[id]=Object.assign({},o[id]||{},patch);return Object.assign({},p,{ovr:o});});}
  function addOne(){var f=st.form;if(!f.title.trim()||!f.desc.trim()){setSt(function(p){return Object.assign({},p,{ferr:'Fill in all fields'});});return;}setSt(function(p){return Object.assign({},p,{custom:p.custom.concat([Object.assign({},f,{description:f.desc,id:'c-'+Date.now(),custom:true,ctx:'any'})]),form:{emoji:'😈',title:'',desc:'',category:'Naughty',level:1},ferr:''});});}
  function bulkImport(){var lines=st.bulk.trim().split('\n').filter(function(l){return l.trim();});var chs=[];var i=0;while(i<lines.length){var tl=lines[i].trim();i++;var desc='';if(i<lines.length&&lines[i].trim()&&!lines[i].trim().match(/^[\d\-\*]/)&&lines[i].trim().length>20){desc=lines[i].trim();i++;}var title=tl.replace(/^[\d\.\-\*]+\s*/,'').trim();if(title.length>2)chs.push({id:'c-'+Date.now()+'-'+chs.length,custom:true,emoji:st.bemoji,title:title,description:desc||title,category:st.bcat,level:Number(st.blvl),ctx:'any'});}if(chs.length===0){setSt(function(p){return Object.assign({},p,{bres:'No challenges found'});});return;}setSt(function(p){return Object.assign({},p,{custom:p.custom.concat(chs),bulk:'',bres:'Imported '+chs.length+' challenges into '+p.bcat});});}
  function tryAdmin(){setSt(function(p){return Object.assign({},p,{showPin:true,pi:'',pe:''});});}
  function submitPin(){if(!st.pinSet){if(st.pi.length<4){setSt(function(p){return Object.assign({},p,{pe:'Need at least 4 digits'});});return;}setSt(function(p){return Object.assign({},p,{pin:p.pi,pinSet:true,unlocked:true,view:'admin',showPin:false});});}else{if(st.pi===st.pin)setSt(function(p){return Object.assign({},p,{unlocked:true,view:'admin',showPin:false,pi:'',adminSeenDate:today});});else setSt(function(p){return Object.assign({},p,{pe:'Wrong PIN',pi:''}); });}}

  var hdates=Object.keys(st.hist).filter(function(d){return d!==today;}).sort(function(a,b){return new Date(b)-new Date(a);});
  var schedC=st.schedId?allCh.find(function(c){return c.id===st.schedId;}):null;
  var schedOv=schedC?(st.ovr[schedC.id]||{}):{};
  var noteC=st.noteId?st.ch.find(function(c){return c.uid===st.noteId;}):null;
  var diffC=st.diffId?st.ch.find(function(c){return c.uid===st.diffId;}):null;
  var filt=allCh.filter(function(c){return (st.fcat==='All'||c.category===st.fcat)&&(!st.fsearch||c.title.toLowerCase().indexOf(st.fsearch.toLowerCase())>=0);});
  var unreadHerMsgs=(st.herMessages||[]).filter(function(m){return !m.read;}).length;
  function getWeekDatesUI(){var d=[];var t2=new Date();var mon=new Date(t2);mon.setDate(t2.getDate()-t2.getDay()+1);for(var i=0;i<7;i++){var x=new Date(mon);x.setDate(mon.getDate()+i);d.push(x);}return d;}
  var nutMeals=nutView==='weekend'?WEEKEND_MEALS:WEEKDAY_MEALS;
  var nutTotals=nutMeals.reduce(function(acc,m){if(nutChecked[m.id]){acc.kcal+=m.kcal;acc.protein+=m.protein;acc.carbs+=m.carbs;acc.fat+=m.fat;acc.fibre+=m.fibre;}return acc;},{kcal:0,protein:0,carbs:0,fat:0,fibre:0});

  var grad='linear-gradient(135deg,'+T.a1+','+T.a2+')';
  var cardS={background:'rgba(255,255,255,.038)',border:'1px solid rgba(255,120,190,.15)',borderRadius:18,backdropFilter:'blur(12px)'};
  var inpS={background:'rgba(255,255,255,.055)',border:'1px solid rgba(255,120,190,.24)',borderRadius:12,padding:'12px 14px',color:'#ffb3d9',fontFamily:'Crimson Text,serif',fontSize:'.95rem',outline:'none',width:'100%',WebkitAppearance:'none',appearance:'none'};
  var lblS={color:'rgba(255,179,217,.46)',fontSize:'.66rem',textTransform:'uppercase',letterSpacing:'.1em',display:'block',marginBottom:5,fontFamily:'Crimson Text,serif'};
  var gbS={background:grad,border:'none',borderRadius:50,color:'#fff',fontFamily:'Playfair Display,serif',fontSize:'.95rem',fontWeight:700,padding:14,cursor:'pointer',boxShadow:'0 0 24px '+T.a1+'55',width:'100%',touchAction:'manipulation'};
  function sbS(on){return{background:on?grad:'transparent',border:on?'none':'1px solid rgba(255,120,190,.24)',borderRadius:50,color:on?'#fff':'#ffb3d9',fontFamily:'Playfair Display,serif',fontSize:'.8rem',padding:'9px 16px',cursor:'pointer',touchAction:'manipulation',whiteSpace:'nowrap'};}
  function cbS(done){return{width:40,height:40,minWidth:40,borderRadius:'50%',border:done?'none':'2px solid rgba(255,120,190,.34)',background:done?grad:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',color:done?'#fff':'transparent',touchAction:'manipulation',flexShrink:0};}

  function OVL(props){return <div onClick={props.onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',backdropFilter:'blur(10px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}><div onClick={function(e){e.stopPropagation();}} style={{maxWidth:400,width:'100%',maxHeight:'90vh',overflowY:'auto'}}>{props.children}</div></div>;}

  return (
    <div style={{minHeight:'100vh',background:T.bg,fontFamily:'Palatino Linotype,Palatino,Georgia,serif',position:'relative',overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=Crimson+Text:ital@0;1&family=Poppins:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @keyframes blob{0%,100%{transform:translateY(0);opacity:.1}50%{transform:translateY(-16px);opacity:.17}}
        @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes popIn{0%{transform:scale(.86) translateY(14px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
        @keyframes fly{0%{transform:scale(0) rotate(0deg);opacity:1}100%{transform:scale(2) rotate(720deg) translateY(-100px);opacity:0}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
        @keyframes up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes lvlPop{0%{transform:scale(0) translateY(40px);opacity:0}65%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}
        @keyframes achSlide{0%{transform:translateY(-70px) translateX(-50%);opacity:0}15%,80%{transform:translateY(0) translateX(-50%);opacity:1}100%{transform:translateY(-70px) translateX(-50%);opacity:0}}
        @keyframes splFade{0%{opacity:1}100%{opacity:0}}
        @keyframes milePop{0%{transform:scale(0) rotate(-3deg);opacity:0}60%{transform:scale(1.05) rotate(1deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        .tappable{transition:transform 0.15s ease,opacity 0.15s ease;cursor:pointer}
        .tappable:active{transform:scale(0.97);opacity:0.85}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,100,180,.22);border-radius:3px}
      `}</style>

      {/* Splash */}
      {splash && <div style={{position:'fixed',inset:0,background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:999,animation:'splFade .5s 1.8s ease-out forwards'}}><div style={{fontSize:'4rem',marginBottom:16,animation:'pulse 1.5s ease-in-out infinite'}}>💖</div><div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'2.6rem',background:'linear-gradient(135deg,'+T.a1+',#ffcce8,'+T.a2+')',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 2s ease infinite'}}>Glow Up</div><div style={{color:'rgba(255,179,217,.45)',fontStyle:'italic',marginTop:8,fontFamily:'Crimson Text,serif',fontSize:'1rem'}}>your daily challenges</div></div>}

      {/* Onboarding */}
      {!splash && !onboardDone && (
        <div style={{position:'fixed',inset:0,background:T.bg,zIndex:990,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'30px 24px'}}>
          <div style={{maxWidth:400,width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'4rem',marginBottom:20,animation:'pulse 2s ease-in-out infinite'}}>{ONBOARDING_SLIDES[onboardSlide].emoji}</div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'1.8rem',background:'linear-gradient(135deg,'+T.a1+','+T.a2+')',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:16,lineHeight:1.2}}>{ONBOARDING_SLIDES[onboardSlide].title}</h2>
            <p style={{color:'rgba(255,179,217,.7)',fontFamily:'Crimson Text,serif',fontSize:'1.05rem',lineHeight:1.75,marginBottom:32}}>{ONBOARDING_SLIDES[onboardSlide].body}</p>
            <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:28}}>
              {ONBOARDING_SLIDES.map(function(_,i){return <div key={i} style={{width:8,height:8,borderRadius:'50%',background:i===onboardSlide?T.a1:'rgba(255,120,190,.2)',transition:'background .3s'}}/>;})}
            </div>
            <button style={gbS} onClick={function(){
              if (onboardSlide < ONBOARDING_SLIDES.length-1) setOnboardSlide(function(s){return s+1;});
              else setOnboardDone(true);
            }}>{ONBOARDING_SLIDES[onboardSlide].btn}</button>
          </div>
        </div>
      )}

      {/* BG blobs */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden'}}>
        {[{t:'-8%',l:'-8%',s:'65vw',c:T.a1+'18'},{t:'38%',r:'-12%',s:'55vw',c:T.a2+'14'},{b:'-8%',l:'15%',s:'60vw',c:T.a1+'0f'}].map(function(b,i){return <div key={i} style={{position:'absolute',top:b.t,left:b.l,right:b.r,bottom:b.b,width:b.s,height:b.s,borderRadius:'50%',background:'radial-gradient(circle,'+b.c+',transparent 70%)',animation:'blob '+(8+i*1.5)+'s '+(i*2)+'s ease-in-out infinite'}}/>;})}</div>

      {/* Confetti */}
      {st.confetti.map(function(c){return <div key={c.id} style={{position:'fixed',top:c.y+'%',left:c.x+'%',fontSize:'1.4rem',pointerEvents:'none',zIndex:300,animation:'fly 2s '+c.d+'s ease-out forwards'}}>{c.e}</div>;})}

      {/* Syncing */}
      {syncing && <div style={{position:'fixed',top:8,right:12,zIndex:500,fontSize:'0.6rem',color:'rgba(255,179,217,.35)',letterSpacing:'0.1em'}}>syncing...</div>}

      {/* Milestone */}
      {milestone && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.9)',backdropFilter:'blur(8px)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}} onClick={function(){setMilestone(null);}}>
          <div style={{background:'linear-gradient(135deg,rgba(22,0,15,.98),rgba(38,0,24,.98))',border:'1px solid '+T.a1+'66',borderRadius:26,padding:'44px 32px',textAlign:'center',maxWidth:340,width:'100%',animation:'milePop .6s ease-out',boxShadow:'0 0 60px '+T.a1+'33'}}>
            <div style={{fontSize:'3.5rem',marginBottom:14}}>{milestone.emoji}</div>
            <div style={{color:'rgba(255,179,217,.45)',fontSize:'0.7rem',letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:8}}>Milestone</div>
            <div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'1.8rem',background:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:16,lineHeight:1.2}}>{milestone.title}</div>
            <p style={{color:'rgba(255,179,217,.7)',fontFamily:'Crimson Text,serif',fontSize:'0.98rem',lineHeight:1.7,marginBottom:24}}>{milestone.msg}</p>
            <button style={gbS} onClick={function(){setMilestone(null);}}>Thank you 💖</button>
          </div>
        </div>
      )}

      {/* Perfect week */}
      {showPerfectWeek && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',backdropFilter:'blur(8px)',zIndex:350,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'linear-gradient(135deg,rgba(22,0,15,.97),rgba(38,0,24,.97))',border:'1px solid '+T.a1+'66',borderRadius:26,padding:'44px 32px',textAlign:'center',animation:'milePop .6s ease-out',maxWidth:320,width:'100%',boxShadow:'0 0 60px '+T.a1+'44'}}>
            <div style={{fontSize:'3.5rem',marginBottom:12}}>🏆</div>
            <div style={{color:'rgba(255,179,217,.5)',fontSize:'0.7rem',letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:8}}>Perfect Week</div>
            <div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'1.9rem',background:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:10}}>1.5x Bonus!</div>
            <p style={{color:'rgba(255,179,217,.6)',fontFamily:'Crimson Text,serif',fontSize:'0.95rem',lineHeight:1.6}}>You crushed every challenge and every session this week. All your points just got a 50% bonus. You earned every single one. 💖</p>
          </div>
        </div>
      )}

      {/* Achievement toast */}
      {st.newAch && <div style={{position:'fixed',top:16,left:'50%',zIndex:401,animation:'achSlide 3s ease-out forwards',whiteSpace:'nowrap'}}><div style={{background:'rgba(22,0,15,.97)',border:'1px solid '+T.a1+'66',borderRadius:50,padding:'11px 20px',display:'flex',alignItems:'center',gap:10,boxShadow:'0 0 28px '+T.a1+'44'}}><span style={{fontSize:'1.5rem'}}>{st.newAch.emoji}</span><div><div style={{color:'rgba(255,179,217,.45)',fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>Achievement Unlocked</div><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.86rem',fontWeight:'bold'}}>{st.newAch.title}</div></div></div></div>}

      {/* All done */}
      {st.allDone && <OVL onClose={function(){setSt(function(p){return Object.assign({},p,{allDone:false});});}}><div style={Object.assign({},cardS,{padding:'44px 32px',textAlign:'center',animation:'lvlPop .6s ease-out',border:'1px solid '+T.a1+'55'})}><div style={{fontSize:'3.5rem',marginBottom:12}}>👑</div><div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'1.7rem',background:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:10}}>All Done!</div><div style={{color:'rgba(255,179,217,.62)',fontFamily:'Crimson Text,serif',fontSize:'1rem',lineHeight:1.7}}>You absolutely smashed today. Every single challenge completed. Sam is so proud of you. 💖</div>{st.streak>1&&<div style={{marginTop:14,color:'#ffb347',fontFamily:'Playfair Display,serif',fontSize:'0.9rem'}}>🔥 {st.streak} day streak{!graceAvailable?' · 🛡 grace used':''}</div>}</div></OVL>}

      {/* Level up */}
      {st.lvlUp&&!st.allDone&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',backdropFilter:'blur(4px)',zIndex:150,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',pointerEvents:'none'}}><div style={Object.assign({},cardS,{padding:'40px',textAlign:'center',animation:'lvlPop .65s ease-out',maxWidth:300,width:'100%',border:'1px solid '+T.a1+'55'})}><div style={{fontSize:'3.5rem',marginBottom:10}}>{getGlowLvl(st.glowPoints).emoji}</div><div style={{color:'rgba(255,179,217,.5)',fontSize:'0.7rem',letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:8}}>Level Up</div><div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'1.9rem',background:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{getGlowLvl(st.glowPoints).title}</div></div></div>}

      {/* PIN */}
      {st.showPin&&<OVL onClose={function(){setSt(function(p){return Object.assign({},p,{showPin:false});});}}><div style={Object.assign({},cardS,{padding:'36px 24px',textAlign:'center',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'44'})}><div style={{fontSize:'2.5rem',marginBottom:12}}>🔐</div><h3 style={{color:T.a1,fontFamily:'Playfair Display,serif',marginBottom:8,fontSize:'1.4rem'}}>{!st.pinSet?'Set Your PIN':'Admin Access'}</h3><p style={{color:'rgba(255,179,217,.46)',fontSize:'0.86rem',marginBottom:22,fontStyle:'italic'}}>{!st.pinSet?'Create a PIN to protect admin':'Enter your PIN'}</p><input type='password' inputMode='numeric' placeholder='••••' value={st.pi} onChange={function(e){setSt(function(p){return Object.assign({},p,{pi:e.target.value,pe:''});});}} onKeyDown={function(e){if(e.key==='Enter')submitPin();}} style={Object.assign({},inpS,{textAlign:'center',fontSize:'2rem',letterSpacing:'0.6em',marginBottom:12})}/>{st.pe&&<p style={{color:'#ff3d9a',fontSize:'0.86rem',margin:'0 0 12px'}}>{st.pe}</p>}<div style={{display:'flex',gap:10}}><button style={Object.assign({},gbS,{flex:1})} onClick={submitPin}>{!st.pinSet?'Set PIN':'Unlock'}</button><button onClick={function(){setSt(function(p){return Object.assign({},p,{showPin:false});});}} style={Object.assign({},sbS(false),{flex:1})}>Cancel</button></div></div></OVL>}

      {/* Note modal */}
      {st.noteId&&noteC&&<OVL onClose={function(){setSt(function(p){return Object.assign({},p,{noteId:null});});}}><div style={Object.assign({},cardS,{padding:'24px',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'38'})}><div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontSize:'0.95rem',fontWeight:'bold',marginBottom:12}}>{noteC.emoji} {noteC.title}</div><textarea rows={4} placeholder='How did it go?' value={st.noted} onChange={function(e){setSt(function(p){return Object.assign({},p,{noted:e.target.value});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5,marginBottom:12})}/><button style={gbS} onClick={function(){setSt(function(p){return Object.assign({},p,{ch:p.ch.map(function(c){return c.uid===p.noteId?Object.assign({},c,{note:p.noted}):c;}),noteId:null,noted:''});});}}>Save Note 💕</button></div></OVL>}

      {/* Difficulty modal */}
      {st.diffId&&diffC&&<OVL onClose={function(){setSt(function(p){return Object.assign({},p,{diffId:null});});}}><div style={Object.assign({},cardS,{padding:'24px',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'38',textAlign:'center'})}><div style={{color:'rgba(255,179,217,.48)',fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8}}>How was that?</div><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:'bold',marginBottom:20}}>{diffC.emoji} {diffC.title}</div><div style={{display:'flex',gap:8}}>{[['😊','Easy'],['💪','Just Right'],['🔥','Hard']].map(function(pair){return <button key={pair[1]} onClick={function(){setSt(function(p){return Object.assign({},p,{ch:p.ch.map(function(c){return c.uid===p.diffId?Object.assign({},c,{diff:pair[1]}):c;}),diffId:null});});}} style={{flex:1,padding:'10px 6px',borderRadius:10,border:'1px solid rgba(255,120,190,.2)',background:'transparent',color:'rgba(255,179,217,.5)',cursor:'pointer',fontFamily:'Crimson Text,serif',fontSize:'.82rem',touchAction:'manipulation'}}><div style={{fontSize:'1.4rem',marginBottom:4}}>{pair[0]}</div>{pair[1]}</button>;})}</div></div></OVL>}

      {/* Schedule modal */}
      {st.schedId&&schedC&&<OVL onClose={function(){setSt(function(p){return Object.assign({},p,{schedId:null});});}}><div style={Object.assign({},cardS,{padding:'22px',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'38'})}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}><span style={{fontSize:'1.2rem'}}>{schedC.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.92rem',fontWeight:'bold',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{schedC.title}</div><div style={{color:CAT_COLOR[schedC.category],fontSize:'0.62rem',marginTop:2}}>{schedC.category}</div></div></div><div style={lblS}>Repeat Schedule</div>{[['none','No repeat'],['daily','Every day'],['days','Specific days'],['date','One date']].map(function(pair){return <button key={pair[0]} onClick={function(){setOv(schedC.id,{rt:pair[0]});}} style={Object.assign({},sbS(schedOv.rt===pair[0]),{textAlign:'left',padding:'10px 14px',borderRadius:12,width:'100%',marginBottom:7})}>{schedOv.rt===pair[0]?'● ':'○ '}{pair[1]}</button>;})} {schedOv.rt==='days'&&<div style={{marginBottom:12}}><div style={lblS}>Select days</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{DAYS_SHORT.map(function(d,i){var sel=(schedOv.days||[]).indexOf(i)>=0;return <button key={i} onClick={function(){var cur=schedOv.days||[];setOv(schedC.id,{days:sel?cur.filter(function(x){return x!==i;}):[...cur,i]});}} style={{width:36,height:36,borderRadius:'50%',border:'1px solid '+(sel?T.a1+'88':'rgba(255,120,190,.22)'),background:sel?grad:'transparent',color:sel?'#fff':'rgba(255,179,217,.48)',fontSize:'.74rem',cursor:'pointer',touchAction:'manipulation'}}>{d}</button>;})} </div></div>} {schedOv.rt==='date'&&<div style={{marginBottom:12}}><div style={lblS}>Pick a date</div><input type='date' style={Object.assign({},inpS,{colorScheme:'dark'})} onChange={function(e){if(e.target.value)setOv(schedC.id,{date:new Date(e.target.value+'T12:00:00').toDateString()});}}/></div>}<button style={Object.assign({},gbS,{marginTop:4})} onClick={function(){setSt(function(p){return Object.assign({},p,{schedId:null});}); }}>Done</button></div></OVL>}


      {/* ── MAIN ── */}
      <div style={{position:'relative',zIndex:1,maxWidth:520,margin:'0 auto',padding:'0 0 90px'}}>

        {/* ═══ HOME TAB ═══ */}
        {tab==='home' && (
          <div style={{padding:'0 15px'}}>
            <div style={{textAlign:'center',padding:'32px 0 14px'}}>
              <div style={{fontSize:'2.5rem',marginBottom:7,animation:'pulse 3s infinite'}}>💖</div>
              <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'clamp(1.8rem,8vw,2.9rem)',background:'linear-gradient(135deg,'+T.a1+',rgba(255,220,240,1),'+T.a2+','+T.a1+')',backgroundSize:'300% 300%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s ease infinite',lineHeight:1.1}}>Glow Up</h1>
              <p style={{color:'rgba(255,179,217,.4)',fontStyle:'italic',margin:'6px 0 0',fontSize:'0.88rem',fontFamily:'Crimson Text,serif'}}>your daily challenges ✨</p>

              {/* Points */}
              <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:13,flexWrap:'wrap'}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:9,background:T.a1+'12',border:'1px solid '+T.a1+'22',borderRadius:50,padding:'9px 18px'}}>
                  <span style={{fontSize:'1.3rem'}}>{glowLvi.emoji}</span>
                  <div style={{textAlign:'left'}}><div style={{color:glowLvi.color,fontWeight:'bold',fontFamily:'Playfair Display,serif',fontSize:'0.86rem'}}>{glowLvi.title}</div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem'}}>✨ {st.glowPoints} Glow Pts</div></div>
                </div>
                <div style={{display:'inline-flex',alignItems:'center',gap:9,background:'rgba(255,45,120,.08)',border:'1px solid rgba(255,45,120,.2)',borderRadius:50,padding:'9px 18px'}}>
                  <span style={{fontSize:'1.3rem'}}>{grindLvi.emoji}</span>
                  <div style={{textAlign:'left'}}><div style={{color:grindLvi.color,fontWeight:'bold',fontFamily:'Playfair Display,serif',fontSize:'0.86rem'}}>{grindLvi.title}</div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem'}}>💪 {st.grindPoints} Grind Pts</div></div>
                </div>
              </div>

              {/* Streak with grace indicator */}
              {st.streak>0 && <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,179,71,.08)',border:'1px solid rgba(255,179,71,.2)',borderRadius:50,padding:'7px 14px',marginTop:8}}>
                <span>🔥</span>
                <div style={{color:'#ffb347',fontWeight:'bold',fontFamily:'Playfair Display,serif',fontSize:'0.86rem'}}>{st.streak} day streak</div>
                <span style={{fontSize:'0.8rem',title:'Grace day'}}>{graceAvailable?'🛡':'💔'}</span>
              </div>}

              {/* Glow progress */}
              {glowLvi.level<5&&<div style={{marginTop:10,padding:'0 20px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{color:'rgba(255,179,217,.24)',fontSize:'0.58rem'}}>✨ Next: {glowNext.title}</span><span style={{color:'rgba(255,179,217,.24)',fontSize:'0.58rem'}}>{Math.round(glowPct)}%</span></div><div style={{height:4,background:'rgba(255,255,255,.05)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:glowPct+'%',background:'linear-gradient(90deg,'+T.a1+','+T.a2+')',borderRadius:4,transition:'width .7s',boxShadow:'0 0 8px '+T.a1+'44'}}/></div></div>}
              {grindLvi.level<6&&<div style={{marginTop:7,padding:'0 20px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{color:'rgba(255,179,217,.24)',fontSize:'0.58rem'}}>💪 Next: {grindNext.title}</span><span style={{color:'rgba(255,179,217,.24)',fontSize:'0.58rem'}}>{Math.round(grindPct)}%</span></div><div style={{height:4,background:'rgba(255,255,255,.05)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:grindPct+'%',background:'linear-gradient(90deg,#ff3d9a,#ff85ad)',borderRadius:4,transition:'width .7s',boxShadow:'0 0 8px rgba(255,45,120,.44)'}}/></div></div>}

              {/* Week summary */}
              <div style={{margin:'12px 0 0',padding:'0 4px'}}>
                <div style={Object.assign({},cardS,{padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'})}>
                  <div style={{textAlign:'left'}}>
                    <div style={{color:'rgba(255,179,217,.4)',fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>This Week</div>
                    <div style={{display:'flex',gap:12}}>
                      <div><div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'0.9rem'}}>{weekGlowTotal} <span style={{fontSize:'0.6rem',color:'rgba(255,179,217,.4)'}}>GP</span></div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem'}}>Glow</div></div>
                      <div><div style={{color:'#ff3d9a',fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'0.9rem'}}>{weekGrindTotal} <span style={{fontSize:'0.6rem',color:'rgba(255,179,217,.4)'}}>GP</span></div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem'}}>Grind</div></div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    {currentWeekData.perfectWeekApplied&&<div style={{background:'linear-gradient(135deg,'+T.a1+','+T.a2+')',borderRadius:20,padding:'4px 10px',fontSize:'0.68rem',fontWeight:700,color:'#fff',marginBottom:4}}>🏆 1.5x!</div>}
                    <button onClick={function(){setShowWeekWrap(true);}} style={{background:'transparent',border:'1px solid rgba(255,120,190,.24)',borderRadius:20,color:'rgba(255,179,217,.5)',cursor:'pointer',fontSize:'0.68rem',padding:'4px 10px',fontFamily:'Crimson Text,serif',touchAction:'manipulation'}}>Week Wrap</button>
                  </div>
                </div>
              </div>

              {/* Admin seen indicator */}
              {st.adminSeenDate===today && <div style={{marginTop:8,fontSize:'0.72rem',color:T.a1+'88',fontFamily:'Crimson Text,serif',fontStyle:'italic'}}>Sam has seen today 💖</div>}

              <div style={{display:'flex',gap:7,justifyContent:'center',marginTop:14,overflowX:'auto',padding:'2px 4px'}}>
                {[{id:'her',l:'💅 Her View'},{id:'admin',l:'🔒 Admin'}].map(function(t){return <button key={t.id} style={sbS(st.view===t.id)} onClick={function(){if(t.id==='admin'&&!st.unlocked)tryAdmin();else setSt(function(p){return Object.assign({},p,{view:t.id});});}}>{t.l}</button>;})}
              </div>
            </div>

            {/* Week Wrap modal */}
            {showWeekWrap&&<OVL onClose={function(){setShowWeekWrap(false);}}>
              <div style={Object.assign({},cardS,{padding:'24px',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'44'})}>
                <div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'1.3rem',background:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:4}}>Week Wrap 📊</div>
                <div style={{color:'rgba(255,179,217,.4)',fontSize:'0.7rem',marginBottom:14,fontFamily:'Crimson Text,serif'}}>{currentWeekStart}</div>
                {currentWeekDates.map(function(dateStr){
                  var dayCh=currentWeekData.challenges[dateStr]||[];var doneCh=dayCh.filter(function(c){return c.done;}).length;
                  var d=new Date(dateStr);var dayId2=(['sun','mon','tue','wed','thu','fri','sat'])[d.getDay()];
                  var sess2=SESSIONS[dayId2];var sessRequired=sess2&&(sess2.isGym||sess2.isRide);var sessDone=currentWeekData.trainingSessions[dayId2];
                  var isFuture=new Date(dateStr)>new Date(today);
                  var isPerfectDay=!isFuture&&doneCh>=3&&(!sessRequired||sessDone);
                  return <div key={dateStr} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid rgba(255,120,190,.08)'}}>
                    <div style={{width:36,textAlign:'center'}}><div style={{fontSize:'0.68rem',fontWeight:'bold',color:isPerfectDay?T.a1:'rgba(255,179,217,.35)',fontFamily:'Playfair Display,serif'}}>{DAYS_SHORT[d.getDay()]}</div><div style={{fontSize:'0.58rem',color:'rgba(255,179,217,.25)'}}>{d.getDate()}/{d.getMonth()+1}</div></div>
                    <div style={{flex:1}}><div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={{fontSize:'0.7rem',color:doneCh>=3?T.a1:'rgba(255,179,217,.3)'}}>✨ {doneCh} challenges</span>{sessRequired&&<span style={{fontSize:'0.7rem',color:sessDone?'#ff3d9a':'rgba(255,179,217,.3)'}}>💪 {sessDone?'done':isFuture?'—':'missed'}</span>}{!sessRequired&&<span style={{fontSize:'0.7rem',color:'rgba(255,179,217,.25)'}}>rest day</span>}</div></div>
                    <div style={{fontSize:'1rem'}}>{isFuture?'':isPerfectDay?'⭐':'✗'}</div>
                  </div>;
                })}
                <div style={{marginTop:14,padding:'12px',background:'rgba(255,255,255,.03)',borderRadius:12,border:'1px solid rgba(255,120,190,.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{color:'rgba(255,179,217,.5)',fontSize:'0.8rem'}}>Glow Points</span><span style={{color:T.a1,fontWeight:'bold',fontSize:'0.8rem'}}>{weekGlowBase}{currentWeekData.perfectWeekApplied?' → '+weekGlowTotal:''}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{color:'rgba(255,179,217,.5)',fontSize:'0.8rem'}}>Grind Points</span><span style={{color:'#ff3d9a',fontWeight:'bold',fontSize:'0.8rem'}}>{weekGrindBase}{currentWeekData.perfectWeekApplied?' → '+weekGrindTotal:''}</span></div>
                  {currentWeekData.perfectWeekApplied&&<div style={{color:T.a1,fontSize:'0.78rem',fontStyle:'italic',textAlign:'center',marginTop:6}}>🏆 1.5x perfect week multiplier applied!</div>}
                  {!currentWeekData.perfectWeekApplied&&<div style={{color:'rgba(255,179,217,.35)',fontSize:'0.72rem',textAlign:'center',marginTop:6}}>Complete all sessions + all 3 challenges daily for 1.5x bonus</div>}
                </div>
                <button style={Object.assign({},gbS,{marginTop:14})} onClick={function(){setShowWeekWrap(false);}}>Close</button>
              </div>
            </OVL>}

            {/* HER VIEW */}
            {st.view==='her'&&<div style={{animation:'up .4s ease-out'}}>
              <div style={{display:'flex',gap:7,marginBottom:14,overflowX:'auto',padding:'2px 0'}}>
                {['Today','Stats','History'].map(function(t){return <button key={t} style={Object.assign({},sbS(st.htab===t),{flex:1,fontSize:'0.78rem'})} onClick={function(){setSt(function(p){return Object.assign({},p,{htab:t});});}}>{t}</button>;})}
              </div>

              {st.htab==='Today'&&<div>
                {/* Admin seen */}
                {st.reaction&&<div style={Object.assign({},cardS,{padding:'14px 16px',marginBottom:12,border:'1px solid '+T.a1+'44',background:T.a1+'0e',display:'flex',alignItems:'center',gap:12})}><span style={{fontSize:'1.8rem'}}>💌</span><div style={{flex:1}}><div style={{color:'rgba(255,179,217,.46)',fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>A message for you</div><div style={{color:'#ffe8f5',fontFamily:'Crimson Text,serif',fontSize:'0.92rem',lineHeight:1.5}}>{st.reaction}</div></div><button onClick={function(){setSt(function(p){return Object.assign({},p,{reaction:''});});}} style={{background:'transparent',border:'none',color:'rgba(255,179,217,.3)',cursor:'pointer',fontSize:'1.2rem',padding:'4px'}}>x</button></div>}
                {st.msg&&<div style={Object.assign({},cardS,{padding:'12px 16px',marginBottom:12})}><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Today from Sam</div><div style={{color:'rgba(255,179,217,.68)',fontFamily:'Crimson Text,serif',fontSize:'0.93rem',fontStyle:'italic',lineHeight:1.55}}>{st.msg}</div></div>}

                {/* Progress */}
                {st.ch.length>0&&<div style={Object.assign({},cardS,{padding:'13px 16px',marginBottom:13})}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}><span style={{color:'rgba(255,179,217,.44)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.12em'}}>Today — all 3 needed</span><span style={{color:doneT>=3?T.a1:'rgba(255,179,217,.5)',fontWeight:'bold',fontFamily:'Playfair Display,serif'}}>{doneT} / {st.ch.length}</span></div><div style={{height:7,background:'rgba(255,255,255,.05)',borderRadius:7,overflow:'hidden'}}><div style={{height:'100%',width:(st.ch.length?(doneT/st.ch.length)*100:0)+'%',background:'linear-gradient(90deg,'+T.a1+','+T.a2+')',borderRadius:7,transition:'width .6s',boxShadow:'0 0 10px '+T.a1+'44'}}/></div></div>}

                {/* Challenges */}
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {st.ch.map(function(c,i){
                    var cc=CAT_COLOR[c.category]||'#ff6eb4';
                    return <div key={c.uid} style={Object.assign({},cardS,{padding:'18px',animation:'popIn .4s '+(i*.12)+'s ease-out both',border:c.done?'1px solid '+T.a1+'36':'1px solid rgba(255,120,190,.13)',background:c.done?T.a1+'07':'rgba(255,255,255,.035)',position:'relative',overflow:'hidden'})}>
                      {st.celebId===c.uid&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',pointerEvents:'none',zIndex:5}}>✨💖✨</div>}
                      <div style={{position:'absolute',top:0,left:0,width:'3px',height:'100%',background:'linear-gradient(to bottom,'+cc+','+cc+'44)',borderRadius:'3px 0 0 3px'}}/>
                      <div style={{display:'flex',alignItems:'flex-start',gap:12,paddingLeft:7}}>
                        <button style={cbS(c.done)} onClick={function(){complete(c.uid);}}>{c.done?'✓':''}</button>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:5}}>
                            <span style={{fontSize:'1.2rem'}}>{c.emoji}</span>
                            <span style={{fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'0.96rem',color:c.done?'rgba(255,179,217,.32)':'#ffe8f5',textDecoration:c.done?'line-through':'none',lineHeight:1.3}}>{c.title}</span>
                            <span style={{fontSize:'0.58rem',padding:'2px 9px',borderRadius:50,background:cc+'14',color:cc,border:'1px solid '+cc+'30',textTransform:'uppercase',whiteSpace:'nowrap'}}>{CAT_ICON[c.category]} {c.category}</span>
                          </div>
                          <p style={{margin:0,color:c.done?'rgba(255,179,217,.22)':'rgba(255,179,217,.55)',fontSize:'0.87rem',fontFamily:'Crimson Text,serif',lineHeight:1.65}}>{c.description}</p>
                          {c.hint&&!c.done&&<div style={{marginTop:8,padding:'8px 11px',background:'rgba(255,255,255,.03)',borderRadius:10,border:'1px solid rgba(255,120,190,.1)'}}><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>💡 How to</div><p style={{color:'rgba(255,179,217,.45)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',lineHeight:1.5,margin:0}}>{c.hint}</p></div>}
                          {c.done&&<div style={{fontSize:'0.7rem',color:T.a1,fontFamily:'Crimson Text,serif',marginTop:5}}>+{GLOW_PER_CHALLENGE} ✨ Glow Points</div>}
                          {c.done&&<div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
                            <button onClick={function(){setSt(function(p){return Object.assign({},p,{noteId:c.uid,noted:c.note||''});});}} style={{background:'transparent',border:'1px solid rgba(255,120,190,.22)',borderRadius:20,color:'rgba(255,179,217,.5)',cursor:'pointer',fontSize:'0.7rem',padding:'4px 12px',fontFamily:'Crimson Text,serif',touchAction:'manipulation'}}>{c.note?'📝 Edit':'📝 Note'}</button>
                            <button onClick={function(){setSt(function(p){return Object.assign({},p,{diffId:c.uid});});}} style={{background:'transparent',border:'1px solid rgba(255,120,190,.22)',borderRadius:20,color:'rgba(255,179,217,.5)',cursor:'pointer',fontSize:'0.7rem',padding:'4px 12px',fontFamily:'Crimson Text,serif',touchAction:'manipulation'}}>{c.diff?(c.diff==='Easy'?'😊 ':c.diff==='Just Right'?'💪 ':'🔥 ')+c.diff:'⭐ Rate'}</button>
                          </div>}
                          {/* Swap button */}
                          {!c.done&&canSwap&&<button onClick={function(){swapChallenge(c.uid);}} style={{marginTop:8,background:'transparent',border:'1px solid rgba(255,120,190,.18)',borderRadius:20,color:'rgba(255,179,217,.3)',cursor:'pointer',fontSize:'0.68rem',padding:'3px 10px',fontFamily:'Crimson Text,serif',touchAction:'manipulation'}}>🔄 Swap challenge</button>}
                          {c.note&&<p style={{margin:'7px 0 0',color:'rgba(255,179,217,.4)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',fontStyle:'italic'}}>{c.note}</p>}
                        </div>
                      </div>
                    </div>;
                  })}
                </div>

                {/* Her message to Sam */}
                <div style={Object.assign({},cardS,{padding:'14px',marginTop:14})}>
                  <div style={{color:'rgba(255,179,217,.4)',fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>💬 Message Sam</div>
                  {(st.herMessages||[]).filter(function(m){return m.date===today;}).map(function(m,i){return <div key={i} style={{padding:'8px 11px',background:T.a1+'0a',borderRadius:10,marginBottom:6,fontSize:'0.82rem',color:'rgba(255,179,217,.65)',fontFamily:'Crimson Text,serif',fontStyle:'italic'}}>{m.text} {m.read&&<span style={{fontSize:'0.6rem',color:T.a1}}>✓ seen</span>}</div>;})}
                  <div style={{display:'flex',gap:8,marginTop:6}}>
                    <input placeholder='Say something to Sam...' value={st.herMsgDraft} onChange={function(e){setSt(function(p){return Object.assign({},p,{herMsgDraft:e.target.value});});}} style={Object.assign({},inpS,{flex:1,padding:'10px 12px'})} onKeyDown={function(e){if(e.key==='Enter'&&st.herMsgDraft.trim()){var msg={id:Date.now(),text:st.herMsgDraft.trim(),date:today,read:false};setSt(function(p){return Object.assign({},p,{herMessages:(p.herMessages||[]).concat([msg]),herMsgDraft:''});});}}}/>
                    <button onClick={function(){if(!st.herMsgDraft.trim())return;var msg={id:Date.now(),text:st.herMsgDraft.trim(),date:today,read:false};setSt(function(p){return Object.assign({},p,{herMessages:(p.herMessages||[]).concat([msg]),herMsgDraft:''});});}} style={{background:grad,border:'none',borderRadius:12,color:'#fff',padding:'10px 14px',cursor:'pointer',fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'0.82rem',touchAction:'manipulation',flexShrink:0}}>Send</button>
                  </div>
                </div>

                {!canSwap&&<div style={{textAlign:'center',color:'rgba(255,179,217,.25)',fontSize:'0.66rem',fontStyle:'italic',marginTop:8,fontFamily:'Crimson Text,serif'}}>Swap used for today</div>}
              </div>}

              {st.htab==='Stats'&&<div style={{animation:'up .35s ease-out'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                  <div style={Object.assign({},cardS,{padding:'16px 12px',textAlign:'center',border:'1px solid '+T.a1+'33'})}><div style={{fontSize:'1.8rem',marginBottom:5}}>{glowLvi.emoji}</div><div style={{color:glowLvi.color,fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1rem'}}>{glowLvi.title}</div><div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1.4rem',marginTop:2}}>{st.glowPoints}</div><div style={{color:'rgba(255,179,217,.32)',fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.07em'}}>Glow Points</div></div>
                  <div style={Object.assign({},cardS,{padding:'16px 12px',textAlign:'center',border:'1px solid rgba(255,45,120,.22)'})}><div style={{fontSize:'1.8rem',marginBottom:5}}>{grindLvi.emoji}</div><div style={{color:grindLvi.color,fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1rem'}}>{grindLvi.title}</div><div style={{color:'#ff3d9a',fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1.4rem',marginTop:2}}>{st.grindPoints}</div><div style={{color:'rgba(255,179,217,.32)',fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.07em'}}>Grind Points</div></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                  {[{e:'🔥',v:st.streak,l:'Day Streak'},{e:'🏆',v:st.perfectWeeks||0,l:'Perfect Weeks'},{e:'✨',v:st.pb.bestGlowWeek||0,l:'Best Glow Week'},{e:'💪',v:st.pb.bestGrindWeek||0,l:'Best Grind Week'}].map(function(s,i){return <div key={i} style={Object.assign({},cardS,{padding:'14px 12px',textAlign:'center'})}><div style={{fontSize:'1.5rem',marginBottom:5}}>{s.e}</div><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1rem'}}>{s.v}</div><div style={{color:'rgba(255,179,217,.32)',fontSize:'0.6rem',marginTop:3,textTransform:'uppercase',letterSpacing:'0.07em'}}>{s.l}</div></div>;})}</div>
                <div style={Object.assign({},cardS,{padding:'16px',marginBottom:13})}><div style={{color:'rgba(255,179,217,.42)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>By Category</div>{CATS.map(function(cat){var n=st.cats[cat]||0;var mx=Math.max.apply(null,CATS.map(function(c){return st.cats[c]||0;}).concat([1]));var cc=CAT_COLOR[cat];return <div key={cat} style={{marginBottom:9}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{color:'rgba(255,179,217,.52)',fontSize:'0.76rem'}}>{CAT_ICON[cat]} {cat}</span><span style={{color:cc,fontSize:'0.76rem',fontWeight:'bold'}}>{n}</span></div><div style={{height:4,background:'rgba(255,255,255,.05)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:((n/mx)*100)+'%',background:'linear-gradient(90deg,'+cc+','+cc+'88)',borderRadius:4}}/></div></div>;})}
                </div>
                <div style={Object.assign({},cardS,{padding:'16px'})}><div style={{color:'rgba(255,179,217,.42)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>Achievements ({st.earned.length}/{ACHIEVEMENTS.length})</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{ACHIEVEMENTS.map(function(a){var e=st.earned.indexOf(a.id)>=0;return <div key={a.id} style={{background:e?T.a1+'12':'rgba(255,255,255,.02)',border:'1px solid '+(e?T.a1+'44':'rgba(255,120,190,.1)'),borderRadius:12,padding:'11px 9px',textAlign:'center',opacity:e?1:.36}}><div style={{fontSize:'1.3rem',marginBottom:3}}>{a.emoji}</div><div style={{color:e?'#ffe8f5':'rgba(255,179,217,.46)',fontFamily:'Playfair Display,serif',fontSize:'0.74rem',fontWeight:'bold',marginBottom:2}}>{a.title}</div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem',lineHeight:1.3}}>{a.desc}</div></div>;})}</div></div>
              </div>}

              {st.htab==='History'&&<div style={{animation:'up .35s ease-out'}}>
                <div style={{color:'rgba(255,179,217,.32)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:12,textAlign:'center'}}>Past Challenges</div>
                {hdates.length===0?<div style={{textAlign:'center',padding:'50px 20px',color:'rgba(255,179,217,.26)',fontStyle:'italic',fontFamily:'Crimson Text,serif'}}>Complete some challenges and they will appear here 🌸</div>
                :hdates.map(function(date){var dc=st.hist[date]||[];var dd=dc.filter(function(c){return c.done;}).length;var pf=dd>=3;
                  return <div key={date} style={Object.assign({},cardS,{padding:'13px 16px',marginBottom:10,border:pf?'1px solid '+T.a1+'30':'1px solid rgba(255,120,190,.11)'})}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}><span style={{color:'rgba(255,179,217,.48)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif'}}>{date}</span><span style={{fontSize:'0.72rem',color:pf?T.a1:'rgba(255,179,217,.3)',fontFamily:'Playfair Display,serif'}}>{dd}/{dc.length}{pf?' ✨':''}</span></div>
                    {dc.map(function(c,i){return <div key={i}><div style={{display:'flex',alignItems:'center',gap:8,marginTop:5,opacity:c.done?1:.32}}><span style={{fontSize:'0.78rem'}}>{c.done?'✅':'⭕'}</span><span style={{color:'rgba(255,179,217,.55)',fontSize:'0.8rem',fontFamily:'Crimson Text,serif',flex:1}}>{c.title}</span>{c.diff&&<span style={{fontSize:'0.7rem'}}>{c.diff==='Easy'?'😊':c.diff==='Just Right'?'💪':'🔥'}</span>}</div>{c.note&&<div style={{color:'rgba(255,179,217,.35)',fontSize:'0.72rem',fontStyle:'italic',marginLeft:22,marginTop:2}}>{c.note}</div>}</div>;})}
                  </div>;
                })}
              </div>}
            </div>}


            {/* ADMIN VIEW */}
            {st.view==='admin'&&st.unlocked&&<div style={{animation:'up .4s ease-out'}}>
              <div style={{display:'flex',gap:5,marginBottom:14,overflowX:'auto',padding:'2px 0'}}>
                {['Today','Challenges','Planner','Add New','Bulk Import','Week','Rules','Naughty','Rewards','Settings'].map(function(t){return <button key={t} style={Object.assign({},sbS(st.atab===t),{flex:1,minWidth:'fit-content',padding:'8px 9px',fontSize:'0.68rem'})} onClick={function(){setSt(function(p){return Object.assign({},p,{atab:t});});}}>{t}</button>;})}
              </div>

              {/* ADMIN TODAY */}
              {st.atab==='Today'&&<div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:13}}>
                  {[{l:'Glow Pts',v:st.glowPoints,e:'✨'},{l:'Grind Pts',v:st.grindPoints,e:'💪'},{l:'Streak',v:st.streak+'d 🔥',e:'📅'},{l:'Perfect Wks',v:st.perfectWeeks||0,e:'🏆'}].map(function(s,i){return <div key={i} style={Object.assign({},cardS,{padding:'12px 7px',textAlign:'center'})}><div style={{fontSize:'1.2rem',marginBottom:3}}>{s.e}</div><div style={{color:'#ffb3d9',fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'0.8rem'}}>{s.v}</div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem',marginTop:2,textTransform:'uppercase',letterSpacing:'0.07em'}}>{s.l}</div></div>;})}</div>

                {/* Her messages */}
                {(st.herMessages||[]).length>0&&<div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div style={lblS}>Messages from Rebecca {unreadHerMsgs>0&&<span style={{background:T.a1,color:'#fff',borderRadius:20,padding:'1px 7px',fontSize:'0.6rem',marginLeft:6}}>{unreadHerMsgs} new</span>}</div>
                  </div>
                  {(st.herMessages||[]).slice(-5).reverse().map(function(m){return <div key={m.id} style={{padding:'8px 11px',background:m.read?'rgba(255,255,255,.02)':T.a1+'0a',borderRadius:10,marginBottom:6,border:'1px solid '+(m.read?'rgba(255,120,190,.1)':T.a1+'22')}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}><div style={{color:'#ffe8f5',fontSize:'0.84rem',fontFamily:'Crimson Text,serif',fontStyle:'italic',flex:1}}>{m.text}</div><button onClick={function(){setSt(function(p){return Object.assign({},p,{herMessages:p.herMessages.map(function(x){return x.id===m.id?Object.assign({},x,{read:true}):x;})});});}} style={{background:'transparent',border:'none',color:m.read?'rgba(255,179,217,.3)':T.a1,cursor:'pointer',fontSize:'0.7rem',padding:'2px 6px',fontFamily:'Crimson Text,serif',touchAction:'manipulation',flexShrink:0}}>{m.read?'✓ seen':'Mark seen'}</button></div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.62rem',marginTop:3}}>{m.date}</div></div>;})}
                </div>}

                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}>
                  <div style={lblS}>Quick Pin for Today</div>
                  <select value={st.qpin||''} onChange={function(e){setSt(function(p){return Object.assign({},p,{qpin:e.target.value||null});});}} style={Object.assign({},inpS,{marginBottom:9})}><option value=''>Pick a challenge...</option>{allCh.map(function(c){return <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>;})}</select>
                  <button style={gbS} onClick={function(){if(!st.qpin)return;var ch=allCh.find(function(c){return c.id===st.qpin;});if(!ch)return;setSt(function(p){var ex=p.ch.filter(function(c){return c.id!==ch.id;});var nc=[Object.assign({},ch,{uid:today+'-pin',done:false,note:'',diff:null})].concat(ex).slice(0,3);return Object.assign({},p,{ch:nc,lgd:today,qpin:null});});}}>Pin Challenge Today 📌</button>
                </div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}>
                  <div style={lblS}>Daily message for her</div>
                  <textarea rows={2} placeholder='Write something encouraging...' value={st.msgd} onChange={function(e){setSt(function(p){return Object.assign({},p,{msgd:e.target.value});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5,marginBottom:9})}/>
                  <button style={gbS} onClick={function(){setSt(function(p){return Object.assign({},p,{msg:p.msgd});});}}>Save Message 💕</button>
                </div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}>
                  <div style={lblS}>Send her a reaction</div>
                  <textarea rows={2} placeholder='A note she will see when she opens the app...' value={st.reactd} onChange={function(e){setSt(function(p){return Object.assign({},p,{reactd:e.target.value});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5,marginBottom:9})}/>
                  <button style={gbS} onClick={function(){setSt(function(p){return Object.assign({},p,{reaction:p.reactd,reactd:''});});}}>Send 💖</button>
                </div>
                <button style={Object.assign({},gbS,{marginBottom:6})} onClick={function(){gen();}}>🔄 Regenerate Challenges</button>
                <p style={{color:'rgba(255,179,217,.24)',fontSize:'0.7rem',textAlign:'center',marginBottom:13,fontStyle:'italic'}}>Day-aware picker — uses today context: {(DAY_CONTEXTS[todayDayId]||[]).join(', ')}</p>
                {st.ch.length>0&&<div style={{marginBottom:13}}><div style={lblS}>Todays Challenges</div>{st.ch.map(function(c){var cc=CAT_COLOR[c.category]||'#ff6eb4';return <div key={c.uid} style={Object.assign({},cardS,{padding:'10px 13px',marginBottom:7,display:'flex',alignItems:'center',gap:9})}><span>{c.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.82rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.title}</div><div style={{color:cc,fontSize:'0.6rem',marginTop:2}}>{c.category} · {c.ctx||'any'} · {c.done?'done':'pending'}</div></div></div>;})} </div>}
                <button onClick={function(){setSt(function(p){return Object.assign({},p,{unlocked:false,view:'her'});});}} style={Object.assign({},sbS(false),{width:'100%',padding:'11px'})}>🔒 Lock and Return</button>
              </div>}

              {/* ADMIN CHALLENGES */}
              {st.atab==='Challenges'&&<div>
                <input placeholder='Search...' value={st.fsearch} onChange={function(e){setSt(function(p){return Object.assign({},p,{fsearch:e.target.value});});}} style={Object.assign({},inpS,{marginBottom:9})}/>
                <div style={{display:'flex',gap:5,overflowX:'auto',padding:'2px 0',marginBottom:11}}>{['All'].concat(CATS).map(function(cat){return <button key={cat} style={Object.assign({},sbS(st.fcat===cat),{fontSize:'0.68rem',padding:'6px 11px',whiteSpace:'nowrap'})} onClick={function(){setSt(function(p){return Object.assign({},p,{fcat:cat});});}}>{cat==='All'?'All':CAT_ICON[cat]+' '+cat}</button>;})} </div>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {filt.map(function(c){var ov=st.ovr[c.id]||{};var dis=!!ov.disabled;var sched=ov.rt&&ov.rt!=='none';var cc=CAT_COLOR[c.category]||'#ff6eb4';
                    return <div key={c.id} style={Object.assign({},cardS,{padding:'10px 12px',opacity:dis?.42:1,border:sched?'1px solid '+T.a1+'35':'1px solid rgba(255,120,190,.12)'})}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:'0.95rem'}}>{c.emoji}</span>
                        <div style={{flex:1,minWidth:0}}><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.8rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textDecoration:dis?'line-through':'none'}}>{c.title}</div><div style={{display:'flex',alignItems:'center',gap:5,marginTop:2,flexWrap:'wrap'}}><span style={{color:cc,fontSize:'0.58rem'}}>{CAT_ICON[c.category]} {c.category}</span><span style={{color:'rgba(255,179,217,.3)',fontSize:'0.56rem'}}>{c.ctx||'any'}</span>{c.custom&&<span style={{color:'rgba(255,179,71,.5)',fontSize:'0.56rem'}}>custom</span>}</div></div>
                        <button onClick={function(){setSt(function(p){return Object.assign({},p,{schedId:c.id});});}} style={{background:'transparent',border:'1px solid rgba(255,120,190,.18)',borderRadius:8,color:sched?T.a1:'rgba(255,179,217,.34)',cursor:'pointer',fontSize:'0.66rem',padding:'4px 8px',touchAction:'manipulation'}}>📅</button>
                        <button onClick={function(){setOv(c.id,{disabled:!dis});}} style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',background:dis?'rgba(255,120,190,.18)':'linear-gradient(135deg,'+T.a1+','+T.a2+')',position:'relative',touchAction:'manipulation',flexShrink:0}}><div style={{position:'absolute',top:3,left:dis?3:23,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/></button>
                      </div>
                      {c.custom&&<button onClick={function(){setSt(function(p){return Object.assign({},p,{custom:p.custom.filter(function(x){return x.id!==c.id;})});});}} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.34)',cursor:'pointer',fontSize:'0.66rem',marginTop:6,padding:0,touchAction:'manipulation'}}>Delete</button>}
                    </div>;
                  })}
                </div>
              </div>}

              {/* ADMIN PLANNER */}
              {st.atab==='Planner'&&<div>
                <p style={{color:'rgba(255,179,217,.4)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',marginBottom:13,lineHeight:1.5}}>Set specific challenges for any day this week.</p>
                {getWeekDatesUI().map(function(date,i){var ds=date.toDateString();var isTd=ds===today;var isPast=date<new Date()&&!isTd;var planned=st.wplan[ds]||[];var exp=st.wpexp===ds;
                  return <div key={i} style={Object.assign({},cardS,{marginBottom:8,border:isTd?'1px solid '+T.a1+'44':'1px solid rgba(255,120,190,.13)',opacity:isPast?.5:1})}>
                    <button onClick={function(){setSt(function(p){return Object.assign({},p,{wpexp:p.wpexp===ds?null:ds});});}} style={{width:'100%',background:'transparent',border:'none',padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,touchAction:'manipulation'}}>
                      <div style={{flex:1,textAlign:'left'}}><div style={{color:isTd?T.a1:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.88rem',fontWeight:isTd?'bold':'normal'}}>{DAYS_SHORT[date.getDay()]} {date.getDate()}/{date.getMonth()+1}{isTd?' (Today)':''}</div><div style={{color:'rgba(255,179,217,.38)',fontSize:'0.64rem',marginTop:2}}>{planned.length>0?planned.length+' planned':'Free choice'}</div></div>
                      <span style={{color:'rgba(255,179,217,.3)',fontSize:'0.8rem'}}>{exp?'▲':'▼'}</span>
                    </button>
                    {exp&&<div style={{padding:'0 14px 14px'}}>
                      {planned.map(function(id){var ch=allCh.find(function(c){return c.id===id;});return ch?<div key={id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,padding:'8px 10px',background:'rgba(255,255,255,.03)',borderRadius:10,border:'1px solid '+T.a1+'22'}}><span style={{fontSize:'0.9rem'}}>{ch.emoji}</span><span style={{color:'rgba(255,179,217,.65)',fontSize:'0.78rem',flex:1,fontFamily:'Crimson Text,serif'}}>{ch.title}</span><button onClick={function(){setSt(function(p){var np=Object.assign({},p.wplan);np[ds]=(np[ds]||[]).filter(function(x){return x!==id;});return Object.assign({},p,{wplan:np});});}} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.38)',cursor:'pointer',fontSize:'1rem',padding:'2px',touchAction:'manipulation'}}>x</button></div>:null;})}
                      {planned.length<3&&<select onChange={function(e){if(e.target.value&&planned.indexOf(e.target.value)<0){setSt(function(p){var np=Object.assign({},p.wplan);np[ds]=(np[ds]||[]).concat([e.target.value]);return Object.assign({},p,{wplan:np});});}e.target.value='';}} defaultValue='' style={inpS}><option value=''>Add a challenge...</option>{allCh.filter(function(c){return planned.indexOf(c.id)<0;}).map(function(c){return <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>;})}</select>}
                      {planned.length>0&&<button onClick={function(){setSt(function(p){var np=Object.assign({},p.wplan);np[ds]=[];return Object.assign({},p,{wplan:np});});}} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.38)',cursor:'pointer',fontSize:'0.7rem',marginTop:7,padding:0,fontFamily:'Crimson Text,serif'}}>Clear day</button>}
                    </div>}
                  </div>;
                })}
              </div>}

              {/* ADMIN ADD NEW */}
              {st.atab==='Add New'&&<div>
                <div style={{marginBottom:10}}><div style={lblS}>Title</div><input placeholder='Short punchy title...' value={st.form.title} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{title:e.target.value}),ferr:''});});}} style={inpS}/></div>
                <div style={{marginBottom:10}}><div style={lblS}>Description</div><textarea rows={3} placeholder='1-2 encouraging sentences...' value={st.form.desc} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{desc:e.target.value}),ferr:''});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5})}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:10}}>
                  <div><div style={lblS}>Category</div><select value={st.form.category} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{category:e.target.value})});});}} style={inpS}>{CATS.map(function(c){return <option key={c} value={c}>{CAT_ICON[c]} {c}</option>;})}</select></div>
                  <div><div style={lblS}>Emoji</div><input value={st.form.emoji} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{emoji:e.target.value})});});}} style={Object.assign({},inpS,{textAlign:'center',fontSize:'1.3rem'})} maxLength={2}/></div>
                </div>
                <div style={{marginBottom:13}}><div style={lblS}>Level</div><select value={st.form.level} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{level:Number(e.target.value)})});});}} style={inpS}>{GLOW_LEVELS.map(function(l){return <option key={l.level} value={l.level}>{l.emoji} Level {l.level} — {l.title}</option>;})}</select></div>
                {st.ferr&&<p style={{color:'#ff3d9a',fontSize:'0.82rem',marginBottom:10}}>{st.ferr}</p>}
                <button style={gbS} onClick={addOne}>Add Challenge 💕</button>
              </div>}

              {/* ADMIN BULK IMPORT */}
              {st.atab==='Bulk Import'&&<div>
                <div style={Object.assign({},cardS,{padding:'13px',marginBottom:12})}><div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontSize:'0.88rem',fontWeight:'bold',marginBottom:6}}>How it works</div><div style={{color:'rgba(255,179,217,.52)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',lineHeight:1.6}}>Paste one challenge per line. Add description on next line optionally.</div></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:10}}>
                  <div><div style={lblS}>Category</div><select value={st.bcat} onChange={function(e){setSt(function(p){return Object.assign({},p,{bcat:e.target.value});});}} style={inpS}>{CATS.map(function(c){return <option key={c} value={c}>{CAT_ICON[c]} {c}</option>;})}</select></div>
                  <div><div style={lblS}>Emoji</div><input value={st.bemoji} onChange={function(e){setSt(function(p){return Object.assign({},p,{bemoji:e.target.value});});}} style={Object.assign({},inpS,{textAlign:'center',fontSize:'1.3rem'})} maxLength={2}/></div>
                </div>
                <div style={{marginBottom:10}}><div style={lblS}>Level</div><select value={st.blvl} onChange={function(e){setSt(function(p){return Object.assign({},p,{blvl:Number(e.target.value)});});}} style={inpS}>{GLOW_LEVELS.map(function(l){return <option key={l.level} value={l.level}>{l.emoji} Level {l.level} — {l.title}</option>;})}</select></div>
                <div style={{marginBottom:10}}><div style={lblS}>Paste challenges</div><textarea rows={8} placeholder='Title here...' value={st.bulk} onChange={function(e){setSt(function(p){return Object.assign({},p,{bulk:e.target.value,bres:''});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5,fontFamily:'monospace',fontSize:'0.8rem'})}/></div>
                {st.bres&&<div style={{color:st.bres.indexOf('Imported')>=0?'#90caf9':'#ff6eb4',fontSize:'0.8rem',marginBottom:10,padding:'9px 13px',background:'rgba(255,255,255,.04)',borderRadius:10}}>{st.bres}</div>}
                <button style={gbS} onClick={bulkImport}>Import</button>
              </div>}

              {/* ADMIN WEEK */}
              {st.atab==='Week'&&<div>
                <div style={{fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1.1rem',color:'#ffe8f5',marginBottom:4}}>Weekly Summary</div>
                <div style={{color:'rgba(255,179,217,.4)',fontSize:'0.72rem',marginBottom:14,fontFamily:'Crimson Text,serif'}}>{currentWeekStart}</div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:12})}>
                  <div style={{display:'flex',justifyContent:'space-around',marginBottom:10}}>
                    <div style={{textAlign:'center'}}><div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1.4rem'}}>{weekGlowTotal}</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.6rem',textTransform:'uppercase'}}>Glow</div>{currentWeekData.perfectWeekApplied&&<div style={{color:T.a1,fontSize:'0.6rem'}}>(was {weekGlowBase})</div>}</div>
                    <div style={{textAlign:'center'}}><div style={{color:'#ff3d9a',fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1.4rem'}}>{weekGrindTotal}</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.6rem',textTransform:'uppercase'}}>Grind</div>{currentWeekData.perfectWeekApplied&&<div style={{color:'#ff3d9a',fontSize:'0.6rem'}}>(was {weekGrindBase})</div>}</div>
                    <div style={{textAlign:'center'}}><div style={{color:'#ffb347',fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1.4rem'}}>{currentWeekData.perfectWeekApplied?'🏆':'—'}</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.6rem',textTransform:'uppercase'}}>Perfect</div></div>
                  </div>
                </div>
                <div style={lblS}>Daily Breakdown</div>
                {currentWeekDates.map(function(dateStr){
                  var dayCh=currentWeekData.challenges[dateStr]||[];var doneCh=dayCh.filter(function(c){return c.done;}).length;
                  var d=new Date(dateStr);var dayId2=(['sun','mon','tue','wed','thu','fri','sat'])[d.getDay()];
                  var sess2=SESSIONS[dayId2];var sessRequired=sess2&&(sess2.isGym||sess2.isRide);var sessDone=currentWeekData.trainingSessions[dayId2];
                  var glowEarned=doneCh*GLOW_PER_CHALLENGE;var grindEarned=sessDone?(sess2.isGym?GRIND_GYM:GRIND_RIDE):0;
                  var isFuture=new Date(dateStr)>new Date(today);
                  return <div key={dateStr} style={Object.assign({},cardS,{padding:'11px 14px',marginBottom:8,opacity:isFuture?.45:1})}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{minWidth:40}}><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.82rem',fontWeight:'bold'}}>{DAYS_SHORT[d.getDay()]}</div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.62rem'}}>{d.getDate()}/{d.getMonth()+1}</div></div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:3}}><span style={{fontSize:'0.72rem',color:doneCh>=3?T.a1:'rgba(255,179,217,.35)'}}>✨ {doneCh} challenges</span>{sessRequired&&<span style={{fontSize:'0.72rem',color:sessDone?'#ff3d9a':'rgba(255,179,217,.35)'}}>💪 {sess2.title} {sessDone?'✓':isFuture?'—':'✗'}</span>}{!sessRequired&&<span style={{fontSize:'0.72rem',color:'rgba(255,179,217,.25)'}}>rest</span>}</div>
                        {dayCh.length>0&&<div style={{fontSize:'0.66rem',color:'rgba(255,179,217,.35)',fontFamily:'Crimson Text,serif'}}>{dayCh.filter(function(c){return c.done;}).map(function(c){return c.title;}).join(', ')||'none done'}</div>}
                      </div>
                      <div style={{textAlign:'right'}}>{glowEarned>0&&<div style={{color:T.a1,fontSize:'0.68rem'}}>+{glowEarned}</div>}{grindEarned>0&&<div style={{color:'#ff3d9a',fontSize:'0.68rem'}}>+{grindEarned}</div>}</div>
                    </div>
                  </div>;
                })}
              </div>}

              {/* ADMIN RULES */}
              {st.atab==='Rules'&&<div>
                <p style={{color:'rgba(255,179,217,.4)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',marginBottom:14,lineHeight:1.5}}>Toggle rules on and off or add your own.</p>
                <div style={Object.assign({},cardS,{padding:'16px',marginBottom:16})}>
                  <div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontSize:'0.9rem',fontWeight:'bold',marginBottom:12}}>Add a Custom Rule</div>
                  <div style={{display:'grid',gridTemplateColumns:'60px 1fr',gap:9,marginBottom:10}}><div><div style={lblS}>Emoji</div><input value={st.ruleForm.emoji} onChange={function(e){setSt(function(p){return Object.assign({},p,{ruleForm:Object.assign({},p.ruleForm,{emoji:e.target.value})});});}} style={Object.assign({},inpS,{textAlign:'center',fontSize:'1.3rem',padding:'10px 6px'})} maxLength={2}/></div><div><div style={lblS}>Title</div><input placeholder='e.g. Stretch for 10 minutes' value={st.ruleForm.title} onChange={function(e){setSt(function(p){return Object.assign({},p,{ruleForm:Object.assign({},p.ruleForm,{title:e.target.value}),ruleFormErr:''});});}} style={inpS}/></div></div>
                  <div style={{marginBottom:12}}><div style={lblS}>Description</div><textarea rows={2} placeholder='What does completing this look like?' value={st.ruleForm.description} onChange={function(e){setSt(function(p){return Object.assign({},p,{ruleForm:Object.assign({},p.ruleForm,{description:e.target.value})});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5})}/></div>
                  {st.ruleFormErr&&<p style={{color:'#ff3d9a',fontSize:'0.82rem',marginBottom:10}}>{st.ruleFormErr}</p>}
                  <button style={gbS} onClick={function(){if(!st.ruleForm.title.trim()){setSt(function(p){return Object.assign({},p,{ruleFormErr:'Add a title'});});return;}var newRule={id:'cr-'+Date.now(),emoji:st.ruleForm.emoji,title:st.ruleForm.title.trim(),description:st.ruleForm.description.trim(),custom:true};setSt(function(p){return Object.assign({},p,{customRules:p.customRules.concat([newRule]),ruleForm:{emoji:'✅',title:'',description:''},ruleFormErr:''});});}}>Add Rule ✅</button>
                </div>
                <div style={lblS}>Built-in Rules</div>
                <div style={{display:'flex',flexDirection:'column',gap:7,marginTop:6,marginBottom:16}}>
                  {DAILY_RULES.map(function(rule){var dis=!!(st.rulesOvr[rule.id]&&st.rulesOvr[rule.id].disabled);return <div key={rule.id} style={Object.assign({},cardS,{padding:'11px 13px',opacity:dis?0.42:1})}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:'1.1rem'}}>{rule.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.82rem',fontWeight:'bold',textDecoration:dis?'line-through':'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{rule.title}</div><div style={{color:'rgba(255,179,217,.35)',fontSize:'0.66rem',marginTop:2,fontFamily:'Crimson Text,serif',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{rule.description}</div></div><button onClick={function(){setSt(function(p){var o=Object.assign({},p.rulesOvr);o[rule.id]=Object.assign({},o[rule.id]||{},{disabled:!dis});return Object.assign({},p,{rulesOvr:o});});}} style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',background:dis?'rgba(255,120,190,.18)':'linear-gradient(135deg,'+T.a1+','+T.a2+')',position:'relative',touchAction:'manipulation',flexShrink:0}}><div style={{position:'absolute',top:3,left:dis?3:23,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/></button></div></div>;})}
                </div>
                {st.customRules.length>0&&<div><div style={lblS}>Custom Rules</div><div style={{display:'flex',flexDirection:'column',gap:7,marginTop:6}}>{st.customRules.map(function(rule){var dis=!!(st.rulesOvr[rule.id]&&st.rulesOvr[rule.id].disabled);return <div key={rule.id} style={Object.assign({},cardS,{padding:'11px 13px',opacity:dis?0.42:1,border:'1px solid '+T.a1+'22'})}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:'1.1rem'}}>{rule.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.82rem',fontWeight:'bold',textDecoration:dis?'line-through':'none'}}>{rule.title}</div></div><button onClick={function(){setSt(function(p){var o=Object.assign({},p.rulesOvr);o[rule.id]=Object.assign({},o[rule.id]||{},{disabled:!dis});return Object.assign({},p,{rulesOvr:o});});}} style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',background:dis?'rgba(255,120,190,.18)':'linear-gradient(135deg,'+T.a1+','+T.a2+')',position:'relative',touchAction:'manipulation',flexShrink:0,marginRight:6}}><div style={{position:'absolute',top:3,left:dis?3:23,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/></button><button onClick={function(){if(window.confirm('Delete this rule?'))setSt(function(p){return Object.assign({},p,{customRules:p.customRules.filter(function(x){return x.id!==rule.id;})});});}} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.38)',cursor:'pointer',fontSize:'0.9rem',padding:'4px',touchAction:'manipulation'}}>🗑️</button></div></div>;})} </div>}
              </div>}

              {/* ADMIN NAUGHTY */}
              {st.atab==='Naughty'&&<div>
                <div style={Object.assign({},cardS,{padding:'18px',marginBottom:14,border:'1px solid rgba(255,68,68,.22)'})}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}><div><div style={{color:'#ff4444',fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:'bold',marginBottom:3}}>😈 Naughty Mode</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif'}}>{naughtyActive?'Active today — resets at midnight':'Off — tap to activate for today'}</div></div><button onClick={function(){var nowActive=!naughtyActive;setSt(function(p){return Object.assign({},p,{naughtyActive:nowActive,naughtyDate:nowActive?today:null});});}} style={{width:60,height:30,borderRadius:15,border:'none',cursor:'pointer',background:naughtyActive?'linear-gradient(135deg,#ff4444,#cc0000)':'rgba(255,68,68,.18)',position:'relative',touchAction:'manipulation'}}><div style={{position:'absolute',top:4,left:naughtyActive?33:4,width:22,height:22,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/></button></div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.72rem',fontFamily:'Crimson Text,serif',lineHeight:1.5}}>When active up to 1 Naughty challenge may appear per day. Requires level 2 or above. Resets automatically at midnight.</div></div>
                <div style={lblS}>Naughty Challenges ({CHALLENGES.filter(function(c){return c.category==='Naughty';}).length} built-in)</div>
                <div style={{display:'flex',flexDirection:'column',gap:7,marginTop:6}}>
                  {CHALLENGES.filter(function(c){return c.category==='Naughty';}).map(function(c){var ov=st.ovr[c.id]||{};var dis=!!ov.disabled;return <div key={c.id} style={Object.assign({},cardS,{padding:'10px 12px',opacity:dis?.42:1})}><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:'0.95rem'}}>{c.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.8rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textDecoration:dis?'line-through':'none'}}>{c.title}</div><div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem',marginTop:2}}>Level {c.level}</div></div><button onClick={function(){setOv(c.id,{disabled:!dis});}} style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',background:dis?'rgba(255,120,190,.18)':'linear-gradient(135deg,#ff4444,#cc0000)',position:'relative',touchAction:'manipulation',flexShrink:0}}><div style={{position:'absolute',top:3,left:dis?3:23,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/></button></div></div>;})}
                </div>
              </div>}

              {/* ADMIN REWARDS */}
              {st.atab==='Rewards'&&<div>
                <p style={{color:'rgba(255,179,217,.4)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',marginBottom:14,lineHeight:1.5}}>Add rewards Rebecca can redeem with her points. Set the cost point type and minimum level required.</p>
                <div style={Object.assign({},cardS,{padding:'16px',marginBottom:16})}>
                  <div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontSize:'0.9rem',fontWeight:'bold',marginBottom:12}}>Add a Reward</div>
                  <div style={{display:'grid',gridTemplateColumns:'60px 1fr',gap:9,marginBottom:10}}><div><div style={lblS}>Emoji</div><input value={st.rewardForm.emoji} onChange={function(e){setSt(function(p){return Object.assign({},p,{rewardForm:Object.assign({},p.rewardForm,{emoji:e.target.value})});});}} style={Object.assign({},inpS,{textAlign:'center',fontSize:'1.3rem',padding:'10px 6px'})} maxLength={2}/></div><div><div style={lblS}>Title</div><input placeholder='e.g. Takeaway of your choice' value={st.rewardForm.title} onChange={function(e){setSt(function(p){return Object.assign({},p,{rewardForm:Object.assign({},p.rewardForm,{title:e.target.value}),rewardFormErr:''});});}} style={inpS}/></div></div>
                  <div style={{marginBottom:10}}><div style={lblS}>Description (optional)</div><input placeholder='Any details...' value={st.rewardForm.desc} onChange={function(e){setSt(function(p){return Object.assign({},p,{rewardForm:Object.assign({},p.rewardForm,{desc:e.target.value})});});}} style={inpS}/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:12}}>
                    <div><div style={lblS}>Points</div><div style={{display:'flex',gap:5}}>{[['glow','✨'],['grind','💪']].map(function(pair){var sel=st.rewardForm.pointType===pair[0];return <button key={pair[0]} onClick={function(){setSt(function(p){return Object.assign({},p,{rewardForm:Object.assign({},p.rewardForm,{pointType:pair[0]})});});}} style={{flex:1,padding:'10px 4px',borderRadius:10,border:'1px solid '+(sel?T.a1+'66':'rgba(255,120,190,.2)'),background:sel?T.a1+'18':'transparent',color:sel?T.a1:'rgba(255,179,217,.4)',cursor:'pointer',fontSize:'0.76rem',touchAction:'manipulation'}}>{pair[1]}</button>;})}</div></div>
                    <div><div style={lblS}>Cost</div><input type='number' min='1' value={st.rewardForm.cost} onChange={function(e){setSt(function(p){return Object.assign({},p,{rewardForm:Object.assign({},p.rewardForm,{cost:Number(e.target.value)})});});}} style={inpS}/></div>
                    <div><div style={lblS}>Min Level</div><select value={st.rewardForm.minLevel} onChange={function(e){setSt(function(p){return Object.assign({},p,{rewardForm:Object.assign({},p.rewardForm,{minLevel:Number(e.target.value)})});});}} style={inpS}><option value={0}>Any</option>{GLOW_LEVELS.map(function(l){return <option key={l.level} value={l.level}>{l.emoji} {l.title}</option>;})}</select></div>
                  </div>
                  {st.rewardFormErr&&<p style={{color:'#ff3d9a',fontSize:'0.82rem',marginBottom:10}}>{st.rewardFormErr}</p>}
                  <button style={gbS} onClick={function(){if(!st.rewardForm.title.trim()){setSt(function(p){return Object.assign({},p,{rewardFormErr:'Add a title'});});return;}var newReward={id:'r-'+Date.now(),emoji:st.rewardForm.emoji,title:st.rewardForm.title.trim(),desc:st.rewardForm.desc.trim(),pointType:st.rewardForm.pointType,cost:Number(st.rewardForm.cost),minLevel:Number(st.rewardForm.minLevel)||0,redeemed:false,createdAt:new Date().toISOString()};setSt(function(p){return Object.assign({},p,{rewards:p.rewards.concat([newReward]),rewardForm:{emoji:'🎁',title:'',desc:'',pointType:'glow',cost:50,minLevel:0},rewardFormErr:''});});}}>Add Reward 🎁</button>
                </div>
                {st.rewards.length>0&&<div><div style={lblS}>Current Rewards ({st.rewards.length})</div><div style={{display:'flex',flexDirection:'column',gap:9,marginTop:6}}>{st.rewards.map(function(r){var isGlow=r.pointType==='glow';var ptColor=isGlow?T.a1:'#ff3d9a';return <div key={r.id} style={Object.assign({},cardS,{padding:'13px 14px',opacity:r.redeemed?.5:1})}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:'1.4rem'}}>{r.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.86rem',fontWeight:'bold',textDecoration:r.redeemed?'line-through':'none'}}>{r.title}</div><div style={{display:'flex',gap:8,alignItems:'center',marginTop:3,flexWrap:'wrap'}}><span style={{color:ptColor,fontSize:'0.68rem',fontWeight:'bold'}}>{r.cost} {isGlow?'✨':'💪'}</span>{r.minLevel>0&&<span style={{color:'rgba(255,179,217,.4)',fontSize:'0.62rem'}}>{GLOW_LEVELS.find(function(l){return l.level===r.minLevel;})?GLOW_LEVELS.find(function(l){return l.level===r.minLevel;}).emoji:''} Level {r.minLevel}+</span>}{r.redeemed&&<span style={{color:'rgba(255,179,217,.35)',fontSize:'0.64rem',fontStyle:'italic'}}>redeemed</span>}</div></div><div style={{display:'flex',gap:6}}>{r.redeemed&&<button onClick={function(){setSt(function(p){return Object.assign({},p,{rewards:p.rewards.map(function(x){return x.id===r.id?Object.assign({},x,{redeemed:false,redeemedAt:null}):x;})});});}} style={{background:'transparent',border:'1px solid rgba(255,120,190,.2)',borderRadius:8,color:'rgba(255,179,217,.4)',cursor:'pointer',fontSize:'0.64rem',padding:'4px 8px',touchAction:'manipulation'}}>Restore</button>}<button onClick={function(){if(window.confirm('Delete?'))setSt(function(p){return Object.assign({},p,{rewards:p.rewards.filter(function(x){return x.id!==r.id;})});});}} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.34)',cursor:'pointer',fontSize:'0.8rem',padding:'4px',touchAction:'manipulation'}}>🗑️</button></div></div></div>;})} </div>}
              </div>}

              {/* ADMIN SETTINGS */}
              {st.atab==='Settings'&&<div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}><div style={lblS}>Theme</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>{Object.keys(THEMES).map(function(key){var t=THEMES[key];var sel=st.theme===key;return <button key={key} onClick={function(){setSt(function(p){return Object.assign({},p,{theme:key});});}} style={{background:sel?'linear-gradient(135deg,'+t.a1+'22,'+t.a2+'22)':'rgba(255,255,255,.03)',border:'1px solid '+(sel?t.a1+'66':'rgba(255,120,190,.13)'),borderRadius:12,padding:'12px 9px',cursor:'pointer',touchAction:'manipulation',textAlign:'center'}}><div style={{height:10,borderRadius:4,background:'linear-gradient(90deg,'+t.a1+','+t.a2+')',marginBottom:7}}/><div style={{color:sel?t.a1:'rgba(255,179,217,.46)',fontFamily:'Playfair Display,serif',fontSize:'0.78rem',fontWeight:sel?'bold':'normal'}}>{t.name}</div></button>;})}</div></div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}><div style={lblS}>Notification Times</div><div style={{marginBottom:10}}><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.72rem',marginBottom:5,fontFamily:'Crimson Text,serif'}}>Challenge nudge (if not all done)</div><input type='time' value={st.challengeNudgeTime} onChange={function(e){setSt(function(p){return Object.assign({},p,{challengeNudgeTime:e.target.value});});}} style={Object.assign({},inpS,{colorScheme:'dark'})}/></div><div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.72rem',marginBottom:5,fontFamily:'Crimson Text,serif'}}>Training nudge (gym and ride days)</div><input type='time' value={st.trainingNudgeTime} onChange={function(e){setSt(function(p){return Object.assign({},p,{trainingNudgeTime:e.target.value});});}} style={Object.assign({},inpS,{colorScheme:'dark'})}/></div></div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}><div style={lblS}>Milestone Messages</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.74rem',fontFamily:'Crimson Text,serif',lineHeight:1.5,marginBottom:10}}>Customise the messages she sees when she hits major milestones. Leave blank to use the defaults.</div>{Object.keys(MILESTONE_MESSAGES).map(function(key){var base=MILESTONE_MESSAGES[key];var custom=(st.milestoneMessages||{})[key]||{};return <div key={key} style={{marginBottom:12}}><div style={{color:'rgba(255,179,217,.5)',fontSize:'0.7rem',marginBottom:4}}>{base.emoji} {base.title}</div><input placeholder={base.msg.substring(0,60)+'...'} value={custom.msg||''} onChange={function(e){setSt(function(p){var mm=Object.assign({},p.milestoneMessages||{});mm[key]=Object.assign({},mm[key]||{},{msg:e.target.value||undefined});return Object.assign({},p,{milestoneMessages:mm});});}} style={Object.assign({},inpS,{fontSize:'0.82rem'})}/></div>;})} </div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}><div style={lblS}>Onboarding</div><button onClick={function(){setOnboardDone(false);setOnboardSlide(0);}} style={Object.assign({},sbS(false),{width:'100%',padding:'11px'})}>Reset Onboarding Screen</button></div>
                <div style={{borderTop:'1px solid rgba(255,120,190,.1)',paddingTop:16,marginBottom:10}}><div style={lblS}>Danger Zone</div><button onClick={function(){if(window.confirm('Reset ALL progress?'))setSt(function(p){return Object.assign({},p,{glowPoints:0,grindPoints:0,seen:[],seenDates:{},ch:[],lgd:null,hist:{},streak:0,lsd:null,graceUsedWeek:null,cats:{},earned:[],wplan:{},weeklyData:{},perfectWeeks:0,pb:{bestGlowWeek:0,bestGrindWeek:0,bestPerfectStreak:0,mostChallengesDay:0},rulesChecked:{},rulesStreak:0,rulesLastDate:null,perfectDays:0,herMessages:[],shownMilestones:[]});});setTChecked({});setRidesDone({});}} style={{background:'transparent',border:'1px solid rgba(255,60,60,.22)',color:'rgba(255,100,100,.4)',borderRadius:12,padding:11,cursor:'pointer',fontSize:'0.8rem',fontFamily:'Crimson Text,serif',width:'100%',marginBottom:8,touchAction:'manipulation'}}>Reset All Progress</button></div>
                <button onClick={function(){setSt(function(p){return Object.assign({},p,{unlocked:false,view:'her'});});}} style={Object.assign({},sbS(false),{width:'100%',padding:'11px'})}>Lock and Return</button>
              </div>}
            </div>}
          </div>
        )}

        {/* ═══ TRAINING TAB ═══ */}
        {tab==='training' && (
          <div style={{fontFamily:'Poppins,sans-serif',color:'#F5E8EF',animation:'up .3s ease-out'}}>
            <div style={{position:'fixed',top:-80,right:-80,width:240,height:240,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,45,120,0.13) 0%,transparent 70%)',pointerEvents:'none'}}/>
            <div style={{padding:'52px 22px 18px'}}>
              <div style={{fontSize:10,letterSpacing:3,color:'#FF85AD',fontWeight:600,marginBottom:6}}>GLOW UP</div>
              <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
                <div><div style={{fontFamily:'Playfair Display,serif',fontSize:32,fontStyle:'italic',color:'#FF2D78',lineHeight:1}}>Training</div><div style={{fontSize:12,color:'#7A5068',fontWeight:300,marginTop:3}}>{TRAINING_DAYS.find(function(d){return d.id===tDay;}).label} · {SESSIONS[tDay].title}</div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:13,fontWeight:700,color:'#FF2D78'}}>{st.grindPoints}</div><div style={{fontSize:8,color:'#5A3545',letterSpacing:1}}>GRIND PTS</div><div style={{fontSize:9,color:grindLvi.color,marginTop:2}}>{grindLvi.emoji} {grindLvi.title}</div></div>
              </div>
            </div>
            <div style={{display:'flex',gap:5,padding:'0 22px 18px',overflowX:'auto'}}>
              {TRAINING_DAYS.map(function(d){var active=d.id===tDay;var isToday=d.id===todayDayId;var dotCol=d.type==='gym'?'#FF2D78':d.type==='ride'?'#FF85AD':'#3A2030';var done=isSessionDone(d.id);
                return <div key={d.id} className='tappable' onClick={function(){setTDay(d.id);setShowProg(false);}} style={{flexShrink:0,width:46,borderRadius:12,padding:'10px 0',textAlign:'center',background:active?'linear-gradient(155deg,#FF2D78,#CC0044)':done?'rgba(255,45,120,0.12)':isToday?'rgba(255,45,120,0.08)':'rgba(255,255,255,0.04)',border:active?'1.5px solid #FF2D78':done?'1.5px solid rgba(255,45,120,0.4)':isToday?'1.5px solid rgba(255,45,120,0.2)':'1.5px solid rgba(255,255,255,0.07)',boxShadow:active?'0 3px 16px rgba(255,45,120,0.38)':'none'}}>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:1,color:active?'rgba(255,255,255,0.65)':'#5A3545',marginBottom:4}}>{d.short}</div>
                  <div style={{width:7,height:7,borderRadius:'50%',background:active?'white':done?'#FF2D78':dotCol,margin:'0 auto 4px',opacity:active?0.9:0.6}}/>
                  <div style={{fontSize:7,color:active?'white':done?'#FF85AD':'#4A2535',fontWeight:active?600:400}}>{done?'DONE':d.type==='gym'?'GYM':d.type==='ride'?'RIDE':'REST'}</div>
                </div>;
              })}
            </div>
            <div style={{padding:'0 20px'}} key={tDay}>
              <div style={{background:'rgba(255,45,120,0.1)',border:'1px solid rgba(255,45,120,0.22)',borderRadius:18,padding:'18px 18px 14px',marginBottom:12,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-24,right:-24,width:90,height:90,borderRadius:'50%',background:'rgba(255,45,120,0.08)',pointerEvents:'none'}}/>
                <div style={{fontSize:9,letterSpacing:3,color:'#FF85AD',fontWeight:600,marginBottom:3}}>{SESSIONS[tDay].tag.toUpperCase()}</div>
                <div style={{fontSize:24,fontWeight:700,color:'white',lineHeight:1.1,marginBottom:8}}>{SESSIONS[tDay].title}</div>
                {(SESSIONS[tDay].isGym||SESSIONS[tDay].isRide)&&<div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,45,120,0.15)',borderRadius:20,padding:'4px 12px'}}><span style={{fontSize:11,color:'#FF85AD',fontWeight:600}}>💪 +{SESSIONS[tDay].isGym?GRIND_GYM:GRIND_RIDE} Grind Pts on completion</span></div>}
                {tTotalExs>0&&<div style={{marginTop:10}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><div style={{fontSize:10,color:'#7A5068'}}>{tDoneExs}/{tTotalExs} exercises</div><div style={{fontSize:10,color:'#FF2D78',fontWeight:600}}>{Math.round(tProgress*100)}%</div></div><div style={{height:4,borderRadius:2,background:'rgba(255,255,255,0.07)'}}><div style={{height:'100%',borderRadius:2,width:(tProgress*100)+'%',background:'linear-gradient(90deg,#FF2D78,#FF85AD)',transition:'width 0.4s ease',boxShadow:tProgress>0?'0 0 8px rgba(255,45,120,0.55)':'none'}}/></div></div>}
              </div>
              {SESSIONS[tDay].isRest&&<div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:20}}><div style={{fontSize:28,marginBottom:10}}>🌸</div>{SESSIONS[tDay].restTips.map(function(tip,i){return <div key={i} style={{display:'flex',gap:10,padding:'9px 0',borderBottom:i<SESSIONS[tDay].restTips.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}><div style={{color:'#FF2D78',fontSize:10,marginTop:2,flexShrink:0}}>—</div><div style={{fontSize:13,color:'#9A7080',fontWeight:300,lineHeight:1.4}}>{tip}</div></div>;})}</div>}
              {SESSIONS[tDay].isRide&&<div>
                <div style={{background:'rgba(255,133,173,0.07)',border:'1px solid rgba(255,133,173,0.18)',borderRadius:16,overflow:'hidden',marginBottom:12}}>{SESSIONS[tDay].rideDetails.map(function(row,i){return <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'12px 16px',borderBottom:i<SESSIONS[tDay].rideDetails.length-1?'1px solid rgba(255,255,255,0.05)':'none',background:i%2===1?'rgba(255,45,120,0.04)':'transparent'}}><div style={{fontSize:10,fontWeight:700,color:'#FF85AD',letterSpacing:1,flexShrink:0,marginTop:1}}>{row.label}</div><div style={{fontSize:12,color:'#C49AAA',fontWeight:300,lineHeight:1.4,textAlign:'right',maxWidth:'65%'}}>{row.value}</div></div>;})}</div>
                <div style={{background:'linear-gradient(135deg,#FF2D78,#CC0055)',borderRadius:14,padding:'14px 18px',display:'flex',alignItems:'center',gap:14,marginBottom:12}}><div style={{fontSize:26,fontWeight:700,color:'white',lineHeight:1,flexShrink:0}}>85-95</div><div><div style={{fontSize:9,letterSpacing:2,color:'rgba(255,255,255,0.65)',marginBottom:2}}>RPM — ALWAYS</div><div style={{fontSize:11,color:'rgba(255,255,255,0.85)',fontWeight:300,lineHeight:1.4}}>Small gears high cadence. Mashing big gears causes knee pain.</div></div></div>
                {isSessionDone(tDay)?<div style={{background:'rgba(255,45,120,0.1)',border:'1px solid rgba(255,45,120,0.3)',borderRadius:16,padding:'16px',textAlign:'center',color:'#FF2D78',fontWeight:700,fontSize:14}}>Ride Done! +{GRIND_RIDE} Grind Pts ✓</div>:tDay===todayDayId?<button onClick={function(){completeTrainingSession(tDay);}} style={{width:'100%',background:'linear-gradient(135deg,#FF2D78,#CC0044)',border:'none',borderRadius:16,padding:'16px',color:'white',fontFamily:'Poppins,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',touchAction:'manipulation',boxShadow:'0 4px 20px rgba(255,45,120,0.4)'}}>Mark Ride Complete +{GRIND_RIDE} Grind Pts</button>:<div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'16px',textAlign:'center',color:'rgba(255,179,217,.3)',fontSize:13}}>Ride not logged for this day</div>}
              </div>}
              {SESSIONS[tDay].isGym&&<div>
                {SESSIONS[tDay].warmup&&<div style={{marginBottom:14}}><div style={{fontSize:9,letterSpacing:3,color:'#FF85AD',fontWeight:700,marginBottom:8,paddingLeft:2}}>WARMUP — 10 MINS</div><div style={{background:'rgba(255,133,173,0.06)',border:'1px solid rgba(255,133,173,0.15)',borderRadius:14}}>{SESSIONS[tDay].warmup.map(function(item,i){var wk=tDay+'-w-'+i;var wdone=!!tWarmup[wk];return <div key={i} className='tappable' onClick={function(){setTWarmup(function(p){return Object.assign({},p,{[wk]:!p[wk]});});}} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderBottom:i<SESSIONS[tDay].warmup.length-1?'1px solid rgba(255,255,255,0.04)':'none'}}><div style={{width:18,height:18,borderRadius:'50%',flexShrink:0,border:'1.5px solid '+(wdone?'#FF85AD':'rgba(255,133,173,0.3)'),background:wdone?'rgba(255,133,173,0.25)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#FF85AD'}}>{wdone?'✓':''}</div><div style={{fontSize:12,fontWeight:300,lineHeight:1.3,color:wdone?'#4A2535':'#C49AAA',textDecoration:wdone?'line-through':'none'}}>{item}</div></div>;})}</div></div>}
                <div style={{fontSize:9,letterSpacing:3,color:'#FF2D78',fontWeight:700,marginBottom:8,paddingLeft:2}}>EXERCISES</div>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {SESSIONS[tDay].exercises.map(function(ex,i){var ek=tDay+'-'+i;var edone=!!tChecked[ek];return <div key={i} className='tappable' onClick={function(){setTChecked(function(p){return Object.assign({},p,{[ek]:!p[ek]});});}} style={{background:edone?'rgba(255,45,120,0.07)':'rgba(255,255,255,0.04)',border:edone?'1px solid rgba(255,45,120,0.28)':'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'13px 14px',display:'flex',alignItems:'center',gap:12}}><div style={{width:27,height:27,borderRadius:'50%',flexShrink:0,background:edone?'linear-gradient(135deg,#FF2D78,#CC0044)':'transparent',border:edone?'none':'2px solid rgba(255,45,120,0.38)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'white',boxShadow:edone?'0 2px 10px rgba(255,45,120,0.45)':'none',transition:'all 0.22s ease'}}>{edone?'✓':''}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:edone?'#4A2535':'white',textDecoration:edone?'line-through':'none',marginBottom:2,lineHeight:1.2}}>{ex.name}</div><div style={{fontSize:11,color:edone?'#3A1A28':'#6A4055',fontWeight:300,lineHeight:1.3}}>{ex.note}</div></div><div style={{background:edone?'rgba(255,45,120,0.12)':'rgba(255,45,120,0.1)',borderRadius:8,padding:'4px 9px',fontSize:10,fontWeight:700,color:edone?'#4A2535':'#FF2D78',flexShrink:0,whiteSpace:'nowrap'}}>{ex.sets}</div></div>;})}
                </div>
                {SESSIONS[tDay].showKneeRules&&<div style={{marginTop:12,background:'rgba(255,45,120,0.05)',border:'1px solid rgba(255,45,120,0.14)',borderRadius:14,padding:'13px 14px'}}><div style={{fontSize:8,letterSpacing:3,color:'#FF2D78',fontWeight:700,marginBottom:10}}>KNEE RULES</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'7px 10px'}}>{KNEE_RULES.map(function(rule,i){return <div key={i} style={{fontSize:10,color:'#6A4055',fontWeight:300,lineHeight:1.4,display:'flex',gap:6,alignItems:'flex-start'}}><span style={{color:'#FF2D78',flexShrink:0,marginTop:1}}>—</span>{rule}</div>;})}</div></div>}
                <div className='tappable' onClick={function(){setShowProg(function(p){return !p;});}} style={{marginTop:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontSize:10,letterSpacing:2,color:'#7A5068',fontWeight:600}}>PROGRESSION PLAN</div><div style={{fontSize:10,color:'#FF2D78',transform:showProg?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s ease'}}>▼</div></div>
                {showProg&&<div style={{marginTop:6,display:'flex',flexDirection:'column',gap:6}}>{PROGRESSION.map(function(p,i){return <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'11px 14px',display:'flex',gap:12,alignItems:'flex-start'}}><div style={{fontSize:9,fontWeight:700,color:'#FF2D78',letterSpacing:1,flexShrink:0,marginTop:2}}>{p.phase}</div><div style={{fontSize:12,color:'#9A7080',fontWeight:300,lineHeight:1.4}}>{p.desc}</div></div>;})}</div>}
              </div>}
              {tAllDone&&<div style={{marginTop:14,background:'linear-gradient(135deg,#FF2D78,#CC0044)',borderRadius:18,padding:'20px',textAlign:'center',boxShadow:'0 8px 28px rgba(255,45,120,0.4)'}}><div style={{fontSize:30,marginBottom:6}}>✨</div><div style={{fontSize:17,fontWeight:700,color:'white',marginBottom:4}}>Session Complete!</div><div style={{fontSize:13,color:'rgba(255,255,255,0.8)',fontWeight:400}}>+{GRIND_GYM} Grind Points earned 💪</div></div>}
            </div>
          </div>
        )}

        {/* ═══ NUTRITION TAB ═══ */}
        {tab==='nutrition' && (
          <div style={{fontFamily:'Poppins,sans-serif',color:'#F5E8EF',animation:'up .3s ease-out'}}>
            <div style={{position:'fixed',top:-70,left:-70,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,45,120,0.11) 0%,transparent 70%)',pointerEvents:'none'}}/>
            <div style={{padding:'52px 22px 16px'}}>
              <div style={{fontSize:10,letterSpacing:3,color:'#FF85AD',fontWeight:600,marginBottom:6}}>GLOW UP</div>
              <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}><div><div style={{fontFamily:'Playfair Display,serif',fontSize:32,fontStyle:'italic',color:'#FF2D78',lineHeight:1}}>Nutrition</div><div style={{fontSize:12,color:'#7A5068',fontWeight:300,marginTop:3}}>Eat to build</div></div><div style={{background:'rgba(255,45,120,0.1)',border:'1px solid rgba(255,45,120,0.22)',borderRadius:14,padding:'8px 14px',textAlign:'right'}}><div style={{fontSize:20,fontWeight:700,color:'#FF2D78',lineHeight:1}}>{nutTotals.kcal}</div><div style={{fontSize:8,color:'#5A3545',letterSpacing:1}}>KCAL LOGGED</div></div></div>
            </div>
            <div style={{padding:'0 20px 14px'}}><div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'14px 16px'}}><div style={{fontSize:8,letterSpacing:3,color:'#FF85AD',fontWeight:700,marginBottom:12}}>DAILY TARGETS</div><div style={{display:'flex',flexDirection:'column',gap:10}}>{[{label:'Protein',val:nutTotals.protein,target:NUT_TARGETS.protein,unit:'g',color:'#FF2D78'},{label:'Carbs',val:nutTotals.carbs,target:NUT_TARGETS.carbs,unit:'g',color:'#FF85AD'},{label:'Fat',val:nutTotals.fat,target:NUT_TARGETS.fat,unit:'g',color:'#FFB347'},{label:'Fibre',val:nutTotals.fibre,target:NUT_TARGETS.fibre,unit:'g',color:'#A8D8A8'}].map(function(m){var p=Math.min(m.val/m.target,1);return <div key={m.label}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><div style={{fontSize:11,color:'#9A7080'}}>{m.label}</div><div style={{fontSize:11,fontWeight:600,color:p>=1?m.color:'#F5E8EF'}}>{m.val}<span style={{fontSize:9,color:'#4A2535'}}>/{m.target}{m.unit}</span></div></div><div style={{height:4,borderRadius:2,background:'rgba(255,255,255,0.06)'}}><div style={{height:'100%',borderRadius:2,background:'linear-gradient(90deg,'+m.color+','+m.color+'88)',width:(p*100)+'%',transition:'width 0.45s ease',boxShadow:p>0?'0 0 6px '+m.color+'55':'none'}}/></div></div>;})} </div></div></div>
            <div style={{padding:'0 20px 14px'}}><div style={{background:'rgba(100,180,255,0.05)',border:'1px solid rgba(100,180,255,0.16)',borderRadius:16,padding:'14px 16px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div><div style={{fontSize:8,letterSpacing:3,color:'#64B4FF',fontWeight:700,marginBottom:2}}>WATER</div><div style={{fontSize:12,color:'#7A9AAA',fontWeight:300}}>{waterMl}ml / 2,500ml</div></div>{waterMl>=2500&&<div style={{background:'rgba(100,180,255,0.18)',borderRadius:10,padding:'4px 10px',fontSize:9,fontWeight:700,color:'#64B4FF'}}>2.5L done ✓</div>}</div><div style={{display:'flex',gap:4}}>{WATER_STEPS.map(function(step,i){var filled=waterMl>=step;return <div key={step} className='tappable' onClick={function(){setWaterMl(filled&&waterMl===step?WATER_STEPS[i-1]||0:step);}} style={{flex:1,height:36,borderRadius:8,background:filled?'linear-gradient(180deg,#64B4FF,#3090E0)':'rgba(100,180,255,0.08)',border:filled?'1px solid #64B4FF':'1px solid rgba(100,180,255,0.18)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:filled?'0 2px 8px rgba(100,180,255,0.3)':'none',transition:'all 0.2s ease'}}><div style={{fontSize:filled?14:10,lineHeight:1}}>{filled?'💧':''}</div><div style={{fontSize:7,color:filled?'white':'rgba(100,180,255,0.4)',fontWeight:600,marginTop:2}}>{step/1000}L</div></div>;})}</div><div style={{marginTop:8,height:3,borderRadius:2,background:'rgba(255,255,255,0.05)'}}><div style={{height:'100%',borderRadius:2,background:'linear-gradient(90deg,#64B4FF,#90D0FF)',width:((waterMl/2500)*100)+'%',transition:'width 0.4s ease',boxShadow:waterMl>0?'0 0 8px rgba(100,180,255,0.45)':'none'}}/></div></div></div>
            <div style={{padding:'0 20px 14px'}}><div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.06)'}}>{[{id:'weekday',label:'Mon-Fri'},{id:'weekend',label:'Weekend'},{id:'rules',label:'Rules'}].map(function(t){return <div key={t.id} className='tappable' onClick={function(){setNutView(t.id);}} style={{flex:1,padding:'8px 4px',borderRadius:9,textAlign:'center',background:nutView===t.id?'linear-gradient(135deg,#FF2D78,#CC0044)':'transparent',fontSize:11,fontWeight:nutView===t.id?700:400,color:nutView===t.id?'white':'#6A4055',boxShadow:nutView===t.id?'0 2px 10px rgba(255,45,120,0.32)':'none'}}>{t.label}</div>;})} </div></div>
            {nutView!=='rules'&&<div style={{padding:'0 20px'}}><div style={{display:'flex',flexDirection:'column',gap:9}}>{nutMeals.map(function(meal){var done=!!nutChecked[meal.id];var expanded=expandedMeal===meal.id;return <div key={meal.id} style={{background:done?'rgba(255,45,120,0.06)':'rgba(255,255,255,0.04)',border:done?'1px solid rgba(255,45,120,0.24)':'1px solid rgba(255,255,255,0.07)',borderRadius:16,overflow:'hidden'}}><div className='tappable' onClick={function(){setExpandedMeal(function(p){return p===meal.id?null:meal.id;});}} style={{padding:'13px 14px'}}><div style={{display:'flex',alignItems:'center',gap:11}}><div onClick={function(e){e.stopPropagation();setNutChecked(function(p){var wasChecked=!!p[meal.id];var newChecked=Object.assign({},p,{[meal.id]:!wasChecked});if(!wasChecked){setSt(function(s){var key='nutDay-'+today;if(s.nutDaysLogged&&s.nutDaysLogged[key])return s;var newDays=Object.assign({},s.nutDaysLogged||{},{[key]:true});return Object.assign({},s,{nutDaysLogged:newDays});});}return newChecked;});}} style={{width:28,height:28,borderRadius:'50%',flexShrink:0,background:done?'linear-gradient(135deg,#FF2D78,#CC0044)':'transparent',border:done?'none':'2px solid rgba(255,45,120,0.34)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'white',cursor:'pointer',boxShadow:done?'0 2px 10px rgba(255,45,120,0.42)':'none',transition:'all 0.22s ease'}}>{done?'✓':''}</div><div style={{fontSize:20,flexShrink:0}}>{meal.emoji}</div><div style={{flex:1,minWidth:0}}><div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}><div style={{fontSize:7,letterSpacing:2,fontWeight:700,color:done?'#4A2535':'#FF85AD'}}>{meal.time}</div>{meal.flexible&&<div style={{fontSize:7,color:'#4A2535',background:'rgba(255,255,255,0.05)',padding:'1px 6px',borderRadius:4}}>FLEXIBLE</div>}</div><div style={{fontSize:13,fontWeight:600,color:done?'#4A2535':'white',textDecoration:done?'line-through':'none',lineHeight:1.2}}>{meal.name}</div></div><div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:15,fontWeight:700,color:done?'#4A2535':'#FF2D78'}}>{meal.kcal}</div><div style={{fontSize:8,color:'#4A2535'}}>kcal</div></div><div style={{fontSize:9,color:'#4A2535',transform:expanded?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s ease'}}>▼</div></div><div style={{display:'flex',gap:5,marginTop:8,paddingLeft:39}}>{[{l:'P',v:meal.protein,c:'#FF2D78'},{l:'C',v:meal.carbs,c:'#FF85AD'},{l:'F',v:meal.fat,c:'#FFB347'},{l:'Fi',v:meal.fibre,c:'#A8D8A8'}].map(function(m){return <div key={m.l} style={{background:'rgba(255,255,255,0.05)',borderRadius:6,padding:'2px 7px',fontSize:9,fontWeight:600,color:done?'#3A1A28':m.c}}>{m.l} {m.v}g</div>;})}</div></div>{expanded&&<div style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'11px 14px 13px'}}>{meal.items.map(function(item,i){return <div key={i} style={{display:'flex',gap:10,padding:'5px 0',borderBottom:i<meal.items.length-1?'1px solid rgba(255,255,255,0.04)':'none'}}><div style={{fontSize:11,color:'#FF85AD',fontWeight:600,minWidth:48,flexShrink:0}}>{item.amount}</div><div style={{fontSize:11,color:'#9A7080',fontWeight:300}}>{item.ingredient}</div></div>;})} <div style={{marginTop:10,background:'rgba(255,45,120,0.07)',borderRadius:8,padding:'8px 11px',fontSize:11,color:'#FF85AD',fontWeight:300,lineHeight:1.4,display:'flex',gap:7}}><span style={{flexShrink:0}}>—</span><span>{meal.note}</span></div></div>}</div>;})} <div style={{marginTop:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}><div style={{fontSize:11,color:'#5A3545',fontWeight:300}}>Target: {nutView==='weekend'?'~2,660':'2,500-2,600'} kcal</div><div style={{display:'flex',alignItems:'baseline',gap:4}}><div style={{fontSize:20,fontWeight:700,color:nutTotals.kcal>=2400?'#FF2D78':'#F5E8EF'}}>{nutTotals.kcal}</div><div style={{fontSize:9,color:'#4A2535'}}>logged</div></div></div></div>}
            {nutView==='rules'&&<div style={{padding:'0 20px'}}><div style={{marginBottom:12}}><div style={{fontSize:8,letterSpacing:3,color:'#A8D8A8',fontWeight:700,marginBottom:8,paddingLeft:2}}>GUT HEALTH — DAILY</div><div style={{background:'rgba(168,216,168,0.05)',border:'1px solid rgba(168,216,168,0.16)',borderRadius:16}}>{GUT_HEALTH.map(function(g,i){return <div key={i} style={{display:'flex',gap:12,padding:'12px 14px',alignItems:'center',borderBottom:i<GUT_HEALTH.length-1?'1px solid rgba(255,255,255,0.04)':'none'}}><div style={{fontSize:18}}>{g.emoji}</div><div style={{fontSize:13,color:'#9AA890',fontWeight:300,lineHeight:1.4}}>{g.item}</div></div>;})}</div></div><div style={{marginBottom:12}}><div style={{fontSize:8,letterSpacing:3,color:'#FF85AD',fontWeight:700,marginBottom:8,paddingLeft:2}}>GOLDEN RULES</div><div style={{display:'flex',flexDirection:'column',gap:7}}>{GOLDEN_RULES.map(function(rule,i){return <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'11px 14px',display:'flex',gap:11,alignItems:'flex-start'}}><div style={{width:20,height:20,borderRadius:'50%',flexShrink:0,background:'rgba(255,45,120,0.14)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#FF2D78'}}>{i+1}</div><div style={{fontSize:13,color:'#C49AAA',fontWeight:300,lineHeight:1.4}}>{rule}</div></div>;})} </div></div><div style={{background:'rgba(255,45,120,0.07)',border:'1px solid rgba(255,45,120,0.18)',borderRadius:14,padding:'16px 16px',marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:'#FF2D78',marginBottom:8}}>On building muscle</div><div style={{fontSize:12,color:'#9A7080',fontWeight:300,lineHeight:1.6}}>At 53kg with no muscle base restricting calories now would leave you a lighter weaker version of yourself. Build muscle for 6-12 months first. Eat train build. The results come after you have built something worth showing.</div></div></div>}
          </div>
        )}

        {/* ═══ RULES TAB ═══ */}
        {tab==='rules' && (
          <div style={{padding:'0 15px',animation:'up .3s ease-out'}}>
            <div style={{textAlign:'center',padding:'32px 0 20px'}}>
              <div style={{fontSize:'2.5rem',marginBottom:8}}>✅</div>
              <h2 style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'2rem',background:'linear-gradient(135deg,'+T.a1+','+T.a2+')',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.1}}>Daily Rules</h2>
              <p style={{color:'rgba(255,179,217,.4)',fontStyle:'italic',margin:'6px 0 0',fontSize:'0.88rem',fontFamily:'Crimson Text,serif'}}>non-negotiable every single day ✨</p>
            </div>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <div style={Object.assign({},cardS,{flex:1,padding:'13px',textAlign:'center'})}><div style={{fontSize:'1.4rem',fontFamily:'Playfair Display,serif',fontWeight:900,color:T.a1}}>{rulesTodayDone} / {allRules.length}</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.62rem',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:3}}>Done Today</div></div>
              <div style={Object.assign({},cardS,{flex:1,padding:'13px',textAlign:'center'})}><div style={{fontSize:'1.4rem',fontFamily:'Playfair Display,serif',fontWeight:900,color:'#ffb347'}}>{st.rulesStreak||0} 🔥</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.62rem',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:3}}>Day Streak</div></div>
            </div>
            <div style={Object.assign({},cardS,{padding:'13px 16px',marginBottom:16})}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}><span style={{color:'rgba(255,179,217,.44)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.12em'}}>Progress</span><span style={{color:T.a1,fontWeight:'bold',fontFamily:'Playfair Display,serif'}}>{rulesTodayDone} / {allRules.length}</span></div><div style={{height:7,background:'rgba(255,255,255,.05)',borderRadius:7,overflow:'hidden'}}><div style={{height:'100%',width:(allRules.length?(rulesTodayDone/allRules.length)*100:0)+'%',background:'linear-gradient(90deg,'+T.a1+','+T.a2+')',borderRadius:7,transition:'width .6s',boxShadow:'0 0 10px '+T.a1+'44'}}/></div></div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {allRules.map(function(rule,i){
                var key=today+'-'+rule.id; var done=!!st.rulesChecked[key];
                return <div key={rule.id} style={Object.assign({},cardS,{padding:'16px',border:done?'1px solid '+T.a1+'36':'1px solid rgba(255,120,190,.13)',background:done?T.a1+'07':'rgba(255,255,255,.035)',animation:'popIn .3s '+(i*.05)+'s ease-out both'})}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <button onClick={function(){
                      var newChecked=Object.assign({},st.rulesChecked,{[key]:!done});
                      var doneCount=allRules.filter(function(r){return !!newChecked[today+'-'+r.id];}).length;
                      var allDoneNow=doneCount===allRules.length;
                      setSt(function(p){
                        var newStreak=p.rulesStreak||0; var newLastDate=p.rulesLastDate;
                        if(allDoneNow&&p.rulesLastDate!==today){var yest=new Date();yest.setDate(yest.getDate()-1);newStreak=p.rulesLastDate===yest.toDateString()?(p.rulesStreak||0)+1:1;newLastDate=today;}
                        var todayChallengesDone=p.ch.filter(function(c){return c.done;}).length;
                        var isPerfectDay=allDoneNow&&todayChallengesDone>=3;
                        var ns=Object.assign({},p,{rulesChecked:newChecked,rulesStreak:newStreak,rulesLastDate:newLastDate,perfectDays:isPerfectDay&&p.rulesLastDate!==today?(p.perfectDays||0)+1:p.perfectDays});
                        return Object.assign({},ns,checkAch(ns));
                      });
                    }} style={{width:36,height:36,minWidth:36,borderRadius:'50%',border:done?'none':'2px solid rgba(255,120,190,.34)',background:done?grad:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem',color:done?'#fff':'transparent',touchAction:'manipulation',flexShrink:0,boxShadow:done?'0 0 12px '+T.a1+'44':'none'}}>{done?'✓':''}</button>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><span style={{fontSize:'1.1rem'}}>{rule.emoji}</span><span style={{fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'0.95rem',color:done?'rgba(255,179,217,.32)':'#ffe8f5',textDecoration:done?'line-through':'none'}}>{rule.title}</span></div>
                      <p style={{margin:0,color:done?'rgba(255,179,217,.22)':'rgba(255,179,217,.55)',fontSize:'0.84rem',fontFamily:'Crimson Text,serif',lineHeight:1.6}}>{rule.description}</p>
                    </div>
                  </div>
                </div>;
              })}
            </div>
            <div style={{marginTop:16,padding:'13px 16px',background:'rgba(255,255,255,.02)',borderRadius:14,border:'1px solid rgba(255,120,190,.08)',textAlign:'center'}}>
              <div style={{color:'rgba(255,179,217,.3)',fontSize:'0.72rem',fontFamily:'Crimson Text,serif',lineHeight:1.6}}>These rules are not optional. They are not negotiable. They are who you are becoming. Tick them every day and watch your whole life change.</div>
            </div>
          </div>
        )}

        {/* ═══ REWARDS TAB ═══ */}
        {tab==='rewards' && (
          <div style={{padding:'0 15px',animation:'up .3s ease-out'}}>
            <div style={{textAlign:'center',padding:'32px 0 20px'}}>
              <div style={{fontSize:'2.5rem',marginBottom:8}}>🎁</div>
              <h2 style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'2rem',background:'linear-gradient(135deg,'+T.a1+','+T.a2+')',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.1}}>Rewards</h2>
              <p style={{color:'rgba(255,179,217,.4)',fontStyle:'italic',margin:'6px 0 0',fontSize:'0.88rem',fontFamily:'Crimson Text,serif'}}>spend your points on something special ✨</p>
            </div>
            <div style={{display:'flex',gap:10,marginBottom:18}}>
              <div style={Object.assign({},cardS,{flex:1,padding:'14px',textAlign:'center'})}><div style={{fontSize:'1.6rem',fontFamily:'Playfair Display,serif',fontWeight:900,color:T.a1}}>{st.glowPoints}</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.62rem',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:3}}>✨ Glow Points</div></div>
              <div style={Object.assign({},cardS,{flex:1,padding:'14px',textAlign:'center'})}><div style={{fontSize:'1.6rem',fontFamily:'Playfair Display,serif',fontWeight:900,color:'#ff3d9a'}}>{st.grindPoints}</div><div style={{color:'rgba(255,179,217,.4)',fontSize:'0.62rem',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:3}}>💪 Grind Points</div></div>
            </div>
            {st.rewards.length===0?<div style={{textAlign:'center',padding:'50px 20px',color:'rgba(255,179,217,.26)',fontStyle:'italic',fontFamily:'Crimson Text,serif',lineHeight:1.7}}>No rewards yet 🌸<br/>Sam will add some for you to unlock</div>
            :<div style={{display:'flex',flexDirection:'column',gap:12}}>
              {st.rewards.map(function(r){
                var isGlow=r.pointType==='glow';
                var balance=isGlow?st.glowPoints:st.grindPoints;
                var canAfford=balance>=r.cost;
                var redeemed=!!r.redeemed;
                var ptColor=isGlow?T.a1:'#ff3d9a';
                var ptLabel=isGlow?'✨ Glow Points':'💪 Grind Points';
                var minLvl=r.minLevel||0;
                var lvlReq=minLvl>0?GLOW_LEVELS.find(function(l){return l.level===minLvl;}):null;
                var lvlUnlocked=!lvlReq||glowLvi.level>=minLvl;
                var locked=!lvlUnlocked;
                var lvlPct=lvlReq?Math.min(100,Math.round(glowPct+(glowLvi.level>minLvl?100:0))):100;
                return <div key={r.id} style={Object.assign({},cardS,{padding:'18px',border:redeemed?'1px solid rgba(255,120,190,.1)':locked?'1px solid rgba(255,120,190,.08)':canAfford?'1px solid '+T.a1+'44':'1px solid rgba(255,120,190,.13)',opacity:redeemed?0.45:locked?0.7:1})}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
                    <div style={{fontSize:'2rem',flexShrink:0}}>{r.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1rem',color:redeemed?'rgba(255,179,217,.35)':'#ffe8f5',textDecoration:redeemed?'line-through':'none',marginBottom:4}}>{r.title}</div>
                      {r.desc&&<p style={{margin:'0 0 8px',color:'rgba(255,179,217,.5)',fontSize:'0.84rem',fontFamily:'Crimson Text,serif',lineHeight:1.55}}>{r.desc}</p>}
                      <div style={{display:'flex',alignItems:'center',gap:6,background:ptColor+'14',border:'1px solid '+ptColor+'30',borderRadius:20,padding:'4px 12px',marginBottom:8,width:'fit-content'}}>
                        <span style={{color:ptColor,fontWeight:'bold',fontFamily:'Playfair Display,serif',fontSize:'0.9rem'}}>{r.cost}</span>
                        <span style={{color:'rgba(255,179,217,.45)',fontSize:'0.65rem'}}>{ptLabel}</span>
                      </div>
                      {/* Level lock */}
                      {locked&&lvlReq&&<div style={{marginBottom:8}}>
                        <div style={{color:'rgba(255,179,217,.4)',fontSize:'0.7rem',marginBottom:5,fontFamily:'Crimson Text,serif'}}>🔒 Unlocks at {lvlReq.emoji} {lvlReq.title}</div>
                        <div style={{height:4,background:'rgba(255,255,255,.05)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:Math.min(100,((st.glowPoints-getGlowLvl(st.glowPoints).threshold)/(Math.max(1,lvlReq.threshold-getGlowLvl(st.glowPoints).threshold)))*100)+'%',background:'linear-gradient(90deg,'+T.a1+'66,'+T.a2+'66)',borderRadius:4,transition:'width .7s'}}/></div>
                        <div style={{color:'rgba(255,179,217,.3)',fontSize:'0.62rem',marginTop:3,fontFamily:'Crimson Text,serif'}}>{lvlReq.threshold-st.glowPoints>0?lvlReq.threshold-st.glowPoints+' Glow Pts needed to unlock':'Unlocked!'}</div>
                      </div>}
                      {/* Affordable progress */}
                      {!locked&&!redeemed&&<div style={{marginBottom:8}}>
                        <div style={{height:4,background:'rgba(255,255,255,.05)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:Math.min(100,(balance/r.cost)*100)+'%',background:'linear-gradient(90deg,'+ptColor+','+ptColor+'88)',borderRadius:4,transition:'width .7s'}}/></div>
                        {!canAfford&&<div style={{color:'rgba(255,179,217,.3)',fontSize:'0.62rem',marginTop:3,fontFamily:'Crimson Text,serif'}}>{r.cost-balance} more {isGlow?'Glow':'Grind'} Pts needed</div>}
                      </div>}
                      {redeemed?<div style={{fontSize:'0.75rem',color:'rgba(255,179,217,.35)',fontFamily:'Crimson Text,serif',fontStyle:'italic'}}>Redeemed ✓</div>
                      :!locked&&<button onClick={function(){if(!canAfford)return;if(!window.confirm('Redeem '+r.title+' for '+r.cost+' '+(isGlow?'Glow':'Grind')+' Points?'))return;setSt(function(p){var newRewards=p.rewards.map(function(x){return x.id===r.id?Object.assign({},x,{redeemed:true,redeemedAt:new Date().toISOString()}):x;});var newGlow=isGlow?Math.max(0,p.glowPoints-r.cost):p.glowPoints;var newGrind=!isGlow?Math.max(0,p.grindPoints-r.cost):p.grindPoints;return Object.assign({},p,{rewards:newRewards,glowPoints:newGlow,grindPoints:newGrind});});}} style={{background:canAfford?'linear-gradient(135deg,'+T.a1+','+T.a2+')':'rgba(255,255,255,.06)',border:'none',borderRadius:20,color:canAfford?'#fff':'rgba(255,179,217,.25)',fontFamily:'Playfair Display,serif',fontSize:'0.78rem',fontWeight:'bold',padding:'7px 16px',cursor:canAfford?'pointer':'not-allowed',touchAction:'manipulation',boxShadow:canAfford?'0 0 14px '+T.a1+'44':'none'}}>{canAfford?'Redeem 💖':'Not enough points'}</button>}
                    </div>
                  </div>
                </div>;
              })}
            </div>}
          </div>
        )}

        {/* ── BOTTOM NAV ── */}
        <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:520,zIndex:100}}>
          <div style={{background:'linear-gradient(0deg,'+T.bg+' 55%,transparent)',padding:'12px 14px 18px',display:'flex',justifyContent:'space-around'}}>
            {[{id:'home',icon:'💖',label:'Home'},{id:'training',icon:'💪',label:'Train'},{id:'nutrition',icon:'🥗',label:'Fuel'},{id:'rules',icon:'✅',label:'Rules'},{id:'rewards',icon:'🎁',label:'Rewards'}].map(function(t){var active=tab===t.id;return <button key={t.id} onClick={function(){setTab(t.id);}} style={{background:'transparent',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,touchAction:'manipulation',opacity:active?1:0.38,transition:'opacity 0.2s'}}><div style={{fontSize:18}}>{t.icon}</div><div style={{fontSize:7,fontWeight:active?700:400,color:active?T.a1:'rgba(255,179,217,.5)',letterSpacing:1,fontFamily:'Poppins,sans-serif'}}>{t.label.toUpperCase()}</div>{active&&<div style={{width:4,height:4,borderRadius:'50%',background:T.a1,boxShadow:'0 0 6px '+T.a1}}/>}</button>;})}
          </div>
        </div>
      </div>
    </div>
  );
}
