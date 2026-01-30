import { useState, useMemo } from 'react';
import { categories, excludeTags } from './data/foodData';
import { useFeatures } from './context/FeaturesContext';
import MindMap from './components/MindMap';
import Roulette from './components/Roulette';
import './App.css';

const STEPS = {
  START: 0,
  YESTERDAY: 1,
  WANTED: 2,
  EXCLUDE: 3,
  PEOPLE: 4,
  SELECT_MENU: 5,
  ROULETTE: 6,
  RESULT: 7,
};

function App() {
  const [step, setStep] = useState(STEPS.START);
  const [yesterdayChoices, setYesterdayChoices] = useState([]);
  const [wantedFoods, setWantedFoods] = useState([]);
  const [excludedCategories, setExcludedCategories] = useState([]);
  const [excludedTags, setExcludedTags] = useState([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [currentPerson, setCurrentPerson] = useState(0);
  const [peopleChoices, setPeopleChoices] = useState([]);
  const [finalCategory, setFinalCategory] = useState(null);
  const [menuSelections, setMenuSelections] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const {
    favorites, blacklist, history,
    toggleFavorite, toggleBlacklist, addHistory,
    isFavorite, isBlacklisted, getStats, clearHistory
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
  }, [yesterdayChoices, excludedCategories, blacklist]);

  // 태그 필터링
  const tagFilteredCategories = useMemo(() => {
    if (excludedTags.length === 0) return filteredCategories;

    return filteredCategories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        !item.tags.some(tag => excludedTags.includes(tag))
      )
    })).filter(cat => cat.items.length > 0);
  }, [filteredCategories, excludedTags]);

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
    setExcludedCategories([]);
    setExcludedTags([]);
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
    setStep(STEPS.RESULT);
  };

  // 랜덤 선택
  const getRandomCategory = () => {
    // 즐겨찾기가 있으면 우선
    const favCats = tagFilteredCategories.filter(c => isFavorite(c.id));
    const cats = favCats.length > 0 ? favCats : tagFilteredCategories;
    return cats[Math.floor(Math.random() * cats.length)];
  };

  // 통계
  const stats = getStats();

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="emoji">🍽️</span>
          {timeLabel} 뭐먹지?
        </h1>
        <p className="subtitle">선택장애 탈출 프로젝트</p>
      </header>

      {step > STEPS.START && step < STEPS.RESULT && (
        <div className="progress-container">
          <div className="progress-bar">
            {[1, 2, 3, 4, 5].map(i => (
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

            {/* 히스토리 & 즐겨찾기 버튼 */}
            <div className="feature-buttons">
              <button
                className={`feature-btn ${showHistory ? 'active' : ''}`}
                onClick={() => setShowHistory(!showHistory)}
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
                    setStep(STEPS.RESULT);
                  }
                }}
              >
                ⭐ 즐겨찾기 추천
              </button>
            </div>

            {showHistory ? (
              <div className="history-section">
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '24px', marginBottom: '16px' }}>
                  최근 선택 기록
                </h3>
                {history.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>아직 기록이 없어요</p>
                ) : (
                  <>
                    <div className="quick-grid">
                      {history.slice(0, 8).map((entry, i) => (
                        <div
                          key={entry.id}
                          className="quick-item"
                          onClick={() => {
                            setFinalCategory(entry.category);
                            addHistory(entry.category, timeOfDay);
                            setStep(STEPS.RESULT);
                          }}
                        >
                          <span className="icon">{entry.category.icon}</span>
                          <span className="name">{entry.category.name}</span>
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
                <MindMap
                  categories={categories}
                  onCategoryClick={(cat) => {
                    setFinalCategory(cat);
                    addHistory(cat, timeOfDay);
                    setStep(STEPS.RESULT);
                  }}
                  favorites={favorites}
                />
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
                기억 안 나
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
                없어
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
              <button className="btn btn-primary" onClick={() => setStep(STEPS.PEOPLE)}>
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 몇 명? */}
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
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.EXCLUDE)}>
                이전
              </button>
              <button className="btn btn-primary" onClick={() => setStep(STEPS.SELECT_MENU)}>
                메뉴 고르기
              </button>
            </div>
          </div>
        )}

        {/* Step 5: 메뉴 선택 (클릭 방식) */}
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

        {/* Step 6: 룰렛 */}
        {step === STEPS.ROULETTE && (
          <div className="step-container">
            <Roulette
              choices={peopleChoices}
              onComplete={handleRouletteComplete}
            />
          </div>
        )}

        {/* Step 7: 결과 */}
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

            <MindMap
              categories={[finalCategory]}
              selectedCategory={finalCategory}
              showMenus={true}
            />

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

            <div className="action-buttons" style={{ marginTop: '32px' }}>
              <button className="btn btn-secondary" onClick={reset}>
                다시 하기
              </button>
              <button
                className="btn btn-secondary"
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
