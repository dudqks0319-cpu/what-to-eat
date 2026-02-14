import { useState, useMemo } from 'react';
import { trackEvent } from './utils/analytics';
import { categories, excludeTags, priceRanges, moods, dietRestrictions } from './data/foodData';
import { useFeatures } from './context/FeaturesContext';
import MindMap from './components/MindMap';
import Roulette from './components/Roulette';
import ErrorBoundary from './components/ErrorBoundary';
import KakaoMap from './components/KakaoMap';
import './App.css';

const STEPS = {
  START: 0,
  YESTERDAY: 1,
  WANTED: 2,
  EXCLUDE: 3,
  DIET: 4,
  PRICE: 5,
  PEOPLE: 6,
  SELECT_MENU: 7,
  ROULETTE: 8,
  RESULT: 9,
};

function App() {
  const [step, setStep] = useState(STEPS.START);
  const [yesterdayChoices, setYesterdayChoices] = useState([]);
  const [wantedFoods, setWantedFoods] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [wantedTab, setWantedTab] = useState('category'); // 'category' or 'mood'
  const [excludedCategories, setExcludedCategories] = useState([]);
  const [excludedTags, setExcludedTags] = useState([]);
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [currentPerson, setCurrentPerson] = useState(0);
  const [peopleChoices, setPeopleChoices] = useState([]);
  const [finalCategory, setFinalCategory] = useState(null);
  const [menuSelections, setMenuSelections] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    favorites, blacklist, history,
    toggleFavorite, toggleBlacklist, addHistory,
    isFavorite, isBlacklisted, getStats, clearHistory, removeHistoryItem
  } = useFeatures();

  // 시간대 감지
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 11 && hour < 14) return 'lunch';
    if (hour >= 17 && hour < 21) return 'dinner';
    if (hour >= 21 || hour < 5) return 'nightsnack';
    return 'meal';
  };

  const timeOfDay = getTimeOfDay();
  const timeLabel = {
    lunch: '점심',
    dinner: '저녁',
    nightsnack: '야식',
    meal: '식사',
  }[timeOfDay];

  // 필터링된 카테고리 (블랙리스트 제외)
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      if (yesterdayChoices.includes(cat.id)) return false;
      if (excludedCategories.includes(cat.id)) return false;
      if (isBlacklisted(cat.id)) return false;
      return true;
    });
  }, [yesterdayChoices, excludedCategories, isBlacklisted]);

  // 상황 기반 필터링
  const moodFilteredCategories = useMemo(() => {
    if (selectedMoods.length === 0) {
      return filteredCategories;
    }

    // 선택된 상황들에서 추천하는 카테고리 ID들 수집
    const recommendedCategoryIds = new Set();
    const recommendedTags = new Set();
    const excludedTagsFromMoods = new Set();

    selectedMoods.forEach(moodId => {
      const mood = moods.find(m => m.id === moodId);
      if (mood) {
        mood.categoryIds.forEach(id => recommendedCategoryIds.add(id));
        mood.tags.forEach(tag => recommendedTags.add(tag));
        mood.excludeTags.forEach(tag => excludedTagsFromMoods.add(tag));
      }
    });

    return filteredCategories.filter(cat => {
      // 카테고리 ID가 추천 목록에 있거나
      if (recommendedCategoryIds.has(cat.id)) return true;

      // 태그 기반 필터링
      const hasRecommendedTag = cat.items.some(item =>
        item.tags.some(tag => recommendedTags.has(tag))
      );
      const hasExcludedTag = cat.items.some(item =>
        item.tags.some(tag => excludedTagsFromMoods.has(tag))
      );

      return hasRecommendedTag && !hasExcludedTag;
    });
  }, [filteredCategories, selectedMoods]);

  // 식단 제한 필터링
  const dietFilteredCategories = useMemo(() => {
    if (selectedDiets.length === 0) {
      return moodFilteredCategories;
    }

    // 선택된 식단 제한에서 제외해야 할 카테고리와 태그 수집
    const excludedCategoryIds = new Set();
    const excludedTagsFromDiets = new Set();

    selectedDiets.forEach(dietId => {
      const diet = dietRestrictions.find(d => d.id === dietId);
      if (diet) {
        diet.excludeCategories.forEach(id => excludedCategoryIds.add(id));
        diet.excludeTags.forEach(tag => excludedTagsFromDiets.add(tag));
      }
    });

    return moodFilteredCategories.filter(cat => {
      // 카테고리 자체가 제외 목록에 있으면 제외
      if (excludedCategoryIds.has(cat.id)) return false;

      // 모든 메뉴 아이템이 제외 태그를 가지고 있으면 제외
      const allItemsExcluded = cat.items.every(item =>
        item.tags.some(tag => excludedTagsFromDiets.has(tag))
      );

      return !allItemsExcluded;
    });
  }, [moodFilteredCategories, selectedDiets]);

  // 태그 필터링
  const tagFilteredCategories = useMemo(() => {
    let filtered = filteredCategories;

    // 태그 필터
    if (excludedTags.length > 0) {
      filtered = filtered.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          !item.tags.some(tag => excludedTags.includes(tag))
        )
      })).filter(cat => cat.items.length > 0);
    }

    // 가격대 필터
    if (selectedPriceRange) {
      filtered = filtered.filter(cat => cat.priceRange === selectedPriceRange);
    }

    return filtered;
  }, [filteredCategories, excludedTags, selectedPriceRange]);

  // 어제 먹은 것 토글
  const toggleYesterday = (catId) => {
    setYesterdayChoices(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  // 먹고 싶은 것 토글 (중복 선택)
  const toggleWanted = (cat) => {
    setWantedFoods(prev =>
      prev.find(c => c.id === cat.id)
        ? prev.filter(c => c.id !== cat.id)
        : [...prev, cat]
    );
  };

  // 태그 토글
  const toggleTag = (tagId) => {
    setExcludedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  // 리셋
  const reset = () => {
    setStep(STEPS.START);
    setYesterdayChoices([]);
    setWantedFoods([]);
    setSelectedMoods([]);
    setWantedTab('category');
    setExcludedCategories([]);
    setExcludedTags([]);
    setSelectedDiets([]);
    setSelectedPriceRange(null);
    setPeopleCount(1);
    setCurrentPerson(0);
    setPeopleChoices([]);
    setFinalCategory(null);
    setMenuSelections([]);
  };

  // 메뉴 선택 토글 (중복 선택)
  const toggleMenuSelection = (cat) => {
    setMenuSelections(prev =>
      prev.find(c => c.id === cat.id)
        ? prev.filter(c => c.id !== cat.id)
        : [...prev, cat]
    );
  };

  // 메뉴 선택 완료 처리
  const handleMenuComplete = () => {
    if (menuSelections.length === 1) {
      setFinalCategory(menuSelections[0]);
      addHistory(menuSelections[0], timeOfDay);
      trackEvent('recommendation_complete', { categoryId: menuSelections[0].id, timeOfDay });
      setStep(STEPS.RESULT);
    } else if (menuSelections.length > 1) {
      setPeopleChoices(menuSelections);
      setStep(STEPS.ROULETTE);
    }
  };

  // 메뉴 선택 (다인용)
  const selectCategory = (cat) => {
    if (peopleCount === 1) {
      setFinalCategory(cat);
      addHistory(cat, timeOfDay);
      trackEvent('recommendation_complete', { categoryId: cat.id, timeOfDay });
      setStep(STEPS.RESULT);
    } else {
      setPeopleChoices(prev => [...prev, cat]);
      if (currentPerson < peopleCount - 1) {
        setCurrentPerson(prev => prev + 1);
      } else {
        setStep(STEPS.ROULETTE);
      }
    }
  };

  // 먹고 싶은거 완료. 처리
  const handleWantedComplete = () => {
    if (wantedFoods.length === 1) {
      setFinalCategory(wantedFoods[0]);
      addHistory(wantedFoods[0], timeOfDay);
      trackEvent('recommendation_complete', { categoryId: wantedFoods[0].id, timeOfDay });
      setStep(STEPS.RESULT);
    } else if (wantedFoods.length > 1) {
      setPeopleChoices(wantedFoods);
      setStep(STEPS.ROULETTE);
    } else {
      setStep(STEPS.EXCLUDE);
    }
  };

  // 룰렛 완료
  const handleRouletteComplete = (winner) => {
    setFinalCategory(winner);
    addHistory(winner, timeOfDay);
    trackEvent('recommendation_complete', { categoryId: winner.id, timeOfDay });
    setStep(STEPS.RESULT);
  };

  // 랜덤 선택
  const getRandomCategory = () => {
    // 즐겨찾기가 있으면 우선
    const favCats = tagFilteredCategories.filter(c => isFavorite(c.id));
    const cats = favCats.length > 0 ? favCats : tagFilteredCategories;
    return cats[Math.floor(Math.random() * cats.length)];
  };

  // 검색 필터링
  const searchFilteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    const query = searchQuery.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        cat.name.toLowerCase().includes(query)
      )
    })).filter(cat =>
      cat.items.length > 0 || cat.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 통계
  const stats = getStats();

  const AFFILIATE_CODES = {
    baemin: import.meta.env.VITE_AFFILIATE_BAEMIN || 'demo-baemin',
    yogiyo: import.meta.env.VITE_AFFILIATE_YOGIYO || 'demo-yogiyo',
    coupangEats: import.meta.env.VITE_AFFILIATE_COUPANGEATS || 'demo-coupangeats',
  };

  const buildTrackedUrl = (baseUrl, params) => {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  };

  const getOrderLinks = (category) => {
    const keyword = `${category.name} 배달`;
    const commonUtm = {
      utm_source: 'what-to-eat',
      utm_medium: 'app',
      utm_campaign: `recommendation_${timeOfDay}`,
      utm_content: category.id,
    };

    return [
      {
        name: '배민',
        url: buildTrackedUrl('https://www.baemin.com/search', {
          q: keyword,
          aff: AFFILIATE_CODES.baemin,
          ...commonUtm,
          utm_term: 'baemin',
        }),
      },
      {
        name: '요기요',
        url: buildTrackedUrl('https://www.yogiyo.co.kr/mobile/#/search/', {
          query: keyword,
          aff: AFFILIATE_CODES.yogiyo,
          ...commonUtm,
          utm_term: 'yogiyo',
        }),
      },
      {
        name: '쿠팡이츠',
        url: buildTrackedUrl('https://www.coupangeats.com/search', {
          query: keyword,
          aff: AFFILIATE_CODES.coupangEats,
          ...commonUtm,
          utm_term: 'coupangeats',
        }),
      },
      {
        name: '네이버지도',
        url: buildTrackedUrl('https://map.naver.com/p/search/', {
          query: keyword,
          ...commonUtm,
          utm_term: 'navermap',
        }),
      },
    ];
  };

  const getSponsoredSlots = (category) => {
    const commonUtm = {
      utm_source: 'what-to-eat',
      utm_medium: 'sponsored-slot',
      utm_campaign: `sponsor_${timeOfDay}`,
      utm_content: category.id,
    };

    return [
      {
        id: 'sponsor-1',
        title: '오늘의 스폰서 맛집',
        subtitle: `${category.name} 카테고리 할인 쿠폰 보기`,
        cta: '쿠폰 받기',
        url: buildTrackedUrl('https://example.com/promo/restaurant', {
          category: category.id,
          ...commonUtm,
          slot: '1',
        }),
      },
      {
        id: 'sponsor-2',
        title: '신규 제휴 매장',
        subtitle: `${category.name} 첫 주문 이벤트 참여`,
        cta: '이벤트 보기',
        url: buildTrackedUrl('https://example.com/promo/new-partner', {
          category: category.id,
          ...commonUtm,
          slot: '2',
        }),
      },
    ];
  };

  const handleOrderClick = (platform, category) => {
    trackEvent('order_link_click', {
      platform,
      categoryId: category.id,
      categoryName: category.name,
      timeOfDay,
    });
  };

  const handleSponsorClick = (slotId, category) => {
    trackEvent('sponsor_slot_click', {
      slotId,
      categoryId: category.id,
      categoryName: category.name,
      timeOfDay,
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="emoji">🍽️</span>
          {timeLabel} 뭐먹지?
        </h1>
        <p className="subtitle">오늘의 메뉴를 빠르게 정해드려요</p>
      </header>

      {step > STEPS.START && step < STEPS.RESULT && (
        <div className="progress-container">
          <div className="progress-bar">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className={`progress-step ${step >= i ? 'completed' : ''} ${step === i ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      <main className="main-content">
        {/* 시작 화면 */}
        {step === STEPS.START && (
          <div className="step-container start-screen">
            <div className="start-emoji">🤔</div>
            <h2 className="start-title">{timeLabel} 뭐 먹을지 고민?</h2>
            <p className="start-description">
              몇 가지 질문에 답하면<br />
              딱 맞는 메뉴를 추천해줄게!
            </p>

            <button className="btn btn-primary" onClick={() => setStep(STEPS.YESTERDAY)}>
              시작하기
            </button>

            {/* 검색 기능 */}
            <div style={{ marginTop: '24px' }}>
              <input
                type="text"
                placeholder="🔍 메뉴 이름으로 검색... (예: 김치찌개, 피자)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              {searchQuery && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                      검색 결과: {searchFilteredCategories.length}개 카테고리
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✕ 초기화
                    </button>
                  </div>
                  <div className="quick-grid">
                    {searchFilteredCategories.slice(0, 8).map(cat => (
                      <div
                        key={cat.id}
                        className="quick-item"
                        onClick={() => {
                          setFinalCategory(cat);
                          addHistory(cat, timeOfDay);
                          trackEvent('recommendation_complete', { categoryId: cat.id, timeOfDay });
                          setStep(STEPS.RESULT);
                          setSearchQuery('');
                        }}
                      >
                        <span className="icon">{cat.icon}</span>
                        <span className="name">{cat.name}</span>
                        {cat.items.filter(item =>
                          item.name.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length > 0 && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                            {cat.items.filter(item =>
                              item.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )[0].name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 히스토리 & 즐겨찾기 버튼 */}
            <div className="feature-buttons">
              <button
                className={`feature-btn ${showHistory ? 'active' : ''}`}
                onClick={() => {
                  setShowHistory(!showHistory);
                  setShowBlacklist(false);
                }}
              >
                📊 {showHistory ? '마인드맵 보기' : '히스토리'}
              </button>
              <button
                className="feature-btn"
                onClick={() => {
                  const fav = categories.find(c => isFavorite(c.id));
                  if (fav) {
                    setFinalCategory(fav);
                    addHistory(fav, timeOfDay);
                    trackEvent('recommendation_complete', { categoryId: fav.id, timeOfDay });
                    setStep(STEPS.RESULT);
                  } else {
                    alert('즐겨찾기가 없습니다. 메뉴를 선택한 후 즐겨찾기에 추가해주세요!');
                  }
                }}
              >
                ⭐ 즐겨찾기 추천
              </button>
              <button
                className={`feature-btn ${showBlacklist ? 'active' : ''}`}
                onClick={() => {
                  setShowBlacklist(!showBlacklist);
                  setShowHistory(false);
                }}
              >
                🚫 블랙리스트 ({blacklist.length})
              </button>
            </div>

            {showBlacklist ? (
              <div className="blacklist-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                    제외 목록
                  </h3>
                  {blacklist.length > 0 && (
                    <button
                      className="feature-btn"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => {
                        blacklist.forEach(id => toggleBlacklist(id));
                      }}
                    >
                      🔓 전체 해제
                    </button>
                  )}
                </div>
                {blacklist.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>제외된 메뉴가 없어요</p>
                ) : (
                  <div className="quick-grid">
                    {blacklist.map(id => {
                      const cat = categories.find(c => c.id === id);
                      if (!cat) return null;
                      return (
                        <div
                          key={id}
                          className="quick-item"
                          style={{ position: 'relative', opacity: 0.7 }}
                        >
                          <button
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(76, 175, 80, 0.8)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              zIndex: 10
                            }}
                            onClick={() => toggleBlacklist(id)}
                            title="해제"
                          >
                            ✓
                          </button>
                          <span className="icon">{cat.icon}</span>
                          <span className="name">{cat.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-danger)', display: 'block', marginTop: '4px' }}>
                            제외됨
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : showHistory ? (
              <div className="history-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                    최근 선택 기록
                  </h3>
                  {history.length > 0 && (
                    <button
                      className="feature-btn"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => {
                        if (window.confirm('모든 기록을 삭제하시겠습니까?')) {
                          clearHistory();
                        }
                      }}
                    >
                      🗑️ 전체 삭제
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>아직 기록이 없어요</p>
                ) : (
                  <>
                    <div className="quick-grid">
                      {history.slice(0, 8).map((entry) => (
                        <div
                          key={entry.id}
                          className="quick-item"
                          style={{ position: 'relative' }}
                        >
                          <button
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(255, 0, 0, 0.7)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              zIndex: 10
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHistoryItem(entry.id);
                            }}
                            title="삭제"
                          >
                            ×
                          </button>
                          <div
                            onClick={() => {
                              setFinalCategory(entry.category);
                              addHistory(entry.category, timeOfDay);
                              trackEvent('recommendation_complete', { categoryId: entry.category.id, timeOfDay });
                              setStep(STEPS.RESULT);
                            }}
                            style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                          >
                            <span className="icon">{entry.category.icon}</span>
                            <span className="name">{entry.category.name}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              {new Date(entry.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {stats.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>자주 먹은 메뉴 TOP 3</h4>
                        <div className="selection-summary">
                          <div className="chips">
                            {stats.slice(0, 3).map((stat, i) => {
                              const cat = categories.find(c => c.id === stat.id);
                              return (
                                <span key={stat.id} className="chip selected">
                                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {cat?.icon} {cat?.name} ({stat.count}회)
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="quick-select">
                <h3>아니면 바로 고르기</h3>
                <ErrorBoundary fallbackMessage="마인드맵을 표시할 수 없습니다">
                  <MindMap
                    categories={categories}
                    onCategoryClick={(cat) => {
                      setFinalCategory(cat);
                      addHistory(cat, timeOfDay);
                      trackEvent('recommendation_complete', { categoryId: cat.id, timeOfDay });
                      setStep(STEPS.RESULT);
                    }}
                    favorites={favorites}
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>
        )}

        {/* Step 1: 어제 뭐 먹었나요? */}
        {step === STEPS.YESTERDAY && (
          <div className="step-container">
            <h2 className="step-title">어제 뭐 먹었어?</h2>
            <p className="step-description">선택하면 오늘은 제외할게 (여러 개 가능)</p>

            <div className="options-grid">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`option-btn ${yesterdayChoices.includes(cat.id) ? 'selected' : ''}`}
                  onClick={() => toggleYesterday(cat.id)}
                >
                  <span className="icon">{cat.icon}</span>
                  <span className="name">{cat.name}</span>
                </button>
              ))}
            </div>

            {yesterdayChoices.length > 0 && (
              <div className="selection-summary">
                <h4>제외될 메뉴</h4>
                <div className="chips">
                  {yesterdayChoices.map(id => {
                    const cat = categories.find(c => c.id === id);
                    return (
                      <span key={id} className="chip excluded">
                        {cat?.icon} {cat?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="skip-btn" onClick={() => setStep(STEPS.WANTED)}>
                기억 안 남
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(STEPS.WANTED)}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 먹고 싶은 음식? (중복 선택) */}
        {step === STEPS.WANTED && (
          <div className="step-container">
            <h2 className="step-title">먹고 싶은 거 있어?</h2>
            <p className="step-description">땡기는 거 다 골라봐! (여러 개 선택 가능)</p>

            {/* 탭 전환 */}
            <div className="wanted-tabs">
              <button
                className={`tab-btn ${wantedTab === 'category' ? 'active' : ''}`}
                onClick={() => setWantedTab('category')}
              >
                📁 카테고리로 선택
              </button>
              <button
                className={`tab-btn ${wantedTab === 'mood' ? 'active' : ''}`}
                onClick={() => setWantedTab('mood')}
              >
                💭 상황으로 선택
              </button>
            </div>

            {/* 상황 선택 탭 */}
            {wantedTab === 'mood' && (
              <>
                <div className="mood-grid">
                  {moods.map(mood => (
                    <button
                      key={mood.id}
                      className={`mood-btn ${selectedMoods.includes(mood.id) ? 'selected' : ''}`}
                      onClick={() => {
                        if (selectedMoods.includes(mood.id)) {
                          setSelectedMoods(selectedMoods.filter(id => id !== mood.id));
                        } else {
                          setSelectedMoods([...selectedMoods, mood.id]);
                        }
                      }}
                    >
                      <span className="icon">{mood.icon}</span>
                      <span className="name">{mood.name}</span>
                    </button>
                  ))}
                </div>

                {selectedMoods.length > 0 && (
                  <div className="selection-summary" style={{ marginTop: '20px' }}>
                    <h4>선택한 상황 {selectedMoods.length}개</h4>
                    <div className="chips">
                      {selectedMoods.map(moodId => {
                        const mood = moods.find(m => m.id === moodId);
                        return (
                          <span key={moodId} className="chip selected">
                            {mood.icon} {mood.name}
                          </span>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '12px' }}>
                      👇 추천 카테고리 {dietFilteredCategories.length}개
                    </p>
                  </div>
                )}

                {/* 상황 기반 필터링된 카테고리 */}
                {selectedMoods.length > 0 && (
                  <div className="options-grid" style={{ marginTop: '20px' }}>
                    {dietFilteredCategories.map(cat => (
                      <button
                        key={cat.id}
                        className={`option-btn ${wantedFoods.find(c => c.id === cat.id) ? 'selected' : ''}`}
                        onClick={() => toggleWanted(cat)}
                      >
                        {isFavorite(cat.id) && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: '12px' }}>⭐</span>}
                        <span className="icon">{cat.icon}</span>
                        <span className="name">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 카테고리 선택 탭 */}
            {wantedTab === 'category' && (
              <div className="options-grid">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    className={`option-btn ${wantedFoods.find(c => c.id === cat.id) ? 'selected' : ''}`}
                    onClick={() => toggleWanted(cat)}
                  >
                    {isFavorite(cat.id) && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: '12px' }}>⭐</span>}
                    <span className="icon">{cat.icon}</span>
                    <span className="name">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {wantedFoods.length > 0 && (
              <div className="selection-summary">
                <h4>선택한 메뉴 {wantedFoods.length}개</h4>
                <div className="chips">
                  {wantedFoods.map(cat => (
                    <span key={cat.id} className="chip selected">
                      {cat.icon} {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.YESTERDAY)}>
                이전
              </button>
              <button className="skip-btn" onClick={() => setStep(STEPS.EXCLUDE)}>
                없음
              </button>
              {wantedFoods.length > 0 && (
                <button className="btn btn-primary" onClick={handleWantedComplete}>
                  {wantedFoods.length === 1 ? '이걸로!' : '이 중에서 골라줘'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: 제외할 음식 */}
        {step === STEPS.EXCLUDE && (
          <div className="step-container">
            <h2 className="step-title">빼고 싶은 거?</h2>
            <p className="step-description">오늘은 피하고 싶은 종류가 있어?</p>

            <div className="tag-options">
              {excludeTags.map(tag => (
                <button
                  key={tag.id}
                  className={`tag-btn ${excludedTags.includes(tag.tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag.tag)}
                >
                  <span className="icon">{tag.icon}</span>
                  <span className="name">{tag.name}</span>
                </button>
              ))}
            </div>

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.WANTED)}>
                이전
              </button>
              <button className="btn btn-primary" onClick={() => setStep(STEPS.DIET)}>
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 식단 제한 */}
        {step === STEPS.DIET && (
          <div className="step-container">
            <h2 className="step-title">식단 제한 있어?</h2>
            <p className="step-description">알레르기나 식단 제한 사항을 선택해주세요 (여러 개 가능)</p>

            <div className="diet-options">
              {dietRestrictions.map(diet => (
                <button
                  key={diet.id}
                  className={`diet-btn ${selectedDiets.includes(diet.id) ? 'selected' : ''}`}
                  onClick={() => {
                    if (selectedDiets.includes(diet.id)) {
                      setSelectedDiets(selectedDiets.filter(id => id !== diet.id));
                    } else {
                      setSelectedDiets([...selectedDiets, diet.id]);
                    }
                  }}
                >
                  <span className="icon">{diet.icon}</span>
                  <div className="diet-info">
                    <span className="name">{diet.name}</span>
                    <span className="description">{diet.description}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedDiets.length > 0 && (
              <div className="selection-summary">
                <h4>선택한 제한 사항 {selectedDiets.length}개</h4>
                <div className="chips">
                  {selectedDiets.map(dietId => {
                    const diet = dietRestrictions.find(d => d.id === dietId);
                    return (
                      <span key={dietId} className="chip selected">
                        {diet.icon} {diet.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.EXCLUDE)}>
                이전
              </button>
              <button className="skip-btn" onClick={() => {
                setSelectedDiets([]);
                setStep(STEPS.PRICE);
              }}>
                없음
              </button>
              <button className="btn btn-primary" onClick={() => setStep(STEPS.PRICE)}>
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 5: 가격대는? */}
        {step === STEPS.PRICE && (
          <div className="step-container">
            <h2 className="step-title">예산은 얼마나?</h2>
            <p className="step-description">오늘의 식사 예산을 선택해주세요</p>

            <div className="people-options">
              {priceRanges.map(range => (
                <button
                  key={range.id}
                  className={`people-btn ${selectedPriceRange === range.value ? 'selected' : ''}`}
                  onClick={() => setSelectedPriceRange(range.value)}
                >
                  <span className="count" style={{ fontSize: '2em' }}>{range.icon}</span>
                  <span className="label">{range.name}</span>
                </button>
              ))}
            </div>

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.DIET)}>
                이전
              </button>
              <button className="skip-btn" onClick={() => {
                setSelectedPriceRange(null);
                setStep(STEPS.PEOPLE);
              }}>
                상관없음
              </button>
              <button className="btn btn-primary" onClick={() => setStep(STEPS.PEOPLE)}>
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 6: 몇 명? */}
        {step === STEPS.PEOPLE && (
          <div className="step-container">
            <h2 className="step-title">몇 명이서 먹어?</h2>
            <p className="step-description">여러 명이면 각자 고른 후 랜덤 뽑기!</p>

            <div className="people-options">
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  className={`people-btn ${peopleCount === num ? 'selected' : ''}`}
                  onClick={() => setPeopleCount(num)}
                >
                  <span className="count">{num}</span>
                  <span className="label">명</span>
                </button>
              ))}
            </div>

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.PRICE)}>
                이전
              </button>
              <button className="btn btn-primary" onClick={() => setStep(STEPS.SELECT_MENU)}>
                메뉴 고르기
              </button>
            </div>
          </div>
        )}

        {/* Step 6: 메뉴 선택 (클릭 방식) */}
        {step === STEPS.SELECT_MENU && (
          <div className="step-container">
            <h2 className="step-title">
              {peopleCount > 1 ? `${currentPerson + 1}번째 사람 차례!` : '어떤 게 땡겨?'}
            </h2>
            <p className="step-description">
              {peopleCount > 1
                ? '마음에 드는 메뉴를 골라주세요'
                : '땡기는 거 다 골라! 고민되면 룰렛 돌려줄게'}
            </p>

            <div className="options-grid">
              {tagFilteredCategories.map(cat => (
                peopleCount === 1 ? (
                  <button
                    key={cat.id}
                    className={`option-btn ${menuSelections.find(c => c.id === cat.id) ? 'selected' : ''}`}
                    onClick={() => toggleMenuSelection(cat)}
                  >
                    {isFavorite(cat.id) && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: '12px' }}>⭐</span>}
                    <span className="icon">{cat.icon}</span>
                    <span className="name">{cat.name}</span>
                  </button>
                ) : (
                  <div key={cat.id} className="category-card">
                    <span className="icon">{cat.icon}</span>
                    <span className="name">{cat.name}</span>
                    <div className="card-actions">
                      <button
                        className="action-btn select-btn"
                        onClick={() => selectCategory(cat)}
                      >
                        선택
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>

            {peopleCount === 1 && menuSelections.length > 0 && (
              <div className="selection-summary">
                <h4>선택한 메뉴 {menuSelections.length}개</h4>
                <div className="chips">
                  {menuSelections.map(cat => (
                    <span key={cat.id} className="chip selected">
                      {cat.icon} {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {peopleCount > 1 && peopleChoices.length > 0 && (
              <div className="selection-summary">
                <h4>선택 완료</h4>
                <div className="chips">
                  {peopleChoices.map((cat, i) => (
                    <span key={i} className="chip selected">
                      {i + 1}번: {cat.icon} {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.PEOPLE)}>
                이전
              </button>
              {peopleCount === 1 ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const random = getRandomCategory();
                      setFinalCategory(random);
                      addHistory(random, timeOfDay);
                      trackEvent('recommendation_complete', { categoryId: random.id, timeOfDay });
                      setStep(STEPS.RESULT);
                    }}
                  >
                    랜덤으로!
                  </button>
                  {menuSelections.length > 0 && (
                    <button className="btn btn-primary" onClick={handleMenuComplete}>
                      {menuSelections.length === 1 ? '이걸로!' : '이 중에서 골라줘'}
                    </button>
                  )}
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const random = getRandomCategory();
                    selectCategory(random);
                  }}
                >
                  랜덤으로!
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 7: 룰렛 */}
        {step === STEPS.ROULETTE && (
          <div className="step-container">
            <Roulette
              choices={peopleChoices}
              onComplete={handleRouletteComplete}
            />
            <div className="action-buttons" style={{ marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => {
                setPeopleChoices([]);
                setCurrentPerson(0);
                setStep(STEPS.SELECT_MENU);
              }}>
                다시 선택
              </button>
            </div>
          </div>
        )}

        {/* Step 8: 결과 */}
        {step === STEPS.RESULT && finalCategory && (
          <div className="step-container result-container">
            <div className="result-header">
              <p className="label">오늘의 {timeLabel}은</p>
              <div className="category-icon">{finalCategory.icon}</div>
              <h2 className="category-name">{finalCategory.name}</h2>

              {/* 즐겨찾기 토글 */}
              <button
                className={`feature-btn ${isFavorite(finalCategory.id) ? 'active' : ''}`}
                style={{ marginTop: '12px' }}
                onClick={() => toggleFavorite(finalCategory.id)}
              >
                {isFavorite(finalCategory.id) ? '⭐ 즐겨찾기 됨' : '☆ 즐겨찾기 추가'}
              </button>
            </div>

            <ErrorBoundary fallbackMessage="마인드맵을 표시할 수 없습니다">
              <div style={{ height: '300px', marginBottom: '24px' }}>
                <MindMap
                  categories={[finalCategory]}
                  selectedCategory={finalCategory}
                  showMenus={true}
                  favorites={favorites}
                />
              </div>
            </ErrorBoundary>

            <h3 className="menu-section-title">추천 메뉴</h3>

            <div className="menu-grid">
              {finalCategory.items
                .filter(item => !item.tags.some(t => excludedTags.includes(t)))
                .slice(0, 6)
                .map((item, i) => (
                  <div key={i} className="menu-card">
                    <span className="name">{item.name}</span>
                    <div className="tags">
                      {item.tags.slice(0, 3).map((tag, j) => (
                        <span key={j} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>

            {/* 카카오 지도 */}
            <ErrorBoundary fallbackMessage="지도를 불러올 수 없습니다">
              <KakaoMap category={finalCategory} />
            </ErrorBoundary>

            <div className="selection-summary" style={{ marginTop: '20px' }}>
              <h4>배달 앱으로 바로 주문</h4>
              <div className="chips">
                {getOrderLinks(finalCategory).map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip selected"
                    onClick={() => handleOrderClick(link.name, finalCategory)}
                    style={{ textDecoration: 'none' }}
                  >
                    {link.name}에서 보기
                  </a>
                ))}
              </div>
            </div>

            <div className="sponsored-section">
              <h4>스폰서 추천</h4>
              <div className="sponsored-grid">
                {getSponsoredSlots(finalCategory).map((slot) => (
                  <a
                    key={slot.id}
                    href={slot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sponsored-card"
                    onClick={() => handleSponsorClick(slot.id, finalCategory)}
                  >
                    <p className="sponsored-badge">광고</p>
                    <h5>{slot.title}</h5>
                    <p>{slot.subtitle}</p>
                    <span>{slot.cta} →</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="action-buttons" style={{ marginTop: '32px', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button className="btn btn-secondary" onClick={() => {
                  setFinalCategory(null);
                  if (peopleChoices.length > 0) {
                    setStep(STEPS.ROULETTE);
                  } else {
                    setStep(STEPS.SELECT_MENU);
                  }
                }}>
                  이전
                </button>
                <button className="btn btn-primary" onClick={reset}>
                  다시 하기
                </button>
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => toggleBlacklist(finalCategory.id)}
              >
                {isBlacklisted(finalCategory.id) ? '🚫 블랙리스트 해제' : '🚫 다음엔 제외'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
