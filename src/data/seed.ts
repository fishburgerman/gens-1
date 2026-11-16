import { getGenerationForYear } from '../config/generations'
import type { RegionCode } from '../config/regions'
import { weeklyQuestion } from '../config/weeklyQuestions'
import type { Post, PostScope } from '../types'

/**
 * Sample posts so the demo feels alive on first launch.
 * Every author here is fictional and every post is flagged `isDemo`,
 * which the UI labels as "Sample" so it is never mistaken for a real person.
 * Bodies are written in the author's own language and are never translated.
 *
 * IDs are stable (demo_post_<n>): the storage migration uses them to keep
 * the user's own reactions when sample posts are refreshed. Only append.
 */
interface SeedEntry {
  author: string
  year: number
  region: RegionCode | null
  /** 'gen' = Generation feed, otherwise the author's class feed */
  feed: 'gen' | 'class'
  minutesAgo: number
  body: string
  reactions: [number, number, number]
  /** answers the Weekly Question of the week the demo was created */
  answersWeekly?: boolean
}

const ENTRIES: SeedEntry[] = [
  // 1–21: original v0.1 samples (order must not change)
  { author: 'Maya R.', year: 2001, region: 'US', feed: 'gen', minutesAgo: 14, reactions: [12, 4, 2],
    body: 'Does anyone else still hear the dial-up sound in their head sometimes? I was so young but it stuck with me.' },
  { author: 'Jonah K.', year: 2003, region: 'CA', feed: 'gen', minutesAgo: 52, reactions: [8, 6, 3],
    body: 'Small win today: phone stayed in another room for the whole morning. Read 60 pages. Felt like 2009 again in the best way.' },
  { author: 'Lena S.', year: 1999, region: 'DE', feed: 'gen', minutesAgo: 130, reactions: [21, 9, 5],
    body: 'Hot take: we were the last group of kids who had to memorize phone numbers. I still know my childhood landline.' },
  { author: 'Theo M.', year: 2005, region: 'AU', feed: 'gen', minutesAgo: 240, reactions: [5, 3, 7],
    body: 'Curious how other years handled graduating during weird times. What do you wish someone had told you at 18?' },
  { author: 'Priya D.', year: 2000, region: 'IN', feed: 'gen', minutesAgo: 420, reactions: [14, 11, 1],
    body: 'Watched the sunset from the pier after work. No photos, just watched it. Recommend.' },
  { author: 'Sam O.', year: 2008, region: 'NG', feed: 'gen', minutesAgo: 1500, reactions: [6, 2, 4],
    body: 'Hi from the younger side of Gen Z. It is interesting reading what the 1998 crowd remembers. Some of it sounds like history class to me.' },
  { author: 'Ava L.', year: 2003, region: 'GB', feed: 'class', minutesAgo: 33, reactions: [9, 5, 1],
    body: 'Class of 2003, where were you when the first iPhone came out? I remember being four and thinking it was magic.' },
  { author: 'Noah P.', year: 2003, region: 'US', feed: 'class', minutesAgo: 190, reactions: [4, 7, 2],
    body: 'Turning the big milestone this year. Planning a quiet weekend by the coast instead of a party. Anyone else going low-key?' },
  { author: 'Iris T.', year: 2003, region: 'NL', feed: 'class', minutesAgo: 900, reactions: [11, 3, 0],
    body: 'Our senior year got cut short and we never really got a proper goodbye. Glad there is a place where we are all in the same room again.' },
  { author: 'Kai N.', year: 2001, region: 'NZ', feed: 'class', minutesAgo: 75, reactions: [7, 2, 1],
    body: '2001 kids: burned CDs or a hand-me-down MP3 player? I had both and labeled every disc in marker.' },
  { author: 'Rosa V.', year: 2001, region: 'MX', feed: 'class', minutesAgo: 600, reactions: [3, 8, 2],
    body: 'Moved back to my hometown this year. Strange how the streets feel smaller.' },
  { author: 'Eli W.', year: 2000, region: 'GB', feed: 'class', minutesAgo: 210, reactions: [10, 4, 3],
    body: 'Born in the year everyone thought computers would stop working. Still here.' },
  { author: 'June H.', year: 2000, region: 'US', feed: 'class', minutesAgo: 1300, reactions: [5, 6, 0],
    body: 'Started learning to surf at 25. The ocean does not care how old you are, which is nice.' },
  { author: 'Leo C.', year: 2002, region: 'IT', feed: 'class', minutesAgo: 95, reactions: [6, 3, 4],
    body: 'Anyone else from 2002 feel like they are always either the oldest or the youngest in the room? Never quite in the middle.' },
  { author: 'Mina A.', year: 1998, region: 'PH', feed: 'class', minutesAgo: 360, reactions: [8, 2, 5],
    body: 'Rewatched a show from middle school. The flip phones made me laugh, but the friendships still hold up.' },
  { author: 'Oscar B.', year: 2005, region: 'SE', feed: 'class', minutesAgo: 480, reactions: [4, 4, 1],
    body: 'First apartment, first houseplant that did not die. Calling it a successful year.' },
  { author: 'Nia G.', year: 2007, region: 'KE', feed: 'class', minutesAgo: 720, reactions: [9, 3, 2],
    body: 'Class of 2007 checking in. Finals are almost over. Going to sleep for about three days.' },
  { author: 'Ren Y.', year: 1997, region: null, feed: 'class', minutesAgo: 2000, reactions: [5, 5, 6],
    body: 'Oldest class in the generation reporting for duty. We remember life before social media, barely.' },
  { author: 'Zoe F.', year: 2010, region: 'FR', feed: 'class', minutesAgo: 160, reactions: [6, 4, 1],
    body: 'Class of 2010 here. Is it normal to feel nostalgic about a game that came out five years ago?' },
  { author: 'Max J.', year: 2012, region: 'DE', feed: 'class', minutesAgo: 820, reactions: [3, 5, 2],
    body: 'Youngest class in Gen Z. Some days we get grouped with Gen Alpha and honestly it is confusing.' },
  { author: 'Clara E.', year: 1999, region: 'ES', feed: 'class', minutesAgo: 1100, reactions: [7, 3, 4],
    body: 'Found my old disposable camera photos from a beach trip. Everyone looks so unbothered. Want that energy back.' },

  // 22+: added in v0.3 — everyday posts from around the world, in their own languages
  { author: 'Haruto S.', year: 2003, region: 'JP', feed: 'class', minutesAgo: 22, reactions: [5, 3, 1],
    body: 'バイト帰りに見た夕焼けがきれいだった。特に何もない一日だったけど、それでいい気がする。' },
  { author: 'Seo-yeon L.', year: 2003, region: 'KR', feed: 'class', minutesAgo: 140, reactions: [6, 4, 0],
    body: '오늘은 그냥 집에서 라면 끓여 먹고 빨래했어요. 평범한 하루도 나쁘지 않네요.' },
  { author: 'Lucas A.', year: 2003, region: 'BR', feed: 'class', minutesAgo: 310, reactions: [3, 2, 2],
    body: 'Rainy Sunday in São Paulo. Made coffee, called my grandmother, did nothing else. Good day.' },
  { author: 'Aiko M.', year: 2001, region: 'JP', feed: 'class', minutesAgo: 260, reactions: [4, 5, 1],
    body: '同い年の人たち、最近なにしてますか。わたしは毎朝15分だけ散歩を続けています。' },
  { author: 'Ji-ho P.', year: 2001, region: 'KR', feed: 'class', minutesAgo: 980, reactions: [2, 3, 3],
    body: '퇴근길 버스에서 어릴 때 듣던 노래가 나와서 괜히 기분이 좋았어요.' },
  { author: 'Ama O.', year: 2002, region: 'GH', feed: 'class', minutesAgo: 400, reactions: [5, 6, 1],
    body: 'Finished my first week at a new job. Nobody tells you how tiring it is to learn everyone’s names.' },
  { author: 'Yuna K.', year: 2005, region: 'KR', feed: 'class', minutesAgo: 55, reactions: [3, 2, 0],
    body: '시험 끝나고 친구랑 한강 가서 아무 말 없이 앉아 있었어요.' },
  { author: 'Sota I.', year: 2000, region: 'JP', feed: 'class', minutesAgo: 700, reactions: [4, 2, 2],
    body: '25歳になって、ようやく自炊が楽しくなってきた。今日は味噌汁だけちゃんと作った。' },
  { author: 'Camila R.', year: 1998, region: 'AR', feed: 'class', minutesAgo: 1250, reactions: [6, 4, 2],
    body: 'Sunday asado with cousins. Same jokes as when we were kids, still funny.' },

  // Weekly Question answers (question of the week the demo data was created)
  { author: 'Mei T.', year: 2003, region: 'TW', feed: 'class', minutesAgo: 45, reactions: [4, 3, 1], answersWeekly: true,
    body: 'Making tea before anyone else in the house woke up. Ten quiet minutes.' },
  { author: 'Daniel K.', year: 2003, region: 'DE', feed: 'class', minutesAgo: 380, reactions: [2, 4, 2], answersWeekly: true,
    body: 'Fixing my bike chain with my hands covered in grease and feeling weirdly proud.' },
  { author: 'Nao H.', year: 2001, region: 'JP', feed: 'class', minutesAgo: 120, reactions: [3, 3, 0], answersWeekly: true,
    body: '洗濯物を取り込んだら、まだお日さまの匂いがした。' },
  { author: 'Tomás G.', year: 2002, region: 'CL', feed: 'class', minutesAgo: 230, reactions: [2, 2, 1], answersWeekly: true,
    body: 'Waiting for the bus and realizing I knew every song the driver played.' },

  // Other generations (read-only for Gen Z members, visible in Explore)
  { author: 'Sarah B.', year: 1995, region: 'IE', feed: 'class', minutesAgo: 500, reactions: [6, 5, 3],
    body: 'Class of 1995 here. Thirty-one and finally okay with going to bed at ten.' },
  { author: 'Kenji W.', year: 1990, region: 'JP', feed: 'class', minutesAgo: 1600, reactions: [4, 6, 4],
    body: '子どもを保育園に送ったあと、コンビニのコーヒーを飲む5分間が一日でいちばん静かな時間です。' },
  { author: 'Hye-jin C.', year: 1993, region: 'KR', feed: 'class', minutesAgo: 880, reactions: [3, 4, 2],
    body: '오랜만에 옛날 싸이월드 사진을 봤어요. 그때 우리는 왜 그렇게 진지했을까요.' },
  { author: 'Marcus T.', year: 1988, region: 'ZA', feed: 'class', minutesAgo: 2400, reactions: [5, 3, 5],
    body: 'Taught my nephew how to use a cassette tape today. He thought it was a phone case.' },
]

function scopeFor(entry: SeedEntry): PostScope {
  const generationId = getGenerationForYear(entry.year)?.id ?? 'gen-z'
  return entry.feed === 'gen'
    ? { kind: 'generation', generationId }
    : { kind: 'class', generationId, classYear: entry.year }
}

function fakeReactors(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `demo_${prefix}_${i}`)
}

export function createSeedPosts(now: Date = new Date()): Post[] {
  const weekly = weeklyQuestion(now)
  return ENTRIES.map((entry, i) => ({
    id: `demo_post_${i + 1}`,
    authorId: `demo_author_${entry.author.replace(/\W/g, '').toLowerCase()}`,
    authorName: entry.author,
    authorClassYear: entry.year,
    authorRegion: entry.region,
    scope: scopeFor(entry),
    body: entry.body,
    createdAt: new Date(now.getTime() - entry.minutesAgo * 60000).toISOString(),
    prompt: entry.answersWeekly ? { questionId: weekly.id, week: weekly.week } : null,
    reactions: {
      same: fakeReactors(`${i}s`, entry.reactions[0]),
      warm: fakeReactors(`${i}w`, entry.reactions[1]),
      thoughtful: fakeReactors(`${i}t`, entry.reactions[2]),
    },
    isDemo: true,
  }))
}
