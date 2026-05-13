import { GAME_NAMES, GAME_EMOJIS } from './gameUtils'

export type GameMeta = {
  index: number
  name: string
  emoji: string
  slug: string
  tagline: string
  description: string
  howToPlay: string
  whyFun: string
  skill: string
  duration: string
}

const RAW: Omit<GameMeta, 'index' | 'name' | 'emoji' | 'slug'>[] = [
  { tagline: 'Tap falling hearts faster than your partner', description: 'A frantic 60-second tapping game where hearts rain down the screen. Every tap counts and the higher one wins.', howToPlay: 'Hearts fall from the top. Tap each one before it leaves the screen. Most taps in 60 seconds wins the round.', whyFun: 'It is pure dopamine. You will be screaming at each other across the couch within ten seconds.', skill: 'reflex + speed tapping', duration: '60 seconds' },
  { tagline: 'Match kawaii pairs before your partner does', description: 'Classic memory match with cute emoji pairs. First to clear the board wins.', howToPlay: 'Flip two cards at a time to find matching pairs. Remember where each card is. Clear the whole board fastest.', whyFun: 'Forces real focus and tests who has the sharper short-term memory under pressure.', skill: 'memory + pattern recognition', duration: '~90 seconds' },
  { tagline: 'Click the instant the screen flashes pink', description: 'A reaction-time duel. The screen waits, then flashes - and the fastest finger wins.', howToPlay: 'Wait for the random pink flash. Click as fast as humanly possible. Click too early and you lose.', whyFun: 'Reveals which one of you actually wakes up before noon.', skill: 'reaction time', duration: '~30 seconds' },
  { tagline: 'Unscramble cute Japanese words', description: 'Five scrambled kawaii words. Type the answers as fast as you can within two minutes.', howToPlay: 'Letters appear scrambled. Type the unscrambled word. Solve 5 to finish.', whyFun: 'Tests vocab + thinking speed. Great for showing off who paid attention in anime.', skill: 'word puzzle + typing', duration: '2 minutes' },
  { tagline: 'Test your kawaii culture knowledge', description: 'Ten quick questions about Japanese culture, sweets, and kawaii lore. Most correct wins.', howToPlay: 'Pick the right answer from four choices. Speed counts as tiebreaker.', whyFun: 'You will both learn something and then argue about it for hours.', skill: 'trivia', duration: '~60 seconds' },
  { tagline: 'Pop targets before they vanish', description: 'Targets appear in random spots. Pop them before they disappear. Most pops wins.', howToPlay: 'Click each target the moment it appears. They vanish after a beat. Stack as many hits as possible.', whyFun: 'Mobile thumb-friendly chaos that rewards calm hands.', skill: 'aim + speed', duration: '45 seconds' },
  { tagline: 'Solve math problems against the clock', description: 'Quick arithmetic - addition, subtraction, multiplication. Most correct in 60 seconds wins.', howToPlay: 'Read the problem. Tap the right answer from four options. Wrong answers lose time.', whyFun: 'Mental math at speed feels primal. Loser pays for dinner.', skill: 'mental math', duration: '60 seconds' },
  { tagline: 'Tap the color of the word, not the word itself', description: 'The classic Stroop test. The word says BLUE but it is printed in pink. Tap the ink color.', howToPlay: 'Look at the color of the letters, not what the word says. Tap the matching color button.', whyFun: 'Your brain will fight you. It is hilarious to watch.', skill: 'attention + inhibition', duration: '~60 seconds' },
  { tagline: 'Catch falling sakura petals in your basket', description: 'Move your basket left and right to catch petals. Miss too many and you lose points.', howToPlay: 'Tap or swipe to slide the basket. Catch as many petals as possible in 45 seconds.', whyFun: 'Soft, pretty, and surprisingly competitive once the wind picks up.', skill: 'tracking + dexterity', duration: '45 seconds' },
  { tagline: 'Decode the emoji sequence', description: 'Three emojis spell out a word, movie, or phrase. Guess the right answer first.', howToPlay: 'Read the emoji clue. Pick the answer from four options. Five rounds total.', whyFun: 'Reveals how aligned your humor and references actually are.', skill: 'lateral thinking', duration: '~60 seconds' },
  { tagline: 'Repeat the kawaii color pattern', description: 'Watch the sequence, then repeat it. It gets longer each round.', howToPlay: 'Memorize the color sequence shown to you. Tap them back in order. Patterns grow longer until you miss.', whyFun: 'Working memory is brutal. You will hit a wall at round 7.', skill: 'sequence memory', duration: '~90 seconds' },
  { tagline: 'Type the kawaii phrase faster', description: 'A sentence appears. Type it word-perfect. Fastest accurate time wins.', howToPlay: 'Type exactly what is shown, including punctuation. Mistakes cost you time.', whyFun: 'Mobile thumb-typers vs laptop touch-typers, fight.', skill: 'typing speed + accuracy', duration: '~45 seconds' },
  { tagline: 'Rock paper scissors with sakura energy', description: 'Best of 5 rock paper scissors with cute sakura art. Pure luck and mind games.', howToPlay: 'Pick rock, paper, or scissors each round. First to 3 wins takes it.', whyFun: 'Reads better in person but still works through a screen. Classic.', skill: 'luck + bluffing', duration: '~30 seconds' },
  { tagline: 'Catch only the yellow stars', description: 'Stars fall from the sky. Catch yellow ones, dodge pink ones. Score wins.', howToPlay: 'Tap yellow stars to collect them. Avoid pink stars or lose points. 45 seconds total.', whyFun: 'Easy to learn, hard to master. Wrist gets a workout.', skill: 'selective attention', duration: '45 seconds' },
  { tagline: 'Hit the displayed number as fast as you can', description: 'A target number is shown. Tap it in the grid before time runs out. Streak for combos.', howToPlay: 'A number appears at the top. Find and tap it in the grid below. Repeat as fast as you can.', whyFun: 'Eyes scanning at full speed. Surprisingly intense.', skill: 'visual search', duration: '60 seconds' },
  { tagline: 'Catch koi fish, not jellyfish', description: 'A pond simulation. Swipe koi fish into your net. Avoid jellyfish.', howToPlay: 'Drag koi into your net. Jellyfish hurt. Goldfish are bonus points.', whyFun: 'Aquatic and oddly relaxing until it speeds up.', skill: 'precision + selection', duration: '45 seconds' },
  { tagline: 'Pop the right balloons before they float away', description: 'Balloons drift upward. Pop balloons of the target color only.', howToPlay: 'The target color is shown at top. Tap only those balloons. Wrong pops cost points.', whyFun: 'Color-sorting under time pressure is unexpectedly stressful.', skill: 'color discrimination', duration: '45 seconds' },
  { tagline: 'Swipe sushi off the conveyor belt', description: 'Sushi slides past. Swipe each piece off before it leaves the belt.', howToPlay: 'Swipe across each sushi piece to grab it. Miss and it is gone forever.', whyFun: 'Feels like a real arcade game on your phone.', skill: 'reaction + tracking', duration: '45 seconds' },
  { tagline: 'Spin the wheel and pray', description: 'Spin a kawaii prize wheel. Highest combined spin wins.', howToPlay: 'Tap to spin three times. Your total score is added up. Best total wins.', whyFun: 'Pure chaos. You can win at this no matter how slow your fingers are.', skill: 'luck only', duration: '~20 seconds' },
  { tagline: 'Tap only the lit tiles', description: 'Tiles in a grid light up briefly. Tap them before they fade.', howToPlay: 'Watch the grid. Tap any tile that flashes. Miss and you lose a point.', whyFun: 'Spatial awareness meets twitch reflex.', skill: 'spatial attention', duration: '45 seconds' },
  { tagline: 'Ring the bell on cue', description: 'A signal appears. Ring the bell exactly when it shows green.', howToPlay: 'Wait for the green signal. Tap the bell immediately. Early taps lose points.', whyFun: 'Self-control plus reflexes. Surprisingly hard.', skill: 'timing + inhibition', duration: '~45 seconds' },
  { tagline: 'Whack the cats poking out of boxes', description: 'Cute cats pop out. Tap them before they hide again.', howToPlay: 'Cats peek out of holes randomly. Tap each one fast. Missed cats hide for good.', whyFun: 'Whack-a-mole but kawaii. You will giggle.', skill: 'reaction + aim', duration: '45 seconds' },
  { tagline: 'Stack dango as high as you can', description: 'Drop dango balls onto the stack. Build the tallest tower before it falls.', howToPlay: 'Tap to drop the next dango. Align it carefully or the stack tips. Tallest stack wins.', whyFun: 'Tension builds with every stack. One slip and it is over.', skill: 'timing + precision', duration: '~60 seconds' },
  { tagline: 'Smash mochi as they appear', description: 'Soft mochi rolls onto the screen. Smash each one before it escapes.', howToPlay: 'Tap each mochi the second you see it. Combos give bonus points.', whyFun: 'Satisfying squish sound on every smash.', skill: 'reaction + tapping', duration: '45 seconds' },
  { tagline: 'Throw darts at the kawaii dartboard', description: 'Aim and throw darts. Closest to bullseye wins each round.', howToPlay: 'Drag and release to throw. Three darts per round, three rounds total.', whyFun: 'Skill ceiling is real. Steady hand pays off.', skill: 'precision + aiming', duration: '~60 seconds' },
  { tagline: 'Find the one that does not match', description: 'A grid of nearly-identical emojis. Tap the odd one out as fast as you can.', howToPlay: 'Scan the grid. Tap the emoji that does not match the others. Ten rounds, fastest total time wins.', whyFun: 'Eyes start to lie at higher speeds. Hilarious.', skill: 'visual discrimination', duration: '~60 seconds' },
  { tagline: 'Continue the number sequence', description: 'Logic puzzle. Spot the pattern and pick the next number in the sequence.', howToPlay: 'Read the sequence. Tap the correct next number from four choices. Five rounds total.', whyFun: 'Pure brain. Reveals who is actually quicker mentally.', skill: 'pattern recognition', duration: '~90 seconds' },
  { tagline: 'Match colors as they appear', description: 'Pairs of colored shapes appear. Tap only when their colors match exactly.', howToPlay: 'Watch the two shapes. Tap MATCH if colors are identical, SKIP if not. Speed and accuracy both score.', whyFun: 'Pace builds and your brain stops trusting itself.', skill: 'attention + speed', duration: '60 seconds' },
  { tagline: 'Slide the kawaii puzzle into order', description: 'A 3x3 slide puzzle of a sakura scene. Solve it fastest.', howToPlay: 'Tap tiles next to the empty space to slide them. Reconstruct the picture. Fastest solve wins.', whyFun: 'Classic puzzle, fresh visuals. Some people lose their minds at this.', skill: 'spatial reasoning', duration: '~120 seconds' },
  { tagline: 'Count the kawaii items at a glance', description: 'A flash of items on screen. How many were there? Closest guess wins.', howToPlay: 'A bunch of items flashes for a moment. Tap the count. Five rounds total.', whyFun: 'Tests how good your eye actually is. Wildly different results.', skill: 'numerical estimation', duration: '~45 seconds' },
]

const SLUGS = [
  'heart-tap',
  'love-memory',
  'reflex-duel',
  'word-scramble',
  'kawaii-quiz',
  'target-pop',
  'math-race',
  'color-stroop',
  'sakura-catch',
  'emoji-decode',
  'simon-says',
  'type-race',
  'rock-paper-sakura',
  'star-catcher',
  'number-rush',
  'koi-catch',
  'balloon-pop',
  'sushi-swipe',
  'lucky-spin',
  'lightning-tile',
  'bell-race',
  'cat-whack',
  'dango-stack',
  'mochi-smash',
  'dart-toss',
  'odd-one-out',
  'number-sequence',
  'color-match',
  'slide-puzzle',
  'quick-count',
]

export const GAME_META: GameMeta[] = GAME_NAMES.map((name, i) => ({
  index: i,
  name,
  emoji: GAME_EMOJIS[i],
  slug: SLUGS[i],
  ...RAW[i],
}))

export function gameBySlug(slug: string): GameMeta | undefined {
  return GAME_META.find((g) => g.slug === slug)
}
