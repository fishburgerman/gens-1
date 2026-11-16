import type { Post, PostScope } from '../types'

/**
 * Sample posts so the demo feels alive on first launch.
 * Every author here is fictional and every post is flagged `isDemo`,
 * which the UI labels as "Sample" so it is never mistaken for a real person.
 */
interface SeedEntry {
  author: string
  year: number
  /** 'gen' = Generation feed, otherwise the author's class feed */
  feed: 'gen' | 'class'
  minutesAgo: number
  body: string
  reactions: [number, number, number]
}

const GEN = 'gen-z'

const ENTRIES: SeedEntry[] = [
  { author: 'Maya R.', year: 2001, feed: 'gen', minutesAgo: 14, reactions: [12, 4, 2],
    body: 'Does anyone else still hear the dial-up sound in their head sometimes? I was so young but it stuck with me.' },
  { author: 'Jonah K.', year: 2003, feed: 'gen', minutesAgo: 52, reactions: [8, 6, 3],
    body: 'Small win today: phone stayed in another room for the whole morning. Read 60 pages. Felt like 2009 again in the best way.' },
  { author: 'Lena S.', year: 1999, feed: 'gen', minutesAgo: 130, reactions: [21, 9, 5],
    body: 'Hot take: we were the last group of kids who had to memorize phone numbers. I still know my childhood landline.' },
  { author: 'Theo M.', year: 2005, feed: 'gen', minutesAgo: 240, reactions: [5, 3, 7],
    body: 'Curious how other years handled graduating during weird times. What do you wish someone had told you at 18?' },
  { author: 'Priya D.', year: 2000, feed: 'gen', minutesAgo: 420, reactions: [14, 11, 1],
    body: 'Watched the sunset from the pier after work. No photos, just watched it. Recommend.' },
  { author: 'Sam O.', year: 2008, feed: 'gen', minutesAgo: 1500, reactions: [6, 2, 4],
    body: 'Hi from the younger side of Gen Z. It is interesting reading what the 1998 crowd remembers. Some of it sounds like history class to me.' },

  { author: 'Ava L.', year: 2003, feed: 'class', minutesAgo: 33, reactions: [9, 5, 1],
    body: 'Class of 2003, where were you when the first iPhone came out? I remember being four and thinking it was magic.' },
  { author: 'Noah P.', year: 2003, feed: 'class', minutesAgo: 190, reactions: [4, 7, 2],
    body: 'Turning the big milestone this year. Planning a quiet weekend by the coast instead of a party. Anyone else going low-key?' },
  { author: 'Iris T.', year: 2003, feed: 'class', minutesAgo: 900, reactions: [11, 3, 0],
    body: 'Our senior year got cut short and we never really got a proper goodbye. Glad there is a place where we are all in the same room again.' },

  { author: 'Kai N.', year: 2001, feed: 'class', minutesAgo: 75, reactions: [7, 2, 1],
    body: '2001 kids: burned CDs or a hand-me-down MP3 player? I had both and labeled every disc in marker.' },
  { author: 'Rosa V.', year: 2001, feed: 'class', minutesAgo: 600, reactions: [3, 8, 2],
    body: 'Moved back to my hometown this year. Strange how the streets feel smaller.' },

  { author: 'Eli W.', year: 2000, feed: 'class', minutesAgo: 210, reactions: [10, 4, 3],
    body: 'Born in the year everyone thought computers would stop working. Still here.' },
  { author: 'June H.', year: 2000, feed: 'class', minutesAgo: 1300, reactions: [5, 6, 0],
    body: 'Started learning to surf at 25. The ocean does not care how old you are, which is nice.' },

  { author: 'Leo C.', year: 2002, feed: 'class', minutesAgo: 95, reactions: [6, 3, 4],
    body: 'Anyone else from 2002 feel like they are always either the oldest or the youngest in the room? Never quite in the middle.' },

  { author: 'Mina A.', year: 1998, feed: 'class', minutesAgo: 360, reactions: [8, 2, 5],
    body: 'Rewatched a show from middle school. The flip phones made me laugh, but the friendships still hold up.' },

  { author: 'Oscar B.', year: 2005, feed: 'class', minutesAgo: 480, reactions: [4, 4, 1],
    body: 'First apartment, first houseplant that did not die. Calling it a successful year.' },

  { author: 'Nia G.', year: 2007, feed: 'class', minutesAgo: 720, reactions: [9, 3, 2],
    body: 'Class of 2007 checking in. Finals are almost over. Going to sleep for about three days.' },

  { author: 'Ren Y.', year: 1997, feed: 'class', minutesAgo: 2000, reactions: [5, 5, 6],
    body: 'Oldest class in the generation reporting for duty. We remember life before social media, barely.' },
  { author: 'Zoe F.', year: 2010, feed: 'class', minutesAgo: 160, reactions: [6, 4, 1],
    body: 'Class of 2010 here. Is it normal to feel nostalgic about a game that came out five years ago?' },
  { author: 'Max J.', year: 2012, feed: 'class', minutesAgo: 820, reactions: [3, 5, 2],
    body: 'Youngest class in Gen Z. Some days we get grouped with Gen Alpha and honestly it is confusing.' },
  { author: 'Clara E.', year: 1999, feed: 'class', minutesAgo: 1100, reactions: [7, 3, 4],
    body: 'Found my old disposable camera photos from a beach trip. Everyone looks so unbothered. Want that energy back.' },
]

function scopeFor(entry: SeedEntry): PostScope {
  return entry.feed === 'gen'
    ? { kind: 'generation', generationId: GEN }
    : { kind: 'class', generationId: GEN, classYear: entry.year }
}

function fakeReactors(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `demo_${prefix}_${i}`)
}

export function createSeedPosts(now: Date = new Date()): Post[] {
  return ENTRIES.map((entry, i) => ({
    id: `demo_post_${i + 1}`,
    authorId: `demo_author_${entry.author.replace(/\W/g, '').toLowerCase()}`,
    authorName: entry.author,
    authorClassYear: entry.year,
    scope: scopeFor(entry),
    body: entry.body,
    createdAt: new Date(now.getTime() - entry.minutesAgo * 60000).toISOString(),
    reactions: {
      same: fakeReactors(`${i}s`, entry.reactions[0]),
      warm: fakeReactors(`${i}w`, entry.reactions[1]),
      thoughtful: fakeReactors(`${i}t`, entry.reactions[2]),
    },
    isDemo: true,
  }))
}
