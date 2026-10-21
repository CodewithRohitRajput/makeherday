export type OccasionId =
  | "birthday"
  | "love-letter"
  | "anniversary"
  | "valentine"
  | "miss-you"
  | "sorry"
  | "thank-you"
  | "congrats"
  | "mothers-day"
  | "just-because";

/** The occasion id is what the API stores as a gift's `giftType`. */
export type GiftType = OccasionId;

export interface Occasion {
  id: OccasionId;
  name: string;
  tagline: string;
  description: string;
  /** Short line shown above the recipient's name on the opened gift. */
  eyebrow: string;
  heading: (recipient: string) => string;
  signoff: string;
  /** Look applied when this occasion is picked before the design has been touched. */
  look: string;
  /** Shown as a large card on the home page. */
  featured?: boolean;
  suggestions: string[];
}

export const OCCASIONS: Occasion[] = [
  {
    id: "birthday",
    name: "Birthday Surprise",
    tagline: "Celebrate the day she arrived",
    description:
      "A sealed birthday note that unfolds with a gentle reveal. A personal way to make her birthday morning special.",
    eyebrow: "A birthday wish, just for you",
    heading: (r) => `Happy Birthday, ${r}`,
    signoff: "With all my love,",
    look: "golden-birthday",
    featured: true,
    suggestions: [
      "Another year of you, and the world is better for it. I hope today is as bright and kind as you are. Here's to every dream you're chasing this year.",
      "Happy birthday to the person who makes ordinary days feel like celebrations. I'm so grateful I get to celebrate you today, and every day after.",
      "Make a wish, then let me help make it come true. You deserve every bit of joy today brings, and so much more.",
    ],
  },
  {
    id: "love-letter",
    name: "Love Letter",
    tagline: "Words you've been meaning to say",
    description:
      "A digital love letter with an envelope reveal. For the things that are easier to write than to say out loud.",
    eyebrow: "A letter, sealed with love",
    heading: (r) => `My dearest ${r},`,
    signoff: "With all my love,",
    look: "parisian",
    featured: true,
    suggestions: [
      "I don't say it nearly enough, so I'm writing it down: you are my favourite part of every day. Thank you for your laugh, your patience, and the way you make everything feel like home.",
      "Some days I still can't believe I found you. I love the way you see the world, and I love who I am when I'm with you. This is just a small reminder that you're loved, always.",
    ],
  },
  {
    id: "anniversary",
    name: "Anniversary Surprise",
    tagline: "Honour every chapter together",
    description:
      "Mark your milestone with a keepsake that looks back on your story and the years still ahead.",
    eyebrow: "To us, and everything ahead",
    heading: (r) => `Happy Anniversary, ${r}`,
    signoff: "With all my love,",
    look: "black-tie",
    featured: true,
    suggestions: [
      "Every year with you has been my favourite chapter so far. Thank you for choosing me, again and again. I can't wait to see what we write next.",
      "From our first hello to this very moment, loving you has been the easiest thing I've ever done. Happy anniversary, my love.",
    ],
  },
  {
    id: "valentine",
    name: "Valentine's Day",
    tagline: "Be mine, today and always",
    description: "A sweet valentine with all the romance and none of the clichés.",
    eyebrow: "Happy Valentine's Day",
    heading: (r) => `Be mine, ${r}?`,
    signoff: "Your valentine,",
    look: "old-hollywood",
    suggestions: [
      "Roses are lovely, chocolates are sweet, but nothing compares to the way you make my heart skip a beat. Happy Valentine's Day, my love.",
      "Every day with you feels like Valentine's Day, but today I get an excuse to say it out loud: I adore you.",
    ],
  },
  {
    id: "miss-you",
    name: "Missing You",
    tagline: "Closing the distance",
    description: "For long distance, long weeks, or just a long day without her.",
    eyebrow: "Across the miles",
    heading: (r) => `Missing you, ${r}`,
    signoff: "Counting the days,",
    look: "midnight-promise",
    suggestions: [
      "The distance is hard, but it reminds me how lucky I am to have someone worth missing. I'm counting down the days until I can hold you again.",
      "I keep turning to tell you things, and you're not there. Every little moment is better with you. Come home soon.",
    ],
  },
  {
    id: "sorry",
    name: "I'm Sorry",
    tagline: "When words matter most",
    description: "A sincere apology, written with care and delivered gently.",
    eyebrow: "From the bottom of my heart",
    heading: (r) => `${r}, I'm sorry`,
    signoff: "With all my heart,",
    look: "garden-party",
    suggestions: [
      "I got it wrong, and I'm truly sorry. You mean more to me than being right ever could. Thank you for your patience while I do better.",
      "I've been thinking about what happened, and I owe you an apology. I hate that I hurt you. Let me make it up to you, starting now.",
    ],
  },
  {
    id: "thank-you",
    name: "Thank You",
    tagline: "Gratitude, beautifully said",
    description: "Thank her for everything she does, the big things and the quiet ones.",
    eyebrow: "A little note of thanks",
    heading: (r) => `Thank you, ${r}`,
    signoff: "Gratefully,",
    look: "daydream",
    suggestions: [
      "For every quiet thing you do that no one notices: I notice. Thank you for making life softer, warmer, and so much brighter.",
      "I don't thank you nearly enough, so here it is in writing. Thank you for being exactly who you are.",
    ],
  },
  {
    id: "congrats",
    name: "Congratulations",
    tagline: "Cheer on her big win",
    description: "A new job, a graduation, a finish line. Celebrate what she's achieved.",
    eyebrow: "You did it",
    heading: (r) => `Congratulations, ${r}!`,
    signoff: "So proud of you,",
    look: "candy-celebration",
    suggestions: [
      "I've watched you work so hard for this, and I couldn't be prouder. You earned every bit of it. Tonight, we celebrate you.",
      "Congratulations! This is just the beginning of everything you're going to do. I'm so proud to be in your corner.",
    ],
  },
  {
    id: "mothers-day",
    name: "Mother's Day",
    tagline: "For the woman who started it all",
    description: "A heartfelt note for Mum, written in your own words.",
    eyebrow: "Happy Mother's Day",
    heading: (r) => `To my wonderful ${r}`,
    signoff: "With love, always,",
    look: "garden-party",
    suggestions: [
      "Thank you for every packed lunch, every late-night talk, and every time you believed in me before I believed in myself. I love you, Mum.",
      "Everything good in me, I learned from you. Happy Mother's Day to the strongest, kindest woman I know.",
    ],
  },
  {
    id: "just-because",
    name: "Just Because",
    tagline: "No reason needed",
    description: "The best surprises don't need an occasion. Brighten an ordinary day.",
    eyebrow: "No reason, just you",
    heading: (r) => `Hey ${r},`,
    signoff: "Thinking of you,",
    look: "sunny-morning",
    suggestions: [
      "No special reason for this, just wanted you to know that you crossed my mind and made me smile. Have the loveliest day.",
      "Just a small reminder in the middle of your day: you are wonderful, and you are loved.",
    ],
  },
];

export const FEATURED_OCCASIONS = OCCASIONS.filter((o) => o.featured);

export function getOccasion(id: string | null | undefined): Occasion {
  return OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[0];
}

export function isOccasionId(value: string | null | undefined): value is OccasionId {
  return OCCASIONS.some((o) => o.id === value);
}
