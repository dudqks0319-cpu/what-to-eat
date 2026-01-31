// 점심 저녁 뭐먹지? - 음식 데이터
// 17개 카테고리 + 세부 메뉴 + 태그 시스템

export const categories = [
  {
    id: 'korean',
    name: '한식',
    icon: '🍚',
    priceRange: 'medium', // low | medium | high
    items: [
      { name: '김치찌개', tags: ['매운', '국물', '저렴'] },
      { name: '된장찌개', tags: ['국물', '저렴', '건강'] },
      { name: '제육볶음', tags: ['매운', '고기', '밥도둑'] },
      { name: '불고기', tags: ['달달', '고기'] },
      { name: '비빔밥', tags: ['건강', '채소'] },
      { name: '삼겹살', tags: ['고기', '회식'] },
      { name: '갈비찜', tags: ['고기', '특별'] },
      { name: '두루치기', tags: ['매운', '고기'] },
      { name: '순두부찌개', tags: ['매운', '국물', '저렴'] },
      { name: '김치찜', tags: ['매운', '고기'] },
      { name: '청국장', tags: ['국물', '건강'] },
      { name: '부대찌개', tags: ['국물', '느끼'] },
    ]
  },
  {
    id: 'chinese',
    name: '중식',
    icon: '🥡',
    priceRange: 'medium',
    items: [
      { name: '짜장면', tags: ['면', '저렴'] },
      { name: '짬뽕', tags: ['매운', '면', '국물'] },
      { name: '탕수육', tags: ['튀김', '달달'] },
      { name: '깐풍기', tags: ['매운', '튀김'] },
      { name: '마파두부', tags: ['매운'] },
      { name: '양장피', tags: ['특별'] },
      { name: '유린기', tags: ['튀김'] },
      { name: '볶음밥', tags: ['밥', '저렴'] },
      { name: '마라탕', tags: ['매운', '국물'] },
      { name: '마라샹궈', tags: ['매운'] },
    ]
  },
  {
    id: 'japanese',
    name: '일식',
    icon: '🍣',
    priceRange: 'high',
    items: [
      { name: '초밥', tags: ['날것', '특별'] },
      { name: '사시미', tags: ['날것', '특별'] },
      { name: '돈카츠', tags: ['튀김', '느끼'] },
      { name: '규카츠', tags: ['튀김', '고기'] },
      { name: '라멘', tags: ['면', '국물', '느끼'] },
      { name: '우동', tags: ['면', '국물'] },
      { name: '소바', tags: ['면', '건강'] },
      { name: '덮밥', tags: ['밥'] },
      { name: '오코노미야끼', tags: ['특별'] },
      { name: '타코야끼', tags: ['간식'] },
    ]
  },
  {
    id: 'western',
    name: '양식',
    icon: '🍝',
    priceRange: 'high',
    items: [
      { name: '파스타', tags: ['면', '느끼'] },
      { name: '스테이크', tags: ['고기', '특별', '비싼'] },
      { name: '리조또', tags: ['밥', '느끼'] },
      { name: '필라프', tags: ['밥'] },
      { name: '오믈렛', tags: ['저렴'] },
      { name: '함박스테이크', tags: ['고기'] },
      { name: '그라탕', tags: ['느끼'] },
      { name: '샐러드', tags: ['건강', '채소'] },
    ]
  },
  {
    id: 'fastfood',
    name: '패스트푸드',
    icon: '🍔',
    priceRange: 'low',
    items: [
      { name: '햄버거', tags: ['느끼', '저렴'] },
      { name: '감자튀김', tags: ['튀김', '간식'] },
      { name: '핫도그', tags: ['저렴'] },
      { name: '샌드위치', tags: ['저렴', '건강'] },
      { name: '타코', tags: ['매운'] },
      { name: '브리또', tags: ['느끼'] },
    ]
  },
  {
    id: 'snack',
    name: '분식',
    icon: '🍜',
    priceRange: 'low',
    items: [
      { name: '떡볶이', tags: ['매운', '저렴'] },
      { name: '순대', tags: ['저렴'] },
      { name: '튀김', tags: ['튀김', '저렴'] },
      { name: '라면', tags: ['면', '매운', '저렴'] },
      { name: '김밥', tags: ['저렴', '간편'] },
      { name: '쫄면', tags: ['면', '매운'] },
      { name: '우동', tags: ['면', '국물'] },
      { name: '오뎅', tags: ['국물', '저렴'] },
    ]
  },
  {
    id: 'chicken',
    name: '치킨',
    icon: '🍗',
    priceRange: 'medium',
    items: [
      { name: '후라이드', tags: ['튀김'] },
      { name: '양념치킨', tags: ['달달', '튀김'] },
      { name: '간장치킨', tags: ['달달', '튀김'] },
      { name: '마늘치킨', tags: ['튀김'] },
      { name: '파닭', tags: ['튀김'] },
      { name: '치킨무', tags: ['사이드'] },
      { name: '핫윙', tags: ['매운', '튀김'] },
    ]
  },
  {
    id: 'pizza',
    name: '피자',
    icon: '🍕',
    priceRange: 'medium',
    items: [
      { name: '페퍼로니', tags: ['느끼', '고기'] },
      { name: '치즈피자', tags: ['느끼'] },
      { name: '불고기피자', tags: ['달달'] },
      { name: '고구마피자', tags: ['달달'] },
      { name: '포테이토피자', tags: ['느끼'] },
      { name: '콤비네이션', tags: ['느끼'] },
    ]
  },
  {
    id: 'cafe',
    name: '카페/디저트',
    icon: '☕',
    priceRange: 'medium',
    items: [
      { name: '케이크', tags: ['달달', '디저트'] },
      { name: '마카롱', tags: ['달달', '디저트'] },
      { name: '와플', tags: ['달달', '디저트'] },
      { name: '빙수', tags: ['달달', '시원'] },
      { name: '아이스크림', tags: ['달달', '시원'] },
      { name: '브런치', tags: ['건강'] },
      { name: '샌드위치', tags: ['간편'] },
    ]
  },
  {
    id: 'lunchbox',
    name: '도시락',
    icon: '🍱',
    priceRange: 'low',
    items: [
      { name: '백반도시락', tags: ['저렴', '간편'] },
      { name: '불고기도시락', tags: ['고기'] },
      { name: '제육도시락', tags: ['매운', '고기'] },
      { name: '돈까스도시락', tags: ['튀김'] },
      { name: '연어도시락', tags: ['건강'] },
    ]
  },
  {
    id: 'tonkatsu',
    name: '돈까스',
    icon: '🥩',
    priceRange: 'medium',
    items: [
      { name: '등심돈까스', tags: ['튀김'] },
      { name: '안심돈까스', tags: ['튀김'] },
      { name: '치즈돈까스', tags: ['튀김', '느끼'] },
      { name: '생선까스', tags: ['튀김'] },
      { name: '왕돈까스', tags: ['튀김', '특별'] },
    ]
  },
  {
    id: 'stew',
    name: '찜/탕',
    icon: '🍲',
    priceRange: 'medium',
    items: [
      { name: '감자탕', tags: ['국물', '고기'] },
      { name: '뼈해장국', tags: ['국물', '해장'] },
      { name: '아구찜', tags: ['매운', '해물'] },
      { name: '해물찜', tags: ['해물'] },
      { name: '닭볶음탕', tags: ['매운', '고기'] },
      { name: '곱창전골', tags: ['국물', '고기'] },
      { name: '부대찌개', tags: ['국물'] },
    ]
  },
  {
    id: 'gukbap',
    name: '국밥',
    icon: '🥣',
    priceRange: 'low',
    items: [
      { name: '돼지국밥', tags: ['국물', '고기', '저렴'] },
      { name: '순대국밥', tags: ['국물', '저렴'] },
      { name: '소머리국밥', tags: ['국물', '고기'] },
      { name: '콩나물국밥', tags: ['국물', '해장'] },
      { name: '설렁탕', tags: ['국물'] },
      { name: '곰탕', tags: ['국물'] },
      { name: '갈비탕', tags: ['국물', '고기', '특별'] },
    ]
  },
  {
    id: 'meat',
    name: '고기',
    icon: '🥓',
    priceRange: 'high',
    items: [
      { name: '삼겹살', tags: ['고기', '회식'] },
      { name: '목살', tags: ['고기'] },
      { name: '갈비', tags: ['고기', '특별'] },
      { name: '소고기', tags: ['고기', '비싼'] },
      { name: '양고기', tags: ['고기', '특별'] },
      { name: '오리고기', tags: ['고기', '건강'] },
      { name: '차돌박이', tags: ['고기'] },
    ]
  },
  {
    id: 'jokbal',
    name: '족발/보쌈',
    icon: '🍖',
    priceRange: 'medium',
    items: [
      { name: '족발', tags: ['고기', '야식'] },
      { name: '보쌈', tags: ['고기'] },
      { name: '막국수', tags: ['면', '사이드'] },
      { name: '쟁반국수', tags: ['면', '사이드'] },
    ]
  },
  {
    id: 'asian',
    name: '아시안',
    icon: '🍛',
    priceRange: 'medium',
    items: [
      { name: '쌀국수', tags: ['면', '국물'] },
      { name: '팟타이', tags: ['면'] },
      { name: '똠양꿍', tags: ['매운', '국물'] },
      { name: '카레', tags: ['밥'] },
      { name: '난', tags: ['빵'] },
      { name: '탄두리치킨', tags: ['고기'] },
      { name: '분짜', tags: ['면'] },
      { name: '반미', tags: ['빵', '간편'] },
    ]
  },
  {
    id: 'nightsnack',
    name: '야식',
    icon: '🌙',
    priceRange: 'medium',
    items: [
      { name: '치킨', tags: ['튀김', '야식'] },
      { name: '족발', tags: ['고기', '야식'] },
      { name: '피자', tags: ['느끼', '야식'] },
      { name: '라면', tags: ['면', '매운', '야식'] },
      { name: '떡볶이', tags: ['매운', '야식'] },
      { name: '야식세트', tags: ['야식'] },
      { name: '컵라면', tags: ['면', '간편', '야식'] },
    ]
  },
];

// 가격대 옵션
export const priceRanges = [
  { id: 'low', name: '저렴 (5천~1만원)', icon: '💵', value: 'low' },
  { id: 'medium', name: '보통 (1만~2만원)', icon: '💴', value: 'medium' },
  { id: 'high', name: '비싸도 OK (2만원+)', icon: '💰', value: 'high' },
];

// 제외 태그 옵션
export const excludeTags = [
  { id: 'spicy', name: '매운 음식', icon: '🌶️', tag: '매운' },
  { id: 'greasy', name: '느끼한 음식', icon: '🧈', tag: '느끼' },
  { id: 'raw', name: '날것 (회 등)', icon: '🐟', tag: '날것' },
  { id: 'expensive', name: '비싼 음식', icon: '💰', tag: '비싼' },
  { id: 'fried', name: '튀긴 음식', icon: '🍟', tag: '튀김' },
];

// 날씨 기반 추천
export const weatherRecommendations = {
  rain: ['전', '파전', '칼국수', '김치전', '막걸리'],
  cold: ['찜', '탕', '국밥', '라면', '김치찌개'],
  hot: ['냉면', '콩국수', '빙수', '아이스크림', '냉모밀'],
};

// 시간대별 카테고리 가중치
export const timeWeights = {
  lunch: ['도시락', '분식', '한식', '중식', '일식'],
  dinner: ['고기', '한식', '양식', '일식', '중식'],
  nightsnack: ['야식', '치킨', '피자', '분식', '족발/보쌈'],
};

// 식단/알레르기 제한 옵션
export const dietRestrictions = [
  {
    id: 'vegetarian',
    name: '채식 (비건/베지테리언)',
    icon: '🥗',
    description: '고기, 생선, 해산물 제외',
    excludeTags: ['고기', '해산물', '날것'],
    excludeCategories: ['meat', 'japanese', 'jokbal']
  },
  {
    id: 'gluten-free',
    name: '글루텐 프리',
    icon: '🌾',
    description: '밀가루 음식 제외',
    excludeTags: ['면', '튀김', '빵'],
    excludeCategories: ['noodles', 'pizza', 'snack']
  },
  {
    id: 'dairy-free',
    name: '유제품 제외',
    icon: '🥛',
    description: '우유, 치즈, 크림 제외',
    excludeTags: ['크림', '치즈'],
    excludeCategories: ['western', 'dessert', 'cafe']
  },
  {
    id: 'seafood-allergy',
    name: '해산물 알레르기',
    icon: '🦐',
    description: '생선, 조개류 제외',
    excludeTags: ['해산물', '날것', '생선'],
    excludeCategories: ['japanese']
  },
  {
    id: 'nut-allergy',
    name: '견과류 알레르기',
    icon: '🥜',
    description: '땅콩, 견과류 제외',
    excludeTags: ['견과류'],
    excludeCategories: []
  },
  {
    id: 'halal',
    name: '할랄 음식',
    icon: '☪️',
    description: '돼지고기 제외',
    excludeTags: ['돼지', '돼지고기'],
    excludeCategories: ['jokbal']
  },
];

// 상황 기반 선택 (Mood-based selection)
export const moods = [
  // 1. 컨디션/몸 상태
  {
    id: 'hangover',
    name: '술 먹었어 (해장)',
    icon: '🍺',
    category: '컨디션',
    categoryIds: ['korean', 'soup'],
    tags: ['국물'],
    excludeTags: ['느끼', '튀김']
  },
  {
    id: 'upset-stomach',
    name: '속이 안 좋아',
    icon: '🤢',
    category: '컨디션',
    categoryIds: ['porridge', 'noodles'],
    tags: ['건강', '국물'],
    excludeTags: ['매운', '느끼', '튀김']
  },
  {
    id: 'tired',
    name: '피곤해',
    icon: '😫',
    category: '컨디션',
    categoryIds: ['meat', 'jokbal', 'western'],
    tags: ['고기'],
    excludeTags: []
  },

  // 2. 식감/온도
  {
    id: 'hot-food',
    name: '뜨끈한 게 땡겨',
    icon: '🔥',
    category: '식감',
    categoryIds: ['korean', 'soup', 'noodles'],
    tags: ['국물'],
    excludeTags: ['날것']
  },
  {
    id: 'cold-food',
    name: '시원한 게 땡겨',
    icon: '❄️',
    category: '식감',
    categoryIds: ['japanese', 'noodles', 'dessert'],
    tags: ['날것', '시원'],
    excludeTags: []
  },
  {
    id: 'soup',
    name: '국물 있는 거',
    icon: '🥣',
    category: '식감',
    categoryIds: ['soup', 'noodles', 'korean'],
    tags: ['국물'],
    excludeTags: []
  },
  {
    id: 'juicy',
    name: '육즙 팡팡',
    icon: '🍖',
    category: '식감',
    categoryIds: ['meat', 'jokbal', 'fastfood'],
    tags: ['고기'],
    excludeTags: []
  },

  // 3. 기분/맛
  {
    id: 'spicy',
    name: '매운 거 땡겨',
    icon: '🌶️',
    category: '기분',
    categoryIds: ['korean', 'chinese', 'snack'],
    tags: ['매운'],
    excludeTags: []
  },
  {
    id: 'salty',
    name: '짭짤한 거',
    icon: '🧂',
    category: '기분',
    categoryIds: ['jokbal', 'chicken', 'chinese'],
    tags: ['짭짤'],
    excludeTags: []
  },
  {
    id: 'sweet',
    name: '달달한 거',
    icon: '🍬',
    category: '기분',
    categoryIds: ['dessert', 'cafe', 'snack'],
    tags: ['달달'],
    excludeTags: []
  },
  {
    id: 'power-up',
    name: '힘내고 싶어',
    icon: '💪',
    category: '기분',
    categoryIds: ['meat', 'donkatsu', 'western', 'fastfood'],
    tags: ['고기', '튀김'],
    excludeTags: []
  },

  // 4. 시간대별
  {
    id: 'brunch',
    name: '브런치',
    icon: '🌅',
    category: '시간대',
    categoryIds: ['cafe', 'western', 'snack'],
    tags: ['브런치'],
    excludeTags: []
  },
  {
    id: 'quick-lunch',
    name: '점심 (빠르게)',
    icon: '🕐',
    category: '시간대',
    categoryIds: ['snack', 'noodles', 'japanese', 'lunchbox'],
    tags: ['간편', '저렴'],
    excludeTags: []
  },
  {
    id: 'hearty-dinner',
    name: '저녁 (든든하게)',
    icon: '🌆',
    category: '시간대',
    categoryIds: ['meat', 'korean', 'chinese', 'western'],
    tags: ['고기', '특별'],
    excludeTags: []
  },
  {
    id: 'late-night',
    name: '야식',
    icon: '🌙',
    category: '시간대',
    categoryIds: ['nightsnack', 'chicken', 'pizza', 'chinese'],
    tags: ['야식'],
    excludeTags: []
  },

  // 5. 날씨
  {
    id: 'rainy',
    name: '비 오는 날',
    icon: '☔',
    category: '날씨',
    categoryIds: ['korean', 'soup', 'noodles'],
    tags: ['국물', '전'],
    excludeTags: []
  },
];
