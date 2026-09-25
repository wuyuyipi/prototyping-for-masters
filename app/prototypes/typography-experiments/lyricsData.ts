export interface TrackLyrics {
  id: string;
  title: string;
  artist: string;
  spotifyUri: string;
  spotifyUrl: string;
  previewUrl: string | null;
  coverUrl: string;
  lyrics: string[];
  timestamps?: number[]; // start time in seconds corresponding to each snippet line
}

export function getLineTimestamp(track: TrackLyrics, lineIndex: number, maxDuration?: number): number {
  if (track.timestamps && typeof track.timestamps[lineIndex] === 'number') {
    return track.timestamps[lineIndex];
  }
  return lineIndex * 5.0;
}

export const PLAYLIST_TRACKS: TrackLyrics[] = [
  {
    id: "0RzD2Vau0Buhf4nes3mrIE",
    title: "ミライノーツを奏でて",
    artist: "Re:vale",
    spotifyUri: "spotify:track:0RzD2Vau0Buhf4nes3mrIE",
    spotifyUrl: "https://open.spotify.com/track/0RzD2Vau0Buhf4nes3mrIE",
    previewUrl: "https://p.scdn.co/mp3-preview/477bba535df24c182b15a2c1da3dfcd630a3f2d0",
    coverUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02c4da7a63774627ac1cd76173",
    timestamps: [0.0, 7.5, 14.0, 20.5],
    lyrics: [
      "大袈裟な夢に気後れして",
      "でも目指さずにはいられなくて",
      "もし全能の誰かだったら",
      "なんて酷い想像はリライトして"
    ]
  },
  {
    id: "6q2JwrbgKHiaavdsPT6LlG",
    title: "太陽のEsperanza",
    artist: "Re:vale",
    spotifyUri: "spotify:track:6q2JwrbgKHiaavdsPT6LlG",
    spotifyUrl: "https://open.spotify.com/track/6q2JwrbgKHiaavdsPT6LlG",
    previewUrl: "https://p.scdn.co/mp3-preview/4bbc889ad944d9243cd8269a9e17e4a77c1224e1",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02fb94ccf068db7f1122867cea",
    timestamps: [7.7, 14.6, 20.9, 25.0],
    lyrics: [
      "どれくらいの覚悟で いつも立っているかを",
      "お前はまだ知らない 知ろうともしないさ",
      "雨を降らせて簡単に濡らせるほど",
      "この心は脆くないと さあ見てるがいい"
    ]
  },
  {
    id: "0gdxYJbgWdSEXo5EMVFpgs",
    title: "SOL",
    artist: "TRIGGER",
    spotifyUri: "spotify:track:0gdxYJbgWdSEXo5EMVFpgs",
    spotifyUrl: "https://open.spotify.com/track/0gdxYJbgWdSEXo5EMVFpgs",
    previewUrl: "https://p.scdn.co/mp3-preview/1c7c8a3cac118f8f259b74024d5557ee6f5a38de",
    coverUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02c9ebd8143c1f326a4b40174c",
    timestamps: [0.0, 6.2, 10.0, 13.6, 18.0, 22.0],
    lyrics: [
      "リミットなら超えた 掴みにいこうじゃないか",
      "回想に耽って過去を覗いて",
      "立ち止まるのは悪く無いけど",
      "朝日が昇るその前までには",
      "そっとブラウザを閉じてみようよ",
      "ただ 眩しい景色を眺めるんだ"
    ]
  },
  {
    id: "0MjSBRe2cE2sNx1ZLpnwdh",
    title: "Answer",
    artist: "TRIGGER",
    spotifyUri: "spotify:track:0MjSBRe2cE2sNx1ZLpnwdh",
    spotifyUrl: "https://open.spotify.com/track/0MjSBRe2cE2sNx1ZLpnwdh",
    previewUrl: "https://p.scdn.co/mp3-preview/6c39e542bcd57e783fe27dce6a956c4ec53f7242",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0258184a3644028a545641999e",
    timestamps: [0.0, 3.5, 6.3, 10.5],
    lyrics: [
      "酸いも甘いも全部",
      "しるべに変えて",
      "どこまでも行けるさ",
      "霞む Answer まだ迷いがあるなら"
    ]
  },
  {
    id: "6jmpRE8C27breHqbZzI3El",
    title: "UNFOLDiNG HARMONY",
    artist: "IDOLiSH7",
    spotifyUri: "spotify:track:6jmpRE8C27breHqbZzI3El",
    spotifyUrl: "https://open.spotify.com/track/6jmpRE8C27breHqbZzI3El",
    previewUrl: "https://p.scdn.co/mp3-preview/146c5d3d301ba99c22ae55cddff6c57e17b81c83",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02a43f66b05420878c7507b83a",
    timestamps: [0.0, 6.0, 12.0, 16.0, 23.0],
    lyrics: [
      "誰のものでもなく 自分の声で告げた",
      "足跡の確かな今日も 追い風になってゆく",
      "物語に 指をすり抜け 心臓のビート",
      "手の中に残る傷が 一つ二つ武器になる",
      "夜を裂く光のように 僕らの強い夢に"
    ]
  },
  {
    id: "3pTkYjWyOMgwPYCOwDV2dB",
    title: "Crz Love",
    artist: "IDOLiSH7",
    spotifyUri: "spotify:track:3pTkYjWyOMgwPYCOwDV2dB",
    spotifyUrl: "https://open.spotify.com/track/3pTkYjWyOMgwPYCOwDV2dB",
    previewUrl: "https://p.scdn.co/mp3-preview/4e77f2932ecbeb1a7974d2d22ab7fa6b957972a2",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0210a2d1cd613890dbd226c7be",
    timestamps: [3.3, 12.0, 14.5, 20.0, 24.0],
    lyrics: [
      "You and me Lady 不安に満ちた",
      "I got a hold on you baby",
      "君の仕草 目線 惹かれてくほど",
      "The way you are 知れば知るほど",
      "溶けるように溢れ出す温もり 今"
    ]
  },
  {
    id: "5xKTQScQGkjAPC0jUcY4Bs",
    title: "Black Toccata",
    artist: "ŹOOĻ",
    spotifyUri: "spotify:track:5xKTQScQGkjAPC0jUcY4Bs",
    spotifyUrl: "https://open.spotify.com/track/5xKTQScQGkjAPC0jUcY4Bs",
    previewUrl: "https://p.scdn.co/mp3-preview/fec97533468706bb773f867291679097d038a1e6",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0258dca2f47ca4fbe225a1b7a1",
    timestamps: [0.0, 4.0, 9.0, 15.0, 20.0],
    lyrics: [
      "錆びた枷 噛み千切れ",
      "群れるな 止まるな",
      "Welcome to the BLACK STAGE",
      "Now we go. Let's BLACKOUT.",
      "Watch me now, it's BLACK TOCCATA"
    ]
  },
  {
    id: "4wvKYQrcKR8aSyD3D9xYUS",
    title: "New Sensation",
    artist: "ŹOOĻ",
    spotifyUri: "spotify:track:4wvKYQrcKR8aSyD3D9xYUS",
    spotifyUrl: "https://open.spotify.com/track/4wvKYQrcKR8aSyD3D9xYUS",
    previewUrl: "https://p.scdn.co/mp3-preview/70be6a88f8de4415738cede5affe4fe79c7199fe",
    coverUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0297e3a8b382a8caa1e3405ba9",
    timestamps: [0.0, 4.0, 7.5, 11.0, 14.0],
    lyrics: [
      "舞い踊れや C'mon Carnival",
      "はじまりの鐘鳴らせ",
      "道化師の Parade",
      "夜明けの Show Time",
      "巻き起こせ New Sensation"
    ]
  },
  {
    id: "6eBfkOqgnnO50sDhSHYYxY",
    title: "コトノハカンタービレ",
    artist: "ALKALOID",
    spotifyUri: "spotify:track:6eBfkOqgnnO50sDhSHYYxY",
    spotifyUrl: "https://open.spotify.com/track/6eBfkOqgnnO50sDhSHYYxY",
    previewUrl: "https://p.scdn.co/mp3-preview/11ec1d89299ee4c966d42a4a773a7c20df49d0c9",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0202287433c1868d0c6640cddb",
    timestamps: [0.0, 7.5, 11.0, 14.6, 18.0, 22.0],
    lyrics: [
      "一瞬の瞬きも見つめてくれるから",
      "大袈裟な愛で世界が変わる",
      "ぎゅっと優しくその手を取った",
      "あの日の勇気を忘れはしない",
      "心を高らかに奏でるカンタービレ",
      "さあここから ありのままの自分で"
    ]
  },
  {
    id: "12iBQN3bsX0ExwgCZ3BAoY",
    title: "Black Out See Saw",
    artist: "ALKALOID",
    spotifyUri: "spotify:track:12iBQN3bsX0ExwgCZ3BAoY",
    spotifyUrl: "https://open.spotify.com/track/12iBQN3bsX0ExwgCZ3BAoY",
    previewUrl: "https://p.scdn.co/mp3-preview/4704387955404f354b7ae42d9a6e3f27ab29f8ff",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0297d70e35ce1fcfd82e5163c6",
    timestamps: [3.9, 8.2, 14.8, 18.2, 24.7],
    lyrics: [
      "おいでよ 誰かが僕を笑っている",
      "体中に耳がついちゃって ノイズの雨を降らしてよ",
      "心が変わったから",
      "どれだけ君と繋がって 孤独が風に呑まれても",
      "不安の針が心を刺して"
    ]
  },
  {
    id: "0QWm3Z36I1OllNv8g2fgXv",
    title: "Aquarium",
    artist: "MELLOW DEAR US",
    spotifyUri: "spotify:track:0QWm3Z36I1OllNv8g2fgXv",
    spotifyUrl: "https://open.spotify.com/track/0QWm3Z36I1OllNv8g2fgXv",
    previewUrl: "https://p.scdn.co/mp3-preview/4d6aaa3f18a441bc620dce67ed9691373fcb1c42",
    coverUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02d657c7199bd939da7c5daa77",
    timestamps: [0.0, 4.8, 7.7, 10.5, 14.4],
    lyrics: [
      "君の声が 届かなくても",
      "触れられないとしても",
      "その手を伝えてよ",
      "二人だけの秘密にして",
      "泳ぎ続ける このアクアリウム"
    ]
  },
  {
    id: "4ntJKvthRg9ORzUhGyfAps",
    title: "Femme fatale",
    artist: "MELLOW DEAR US",
    spotifyUri: "spotify:track:4ntJKvthRg9ORzUhGyfAps",
    spotifyUrl: "https://open.spotify.com/track/4ntJKvthRg9ORzUhGyfAps",
    previewUrl: "https://p.scdn.co/mp3-preview/beae9f55c05897b442935b8976dab817f4d7a87f",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02d657c7199bd939da7c5daa77",
    timestamps: [0.0, 4.9, 12.2, 16.6, 24.4],
    lyrics: [
      "月明かりのセレナーデ",
      "境界線の舞台で 運命の罠を",
      "ファム・ファタール 甘く危険な香りで",
      "心奪って 抜け出せない迷宮へ",
      "I'm falling in love"
    ]
  },
  {
    id: "0UV888klzGdbyMpwuxPYnK",
    title: "海へ",
    artist: "syh",
    spotifyUri: "spotify:track:0UV888klzGdbyMpwuxPYnK",
    spotifyUrl: "https://open.spotify.com/track/0UV888klzGdbyMpwuxPYnK",
    previewUrl: "https://p.scdn.co/mp3-preview/ae38bedefb78bb0ac99ba3136c9aee122c44418d",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e026c52b8f059802dc3bc31d706",
    timestamps: [0.0, 8.0, 15.0, 21.0],
    lyrics: [
      "涙の味が教えてる",
      "ほら、雨はいつかこの地球を巡り巡って",
      "歓びも 哀しみも手を繋いで",
      "手を繋いで 海へ"
    ]
  },
  {
    id: "46Qfr2EcTsB0H7I1h2XLoc",
    title: "ストレイト",
    artist: "syh",
    spotifyUri: "spotify:track:46Qfr2EcTsB0H7I1h2XLoc",
    spotifyUrl: "https://open.spotify.com/track/46Qfr2EcTsB0H7I1h2XLoc",
    previewUrl: "https://p.scdn.co/mp3-preview/69293945b9408edb042815c27e42833c1202645b",
    coverUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02032870f5ce24c70715e952e5",
    timestamps: [0.0, 4.0, 8.0, 12.5, 16.5],
    lyrics: [
      "貫け いまこの声よ",
      "思い出せ あの頃の記憶を",
      "画用紙ひとつの中に なんだって描けたろう",
      "轟け 色褪せぬように",
      "届くまで 俺は歌ってる"
    ]
  },
  {
    id: "5Hx7H767SqDFuW8aoqPFql",
    title: "冬のはなし -with 立夏ver.-",
    artist: "Given",
    spotifyUri: "spotify:track:5Hx7H767SqDFuW8aoqPFql",
    spotifyUrl: "https://open.spotify.com/track/5Hx7H767SqDFuW8aoqPFql",
    previewUrl: "https://p.scdn.co/mp3-preview/24aff4fc1a78a025a37698904b823a4112985472",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02a8ac7bf4a90bf0818031cfec",
    timestamps: [0.0, 7.2, 10.7, 17.8],
    lyrics: [
      "あなたのすべてが明日を失くして",
      "永遠の中を彷徨っているよ",
      "さよならできずに 立ち止まったままの",
      "僕と一緒に"
    ]
  },
  {
    id: "12GTBy9hDysvblcr2XC5wq",
    title: "夜が明ける",
    artist: "Given",
    spotifyUri: "spotify:track:12GTBy9hDysvblcr2XC5wq",
    spotifyUrl: "https://open.spotify.com/track/12GTBy9hDysvblcr2XC5wq",
    previewUrl: "https://p.scdn.co/mp3-preview/f166ee76e98e9a02e95408bee8685b7e27ae3c24",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02d3b27ed188ff76904ef0c300",
    timestamps: [0.0, 8.1, 18.2, 24.0],
    lyrics: [
      "夜は明ける それを僕は眺めている",
      "変わってくこと 始まってくこと",
      "君がいなくても 生きてゆける",
      "それが僕は ねぇ 悲しい"
    ]
  }
];
