import { createContext, useContext, useReducer, useEffect } from 'react';

const FeaturesContext = createContext();

const initialState = {
    // 즐겨찾기 (카테고리 ID 배열)
    favorites: JSON.parse(localStorage.getItem('food_favorites') || '[]'),
    // 블랙리스트 (카테고리 ID 배열)
    blacklist: JSON.parse(localStorage.getItem('food_blacklist') || '[]'),
    // 히스토리 (선택 기록)
    history: JSON.parse(localStorage.getItem('food_history') || '[]'),
};

function featuresReducer(state, action) {
    switch (action.type) {
        case 'TOGGLE_FAVORITE': {
            const favorites = state.favorites.includes(action.categoryId)
                ? state.favorites.filter(id => id !== action.categoryId)
                : [...state.favorites, action.categoryId];
            return { ...state, favorites };
        }
        case 'TOGGLE_BLACKLIST': {
            const blacklist = state.blacklist.includes(action.categoryId)
                ? state.blacklist.filter(id => id !== action.categoryId)
                : [...state.blacklist, action.categoryId];
            return { ...state, blacklist };
        }
        case 'ADD_HISTORY': {
            const newEntry = {
                id: Date.now(),
                category: action.category,
                timestamp: new Date().toISOString(),
                timeOfDay: action.timeOfDay,
            };
            const history = [newEntry, ...state.history].slice(0, 50); // 최근 50개만 저장
            return { ...state, history };
        }
        case 'CLEAR_HISTORY':
            return { ...state, history: [] };
        case 'REMOVE_HISTORY':
            return {
                ...state,
                history: state.history.filter(entry => entry.id !== action.id)
            };
        default:
            return state;
    }
}

export function FeaturesProvider({ children }) {
    const [state, dispatch] = useReducer(featuresReducer, initialState);

    // localStorage에 저장
    useEffect(() => {
        localStorage.setItem('food_favorites', JSON.stringify(state.favorites));
    }, [state.favorites]);

    useEffect(() => {
        localStorage.setItem('food_blacklist', JSON.stringify(state.blacklist));
    }, [state.blacklist]);

    useEffect(() => {
        localStorage.setItem('food_history', JSON.stringify(state.history));
    }, [state.history]);

    const toggleFavorite = (categoryId) => {
        dispatch({ type: 'TOGGLE_FAVORITE', categoryId });
    };

    const toggleBlacklist = (categoryId) => {
        dispatch({ type: 'TOGGLE_BLACKLIST', categoryId });
    };

    const addHistory = (category, timeOfDay) => {
        dispatch({ type: 'ADD_HISTORY', category, timeOfDay });
    };

    const clearHistory = () => {
        dispatch({ type: 'CLEAR_HISTORY' });
    };

    const removeHistoryItem = (id) => {
        dispatch({ type: 'REMOVE_HISTORY', id });
    };

    const isFavorite = (categoryId) => state.favorites.includes(categoryId);
    const isBlacklisted = (categoryId) => state.blacklist.includes(categoryId);

    // 통계 계산
    const getStats = () => {
        const stats = {};
        state.history.forEach(entry => {
            const id = entry.category.id;
            stats[id] = (stats[id] || 0) + 1;
        });
        return Object.entries(stats)
            .map(([id, count]) => ({ id, count }))
            .sort((a, b) => b.count - a.count);
    };

    return (
        <FeaturesContext.Provider value={{
            favorites: state.favorites,
            blacklist: state.blacklist,
            history: state.history,
            toggleFavorite,
            toggleBlacklist,
            addHistory,
            clearHistory,
            removeHistoryItem,
            isFavorite,
            isBlacklisted,
            getStats,
        }}>
            {children}
        </FeaturesContext.Provider>
    );
}

export function useFeatures() {
    const context = useContext(FeaturesContext);
    if (!context) {
        throw new Error('useFeatures must be used within a FeaturesProvider');
    }
    return context;
}
