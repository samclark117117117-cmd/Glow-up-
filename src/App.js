import { useState, useEffect } from 'react';

const SK = 'glowup-v5';

const CHALLENGES = [
  {id:'b01',emoji:'💄',title:'Lipgloss Before You Leave',description:'Apply lipgloss before you leave the house today. Every single time you go out - gloss on, no exceptions.',category:'Beauty',level:1},
  {id:'b02',emoji:'💄',title:'Lipgloss Every Two Hours',description:'Set a reminder and reapply your lip product every two hours today. Glossy lips all day.',category:'Beauty',level:1},
  {id:'b03',emoji:'💄',title:'Bold Lip Today',description:'Wear your boldest, most pigmented lip colour today. All day. Do not wipe it off.',category:'Beauty',level:1},
  {id:'b04',emoji:'💄',title:'Lip Gloss All Day',description:'Your lip gloss stays on all day - reapply constantly. Glossy, full, feminine lips from morning to night.',category:'Beauty',level:1},
  {id:'b05',emoji:'💄',title:'Lip Liner First',description:'Before your lipgloss today, apply lip liner first. Fuller, more defined, more polished.',category:'Beauty',level:2},
  {id:'b06',emoji:'💄',title:'Red Lip Day',description:'Wear a red lip today - classic, bold, non-negotiable. The world is your runway.',category:'Beauty',level:2},
  {id:'b07',emoji:'💄',title:'Try a New Lip Colour',description:'Wear a lip colour you have never worn out before. Today is the day.',category:'Beauty',level:2},
  {id:'b08',emoji:'💄',title:'Winged Eyeliner Today',description:'Do a winged eyeliner look today - sharp, precise, and confident. Take your time.',category:'Beauty',level:2},
  {id:'b09',emoji:'💄',title:'Gloss Check Phone Check',description:'Every time you check your phone today, reapply your lipgloss first.',category:'Beauty',level:3},
  {id:'b10',emoji:'💄',title:'Perfect Your Wing',description:'Spend extra time perfecting your eyeliner wing today. One side then the other until they match.',category:'Beauty',level:3},
  {id:'b11',emoji:'💄',title:'False Lashes Today',description:'Apply false lashes today - natural strip or individual, your choice. Put them on and own it.',category:'Beauty',level:3},
  {id:'b12',emoji:'💄',title:'Lashes and Liner Together',description:'Full lashes and a winged liner today. The classic combination. Spend time getting both right.',category:'Beauty',level:3},
  {id:'b13',emoji:'🌟',title:'Full Face Before Anything',description:'Do your full makeup look before you do anything else this morning. It sets the tone for the day.',category:'Beauty',level:1},
  {id:'b14',emoji:'🌟',title:'Makeup Even If Staying In',description:'Full face today even if you have nowhere to go. You are doing it for you.',category:'Beauty',level:1},
  {id:'b15',emoji:'🌟',title:'Mascara Non Negotiable',description:'Mascara goes on today before you do anything else. Even on a lazy day - mascara stays.',category:'Beauty',level:1},
  {id:'b16',emoji:'🌟',title:'Spend 30 Minutes on Makeup',description:'No rushing today - spend a full 30 minutes on your makeup. Enjoy every step.',category:'Beauty',level:2},
  {id:'b17',emoji:'🌟',title:'Blush Placement Challenge',description:'Apply blush higher than usual today - more lifted, more flushed. Notice the difference.',category:'Beauty',level:2},
  {id:'b18',emoji:'🌟',title:'Setting Spray to Finish',description:'Finish your makeup with a setting spray today. Glowy, long-lasting, polished.',category:'Beauty',level:2},
  {id:'b19',emoji:'🌟',title:'Full Contour Today',description:'Foundation is not enough today. Contour, highlight, blush - the full sculpted look.',category:'Beauty',level:3},
  {id:'b20',emoji:'🌟',title:'Highlighter Everywhere',description:'Apply highlighter to every point today - cheekbones, cupids bow, inner corners, tip of nose, brow bone.',category:'Beauty',level:3},
  {id:'b21',emoji:'🧴',title:'Skincare Routine Tonight',description:'Full skincare routine tonight - cleanser, toner, serum, moisturiser, eye cream. No skipping.',category:'Beauty',level:1},
  {id:'b22',emoji:'🧴',title:'Morning Skincare First',description:'Do a proper morning skincare routine before anything else today. SPF included.',category:'Beauty',level:1},
  {id:'b23',emoji:'🧴',title:'Face Mask Tonight',description:'Do a face mask tonight. Put on music or your favourite show and spend real time on it.',category:'Beauty',level:1},
  {id:'b24',emoji:'💅',title:'Paint Your Nails',description:'Pick a colour that makes you feel fabulous and paint your nails today. Hands, toes, or both.',category:'Beauty',level:1},
  {id:'b25',emoji:'💅',title:'French Tips Today',description:'Do a French tip manicure today - classic, clean, and ultra-feminine.',category:'Beauty',level:2},
  {id:'b26',emoji:'🎀',title:'Brows Properly Done',description:'Spend real time on your brows today - fill, shape, and set them. Do not rush this step.',category:'Beauty',level:1},
  {id:'b27',emoji:'🎀',title:'Hair Done Before You Leave',description:'Style your hair properly before leaving today. No default ponytail. Give it real time.',category:'Beauty',level:2},
  {id:'b28',emoji:'🎀',title:'Hair Accessory Today',description:'Add a hair accessory today - a bow, clip, claw, or headband. Cute, intentional, feminine.',category:'Beauty',level:1},
  {id:'b29',emoji:'🌸',title:'Perfume Before You Leave',description:'Apply your perfume before you leave today. Wrists, neck, and hair. Every time.',category:'Beauty',level:1},
  {id:'b30',emoji:'🌸',title:'Reapply After Lunch',description:'Reapply your perfume after lunch today. Leave a trail wherever you go.',category:'Beauty',level:2},
  {id:'b31',emoji:'✨',title:'Moisturise Your Body',description:'After your shower today, moisturise your entire body - arms, legs, everywhere.',category:'Beauty',level:1},
  {id:'b32',emoji:'✨',title:'Body Glow Today',description:'Apply a shimmer body lotion or oil to your arms and legs today. You deserve to glow.',category:'Beauty',level:3},
  {id:'s01',emoji:'👗',title:'Wear Something Pink',description:'Incorporate pink into your outfit today - top, accessory, shoes, or all three.',category:'Style',level:1},
  {id:'s02',emoji:'👗',title:'Skirt or Dress Today',description:'No trousers today - wear a skirt or dress instead. Feminine, intentional, beautiful.',category:'Style',level:1},
  {id:'s03',emoji:'👗',title:'Your Favourite Outfit Today',description:'Wear your absolute favourite outfit today for no reason at all. Today is reason enough.',category:'Style',level:1},
  {id:'s04',emoji:'👗',title:'Prettiest Underwear',description:'Wear your nicest underwear set today even if no one sees it. This one is just for you.',category:'Style',level:1},
  {id:'s05',emoji:'👗',title:'Add One Accessory',description:'Add one accessory you would usually skip - a necklace, bracelet, hair clip, or belt.',category:'Style',level:1},
  {id:'s06',emoji:'👗',title:'Wear Something Sparkly',description:'Sequins, shimmer, sparkle - wear something that catches the light today.',category:'Style',level:2},
  {id:'s07',emoji:'👗',title:'Wear Your Nicest Shoes',description:'Choose your prettiest or most feminine shoes today, even for ordinary tasks.',category:'Style',level:2},
  {id:'s08',emoji:'👗',title:'Dress Up for Errands',description:'Dress like you are going somewhere important today, even if you are just running errands.',category:'Style',level:2},
  {id:'s09',emoji:'👗',title:'Wear a Bow',description:'Put a bow in your hair or on your outfit today. Fully committed, fully cute.',category:'Style',level:2},
  {id:'s10',emoji:'👗',title:'All One Colour',description:'Wear all one colour today - all pink, all cream, all white. Committed and intentional.',category:'Style',level:3},
  {id:'s11',emoji:'👗',title:'Show Off Your Figure',description:'No hiding today. Wear something that shows off your shape and feel completely amazing.',category:'Style',level:3},
  {id:'s12',emoji:'👗',title:'Heels All Day',description:'Wear heels or your most feminine shoes for a full outing today. No switching to flats.',category:'Style',level:3},
  {id:'s13',emoji:'👗',title:'Jewellery Stack Today',description:'Stack your rings, layer your necklaces, pile on the bracelets. More is more today.',category:'Style',level:3},
  {id:'s14',emoji:'👗',title:'Most Daring Outfit',description:'The outfit that feels like too much - wear it today for the most ordinary task.',category:'Style',level:4},
  {id:'g01',emoji:'✨',title:'Full Glam Before Leaving',description:'Today - hair done, makeup done, outfit intentional, perfume on. The full picture.',category:'Glam',level:2},
  {id:'g02',emoji:'✨',title:'One More Touch',description:'Before you leave, look in the mirror and add one extra thing. A necklace, a spritz, a lip liner.',category:'Glam',level:1},
  {id:'g03',emoji:'✨',title:'Nails and Lips Match',description:'Make sure your nails and lips are in the same colour family today. Intentional glamour.',category:'Glam',level:3},
  {id:'g04',emoji:'✨',title:'Good Jewellery Today',description:'Do not wear the everyday studs - wear the good jewellery. Today is the occasion.',category:'Glam',level:3},
  {id:'g05',emoji:'✨',title:'Shimmer Somewhere',description:'Add a shimmer, glitter, or metallic product somewhere in your look today.',category:'Glam',level:2},
  {id:'g06',emoji:'✨',title:'Smell Amazing All Day',description:'Before any interaction today - make sure you smell completely incredible.',category:'Glam',level:2},
  {id:'g07',emoji:'✨',title:'Hair Properly Done',description:'No leaving the house with your hair undone today. Style it, set it, own it.',category:'Glam',level:2},
  {id:'g08',emoji:'✨',title:'Glam on a Weekday',description:'Today is not a special day. Do full glam anyway. Because you feel like it.',category:'Glam',level:3},
  {id:'g09',emoji:'✨',title:'Touch Up in Public',description:'Touch up your makeup mid-day in public today - lipgloss, powder. Openly. Confidently.',category:'Glam',level:4},
  {id:'c01',emoji:'🦋',title:'Chin Up Shoulders Back',description:'Every time you walk today - chin up, shoulders back. Correct it every time you forget.',category:'Confidence',level:1},
  {id:'c02',emoji:'🦋',title:'Slow Down Your Walk',description:'Walk more slowly than usual today. Deliberately. You have all the time in the world.',category:'Confidence',level:1},
  {id:'c03',emoji:'🦋',title:'Mirror Affirmations',description:'Stand in front of the mirror this morning and say 3 things you love about your appearance, out loud.',category:'Confidence',level:1},
  {id:'c04',emoji:'🦋',title:'Sit Up Straight All Day',description:'No slouching today. Every time you catch yourself, correct it. Posture is presence.',category:'Confidence',level:1},
  {id:'c05',emoji:'🦋',title:'No Unnecessary Apologies',description:'Do not apologise today unless you have genuinely done something wrong.',category:'Confidence',level:1},
  {id:'c06',emoji:'🦋',title:'Say Something Kind to Yourself',description:'Before you start your day, say something genuinely kind about yourself out loud.',category:'Confidence',level:1},
  {id:'c07',emoji:'🦋',title:'Pause Before You Enter',description:'Every time you walk into a room today, pause for 2 beats. Look around. Then move.',category:'Confidence',level:2},
  {id:'c08',emoji:'🦋',title:'Hold Eye Contact',description:'In every conversation today, hold eye contact. Do not look away first.',category:'Confidence',level:2},
  {id:'c09',emoji:'🦋',title:'Speak Slowly and Clearly',description:'Do not rush your words for anyone today. Speak slowly, clearly, and with full intention.',category:'Confidence',level:2},
  {id:'c10',emoji:'🦋',title:'Own Every Compliment',description:'When someone compliments you today, say thank you - nothing else. No deflecting.',category:'Confidence',level:2},
  {id:'c11',emoji:'🦋',title:'Take Up Space',description:'Today: sit spread out, do not shrink in conversations, speak without hedging.',category:'Confidence',level:3},
  {id:'c12',emoji:'🦋',title:'I Am That Girl',description:'Say I am that girl out loud in the mirror 10 times before you leave. Mean it.',category:'Confidence',level:2},
  {id:'c13',emoji:'🦋',title:'Speak First',description:'In every group situation today, be the first to speak. Do not wait.',category:'Confidence',level:3},
  {id:'c14',emoji:'🦋',title:'Walk Like You Are Being Watched',description:'Walk today as if there is a camera on you at all times. Slow, deliberate, beautiful.',category:'Confidence',level:3},
  {id:'c15',emoji:'🦋',title:'Be the Energy in the Room',description:'Walk into every space today and make it better with your presence. Own the room.',category:'Confidence',level:4},
  {id:'o01',emoji:'🌸',title:'Smile at 3 Strangers',description:'Give a real, warm, deliberate smile to at least 3 strangers today. A proper smile.',category:'Social',level:1},
  {id:'o02',emoji:'🌸',title:'Say Hello First',description:'Be the first to say hello in every interaction today. Do not wait for others.',category:'Social',level:1},
  {id:'o03',emoji:'🌸',title:'Compliment Someone You Know',description:'Give a specific, genuine compliment to someone you know today. Something real.',category:'Social',level:1},
  {id:'o04',emoji:'🌸',title:'Compliment a Stranger',description:'Give a genuine, specific compliment to a complete stranger today.',category:'Social',level:2},
  {id:'o05',emoji:'🌸',title:'Start a Conversation',description:'Start a conversation with someone you do not know well today.',category:'Social',level:2},
  {id:'o06',emoji:'🌸',title:'Laugh Loudly and Openly',description:'Laugh today without covering your mouth or shrinking it. Loud, open, unashamed.',category:'Social',level:2},
  {id:'o07',emoji:'🌸',title:'A Compliment They Will Remember',description:'Give one person a compliment so specific and genuine they will still think about it tomorrow.',category:'Social',level:3},
  {id:'o08',emoji:'🌸',title:'Give 5 Compliments Today',description:'Five compliments, five different people, all specific and genuine. Let each one land.',category:'Social',level:4},
  {id:'e01',emoji:'💆',title:'Treat Yourself Today',description:'Buy yourself something small and lovely today - a nice coffee, flowers, chocolate.',category:'Self-Care',level:1},
  {id:'e02',emoji:'💆',title:'Pamper Night Tonight',description:'Tonight: face mask, candles, favourite playlist. Full princess treatment. No rushing.',category:'Self-Care',level:1},
  {id:'e03',emoji:'💆',title:'Full Skincare Before Bed',description:'Clean skin, full routine, bed feeling gorgeous. Do not skip a single step tonight.',category:'Self-Care',level:1},
  {id:'e04',emoji:'💆',title:'Journal 5 Things You Like',description:'Write down 5 things you genuinely like about yourself - not what you have done, who you are.',category:'Self-Care',level:1},
  {id:'e05',emoji:'💆',title:'Slow Morning Today',description:'Give yourself a slow, luxurious morning today. Favourite playlist, no rushing.',category:'Self-Care',level:2},
  {id:'e06',emoji:'💆',title:'Run a Proper Bath',description:'Bubbles, candles, oils, music. At least 30 minutes. Phone in another room.',category:'Self-Care',level:2},
  {id:'e07',emoji:'💆',title:'Rest Without Guilt',description:'Take a real rest today - nap, lie down, be still. No guilt. Rest is productive.',category:'Self-Care',level:2},
  {id:'e08',emoji:'💆',title:'Light a Candle Today',description:'Light your favourite candle while you get ready or relax today. Make it feel special.',category:'Self-Care',level:1},
  {id:'e09',emoji:'💆',title:'Solo Date Today',description:'Take yourself somewhere nice today - a cafe, a walk, a little shop. Just you. Dressed up.',category:'Self-Care',level:4},
  {id:'d01',emoji:'📸',title:'Take a Confident Selfie',description:'Take 10 selfies today and keep your favourite. No deleting them all. At least one stays.',category:'Dare',level:1},
  {id:'d02',emoji:'📸',title:'Post a Selfie Online',description:'Post a confident photo on social media - no heavy filters. Caption it something confident.',category:'Dare',level:2},
  {id:'d03',emoji:'📸',title:'Wear Bold to Do the Boring',description:'Wear your most glamorous outfit for the most boring task today. Grocery run, petrol.',category:'Dare',level:3},
  {id:'d04',emoji:'📸',title:'Fully Glam for a Coffee Run',description:'Get completely glam and go to a coffee shop. Sit in. Act like this is completely normal.',category:'Dare',level:3},
  {id:'d05',emoji:'📸',title:'Home Photoshoot',description:'Set up a little photoshoot at home - try 5 different outfits and photograph each one.',category:'Dare',level:3},
  {id:'d06',emoji:'📸',title:'Strut Everywhere Today',description:'Walk with a deliberate, confident strut everywhere today. Every corridor, car park, shop.',category:'Dare',level:5},
  {id:'f01',emoji:'💋',title:'Slow Deliberate Smile',description:'Smile more slowly and deliberately at people today - a full, intentional smile.',category:'Flirty',level:1},
  {id:'f02',emoji:'💋',title:'Laugh Without Hiding',description:'Laugh today without covering your face. Let it be full and open and unashamed.',category:'Flirty',level:1},
  {id:'f03',emoji:'💋',title:'Wear Your Most Irresistible Scent',description:'Wear the perfume that makes you feel completely irresistible today. Reapply after lunch.',category:'Flirty',level:2},
  {id:'f04',emoji:'💋',title:'Wink at Someone',description:'Wink at someone today - a friend, your partner, whoever - completely unprompted.',category:'Flirty',level:3},
  {id:'f05',emoji:'💋',title:'Smile Like You Have a Secret',description:'Smile today like you know something wonderful that no one else does.',category:'Flirty',level:3},
  {id:'f06',emoji:'💋',title:'Enjoy Being Looked At',description:'When you notice someone glance at you today, let yourself enjoy it. Do not shrink.',category:'Flirty',level:4},
  {id:'f07',emoji:'💋',title:'Own Your Femininity Fully',description:'Today, every choice - how you dress, speak, and move - is fully and proudly feminine.',category:'Flirty',level:5},
];

const LEVELS = [
  {level:1,title:'Rising Star',emoji:'🌸',color:'#ffb3d9',threshold:0},
  {level:2,title:'Glitter Girl',emoji:'✨',color:'#e8a0ff',threshold:6},
  {level:3,title:'That Girl',emoji:'🔥',color:'#ff80cc',threshold:15},
  {level:4,title:'Main Character',emoji:'👑',color:'#ff4db8',threshold:28},
  {level:5,title:'Icon',emoji:'💎',color:'#e600ac',threshold:45},
];

const CATS = ['Beauty','Style','Glam','Confidence','Social','Self-Care','Dare','Flirty','Naughty'];
const CAT_COLOR = {Beauty:'#ff6eb4',Style:'#c77dff',Glam:'#ffb347',Confidence:'#ff4db8',Social:'#ff9bd2','Self-Care':'#90caf9',Dare:'#ff3d9a',Flirty:'#ff80cc',Naughty:'#ff4444'};
const CAT_ICON = {Beauty:'💄',Style:'👗',Glam:'✨',Confidence:'🦋',Social:'🌸','Self-Care':'💆',Dare:'📸',Flirty:'💋',Naughty:'😈'};
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const ACHIEVEMENTS = [
  {id:'a1',emoji:'🌸',title:'First Step',desc:'Complete your first challenge',check:function(s){return s.total>=1;}},
  {id:'a2',emoji:'💅',title:'Getting Into It',desc:'Complete 10 challenges',check:function(s){return s.total>=10;}},
  {id:'a3',emoji:'✨',title:'On a Roll',desc:'Complete 25 challenges',check:function(s){return s.total>=25;}},
  {id:'a4',emoji:'👑',title:'Fifty Done',desc:'Complete 50 challenges',check:function(s){return s.total>=50;}},
  {id:'a5',emoji:'🔥',title:'On Fire',desc:'3 day streak',check:function(s){return s.streak>=3;}},
  {id:'a6',emoji:'🌟',title:'Week Warrior',desc:'7 day streak',check:function(s){return s.streak>=7;}},
  {id:'a7',emoji:'💄',title:'Beauty Habit',desc:'10 Beauty challenges done',check:function(s){return (s.cats.Beauty||0)>=10;}},
  {id:'a8',emoji:'🦋',title:'Confidence Queen',desc:'10 Confidence challenges done',check:function(s){return (s.cats.Confidence||0)>=10;}},
  {id:'a9',emoji:'📸',title:'Dare Devil',desc:'5 Dare challenges done',check:function(s){return (s.cats.Dare||0)>=5;}},
];

const THEMES = {
  pink:{bg:'#0f0008',a1:'#ff3d9a',a2:'#c77dff',name:'Rose Pink'},
  gold:{bg:'#0a0800',a1:'#ffb347',a2:'#ffd700',name:'Rose Gold'},
  lilac:{bg:'#08000f',a1:'#c77dff',a2:'#ff80cc',name:'Lilac Dream'},
  noir:{bg:'#050505',a1:'#ff6eb4',a2:'#e0e0e0',name:'Noir'},
};

const CONF_EMOJI = ['💖','✨','🌸','💅','👑','🦋','💗','*','🎀','💎','🌟','🩷'];

function getLvl(n) {
  return [...LEVELS].reverse().find(function(l){return n>=l.threshold;}) || LEVELS[0];
}
function getNext(n) {
  var i = LEVELS.findIndex(function(l){return n>=l.threshold;});
  return LEVELS[Math.min(i+1,LEVELS.length-1)];
}
function loadData() {
  try { return JSON.parse(localStorage.getItem(SK)) || {}; } catch(e) { return {}; }
}
function saveData(d) {
  localStorage.setItem(SK, JSON.stringify(d));
}

function pickChallenges(seen, total, ovr, custom) {
  var today = new Date().toDateString();
  var dow = new Date().getDay();
  var all = CHALLENGES.concat(custom || []);
  var pinned = all.filter(function(c) {
    var o = ovr[c.id] || {};
    if (o.disabled) return false;
    return o.rt === 'daily' || (o.rt === 'days' && (o.days||[]).indexOf(dow) >= 0) || (o.rt === 'date' && o.date === today);
  }).slice(0,3);
  if (pinned.length >= 3) return pinned.slice(0,3);
  var lvl = getLvl(total).level;
  var pids = pinned.map(function(c){return c.id;});
  var pool = all.filter(function(c) {
    var o = ovr[c.id] || {};
    return !o.disabled && pids.indexOf(c.id) < 0 && c.level <= lvl && c.category !== 'Naughty';
  });
  var unseen = pool.filter(function(c){ return seen.indexOf(c.id) < 0; });
  var src = unseen.length >= (3 - pinned.length) ? unseen : unseen.concat(pool.filter(function(c){ return seen.indexOf(c.id) >= 0; }));
  var cats = src.map(function(c){return c.category;}).filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(){return Math.random()-.5;});
  var picked = pinned.slice();
  var used = pids.slice();
  cats.forEach(function(cat) {
    if (picked.length >= 3) return;
    var cp = src.filter(function(c){ return c.category === cat && used.indexOf(c.id) < 0; });
    if (cp.length) { var p = cp[Math.floor(Math.random()*cp.length)]; picked.push(p); used.push(p.id); }
  });
  var rem = src.filter(function(c){ return used.indexOf(c.id) < 0; });
  while (picked.length < 3 && rem.length) {
    var i = Math.floor(Math.random()*rem.length);
    picked.push(rem[i]); rem.splice(i,1);
  }
  return picked.slice(0,3);
}

export default function App() {
  var today = new Date().toDateString();
  var s = loadData();

  var [splash, setSplash] = useState(true);
  var [st, setSt] = useState({
    ch: s.ch || [], lgd: s.lgd || null, total: s.total || 0, seen: s.seen || [],
    hist: s.hist || {}, streak: s.streak || 0, lsd: s.lsd || null,
    custom: s.custom || [], ovr: s.ovr || {}, cats: s.cats || {},
    earned: s.earned || [], msg: s.msg || '', reaction: s.reaction || '',
    theme: s.theme || 'pink', wplan: s.wplan || {},
    view: 'her', htab: 'Today', atab: 'Today',
    pinSet: s.pinSet || false, pin: s.pin || '', unlocked: false,
    showPin: false, pi: '', pe: '',
    celebId: null, confetti: [], lvlUp: false, allDone: false, newAch: null,
    fcat: 'All', fsearch: '',
    form: {emoji:'😈',title:'',desc:'',category:'Naughty',level:1}, ferr: '',
    bulk: '', bcat: 'Naughty', blvl: 1, bemoji: '😈', bres: '',
    schedId: null, msgd: s.msg || '', reactd: '',
    noteId: null, noted: '', diffId: null,
    wpexp: null, qpin: null,
  });

  useEffect(function() {
    saveData({ch:st.ch,lgd:st.lgd,total:st.total,seen:st.seen,hist:st.hist,streak:st.streak,lsd:st.lsd,custom:st.custom,ovr:st.ovr,cats:st.cats,earned:st.earned,msg:st.msg,reaction:st.reaction,theme:st.theme,wplan:st.wplan,pinSet:st.pinSet,pin:st.pin});
  }, [st.ch,st.lgd,st.total,st.seen,st.hist,st.streak,st.lsd,st.custom,st.ovr,st.cats,st.earned,st.msg,st.reaction,st.theme,st.wplan,st.pinSet,st.pin]);

  useEffect(function() {
    var t = setTimeout(function(){ setSplash(false); }, 2000);
    return function(){ clearTimeout(t); };
  }, []);

  var T = THEMES[st.theme] || THEMES.pink;
  var lvi = getLvl(st.total);
  var nxt = getNext(st.total);
  var pct = lvi.level < 5 ? Math.min(100, ((st.total - lvi.threshold) / (nxt.threshold - lvi.threshold)) * 100) : 100;
  var doneT = st.ch.filter(function(c){return c.done;}).length;
  var allCh = CHALLENGES.concat(st.custom);

  function gen(base) {
    var b = base || st;
    var all = CHALLENGES.concat(b.custom);
    var plan = b.wplan[today];
    var picked;
    if (plan && plan.length > 0) {
      picked = plan.map(function(id){ return all.find(function(c){return c.id===id;}); }).filter(Boolean).slice(0,3);
    }
    if (!picked || picked.length === 0) picked = pickChallenges(b.seen, b.total, b.ovr, b.custom);
    setSt(function(p){ return Object.assign({}, p, {ch: picked.map(function(c,i){ return Object.assign({},c,{uid:today+'-'+i,done:false,note:'',diff:null}); }), lgd: today}); });
  }

  useEffect(function() {
    if (st.lgd !== today || st.ch.length === 0) gen();
  }, []);

  function checkAch(ns) {
    var ne = ACHIEVEMENTS.filter(function(a){ return ns.earned.indexOf(a.id) < 0 && a.check(ns); });
    if (ne.length > 0) return {earned: ns.earned.concat(ne.map(function(a){return a.id;})), newAch: ne[0]};
    return {};
  }

  function complete(uid) {
    setSt(function(p) {
      var ch = p.ch.find(function(c){return c.uid===uid;});
      if (!ch) return p;
      var nd = !ch.done;
      var nt = nd ? p.total+1 : Math.max(0,p.total-1);
      var lu = nd && getLvl(nt).level > getLvl(p.total).level;
      var ns2 = nd && p.seen.indexOf(ch.id) < 0 ? p.seen.concat([ch.id]) : p.seen;
      var nc = p.ch.map(function(c){ return c.uid===uid ? Object.assign({},c,{done:nd}) : c; });
      var an = nc.every(function(c){return c.done;});
      var ncc = Object.assign({},p.cats);
      ncc[ch.category] = (ncc[ch.category]||0) + (nd?1:-1);
      var str = p.streak, lsd = p.lsd;
      if (nd && an) {
        var y = new Date(); y.setDate(y.getDate()-1);
        str = (p.lsd === y.toDateString() || p.lsd === today) ? (p.lsd === today ? p.streak : p.streak+1) : 1;
        lsd = today;
      }
      var conf = nd ? Array.from({length:18},function(_,i){ return {id:Date.now()+'-'+i, x:8+Math.random()*84, y:10+Math.random()*80, e:CONF_EMOJI[Math.floor(Math.random()*CONF_EMOJI.length)], d:Math.random()*0.7}; }) : [];
      var ns = Object.assign({},p,{ch:nc,total:nt,seen:ns2,celebId:nd?uid:null,confetti:conf,lvlUp:lu,hist:Object.assign({},p.hist,{[today]:nc}),streak:str,lsd:lsd,allDone:an&&nd,cats:ncc});
      return Object.assign({},ns,checkAch(ns));
    });
    setTimeout(function(){ setSt(function(p){ return Object.assign({},p,{celebId:null,confetti:[],lvlUp:false,allDone:false,newAch:null}); }); }, 3200);
  }

  function setOv(id, patch) {
    setSt(function(p){ var o = Object.assign({},p.ovr); o[id] = Object.assign({},o[id]||{},patch); return Object.assign({},p,{ovr:o}); });
  }

  function addOne() {
    var f = st.form;
    if (!f.title.trim() || !f.desc.trim()) { setSt(function(p){return Object.assign({},p,{ferr:'Fill in all fields'});}); return; }
    setSt(function(p){ return Object.assign({},p,{custom:p.custom.concat([Object.assign({},f,{description:f.desc,id:'c-'+Date.now(),custom:true})]),form:{emoji:'😈',title:'',desc:'',category:'Naughty',level:1},ferr:''}); });
  }

  function bulkImport() {
    var lines = st.bulk.trim().split('\n').filter(function(l){return l.trim();});
    var chs = []; var i = 0;
    while (i < lines.length) {
      var tl = lines[i].trim(); i++;
      var desc = '';
      if (i < lines.length && lines[i].trim() && !lines[i].trim().match(/^[\d\-\*]/) && lines[i].trim().length > 20) { desc = lines[i].trim(); i++; }
      var title = tl.replace(/^[\d\.\-\*]+\s*/,'').trim();
      if (title.length > 2) chs.push({id:'c-'+Date.now()+'-'+chs.length,custom:true,emoji:st.bemoji,title:title,description:desc||title,category:st.bcat,level:Number(st.blvl)});
    }
    if (chs.length === 0) { setSt(function(p){return Object.assign({},p,{bres:'No challenges found'});}); return; }
    setSt(function(p){ return Object.assign({},p,{custom:p.custom.concat(chs),bulk:'',bres:'Imported '+chs.length+' challenges into '+p.bcat}); });
  }

  function tryAdmin() { setSt(function(p){return Object.assign({},p,{showPin:true,pi:'',pe:''});}); }
  function submitPin() {
    if (!st.pinSet) {
      if (st.pi.length < 4) { setSt(function(p){return Object.assign({},p,{pe:'Need at least 4 digits'});}); return; }
      setSt(function(p){return Object.assign({},p,{pin:p.pi,pinSet:true,unlocked:true,view:'admin',showPin:false});});
    } else {
      if (st.pi === st.pin) setSt(function(p){return Object.assign({},p,{unlocked:true,view:'admin',showPin:false,pi:''});});
      else setSt(function(p){return Object.assign({},p,{pe:'Wrong PIN',pi:''});});
    }
  }

  var hdates = Object.keys(st.hist).filter(function(d){return d!==today;}).sort(function(a,b){return new Date(b)-new Date(a);});
  var schedC = st.schedId ? allCh.find(function(c){return c.id===st.schedId;}) : null;
  var schedOv = schedC ? (st.ovr[schedC.id]||{}) : {};
  var noteC = st.noteId ? st.ch.find(function(c){return c.uid===st.noteId;}) : null;
  var diffC = st.diffId ? st.ch.find(function(c){return c.uid===st.diffId;}) : null;
  var filt = allCh.filter(function(c){ return (st.fcat==='All'||c.category===st.fcat) && (!st.fsearch||c.title.toLowerCase().indexOf(st.fsearch.toLowerCase())>=0); });

  function getWeekDates() {
    var d = []; var t2 = new Date(); var mon = new Date(t2); mon.setDate(t2.getDate()-t2.getDay()+1);
    for (var i=0;i<7;i++){var x=new Date(mon);x.setDate(mon.getDate()+i);d.push(x);}
    return d;
  }

  var grad = 'linear-gradient(135deg,'+T.a1+','+T.a2+')';
  var cardS = {background:'rgba(255,255,255,.038)',border:'1px solid rgba(255,120,190,.15)',borderRadius:18,backdropFilter:'blur(12px)'};
  var inpS = {background:'rgba(255,255,255,.055)',border:'1px solid rgba(255,120,190,.24)',borderRadius:12,padding:'12px 14px',color:'#ffb3d9',fontFamily:'Crimson Text,serif',fontSize:'.95rem',outline:'none',width:'100%',WebkitAppearance:'none',appearance:'none'};
  var lblS = {color:'rgba(255,179,217,.46)',fontSize:'.66rem',textTransform:'uppercase',letterSpacing:'.1em',display:'block',marginBottom:5,fontFamily:'Crimson Text,serif'};
  var gbS = {background:grad,border:'none',borderRadius:50,color:'#fff',fontFamily:'Playfair Display,serif',fontSize:'.95rem',fontWeight:700,padding:14,cursor:'pointer',boxShadow:'0 0 24px '+T.a1+'55',width:'100%',touchAction:'manipulation'};
  function sbS(on) { return {background:on?grad:'transparent',border:on?'none':'1px solid rgba(255,120,190,.24)',borderRadius:50,color:on?'#fff':'#ffb3d9',fontFamily:'Playfair Display,serif',fontSize:'.8rem',padding:'9px 16px',cursor:'pointer',touchAction:'manipulation',whiteSpace:'nowrap'}; }
  function cbS(done) { return {width:40,height:40,minWidth:40,borderRadius:'50%',border:done?'none':'2px solid rgba(255,120,190,.34)',background:done?grad:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',color:done?'#fff':'transparent',touchAction:'manipulation',flexShrink:0}; }

  function OVL(props) {
    return (
      <div onClick={props.onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',backdropFilter:'blur(10px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
        <div onClick={function(e){e.stopPropagation();}} style={{maxWidth:400,width:'100%'}}>{props.children}</div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:T.bg,fontFamily:'Palatino Linotype,Palatino,Georgia,serif',position:'relative',overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Crimson+Text:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @keyframes blob{0%,100%{transform:translateY(0);opacity:.1}50%{transform:translateY(-16px);opacity:.17}}
        @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes popIn{0%{transform:scale(.86) translateY(14px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
        @keyframes fly{0%{transform:scale(0) rotate(0deg);opacity:1}100%{transform:scale(2) rotate(720deg) translateY(-100px);opacity:0}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
        @keyframes up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes lvlPop{0%{transform:scale(0) translateY(40px);opacity:0}65%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}
        @keyframes tick{0%{transform:scale(1)}40%{transform:scale(1.4)}100%{transform:scale(1)}}
        @keyframes achSlide{0%{transform:translateY(-70px) translateX(-50%);opacity:0}15%,80%{transform:translateY(0) translateX(-50%);opacity:1}100%{transform:translateY(-70px) translateX(-50%);opacity:0}}
        @keyframes splFade{0%{opacity:1}100%{opacity:0}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,100,180,.22);border-radius:3px}
      `}</style>

      {splash && (
        <div style={{position:'fixed',inset:0,background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:999,animation:'splFade .5s 1.8s ease-out forwards'}}>
          <div style={{fontSize:'4rem',marginBottom:16,animation:'pulse 1.5s ease-in-out infinite'}}>💖</div>
          <div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'2.6rem',background:'linear-gradient(135deg,'+T.a1+',#ffcce8,'+T.a2+')',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 2s ease infinite'}}>Glow Up</div>
          <div style={{color:'rgba(255,179,217,.45)',fontStyle:'italic',marginTop:8,fontFamily:'Crimson Text,serif',fontSize:'1rem'}}>your daily challenges</div>
        </div>
      )}

      <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden'}}>
        {[{t:'-8%',l:'-8%',s:'65vw',c:T.a1+'18'},{t:'38%',r:'-12%',s:'55vw',c:T.a2+'14'},{b:'-8%',l:'15%',s:'60vw',c:T.a1+'0f'}].map(function(b,i){
          return <div key={i} style={{position:'absolute',top:b.t,left:b.l,right:b.r,bottom:b.b,width:b.s,height:b.s,borderRadius:'50%',background:'radial-gradient(circle,'+b.c+',transparent 70%)',animation:'blob '+(8+i*1.5)+'s '+(i*2)+'s ease-in-out infinite'}}/>;
        })}
      </div>

      {st.confetti.map(function(c){
        return <div key={c.id} style={{position:'fixed',top:c.y+'%',left:c.x+'%',fontSize:'1.4rem',pointerEvents:'none',zIndex:300,animation:'fly 2s '+c.d+'s ease-out forwards'}}>{c.e}</div>;
      })}

      {st.newAch && (
        <div style={{position:'fixed',top:16,left:'50%',zIndex:400,animation:'achSlide 3s ease-out forwards',whiteSpace:'nowrap'}}>
          <div style={{background:'rgba(22,0,15,.97)',border:'1px solid '+T.a1+'66',borderRadius:50,padding:'11px 20px',display:'flex',alignItems:'center',gap:10,boxShadow:'0 0 28px '+T.a1+'44'}}>
            <span style={{fontSize:'1.5rem'}}>{st.newAch.emoji}</span>
            <div>
              <div style={{color:'rgba(255,179,217,.45)',fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>Achievement Unlocked</div>
              <div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.86rem',fontWeight:'bold'}}>{st.newAch.title}</div>
            </div>
          </div>
        </div>
      )}

      {st.allDone && (
        <OVL onClose={function(){setSt(function(p){return Object.assign({},p,{allDone:false});});}}>
          <div style={Object.assign({},cardS,{padding:'44px 32px',textAlign:'center',animation:'lvlPop .6s ease-out',border:'1px solid '+T.a1+'55'})}>
            <div style={{fontSize:'3.5rem',marginBottom:12}}>👑</div>
            <div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'1.7rem',background:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:10}}>All Done!</div>
            <div style={{color:'rgba(255,179,217,.62)',fontFamily:'Crimson Text,serif',fontSize:'1rem',lineHeight:1.6}}>You absolutely smashed today. You are incredible. 💖</div>
            {st.streak > 1 && <div style={{marginTop:14,color:'#ffb347',fontFamily:'Playfair Display,serif',fontSize:'0.9rem'}}>🔥 {st.streak} day streak!</div>}
          </div>
        </OVL>
      )}

      {st.lvlUp && !st.allDone && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',backdropFilter:'blur(4px)',zIndex:150,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',pointerEvents:'none'}}>
          <div style={Object.assign({},cardS,{padding:'40px',textAlign:'center',animation:'lvlPop .65s ease-out',maxWidth:300,width:'100%',border:'1px solid '+T.a1+'55'})}>
            <div style={{fontSize:'3.5rem',marginBottom:10}}>{getLvl(st.total).emoji}</div>
            <div style={{color:'rgba(255,179,217,.5)',fontSize:'0.7rem',letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:8}}>Level Up</div>
            <div style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'1.9rem',background:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{getLvl(st.total).title}</div>
          </div>
        </div>
      )}

      {st.showPin && (
        <OVL onClose={function(){setSt(function(p){return Object.assign({},p,{showPin:false});});}}>
          <div style={Object.assign({},cardS,{padding:'36px 24px',textAlign:'center',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'44'})}>
            <div style={{fontSize:'2.5rem',marginBottom:12}}>🔐</div>
            <h3 style={{color:T.a1,fontFamily:'Playfair Display,serif',marginBottom:8,fontSize:'1.4rem'}}>{!st.pinSet?'Set Your PIN':'Admin Access'}</h3>
            <p style={{color:'rgba(255,179,217,.46)',fontSize:'0.86rem',marginBottom:22,fontStyle:'italic'}}>{!st.pinSet?'Create a PIN to protect admin':'Enter your PIN'}</p>
            <input type='password' inputMode='numeric' placeholder='••••' value={st.pi} onChange={function(e){setSt(function(p){return Object.assign({},p,{pi:e.target.value,pe:''});});}} onKeyDown={function(e){if(e.key==='Enter')submitPin();}} style={Object.assign({},inpS,{textAlign:'center',fontSize:'2rem',letterSpacing:'0.6em',marginBottom:12})}/>
            {st.pe && <p style={{color:'#ff3d9a',fontSize:'0.86rem',margin:'0 0 12px'}}>{st.pe}</p>}
            <div style={{display:'flex',gap:10}}>
              <button style={Object.assign({},gbS,{flex:1})} onClick={submitPin}>{!st.pinSet?'Set PIN':'Unlock'}</button>
              <button onClick={function(){setSt(function(p){return Object.assign({},p,{showPin:false});});}} style={Object.assign({},sbS(false),{flex:1})}>Cancel</button>
            </div>
          </div>
        </OVL>
      )}

      {st.noteId && noteC && (
        <OVL onClose={function(){setSt(function(p){return Object.assign({},p,{noteId:null});});}}>
          <div style={Object.assign({},cardS,{padding:'24px',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'38'})}>
            <div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontSize:'0.95rem',fontWeight:'bold',marginBottom:12}}>{noteC.emoji} {noteC.title}</div>
            <textarea rows={4} placeholder='How did it go?' value={st.noted} onChange={function(e){setSt(function(p){return Object.assign({},p,{noted:e.target.value});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5,marginBottom:12})}/>
            <button style={gbS} onClick={function(){setSt(function(p){return Object.assign({},p,{ch:p.ch.map(function(c){return c.uid===p.noteId?Object.assign({},c,{note:p.noted}):c;}),noteId:null,noted:''});});}}>Save Note 💕</button>
          </div>
        </OVL>
      )}

      {st.diffId && diffC && (
        <OVL onClose={function(){setSt(function(p){return Object.assign({},p,{diffId:null});});}}>
          <div style={Object.assign({},cardS,{padding:'24px',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'38',textAlign:'center'})}>
            <div style={{color:'rgba(255,179,217,.48)',fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8}}>How was that?</div>
            <div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:'bold',marginBottom:20}}>{diffC.emoji} {diffC.title}</div>
            <div style={{display:'flex',gap:8}}>
              {[['😊','Easy'],['💪','Just Right'],['🔥','Hard']].map(function(pair){
                return (
                  <button key={pair[1]} onClick={function(){setSt(function(p){return Object.assign({},p,{ch:p.ch.map(function(c){return c.uid===p.diffId?Object.assign({},c,{diff:pair[1]}):c;}),diffId:null});});}} style={{flex:1,padding:'10px 6px',borderRadius:10,border:'1px solid rgba(255,120,190,.2)',background:'transparent',color:'rgba(255,179,217,.5)',cursor:'pointer',fontFamily:'Crimson Text,serif',fontSize:'.82rem',touchAction:'manipulation'}}>
                    <div style={{fontSize:'1.4rem',marginBottom:4}}>{pair[0]}</div>{pair[1]}
                  </button>
                );
              })}
            </div>
          </div>
        </OVL>
      )}

      {st.schedId && schedC && (
        <OVL onClose={function(){setSt(function(p){return Object.assign({},p,{schedId:null});});}}>
          <div style={Object.assign({},cardS,{padding:'22px',animation:'popIn .3s ease-out',border:'1px solid '+T.a1+'38',maxHeight:'80vh',overflowY:'auto'})}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <span style={{fontSize:'1.2rem'}}>{schedC.emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.92rem',fontWeight:'bold',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{schedC.title}</div>
                <div style={{color:CAT_COLOR[schedC.category],fontSize:'0.62rem',marginTop:2}}>{schedC.category}</div>
              </div>
            </div>
            <div style={lblS}>Repeat Schedule</div>
            {[['none','No repeat'],['daily','Every day'],['days','Specific days'],['date','One date']].map(function(pair){
              return <button key={pair[0]} onClick={function(){setOv(schedC.id,{rt:pair[0]});}} style={Object.assign({},sbS(schedOv.rt===pair[0]),{textAlign:'left',padding:'10px 14px',borderRadius:12,width:'100%',marginBottom:7})}>{schedOv.rt===pair[0]?'* ':'o '}{pair[1]}</button>;
            })}
            {schedOv.rt==='days' && (
              <div style={{marginBottom:12}}>
                <div style={lblS}>Select days</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {DAYS.map(function(d,i){
                    var sel = (schedOv.days||[]).indexOf(i)>=0;
                    return <button key={i} onClick={function(){var cur=schedOv.days||[];setOv(schedC.id,{days:sel?cur.filter(function(x){return x!==i;}):[...cur,i]});}} style={{width:36,height:36,borderRadius:'50%',border:'1px solid '+(sel?T.a1+'88':'rgba(255,120,190,.22)'),background:sel?grad:'transparent',color:sel?'#fff':'rgba(255,179,217,.48)',fontSize:'.74rem',cursor:'pointer',touchAction:'manipulation'}}>{d}</button>;
                  })}
                </div>
              </div>
            )}
            {schedOv.rt==='date' && (
              <div style={{marginBottom:12}}>
                <div style={lblS}>Pick a date</div>
                <input type='date' style={Object.assign({},inpS,{colorScheme:'dark'})} onChange={function(e){if(e.target.value)setOv(schedC.id,{date:new Date(e.target.value+'T12:00:00').toDateString()});}}/>
              </div>
            )}
            <button style={Object.assign({},gbS,{marginTop:4})} onClick={function(){setSt(function(p){return Object.assign({},p,{schedId:null});});}}>Done</button>
          </div>
        </OVL>
      )}

      <div style={{position:'relative',zIndex:1,maxWidth:520,margin:'0 auto',padding:'0 15px 80px'}}>

        <div style={{textAlign:'center',padding:'32px 0 16px'}}>
          <div style={{fontSize:'2.5rem',marginBottom:7,animation:'pulse 3s infinite'}}>💖</div>
          <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'clamp(1.8rem,8vw,2.9rem)',background:'linear-gradient(135deg,'+T.a1+',rgba(255,220,240,1),'+T.a2+','+T.a1+')',backgroundSize:'300% 300%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 5s ease infinite',lineHeight:1.1}}>Glow Up</h1>
          <p style={{color:'rgba(255,179,217,.4)',fontStyle:'italic',margin:'6px 0 0',fontSize:'0.88rem',fontFamily:'Crimson Text,serif'}}>your daily challenges ✨</p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:13,flexWrap:'wrap'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:9,background:T.a1+'12',border:'1px solid '+T.a1+'22',borderRadius:50,padding:'9px 18px'}}>
              <span style={{fontSize:'1.3rem'}}>{lvi.emoji}</span>
              <div style={{textAlign:'left'}}>
                <div style={{color:lvi.color,fontWeight:'bold',fontFamily:'Playfair Display,serif',fontSize:'0.88rem'}}>{lvi.title}</div>
                <div style={{color:'rgba(255,179,217,.3)',fontSize:'0.6rem'}}>{st.total} done</div>
              </div>
            </div>
            {st.streak > 0 && (
              <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,179,71,.08)',border:'1px solid rgba(255,179,71,.2)',borderRadius:50,padding:'9px 14px'}}>
                <span>🔥</span><div style={{color:'#ffb347',fontWeight:'bold',fontFamily:'Playfair Display,serif',fontSize:'0.86rem'}}>{st.streak}d</div>
              </div>
            )}
          </div>
          {lvi.level < 5 && (
            <div style={{marginTop:10,padding:'0 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{color:'rgba(255,179,217,.24)',fontSize:'0.6rem'}}>Next: {nxt.title}</span>
                <span style={{color:'rgba(255,179,217,.24)',fontSize:'0.6rem'}}>{Math.round(pct)}%</span>
              </div>
              <div style={{height:4,background:'rgba(255,255,255,.05)',borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,'+T.a1+','+T.a2+')',borderRadius:4,transition:'width .7s',boxShadow:'0 0 8px '+T.a1+'44'}}/>
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:7,justifyContent:'center',marginTop:16,overflowX:'auto',padding:'2px 4px'}}>
            {[{id:'her',l:'💅 Today'},{id:'admin',l:'🔒 Admin'}].map(function(t){
              return <button key={t.id} style={sbS(st.view===t.id)} onClick={function(){if(t.id==='admin'&&!st.unlocked)tryAdmin();else setSt(function(p){return Object.assign({},p,{view:t.id});});}}>{t.l}</button>;
            })}
          </div>
        </div>

        {st.view==='her' && (
          <div style={{animation:'up .4s ease-out'}}>
            <div style={{display:'flex',gap:7,marginBottom:14,overflowX:'auto',padding:'2px 0'}}>
              {['Today','Stats','History'].map(function(t){
                return <button key={t} style={Object.assign({},sbS(st.htab===t),{flex:1,fontSize:'0.78rem'})} onClick={function(){setSt(function(p){return Object.assign({},p,{htab:t});});}}>{t}</button>;
              })}
            </div>

            {st.htab==='Today' && (
              <div>
                {st.reaction && (
                  <div style={Object.assign({},cardS,{padding:'14px 16px',marginBottom:12,border:'1px solid '+T.a1+'44',background:T.a1+'0e',display:'flex',alignItems:'center',gap:12})}>
                    <span style={{fontSize:'1.8rem'}}>💌</span>
                    <div style={{flex:1}}>
                      <div style={{color:'rgba(255,179,217,.46)',fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>A message for you</div>
                      <div style={{color:'#ffe8f5',fontFamily:'Crimson Text,serif',fontSize:'0.92rem',lineHeight:1.5}}>{st.reaction}</div>
                    </div>
                    <button onClick={function(){setSt(function(p){return Object.assign({},p,{reaction:''});});}} style={{background:'transparent',border:'none',color:'rgba(255,179,217,.3)',cursor:'pointer',fontSize:'1.2rem',padding:'4px'}}>x</button>
                  </div>
                )}
                {st.msg && (
                  <div style={Object.assign({},cardS,{padding:'12px 16px',marginBottom:12})}>
                    <div style={{color:'rgba(255,179,217,.4)',fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>✨ Today</div>
                    <div style={{color:'rgba(255,179,217,.68)',fontFamily:'Crimson Text,serif',fontSize:'0.93rem',fontStyle:'italic',lineHeight:1.55}}>{st.msg}</div>
                  </div>
                )}
                {st.ch.length > 0 && (
                  <div style={Object.assign({},cardS,{padding:'13px 16px',marginBottom:13})}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                      <span style={{color:'rgba(255,179,217,.44)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.12em'}}>Today</span>
                      <span style={{color:T.a1,fontWeight:'bold',fontFamily:'Playfair Display,serif'}}>{doneT} / {st.ch.length}</span>
                    </div>
                    <div style={{height:7,background:'rgba(255,255,255,.05)',borderRadius:7,overflow:'hidden'}}>
                      <div style={{height:'100%',width:(st.ch.length?(doneT/st.ch.length)*100:0)+'%',background:'linear-gradient(90deg,'+T.a1+','+T.a2+')',borderRadius:7,transition:'width .6s',boxShadow:'0 0 10px '+T.a1+'44'}}/>
                    </div>
                  </div>
                )}
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {st.ch.map(function(c,i){
                    var cc = CAT_COLOR[c.category] || '#ff6eb4';
                    return (
                      <div key={c.uid} style={Object.assign({},cardS,{padding:'18px',animation:'popIn .4s '+(i*.12)+'s ease-out both',border:c.done?'1px solid '+T.a1+'36':'1px solid rgba(255,120,190,.13)',background:c.done?T.a1+'07':'rgba(255,255,255,.035)',position:'relative',overflow:'hidden'})}>
                        {st.celebId===c.uid && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',pointerEvents:'none',zIndex:5}}>✨💖✨</div>}
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
                            {c.done && (
                              <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                                <button onClick={function(){setSt(function(p){return Object.assign({},p,{noteId:c.uid,noted:c.note||''});});}} style={{background:'transparent',border:'1px solid rgba(255,120,190,.22)',borderRadius:20,color:'rgba(255,179,217,.5)',cursor:'pointer',fontSize:'0.7rem',padding:'4px 12px',fontFamily:'Crimson Text,serif',touchAction:'manipulation'}}>{c.note?'📝 Edit note':'📝 Add note'}</button>
                                <button onClick={function(){setSt(function(p){return Object.assign({},p,{diffId:c.uid});});}} style={{background:'transparent',border:'1px solid rgba(255,120,190,.22)',borderRadius:20,color:'rgba(255,179,217,.5)',cursor:'pointer',fontSize:'0.7rem',padding:'4px 12px',fontFamily:'Crimson Text,serif',touchAction:'manipulation'}}>{c.diff?(c.diff==='Easy'?'😊 ':c.diff==='Just Right'?'💪 ':'🔥 ')+c.diff:'* Rate'}</button>
                              </div>
                            )}
                            {c.note && <p style={{margin:'7px 0 0',color:'rgba(255,179,217,.4)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',fontStyle:'italic'}}>'{c.note}'</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {st.htab==='Stats' && (
              <div style={{animation:'up .35s ease-out'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                  {[{e:'✅',v:st.total,l:'Total Done'},{e:'🔥',v:st.streak,l:'Streak'},{e:lvi.emoji,v:lvi.title,l:'Level'},{e:'📅',v:hdates.length+1,l:'Days Active'}].map(function(s,i){
                    return (
                      <div key={i} style={Object.assign({},cardS,{padding:'16px 12px',textAlign:'center'})}>
                        <div style={{fontSize:'1.8rem',marginBottom:5}}>{s.e}</div>
                        <div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'1rem'}}>{s.v}</div>
                        <div style={{color:'rgba(255,179,217,.32)',fontSize:'0.6rem',marginTop:3,textTransform:'uppercase',letterSpacing:'0.07em'}}>{s.l}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={Object.assign({},cardS,{padding:'16px',marginBottom:13})}>
                  <div style={{color:'rgba(255,179,217,.42)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>By Category</div>
                  {CATS.map(function(cat){
                    var n=st.cats[cat]||0; var mx=Math.max.apply(null,CATS.map(function(c){return st.cats[c]||0;}).concat([1])); var cc=CAT_COLOR[cat];
                    return (
                      <div key={cat} style={{marginBottom:9}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                          <span style={{color:'rgba(255,179,217,.52)',fontSize:'0.76rem'}}>{CAT_ICON[cat]} {cat}</span>
                          <span style={{color:cc,fontSize:'0.76rem',fontWeight:'bold'}}>{n}</span>
                        </div>
                        <div style={{height:4,background:'rgba(255,255,255,.05)',borderRadius:4,overflow:'hidden'}}>
                          <div style={{height:'100%',width:((n/mx)*100)+'%',background:'linear-gradient(90deg,'+cc+','+cc+'88)',borderRadius:4}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={Object.assign({},cardS,{padding:'16px'})}>
                  <div style={{color:'rgba(255,179,217,.42)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>Achievements ({st.earned.length}/{ACHIEVEMENTS.length})</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {ACHIEVEMENTS.map(function(a){
                      var e=st.earned.indexOf(a.id)>=0;
                      return (
                        <div key={a.id} style={{background:e?T.a1+'12':'rgba(255,255,255,.02)',border:'1px solid '+(e?T.a1+'44':'rgba(255,120,190,.1)'),borderRadius:12,padding:'11px 9px',textAlign:'center',opacity:e?1:.36}}>
                          <div style={{fontSize:'1.3rem',marginBottom:3}}>{a.emoji}</div>
                          <div style={{color:e?'#ffe8f5':'rgba(255,179,217,.46)',fontFamily:'Playfair Display,serif',fontSize:'0.74rem',fontWeight:'bold',marginBottom:2}}>{a.title}</div>
                          <div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem',lineHeight:1.3}}>{a.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {st.htab==='History' && (
              <div style={{animation:'up .35s ease-out'}}>
                <div style={{color:'rgba(255,179,217,.32)',fontSize:'0.64rem',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:12,textAlign:'center'}}>Past Challenges</div>
                {hdates.length===0 ? (
                  <div style={{textAlign:'center',padding:'50px 20px',color:'rgba(255,179,217,.26)',fontStyle:'italic',fontFamily:'Crimson Text,serif'}}>Complete some challenges and they will appear here 🌸</div>
                ) : hdates.map(function(date){
                  var dc=st.hist[date]||[]; var dd=dc.filter(function(c){return c.done;}).length; var pf=dd===dc.length&&dc.length>0;
                  return (
                    <div key={date} style={Object.assign({},cardS,{padding:'13px 16px',marginBottom:10,border:pf?'1px solid '+T.a1+'30':'1px solid rgba(255,120,190,.11)'})}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                        <span style={{color:'rgba(255,179,217,.48)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif'}}>{date}</span>
                        <span style={{fontSize:'0.72rem',color:pf?T.a1:'rgba(255,179,217,.3)',fontFamily:'Playfair Display,serif'}}>{dd}/{dc.length}{pf?' 👑':''}</span>
                      </div>
                      {dc.map(function(c,i){
                        return (
                          <div key={i}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:5,opacity:c.done?1:.32}}>
                              <span style={{fontSize:'0.78rem'}}>{c.done?'✅':'O'}</span>
                              <span style={{color:'rgba(255,179,217,.55)',fontSize:'0.8rem',fontFamily:'Crimson Text,serif',flex:1}}>{c.title}</span>
                              {c.diff && <span style={{fontSize:'0.7rem'}}>{c.diff==='Easy'?'😊':c.diff==='Just Right'?'💪':'🔥'}</span>}
                            </div>
                            {c.note && <div style={{color:'rgba(255,179,217,.35)',fontSize:'0.72rem',fontStyle:'italic',marginLeft:22,marginTop:2}}>'{c.note}'</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {st.view==='admin' && st.unlocked && (
          <div style={{animation:'up .4s ease-out'}}>
            <div style={{display:'flex',gap:5,marginBottom:14,overflowX:'auto',padding:'2px 0'}}>
              {['Today','Challenges','Planner','Add New','Bulk Import','Settings'].map(function(t){
                return <button key={t} style={Object.assign({},sbS(st.atab===t),{flex:1,minWidth:'fit-content',padding:'8px 9px',fontSize:'0.72rem'})} onClick={function(){setSt(function(p){return Object.assign({},p,{atab:t});});}}>{t}</button>;
              })}
            </div>

            {st.atab==='Today' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:13}}>
                  {[{l:'Level',v:lvi.title,e:lvi.emoji},{l:'Total',v:st.total,e:'✅'},{l:'Streak',v:st.streak+'🔥',e:'📅'}].map(function(s,i){
                    return (
                      <div key={i} style={Object.assign({},cardS,{padding:'12px 7px',textAlign:'center'})}>
                        <div style={{fontSize:'1.2rem',marginBottom:3}}>{s.e}</div>
                        <div style={{color:'#ffb3d9',fontFamily:'Playfair Display,serif',fontWeight:'bold',fontSize:'0.8rem'}}>{s.v}</div>
                        <div style={{color:'rgba(255,179,217,.3)',fontSize:'0.58rem',marginTop:2,textTransform:'uppercase',letterSpacing:'0.07em'}}>{s.l}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}>
                  <div style={lblS}>Quick Pin for Today</div>
                  <select value={st.qpin||''} onChange={function(e){setSt(function(p){return Object.assign({},p,{qpin:e.target.value||null});});}} style={Object.assign({},inpS,{marginBottom:9})}>
                    <option value=''>Pick a challenge...</option>
                    {allCh.map(function(c){return <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>;})}
                  </select>
                  <button style={gbS} onClick={function(){
                    if(!st.qpin)return;
                    var ch=allCh.find(function(c){return c.id===st.qpin;});
                    if(!ch)return;
                    setSt(function(p){var ex=p.ch.filter(function(c){return c.id!==ch.id;});var nc=[Object.assign({},ch,{uid:today+'-pin',done:false,note:'',diff:null})].concat(ex).slice(0,3);return Object.assign({},p,{ch:nc,lgd:today,qpin:null});});
                  }}>Pin Challenge Today 📌</button>
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
                <p style={{color:'rgba(255,179,217,.24)',fontSize:'0.7rem',textAlign:'center',marginBottom:13,fontStyle:'italic'}}>Picks 3 fresh challenges at her current level</p>

                {st.ch.length > 0 && (
                  <div style={{marginBottom:13}}>
                    <div style={lblS}>Todays Challenges</div>
                    {st.ch.map(function(c){
                      var cc=CAT_COLOR[c.category]||'#ff6eb4'; var ov=st.ovr[c.id]||{};
                      return (
                        <div key={c.uid} style={Object.assign({},cardS,{padding:'10px 13px',marginBottom:7,display:'flex',alignItems:'center',gap:9})}>
                          <span style={{fontSize:'0.95rem'}}>{c.emoji}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.82rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.title}</div>
                            <div style={{color:cc,fontSize:'0.6rem',marginTop:2}}>{c.category} · {c.done?'done':'pending'}{ov.rt&&ov.rt!=='none'?' · 📌':''}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button onClick={function(){setSt(function(p){return Object.assign({},p,{unlocked:false,view:'her'});});}} style={Object.assign({},sbS(false),{width:'100%',padding:'11px'})}>🔒 Lock and Return</button>
              </div>
            )}

            {st.atab==='Challenges' && (
              <div>
                <input placeholder='Search...' value={st.fsearch} onChange={function(e){setSt(function(p){return Object.assign({},p,{fsearch:e.target.value});});}} style={Object.assign({},inpS,{marginBottom:9})}/>
                <div style={{display:'flex',gap:5,overflowX:'auto',padding:'2px 0',marginBottom:11}}>
                  {['All'].concat(CATS).map(function(cat){
                    return <button key={cat} style={Object.assign({},sbS(st.fcat===cat),{fontSize:'0.68rem',padding:'6px 11px',whiteSpace:'nowrap'})} onClick={function(){setSt(function(p){return Object.assign({},p,{fcat:cat});});}}>{cat==='All'?'All':CAT_ICON[cat]+' '+cat}</button>;
                  })}
                </div>
                <div style={{color:'rgba(255,179,217,.26)',fontSize:'0.6rem',marginBottom:7}}>{filt.length} challenges</div>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {filt.map(function(c){
                    var ov=st.ovr[c.id]||{}; var dis=!!ov.disabled; var sched=ov.rt&&ov.rt!=='none'; var cc=CAT_COLOR[c.category]||'#ff6eb4';
                    return (
                      <div key={c.id} style={Object.assign({},cardS,{padding:'10px 12px',opacity:dis?.42:1,border:sched?'1px solid '+T.a1+'35':'1px solid rgba(255,120,190,.12)'})}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:'0.95rem'}}>{c.emoji}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{color:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.8rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textDecoration:dis?'line-through':'none'}}>{c.title}</div>
                            <div style={{display:'flex',alignItems:'center',gap:5,marginTop:2,flexWrap:'wrap'}}>
                              <span style={{color:cc,fontSize:'0.58rem'}}>{CAT_ICON[c.category]} {c.category}</span>
                              {c.custom && <span style={{color:'rgba(255,179,71,.5)',fontSize:'0.56rem'}}>custom</span>}
                              {sched && <span style={{color:T.a1,fontSize:'0.56rem'}}>📌 {ov.rt==='daily'?'daily':ov.rt==='days'?(ov.days||[]).map(function(d){return DAYS[d];}).join(', '):ov.date||''}</span>}
                            </div>
                          </div>
                          <button onClick={function(){setSt(function(p){return Object.assign({},p,{schedId:c.id});});}} style={{background:'transparent',border:'1px solid rgba(255,120,190,.18)',borderRadius:8,color:sched?T.a1:'rgba(255,179,217,.34)',cursor:'pointer',fontSize:'0.66rem',padding:'4px 8px',touchAction:'manipulation'}}>📅</button>
                          <button onClick={function(){setOv(c.id,{disabled:!dis});}} style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',background:dis?'rgba(255,120,190,.18)':'linear-gradient(135deg,'+T.a1+','+T.a2+')',position:'relative',touchAction:'manipulation',flexShrink:0}}>
                            <div style={{position:'absolute',top:3,left:dis?3:23,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
                          </button>
                        </div>
                        {c.custom && <button onClick={function(){setSt(function(p){return Object.assign({},p,{custom:p.custom.filter(function(x){return x.id!==c.id;})});});}} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.34)',cursor:'pointer',fontSize:'0.66rem',marginTop:6,padding:0,touchAction:'manipulation'}}>🗑 Delete</button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {st.atab==='Planner' && (
              <div>
                <p style={{color:'rgba(255,179,217,.4)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',marginBottom:13,lineHeight:1.5}}>Set specific challenges for any day this week.</p>
                {getWeekDates().map(function(date,i){
                  var ds=date.toDateString(); var isTd=ds===today; var isPast=date<new Date()&&!isTd;
                  var planned=st.wplan[ds]||[]; var exp=st.wpexp===ds;
                  return (
                    <div key={i} style={Object.assign({},cardS,{marginBottom:8,border:isTd?'1px solid '+T.a1+'44':'1px solid rgba(255,120,190,.13)',opacity:isPast?.5:1})}>
                      <button onClick={function(){setSt(function(p){return Object.assign({},p,{wpexp:p.wpexp===ds?null:ds});});}} style={{width:'100%',background:'transparent',border:'none',padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,touchAction:'manipulation'}}>
                        <div style={{flex:1,textAlign:'left'}}>
                          <div style={{color:isTd?T.a1:'#ffe8f5',fontFamily:'Playfair Display,serif',fontSize:'0.88rem',fontWeight:isTd?'bold':'normal'}}>{DAYS[date.getDay()]} {date.getDate()}/{date.getMonth()+1}{isTd?' (Today)':''}</div>
                          <div style={{color:'rgba(255,179,217,.38)',fontSize:'0.64rem',marginTop:2}}>{planned.length>0?planned.length+' planned':'Free choice'}</div>
                        </div>
                        <span style={{color:'rgba(255,179,217,.3)',fontSize:'0.8rem'}}>{exp?'^':'v'}</span>
                      </button>
                      {exp && (
                        <div style={{padding:'0 14px 14px'}}>
                          {planned.map(function(id){
                            var ch=allCh.find(function(c){return c.id===id;});
                            return ch ? (
                              <div key={id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,padding:'8px 10px',background:'rgba(255,255,255,.03)',borderRadius:10,border:'1px solid '+T.a1+'22'}}>
                                <span style={{fontSize:'0.9rem'}}>{ch.emoji}</span>
                                <span style={{color:'rgba(255,179,217,.65)',fontSize:'0.78rem',flex:1,fontFamily:'Crimson Text,serif'}}>{ch.title}</span>
                                <button onClick={function(){setSt(function(p){var np=Object.assign({},p.wplan);np[ds]=(np[ds]||[]).filter(function(x){return x!==id;});return Object.assign({},p,{wplan:np});});}} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.38)',cursor:'pointer',fontSize:'1rem',padding:'2px',touchAction:'manipulation'}}>x</button>
                              </div>
                            ) : null;
                          })}
                          {planned.length < 3 && (
                            <select onChange={function(e){if(e.target.value&&planned.indexOf(e.target.value)<0){setSt(function(p){var np=Object.assign({},p.wplan);np[ds]=(np[ds]||[]).concat([e.target.value]);return Object.assign({},p,{wplan:np});});}e.target.value='';}} defaultValue='' style={inpS}>
                              <option value=''>+ Add a challenge...</option>
                              {allCh.filter(function(c){return planned.indexOf(c.id)<0;}).map(function(c){return <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>;})}
                            </select>
                          )}
                          {planned.length > 0 && <button onClick={function(){setSt(function(p){var np=Object.assign({},p.wplan);np[ds]=[];return Object.assign({},p,{wplan:np});});}} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.38)',cursor:'pointer',fontSize:'0.7rem',marginTop:7,padding:0,fontFamily:'Crimson Text,serif'}}>Clear day</button>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {st.atab==='Add New' && (
              <div>
                <div style={{marginBottom:10}}>
                  <div style={lblS}>Title</div>
                  <input placeholder='Short punchy title...' value={st.form.title} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{title:e.target.value}),ferr:''});});}} style={inpS}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={lblS}>Description</div>
                  <textarea rows={3} placeholder='1-2 encouraging sentences...' value={st.form.desc} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{desc:e.target.value}),ferr:''});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5})}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:10}}>
                  <div>
                    <div style={lblS}>Category</div>
                    <select value={st.form.category} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{category:e.target.value})});});}} style={inpS}>
                      {CATS.map(function(c){return <option key={c} value={c}>{CAT_ICON[c]} {c}</option>;})}
                    </select>
                  </div>
                  <div>
                    <div style={lblS}>Emoji</div>
                    <input value={st.form.emoji} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{emoji:e.target.value})});});}} style={Object.assign({},inpS,{textAlign:'center',fontSize:'1.3rem'})} maxLength={2}/>
                  </div>
                </div>
                <div style={{marginBottom:13}}>
                  <div style={lblS}>Level</div>
                  <select value={st.form.level} onChange={function(e){setSt(function(p){return Object.assign({},p,{form:Object.assign({},p.form,{level:Number(e.target.value)})});});}} style={inpS}>
                    {LEVELS.map(function(l){return <option key={l.level} value={l.level}>{l.emoji} Level {l.level} - {l.title}</option>;})}
                  </select>
                </div>
                {st.ferr && <p style={{color:'#ff3d9a',fontSize:'0.82rem',marginBottom:10}}>{st.ferr}</p>}
                <button style={gbS} onClick={addOne}>Add Challenge 💕</button>
              </div>
            )}

            {st.atab==='Bulk Import' && (
              <div>
                <div style={Object.assign({},cardS,{padding:'13px',marginBottom:12})}>
                  <div style={{color:T.a1,fontFamily:'Playfair Display,serif',fontSize:'0.88rem',fontWeight:'bold',marginBottom:6}}>How it works</div>
                  <div style={{color:'rgba(255,179,217,.52)',fontSize:'0.78rem',fontFamily:'Crimson Text,serif',lineHeight:1.6}}>Paste one challenge per line. Optionally add a description on the next line.</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:10}}>
                  <div>
                    <div style={lblS}>Category</div>
                    <select value={st.bcat} onChange={function(e){setSt(function(p){return Object.assign({},p,{bcat:e.target.value});});}} style={inpS}>
                      {CATS.map(function(c){return <option key={c} value={c}>{CAT_ICON[c]} {c}</option>;})}
                    </select>
                  </div>
                  <div>
                    <div style={lblS}>Emoji</div>
                    <input value={st.bemoji} onChange={function(e){setSt(function(p){return Object.assign({},p,{bemoji:e.target.value});});}} style={Object.assign({},inpS,{textAlign:'center',fontSize:'1.3rem'})} maxLength={2}/>
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={lblS}>Level</div>
                  <select value={st.blvl} onChange={function(e){setSt(function(p){return Object.assign({},p,{blvl:Number(e.target.value)});});}} style={inpS}>
                    {LEVELS.map(function(l){return <option key={l.level} value={l.level}>{l.emoji} Level {l.level} - {l.title}</option>;})}
                  </select>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={lblS}>Paste your challenges</div>
                  <textarea rows={8} placeholder='Title here...' value={st.bulk} onChange={function(e){setSt(function(p){return Object.assign({},p,{bulk:e.target.value,bres:''});});}} style={Object.assign({},inpS,{resize:'none',lineHeight:1.5,fontFamily:'monospace',fontSize:'0.8rem'})}/>
                </div>
                {st.bres && <div style={{color:st.bres.indexOf('Imported')>=0?'#90caf9':'#ff6eb4',fontSize:'0.8rem',marginBottom:10,padding:'9px 13px',background:'rgba(255,255,255,.04)',borderRadius:10}}>{st.bres}</div>}
                <button style={gbS} onClick={bulkImport}>Import 📥</button>
              </div>
            )}

            {st.atab==='Settings' && (
              <div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}>
                  <div style={lblS}>Theme</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
                    {Object.keys(THEMES).map(function(key){
                      var t=THEMES[key]; var sel=st.theme===key;
                      return (
                        <button key={key} onClick={function(){setSt(function(p){return Object.assign({},p,{theme:key});});}} style={{background:sel?'linear-gradient(135deg,'+t.a1+'22,'+t.a2+'22)':'rgba(255,255,255,.03)',border:'1px solid '+(sel?t.a1+'66':'rgba(255,120,190,.13)'),borderRadius:12,padding:'12px 9px',cursor:'pointer',touchAction:'manipulation',textAlign:'center'}}>
                          <div style={{height:10,borderRadius:4,background:'linear-gradient(90deg,'+t.a1+','+t.a2+')',marginBottom:7}}/>
                          <div style={{color:sel?t.a1:'rgba(255,179,217,.46)',fontFamily:'Playfair Display,serif',fontSize:'0.78rem',fontWeight:sel?'bold':'normal'}}>{t.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={Object.assign({},cardS,{padding:'14px',marginBottom:11})}>
                  <div style={lblS}>Levels</div>
                  {LEVELS.map(function(l){
                    var r=st.total>=l.threshold; var cur=l.level===lvi.level;
                    return (
                      <div key={l.level} style={{display:'flex',alignItems:'center',gap:9,marginBottom:9,opacity:r?1:.34}}>
                        <span>{l.emoji}</span>
                        <div style={{flex:1}}>
                          <div style={{color:r?l.color:'rgba(255,179,217,.38)',fontFamily:'Playfair Display,serif',fontSize:'0.8rem',fontWeight:'bold'}}>{l.title}{cur?' (current)':''}</div>
                          <div style={{color:'rgba(255,179,217,.26)',fontSize:'0.58rem'}}>Unlocks at {l.threshold}</div>
                        </div>
                        {r && <span style={{color:l.color,fontSize:'0.76rem'}}>✓</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{borderTop:'1px solid rgba(255,120,190,.1)',paddingTop:16,marginBottom:10}}>
                  <div style={lblS}>Danger Zone</div>
                  <button onClick={function(){if(window.confirm('Reset all progress?'))setSt(function(p){return Object.assign({},p,{total:0,seen:[],ch:[],lgd:null,hist:{},streak:0,lsd:null,cats:{},earned:[],wplan:{}});});}} style={{background:'transparent',border:'1px solid rgba(255,60,60,.22)',color:'rgba(255,100,100,.4)',borderRadius:12,padding:11,cursor:'pointer',fontSize:'0.8rem',fontFamily:'Crimson Text,serif',width:'100%',marginBottom:8,touchAction:'manipulation'}}>Reset All Progress</button>
                  <button onClick={function(){if(window.confirm('Clear custom challenges?'))setSt(function(p){return Object.assign({},p,{custom:[]});});}} style={{background:'transparent',border:'1px solid rgba(255,60,60,.22)',color:'rgba(255,100,100,.4)',borderRadius:12,padding:11,cursor:'pointer',fontSize:'0.8rem',fontFamily:'Crimson Text,serif',width:'100%',touchAction:'manipulation'}}>Clear Custom Challenges</button>
                </div>
                <button onClick={function(){setSt(function(p){return Object.assign({},p,{unlocked:false,view:'her'});});}} style={Object.assign({},sbS(false),{width:'100%',padding:'11px'})}>Lock and Return</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
