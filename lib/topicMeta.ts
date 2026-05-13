import { GAME_META } from './gameMeta'

export type TopicMeta = {
  slug: string
  h1: string
  title: string
  description: string
  intro: string
  audience: string
  why: string
  featured: number[]
}

export const TOPIC_META: TopicMeta[] = [
  {
    slug: 'long-distance-couple-games',
    h1: 'Long Distance Couple Games You Can Play Over Any Distance',
    title: 'Long Distance Couple Games - Free 2 Player Online | Kawaii Couple',
    description: 'Free games for long distance couples. Real-time 2 player browser games, no download. Share a code with your partner across any time zone and play together.',
    intro: 'You are not in the same room and the FaceTime is getting quiet. These 30 mini games turn any call into a date night. Share a 6-letter code, both join from your phones or laptops, play the same 5 games at the same time, see who wins.',
    audience: 'Made for LDR couples, deployed couples, study-abroad partners, and anyone who is just on the other end of a phone tonight.',
    why: 'Real-time. No download. Works on phones. Every round you both play live and the score syncs instantly. Cheaper than a date, more fun than another \'how was your day\'.',
    featured: [0, 2, 4, 9, 11, 12],
  },
  {
    slug: 'date-night-games-for-couples',
    h1: 'Date Night Games for Couples - 30 Mini Games for Two',
    title: 'Date Night Games for Couples - Free Mini Games | Kawaii Couple',
    description: '30 free mini games for couple date night. Play head to head from one phone or two. Pick the games, share the code, find out who actually has the faster reflexes.',
    intro: 'Cancel the third movie of the week. Open the laptop, share a code, play 5 random games against each other. Twenty minutes of yelling, laughing, and one of you smug about reflex scores.',
    audience: 'Built for couples on the couch, on a road trip, on a quiet Tuesday, on a too-rainy Saturday.',
    why: 'No setup. No download. Browser, code, go. Loser does the dishes.',
    featured: [0, 1, 2, 5, 14, 22],
  },
  {
    slug: 'valentines-day-games-for-couples',
    h1: 'Valentine\'s Day Games for Couples',
    title: 'Valentine\'s Day Games for Couples - Free Online | Kawaii Couple',
    description: 'Cute Valentine\'s Day games for couples. Free, browser-based, 2 player, kawaii. Play heart-themed reflex, memory, and trivia mini games with your partner.',
    intro: 'It is Valentine\'s and the dinner reservation got cancelled. Here are 30 sakura-soaked mini games designed for two people who want to compete sweetly. Hearts, memory, kawaii quizzes, the works.',
    audience: 'For Valentine\'s Day, anti-Valentine\'s Day, Galentine\'s, or any random Tuesday that needs a little ♡.',
    why: 'It is free. It is cute. It is faster than baking a cake. The winner gets bragging rights and a tiny crown emoji.',
    featured: [0, 1, 4, 8, 12, 22],
  },
  {
    slug: 'anniversary-games-for-couples',
    h1: 'Anniversary Games to Play with Your Partner',
    title: 'Anniversary Games for Couples - 2 Player Online | Kawaii Couple',
    description: 'Anniversary games to play with your partner. 30 free 2-player browser games, no download. Make the night something other than another fancy dinner photo.',
    intro: 'Anniversary energy says: do the dinner, but also do something dumb and fun together. 30 mini games, 5 random per session, 20 minutes from start to crowning a winner.',
    audience: 'For 1 month, 1 year, 10 years, however long you have been at each other\'s side.',
    why: 'The winner picks the next anniversary tradition.',
    featured: [4, 9, 26, 28, 13, 25],
  },
  {
    slug: 'two-player-games-for-couples',
    h1: 'Two Player Games for Couples - Free, No Download',
    title: 'Two Player Games for Couples - Free Online | Kawaii Couple',
    description: 'Free 2 player browser games for couples. 30 mini games, real-time sync, no app required. Share a code and play from any device.',
    intro: 'A real two-player setup. Not two phones playing the same single-player level next to each other. Same session, same code, scores compared live.',
    audience: 'For any two people who want to actually compete against each other on the internet.',
    why: 'Cross-device. Cross-platform. Cross-room or cross-country.',
    featured: [0, 2, 5, 14, 19, 23],
  },
  {
    slug: 'couple-quiz-games',
    h1: 'Couple Quiz Games - Test What You Both Know',
    title: 'Couple Quiz Games - Free Online Trivia | Kawaii Couple',
    description: 'Couple quiz games. Trivia, word puzzles, brain teasers - 30 free mini games for two players. Find out who actually paid attention in school.',
    intro: 'Quiz format mini games for couples. Trivia, word scrambles, emoji decoding, math sprints, sequence puzzles - test what each of you actually remembers.',
    audience: 'For partners who love being right about random things.',
    why: 'You will both learn something and then argue about who was actually closer.',
    featured: [3, 4, 9, 26, 6, 25],
  },
  {
    slug: 'mobile-couple-games',
    h1: 'Mobile Couple Games You Don\'t Need to Download',
    title: 'Mobile Couple Games - Browser Based, No Download | Kawaii Couple',
    description: 'Mobile couple games you don\'t need to download. Plays in the browser on iPhone and Android. Share a code, play with your partner from anywhere.',
    intro: 'No app store, no downloads, no permissions screen. Open the page on your phone, share the code, both of you tap in. The whole loop fits on a phone screen.',
    audience: 'For couples who hate cluttering their phones with single-use apps.',
    why: 'Works offline-friendly, syncs over the cloud, no installs.',
    featured: [0, 2, 5, 8, 16, 23],
  },
  {
    slug: 'cute-couple-games',
    h1: 'Cute Couple Games with Kawaii Vibes',
    title: 'Cute Couple Games - Kawaii Mini Games for Two | Kawaii Couple',
    description: 'Cute couple games with kawaii vibes. Sakura, mochi, koi fish, heart taps - 30 free 2-player games with the softest aesthetic on the internet.',
    intro: 'Sakura petals fall behind every screen. Pink confetti rains at the end. The buttons are pixel-font and the cats have tiny faces. 30 mini games, all dressed up in kawaii.',
    audience: 'For couples who want their games to match their wallpaper.',
    why: 'It is cute, it is free, it is short. Maximum serotonin per minute.',
    featured: [0, 8, 15, 18, 21, 22],
  },
]

export function topicBySlug(slug: string): TopicMeta | undefined {
  return TOPIC_META.find((t) => t.slug === slug)
}

export function gamesForTopic(t: TopicMeta) {
  return t.featured.map((i) => GAME_META[i]).filter(Boolean)
}
