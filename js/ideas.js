// ---- Bar Ideas: a theme, a prompt, an angle and a few images to write 4 or 8 bars about ----
const IDEA_THEMES = {
  faith: {
    label: "Faith",
    prompts: [
      "Lighting a candle in a church that smells of beeswax and incense. What are you asking for, and what are you too scared to ask for?",
      "The icons are watching. Write about being seen by eyes that were painted hundreds of years ago.",
      "Fasting before Easter: what you give up, and what it shows you about what really owns you.",
      "Midnight on Easter. The church goes dark, then one flame spreads from hand to hand until the whole room is lit. Write that moment.",
      "Faith when you can't feel it. Still showing up to pray when the line feels dead.",
      "Confession: the thing you'd only say to a priest, said in a way only you would understand.",
      "Your grandmother's prayers might be the reason you're still standing.",
      "The cross you wear around your neck vs. the cross you actually carry.",
      "Doubt isn't the opposite of faith. Write a bar where the two of them sit at the same table.",
      "Standing through the whole liturgy. Your legs ache, but something inside you finally goes quiet.",
      "A liturgy in an old language you only half understand, and still feel all the way through.",
      "Coming back after months of not praying. What does the walk back up the church steps look like?",
      "The world tells you you're your own god. Write about why that sounds like a cage.",
      "Mercy you didn't earn. The moment you realised you didn't have to.",
      "Praying for the people who hurt you, and actually meaning it by the last bar.",
      "Your body is a temple, but lately you've been treating it like a motel.",
      "Talking to God like it's a 2am text: short, honest, no punctuation.",
      "Sunday morning, rough from the night before, walking in anyway. Grace meets you at the door.",
      "Every saint was a sinner who kept going. Which one would you have been?",
      "Holy water on your forehead, mud still on your shoes."
    ],
    pics: ["incense", "beeswax candle", "icon", "gold leaf", "prayer rope", "the cross", "bell tower", "Easter bread", "red eggs", "holy water", "the dome", "choir", "altar", "candle smoke"]
  },
  christ: {
    label: "Jesus Christ",
    prompts: [
      "A carpenter who made the world, working with wood. Write about hands that build things.",
      "Gethsemane: sweating blood the night before. Put yourself in that garden on your worst night.",
      "He washed the feet of the man who was about to betray him. What would that cost you?",
      "Walking on water, and the second Peter looked down. What makes you look down?",
      "Thirty pieces of silver. What's your price, and who's offering it?",
      "The tomb was empty. Write about what you'd leave behind if you walked out of yours.",
      "He ate with the people everyone else avoided. Who's sitting at your table?",
      "Water into wine at a wedding: joy as a miracle.",
      "The crown of thorns vs. the crowns this world tries to sell you.",
      "\"Forgive them, they don't know what they're doing.\" Write the bar where you try to say that and mean it.",
      "Lazarus, come out. What part of you is dead and waiting to be called by name?",
      "Flipping the tables in the temple: righteous anger at people selling holy things.",
      "The thief on the cross got in at the very last minute. Write about late chances.",
      "Five thousand fed from one kid's lunch. Write about small things becoming enough.",
      "Peter denied Him three times before the rooster crowed. Write your three denials.",
      "Calming the storm while everyone in the boat panicked. What storm needs to be told to be still?",
      "Born in a stable, not a palace. Write about where real kings come from.",
      "Love your enemies. The hardest bar you'll ever write.",
      "Thomas needed to touch the wounds before he'd believe. What proof do you keep asking for?",
      "The road to Emmaus: walking right next to Him and not recognising Him."
    ],
    pics: ["carpenter's hands", "nails", "thorns", "empty tomb", "fishing nets", "bread and wine", "rooster", "stable", "olive trees", "silver coins", "the cross", "stone rolled away", "Galilee", "upper room"]
  },
  her: {
    label: "Her",
    prompts: [
      "The first time her hand found yours without asking.",
      "Her perfume still on your hoodie the morning after she left.",
      "Write about her laugh like it's a sound you'd want to sample.",
      "Slow dancing in the kitchen with no music on.",
      "Her head on your chest, and you can feel her breathing slow down.",
      "Love in a world of swiping: why you want something a thumb can't replace.",
      "The quiet after an argument when you both know you're staying.",
      "Her hands are always cold, so you keep them in your pockets.",
      "Describe her the way you'd describe a cathedral.",
      "You don't want a girl to show off. You want one you could pray next to.",
      "The way she says your name when she's half asleep.",
      "Bringing her home to your mum, and the look on your mum's face.",
      "Write one bar about her that would still be true in fifty years.",
      "Her fingers tracing the scar you never talk about.",
      "She sees the version of you that you're still building.",
      "Rain on the window, her in your shirt, nowhere to be.",
      "Love isn't fireworks. It's the fire you keep going every single night.",
      "What you'd give up for one more ordinary Tuesday with her."
    ],
    pics: ["perfume", "hoodie", "her hands", "kitchen light", "slow dance", "polaroid", "her laugh", "eyelashes", "rain on glass", "shared coat", "lipstick on a cup", "voice note", "her name", "goosebumps"]
  },
  agape: {
    label: "Agape",
    prompts: [
      "Love that doesn't keep score. Write about someone who never counted what you owed them.",
      "Your mum's love: the kind you only understand once you're grown.",
      "Loving someone who can give you nothing back.",
      "God's love as a door that was never locked. You just never tried the handle.",
      "\"Love is patient, love is kind.\" Rewrite it in your own words, set in your own city.",
      "The stranger who helped you when you needed it, and you never got their name.",
      "Forgiving your father for something he never apologised for.",
      "Loving your enemy without pretending they're your friend.",
      "The father running down the road to meet the son who wasted everything.",
      "Giving when nobody's watching and nobody will ever know.",
      "Laying down your life for your friends, in small ways, every day.",
      "Loving people who are hard to love, starting with yourself.",
      "Your grandparents' kind of love: shared beds, rationed food, no complaining.",
      "Love as a verb. List what it does, not what it feels like.",
      "A love bigger than a feeling: a decision you make again every morning.",
      "Being loved at your worst, and not knowing what to do with it."
    ],
    pics: ["open door", "empty chair", "warm bread", "old hands", "open arms", "a coat given away", "mum's cooking", "washed feet", "candle in the window", "unlocked gate", "first light", "spare key"]
  },
  wife: {
    label: "Finding a wife",
    prompts: [
      "Looking for a wife in a world that's built for one-night stands.",
      "Everyone's dating for content. You want someone for the quiet years.",
      "A letter to the wife you haven't met yet.",
      "What your future kids should know about how you found their mother.",
      "Praying for her before you even know her name.",
      "Walking past a hundred people a day and none of them feel like home.",
      "Your parents' marriage: what you'd keep and what you'd do differently.",
      "The world feels dead, so love has to be something you build, not something you find.",
      "You don't want a trophy. You want a witness.",
      "Picture your wedding in an old church. Who's crying, and why?",
      "Who you have to become before you're ready for her.",
      "The girl who'd still choose you if you lost everything tomorrow.",
      "Dating apps feel like a marketplace. Write about refusing to be a product.",
      "Old-fashioned in a new world: holding doors open in a city of locked phones.",
      "The vows you'd actually mean, not the ones from films."
    ],
    pics: ["wedding bands", "church steps", "a letter", "empty passenger seat", "two coffee cups", "family table", "veil", "phone screen", "crowded street", "front door", "cradle", "parents' old photo"]
  },
  visions: {
    label: "Visions",
    prompts: [
      "If nobody saw it, did it count? Write about doing good in secret.",
      "Everyone's rushing toward a finish line that turns out to be a grave.",
      "People in a cave watching shadows on the wall and calling them real.",
      "You are not your thoughts. Write about watching your mind like weather.",
      "Remember you will die. Let that make the next bar braver.",
      "Freedom vs. comfort: which one are you really choosing?",
      "What you'd do with your life if money didn't exist.",
      "Everything you own ends up owning you.",
      "The gap between who you are and who you say you are.",
      "Suffering as a teacher: what it taught you that comfort never could.",
      "The meaning of life, asked by someone who's tired.",
      "Fate or choice? Argue both sides across the bars.",
      "The more you know, the less sure you are. Write that dizziness.",
      "Happiness vs. purpose. You can't always have both.",
      "A thousand years from now nobody remembers your name. Write anyway.",
      "Silence says more than most people do.",
      "The present moment is the only one you ever actually live in.",
      "Stare into the void, then refuse to fall in."
    ],
    pics: ["hourglass", "shadows on a wall", "mirror", "skull", "empty room", "clock hands", "stars", "compass", "candle burning down", "chessboard", "blank page", "crossroads"]
  },
  system: {
    label: "The system",
    prompts: [
      "A screen in every hand: a generation that's never bored and never still.",
      "Debt as a leash. Signing your life away before you're old enough to know what it means.",
      "The algorithm knows what you want before you do. So who's really choosing?",
      "Fear sells. Write about turning off the news and feeling your shoulders drop.",
      "Working forty years to get a watch and a handshake at the end.",
      "Rent eats the dream before it's even born.",
      "Distracted, numbed or scrolling. Who's actually awake?",
      "They sell you the problem, then they sell you the cure.",
      "Kids who know brand logos better than bird names.",
      "People too tired at the end of the day to ever ask why.",
      "Keep people divided and they'll never look up. Write about looking up.",
      "The nine to five: a cage with a nice view.",
      "Your attention is the most valuable thing you own, and it's being farmed.",
      "Wars are decided by people who'll never hear a gunshot. Write about the ones who do.",
      "Being told what beauty is by people who sell mirrors.",
      "Breaking free starts small: one phone left at home, one walk without headphones.",
      "What the system does to a mother working two jobs.",
      "Comfort is the softest prison there is.",
      "A whole city lit up at night and nobody knows their neighbour's name."
    ],
    pics: ["screens", "chains", "puppet strings", "barcode", "billboards", "rent letter", "glass towers", "traffic", "news anchor", "payslip", "CCTV", "open sky", "phone left at home"]
  },
  truman: {
    label: "Truman Show",
    prompts: [
      "What if the sky is painted? Write about sailing until you touch the wall at the end of the sea.",
      "Everyone around you is playing a role. What's your script, and who wrote it?",
      "Write the line you'd say as you take a bow and walk off the set.",
      "Living like you're being watched, then realising you are.",
      "The people closest to you might be reading lines. How do you know what's real?",
      "Social media is a set. Write about the day you stopped performing.",
      "Sailing straight into the storm they built to scare you home.",
      "A perfect little town where nothing ever changes, and the itch to leave it.",
      "The director talks to you through the clouds. Answer him.",
      "Product placement in your own life story.",
      "What's behind the door marked EXIT?",
      "The first thing that ever happened to you that was 100% real.",
      "If your life was a show, which episode would you cut?",
      "Living for the audience vs. living for the One who made the actual stars.",
      "Same route every day. Today, take a left."
    ],
    pics: ["painted sky", "studio lights", "exit door", "sailboat", "hidden cameras", "script", "applause", "same street", "billboard smile", "spotlight", "stairs into the clouds", "curtain"]
  },
  travel: {
    label: "Round the world",
    prompts: [
      "Waking up somewhere you can't read the signs.",
      "An airport at 5am: everyone there is somebody's story, mid-sentence.",
      "A street market in a city you can't pronounce.",
      "Looking down from a plane window, your whole life could fit under one cloud.",
      "A stranger abroad who was kinder to you than people back home.",
      "Seeing the same ocean from the other side.",
      "Postcards you wrote and never sent.",
      "Every passport stamp is another version of you.",
      "A night train across borders, everyone sleeping in different languages.",
      "Travel shows you how small your problems are, and how big the world is.",
      "Eating something your parents ate as kids, in the country they left.",
      "A sunset in a place you'll never see again.",
      "Getting lost on purpose.",
      "Coming home and the house looks smaller than you remember.",
      "The whole world in front of you, and you're still thinking about one person."
    ],
    pics: ["passport", "boarding pass", "night train", "foreign coins", "street market", "departure board", "suitcase", "ocean", "postcard", "cobblestones", "folded map", "hostel bunk", "sunset"]
  },
  roots: {
    label: "Roots",
    prompts: [
      "Your parents crossed borders with a few bags so you could complain about the Wi-Fi.",
      "Two languages at the dinner table: one for feelings, one for forms.",
      "Too foreign for here, too Irish for there.",
      "Your mum's accent on the phone to the landlord, and you translating.",
      "What your parents gave up that they never talk about.",
      "Your grandparents' village. You've only seen it in photos, but it feels like a memory.",
      "Being the first in your family to do something, and the weight that comes with it.",
      "Grey apartment blocks there, grey Irish sky here: two skylines in your blood.",
      "The food your mum makes when she's homesick.",
      "Your dad's hands, worn from years of work so you'd never have to do it.",
      "Your surname spelled wrong on every form.",
      "Summers back in the old country: aunties, questions, old photos, a language you're losing.",
      "What you'll pass down to kids who may never see where you come from.",
      "Your parents' silence about the past is its own language.",
      "Make them proud vs. make yourself proud.",
      "Raised by people who survived things you'll never fully understand."
    ],
    pics: ["old suitcase", "two passports", "grandmother's kitchen", "apartment blocks", "black bread", "family photo", "phone call home", "work boots", "your surname", "border crossing", "village road", "Sunday soup"]
  },
  dublin: {
    label: "Dublin",
    prompts: [
      "The Liffey at night with the city lights shaking on the water.",
      "Rain that doesn't really fall. It just hangs in the air.",
      "The last bus home at midnight, everyone with a story they won't tell.",
      "Cranes everywhere and the old pubs closing: the city changing under your feet.",
      "Green fields an hour away from grey streets.",
      "The Irish way of saying \"I'm grand\" when you're not.",
      "The Spire in the middle of the city like a needle stitching up the sky.",
      "The sea at the end of a pier in winter, wind straight through your coat.",
      "A city where everyone knows everyone, and nobody really knows you.",
      "History on the same streets you buy your coffee on.",
      "A chipper, a bookie and a church on the same road.",
      "Rent so high the young ones are leaving on planes.",
      "Saints and scholars and lads on the corner.",
      "The west coast: nothing but Atlantic between you and America.",
      "Grey sky, golden people."
    ],
    pics: ["the Liffey", "the Spire", "night bus", "drizzle", "the pier", "Georgian doors", "cranes", "chipper", "pint glass", "the Luas", "Ha'penny Bridge", "cliffs", "the Atlantic", "turf fire"]
  },
  college: {
    label: "College",
    prompts: [
      "Sitting in a lecture hall, paying for a dream that might not be yours.",
      "Your parents' sacrifice as a debt you never signed for.",
      "Studying at 3am for an exam in something you don't care about.",
      "What would you do if you weren't scared of letting anyone down?",
      "A degree as a safety net vs. a degree as a cage.",
      "Everyone around you seems so sure. You're faking it.",
      "Rehearsing the conversation where you tell your parents you're not sure.",
      "Code by day, bars by night: living two lives.",
      "Choosing the safe path because they never had a choice.",
      "The graduation photo you can picture but can't feel.",
      "The pressure isn't really from them. It's from what they went through.",
      "Library lights and empty coffee cups. What are you actually building here?",
      "Maybe the point isn't the degree. It's who you become finishing it.",
      "Grades: a number trying to measure a person.",
      "You could be anything, and that's the scary part."
    ],
    pics: ["lecture hall", "deadline", "laptop glow", "library", "results day", "cap and gown", "coffee cups", "bus to campus", "exam hall clock", "student loan", "mum's phone call", "empty notebook"]
  },
  self: {
    label: "Who am I",
    prompts: [
      "Who are you when nobody's watching and your phone is dead?",
      "Every version of you that you've outgrown.",
      "The different masks you wear around different people.",
      "You're supposed to have it all figured out by now.",
      "What would the kid you used to be be proud of?",
      "Finding yourself vs. building yourself.",
      "Your name: what it means, who gave it to you, and what you'll make it mean.",
      "Habits are who you are on autopilot. Which ones are you proud of?",
      "The mirror shows a face. Write about what it doesn't show.",
      "You're a mix of every person who ever loved you.",
      "Unlearning the things you were taught to be scared of.",
      "The day you stopped trying to be someone else.",
      "Being alone vs. being lonely.",
      "What do you actually believe, not what you were told to believe?",
      "Growth looks like losing things at first."
    ],
    pics: ["mirror", "mask", "old photos", "fingerprints", "shadow", "journal", "name tag", "childhood bedroom", "crossroads", "tattoo", "reflection in a train window", "first page"]
  },
  gothic: {
    label: "Cathedrals",
    prompts: [
      "Someone carved this stone knowing they'd die before the cathedral was finished.",
      "Blueprints drawn by candlelight: building something you'll never see completed.",
      "Flying buttresses holding up all that weight. What's holding up yours?",
      "Light through stained glass, coloured by the stories in it.",
      "Gargoyles: ugly things put there to protect the beautiful.",
      "The tallest spires were built to make people look up.",
      "Masons with no machines, just faith, rope and time.",
      "Old buildings outlive everyone who built them. What will outlive you?",
      "Walking into a cathedral and feeling small in a good way.",
      "A rose window: hundreds of broken pieces of colour making one picture.",
      "Glass boxes thrown up in a year vs. stone that took three generations.",
      "Arches: weight turned into something beautiful.",
      "The ruins of an abbey in a field. What used to happen here?",
      "Your voice echoing in an empty nave and coming back older.",
      "The cornerstone: the first stone laid, the one everything else depends on."
    ],
    pics: ["stained glass", "spire", "gargoyle", "flying buttress", "rose window", "blueprints", "chisel", "scaffolding", "crypt", "bell tower", "vaulted ceiling", "stone dust", "cornerstone"]
  },
  nature: {
    label: "Nature",
    prompts: [
      "A river doesn't ask permission. Write about moving like that.",
      "Trees never rush, but they still reach the sky.",
      "Nature doesn't follow rules, it just exists. What would that look like in you?",
      "A forest cut down for a car park.",
      "The ocean doesn't care about your problems, and somehow that's comforting.",
      "Seasons: something has to die for spring to come.",
      "Plastic in the stomach of a seabird. Say it plain, no metaphors.",
      "A storm rolling in over the fields, and the smell right before the rain.",
      "Roots grow in the dark long before anything shows above ground.",
      "Animals don't overthink. Write about wanting that.",
      "The moon pulling the sea, and pulling you.",
      "Wildflowers coming up through cracks in the concrete.",
      "We call it \"resources\" like the earth is a shop.",
      "Silence in the woods is never actually silent.",
      "The sunrise doesn't need an audience.",
      "We ruin what we need most, then wonder why we feel empty."
    ],
    pics: ["river", "oak tree", "wildflowers", "storm clouds", "roots", "moss", "ocean", "moon", "deer", "cracked concrete", "smoke", "seabird", "sunrise", "rain on leaves"]
  },
  lane: {
    label: "My own lane",
    prompts: [
      "Dressing for yourself in a city where everyone dresses for each other.",
      "The car you want isn't about the money. It's about how the drive feels.",
      "Clothes as armour vs. clothes as a signature.",
      "Everyone in the same fit. Write about wearing what's yours.",
      "A vintage piece with somebody else's story stitched into it.",
      "An old car with no screens: just a wheel, a gearstick and a road.",
      "Not flexing, just aligned: when what you wear matches who you are.",
      "They laughed at the fit, then wore it themselves the next year.",
      "Cars and clothes are everywhere. Write about wanting them without needing them.",
      "The sound of an engine you've wanted since you were a kid.",
      "Tailoring: fitting the clothes to the man, not the man to the clothes.",
      "Taste can't be bought.",
      "Driving alone at night, windows down, the only time you think clearly.",
      "Brands as tribes, and choosing to be your own.",
      "Your dad's old jacket, now on your back."
    ],
    pics: ["tailored coat", "old leather", "boots", "steering wheel", "engine note", "vintage tag", "garage", "driving gloves", "night drive", "rear-view mirror", "loose thread", "archive piece", "car keys"]
  },
  night: {
    label: "Late night",
    prompts: [
      "3am. Everyone's asleep and your thoughts finally get loud.",
      "The only light in the house is your screen.",
      "The fridge humming and the clock ticking: the sounds of a sleeping house.",
      "Late night is when you're most honest. Say the thing.",
      "Streetlights on an empty road, like they're waiting for someone.",
      "Staring at the ceiling, replaying a conversation from years ago.",
      "Writing at night because daytime you is too busy pretending.",
      "The whole city asleep and you the only one awake, king of nothing.",
      "Night prayers: the ones you'd never say out loud in daylight.",
      "Overthinking until the birds start singing.",
      "Calling someone at 2am and they actually pick up.",
      "Night-shift workers, taxi drivers and you: the night's own family.",
      "Moonlight through the blinds, striped across your bed.",
      "Ideas come at night and they're gone by morning. Catch one.",
      "So quiet you can hear your own heartbeat."
    ],
    pics: ["streetlight", "ceiling", "screen glow", "empty road", "fridge hum", "moon", "notebook", "headphones", "window", "3:00 on the clock", "birdsong", "taxi", "kettle", "stars"]
  },
  peaks: {
    label: "Mountains",
    prompts: [
      "A mountain doesn't move for anyone.",
      "Climbing for hours to stand at the top for five minutes.",
      "From up here the city looks like a circuit board.",
      "Rivers carve canyons with patience, not force.",
      "Maps were drawn by people who walked every line.",
      "Fog rolling over a ridge like the mountain is breathing.",
      "Borders are lines we drew on land that doesn't know they're there.",
      "From down in the valley you only see how far there is to climb.",
      "Snow on the peaks in summer: some things stay cold forever.",
      "The earth is older than every argument you've ever had.",
      "Glaciers moving an inch a year and still reshaping the world.",
      "Sinai, the Mount of Olives: mountains are where God shows up.",
      "Climbing as prayer, every step a word.",
      "Up high the air gets thin, but the view gets clear.",
      "Coastlines change every day and nobody notices."
    ],
    pics: ["summit", "ridge", "fog", "glacier", "valley", "canyon", "compass", "contour lines", "snowcap", "base camp", "rope", "cliff edge", "thin air", "horizon"]
  }
};

// ways to come at an idea: {n} = bars, {h} = half of them
const IDEA_ANGLES = [
  "Open on one small image and zoom out a little more with every bar.",
  "Bars 1–{h}: what it looks like. Bars {h1}–{n}: what it costs.",
  "Write it as a letter you'll never send.",
  "Talk to God like He's sitting in the passenger seat.",
  "End every bar on the same vowel sound.",
  "Start with a question and don't answer it until the last bar.",
  "Tell it from your future son's point of view.",
  "Write it like it's 3am and you're whispering.",
  "Alternate: one bar of confidence, one bar of confession.",
  "Put a number in every bar.",
  "Describe it like a film shot. Where's the camera, and what's in the frame?",
  "No \"I\" allowed. Make it all \"you\" and \"we\".",
  "Flip a well-known saying in the last bar.",
  "Set every bar in the same room.",
  "Use a different sense in each of the first {h} bars: sight, sound, smell, touch.",
  "Write it from the point of view of an object in the scene.",
  "Make the first bar a whisper and the last bar a shout.",
  "Put something old against something new in every pair of bars.",
  "End on a line that could be a tattoo.",
  "Put a place in the first bar and a person in the last.",
  "Start it as a prayer and let it turn into an argument.",
  "Keep every bar short and heavy, under ten syllables.",
  "Rhyme in the middle of the bars, not just at the end.",
  "Tell it as a story: a start, a turn, an ending.",
  "Write it the way your dad would say it, then answer him.",
  "Pick one colour and paint every bar with it.",
  "Make bar {h} the hook, something you could repeat.",
  "Write what you'd tell yourself at fifteen.",
  "Write the last bar first, then build up to it.",
  "Carry one weather metaphor all the way through.",
  "Switch perspective halfway: you first, then them.",
  "Make it a list: {n} things, one per bar.",
  "Start like a news report and let it slowly turn personal.",
  "Start every bar with the same word.",
  "Get one Heavy word into every bar.",
  "Ask {n} questions, one per bar, no answers.",
  "Before and after: the first {h} bars before it happened, the rest after.",
  "Write it as if you're explaining it to your grandmother.",
  "Make every bar a picture, with no feelings named. Let the images say it.",
  "Name the feeling in the first bar, then never say it again.",
  "Use a scripture or a proverb as the seed and build around it, in your own words.",
  "Go from the smallest detail to the biggest idea you can reach in {n} bars."
];

(function () {
  const $i = id => document.getElementById(id);
  const KEY = "ma.ideas";
  const keys = Object.keys(IDEA_THEMES);
  let st = { on: keys.slice(), bars: 8, mix: false };
  try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s) st = { ...st, ...s, on: (s.on || []).filter(k => IDEA_THEMES[k]) }; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  // shuffle bags so prompts and angles don't repeat until they've all been seen
  const bags = {};
  function draw(name, list) {
    let b = bags[name];
    if (!b || !b.length) {
      b = bags[name] = list.map((_, i) => i);
      for (let i = b.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [b[i], b[j]] = [b[j], b[i]]; }
    }
    return list[b.pop()];
  }
  const pickN = (list, n) => list.slice().sort(() => Math.random() - 0.5).slice(0, n);

  const history = [];
  let pos = -1;

  function make() {
    const pool = st.on.length ? st.on : keys;
    const tk = draw("themes", pool), T = IDEA_THEMES[tk];
    let B = null;
    if (st.mix) {
      const others = (pool.length > 1 ? pool : keys).filter(k => k !== tk);
      B = others[Math.random() * others.length | 0];
    }
    const n = st.bars, h = n / 2;
    const angle = draw("angles", IDEA_ANGLES).replace(/\{n\}/g, n).replace(/\{h1\}/g, h + 1).replace(/\{h\}/g, h);
    const pics = B ? pickN(T.pics, 2).concat(pickN(IDEA_THEMES[B].pics, 2)) : pickN(T.pics, 4);
    return { t: tk, b: B, n, prompt: draw("p:" + tk, T.prompts), angle, pics };
  }

  function render() {
    const c = history[pos], el = $i("ideaCard");
    if (!c) { el.hidden = true; return; }
    el.hidden = false;
    const label = IDEA_THEMES[c.t].label + (c.b ? " × " + IDEA_THEMES[c.b].label : "");
    el.innerHTML = `
      <div class="idea-top">
        <span class="idea-tag">${esc(label)} · ${c.n} bars</span>
        <span class="idea-nav">
          <button type="button" class="icon" id="ideaPrev" aria-label="Previous idea" ${pos <= 0 ? "disabled" : ""}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button type="button" class="icon" id="ideaNext" aria-label="Next idea" ${pos >= history.length - 1 ? "disabled" : ""}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
        </span>
      </div>
      <p class="idea-prompt">${esc(c.prompt)}</p>
      ${c.b ? `<p class="idea-mix">Bring in <b>${esc(IDEA_THEMES[c.b].label.toLowerCase())}</b> somewhere in the bars.</p>` : ""}
      <div class="idea-angle"><span class="label">Angle</span><p>${esc(c.angle)}</p></div>
      <div class="idea-pics"><span class="label">Picture these · tap one to find rhymes</span>
        <div class="chips">${c.pics.map(p => `<button type="button" class="pic" data-pic="${esc(p)}">${esc(p)}</button>`).join("")}</div>
      </div>
      <div class="idea-acts">
        <button type="button" class="reroll" id="ideaWrite">Write this</button>
        <button type="button" class="ghost" id="ideaCopy">Copy</button>
      </div>`;
    el.classList.remove("fresh"); void el.offsetWidth; el.classList.add("fresh");
  }
  function next(e) {
    history.splice(pos + 1); history.push(make()); if (history.length > 40) history.shift(); pos = history.length - 1; render();
    // on small screens the card can be below the theme chips, so bring it into view
    if (e) { const r = $i("ideaCard").getBoundingClientRect(); if (r.top > innerHeight * 0.6) $i("ideaCard").scrollIntoView({ block: "start", behavior: "smooth" }); }
  }

  function renderControls() {
    $i("ideaThemes").innerHTML = keys.map(k => `<button class="chip" type="button" data-theme="${k}" aria-pressed="${st.on.includes(k)}">${IDEA_THEMES[k].label}</button>`).join("");
    $i("ideaBars").innerHTML = [4, 8].map(n => `<button type="button" data-bars="${n}" aria-pressed="${st.bars === n}">${n} bars</button>`).join("");
    $i("ideaMix").checked = st.mix;
    const total = keys.reduce((s, k) => s + IDEA_THEMES[k].prompts.length, 0);
    $i("ideaHint").textContent = `${total} prompts × ${IDEA_ANGLES.length} angles across ${keys.length} themes · nothing repeats until you've seen it all`;
  }

  $i("ideaThemes").addEventListener("click", e => {
    const b = e.target.closest("[data-theme]"); if (!b) return;
    const k = b.dataset.theme;
    st.on = st.on.includes(k) ? st.on.filter(x => x !== k) : st.on.concat(k);
    delete bags.themes; save(); renderControls();
  });
  $i("ideaAll").addEventListener("click", () => { st.on = st.on.length === keys.length ? [] : keys.slice(); delete bags.themes; save(); renderControls(); });
  $i("ideaBars").addEventListener("click", e => {
    const b = e.target.closest("[data-bars]"); if (!b) return;
    st.bars = +b.dataset.bars; save(); renderControls();
    const c = history[pos];
    if (c) { c.n = st.bars; c.angle = draw("angles", IDEA_ANGLES).replace(/\{n\}/g, c.n).replace(/\{h1\}/g, c.n / 2 + 1).replace(/\{h\}/g, c.n / 2); render(); }
  });
  $i("ideaMix").addEventListener("change", e => { st.mix = e.target.checked; save(); });
  $i("ideaNew").addEventListener("click", next);

  const asText = c => `${IDEA_THEMES[c.t].label}${c.b ? " × " + IDEA_THEMES[c.b].label : ""} · ${c.n} bars: ${c.prompt} Angle: ${c.angle}`;
  $i("ideaCard").addEventListener("click", e => {
    const c = history[pos]; if (!c) return;
    const t = e.target.closest("button"); if (!t) return;
    if (t.id === "ideaPrev" && pos > 0) { pos--; render(); }
    else if (t.id === "ideaNext" && pos < history.length - 1) { pos++; render(); }
    else if (t.id === "ideaCopy") copy(asText(c));
    else if (t.dataset.pic) {
      $i("rhymeInput").value = t.dataset.pic.replace(/^the /i, "");
      showTool("rhymes"); runRhyme();
    } else if (t.id === "ideaWrite") {
      if (typeof current === "function" && !current()) { toast("Open or start a song first"); return; }
      const lyrics = $i("lyrics");
      const v = lyrics.value.replace(/\s+$/, "");
      // square brackets keep it out of the syllable counts and rhyme colours
      const clean = s => s.replace(/[\[\]]/g, "");
      const note = `[${c.n} bars · ${IDEA_THEMES[c.t].label}${c.b ? " × " + IDEA_THEMES[c.b].label : ""}: ${clean(c.prompt)}]\n[Angle: ${clean(c.angle)}]`;
      lyrics.value = (v ? v + "\n\n" : "") + note + "\n";
      lyrics.dispatchEvent(new Event("input", { bubbles: true }));
      if (typeof setView === "function") setView("write");
      lyrics.focus({ preventScroll: true });
      lyrics.setSelectionRange(lyrics.value.length, lyrics.value.length);
      lyrics.scrollIntoView({ block: "center", behavior: "smooth" });
      toast("Idea added to your song. Start writing under it.");
    }
  });

  renderControls();
  next();
})();
