import { useState, createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
    step: 0, // 0: 시작, 1: 어제 뭐먹음, 2: 먹고싶은거, 3: 제외, 4: 인원, 5: 룰렛, 6: 결과
    yesterdayChoice: null,
    wantedFood: null,
    excludedTags: [],
    peopleCount: 1,
    peopleChoices: [],
    finalCategory: null,
    history: JSON.parse(localStorage.getItem('foodHistory') || '[]'),
    favorites: JSON.parse(localStorage.getItem('foodFavorites') || '[]'),
    blacklist: JSON.parse(localStorage.getItem('foodBlacklist') || '[]'),
};

function appReducer(state, action) {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'SET_YESTERDAY':
            return { ...state, yesterdayChoice: action.payload };
        case 'SET_WANTED':
            return { ...state, wantedFood: action.payload };
        case 'TOGGLE_EXCLUDE_TAG':
            const tags = state.excludedTags.includes(action.payload)
                ? state.excludedTags.filter(t => t !== action.payload)
                : [...state.excludedTags, action.payload];
            return { ...state, excludedTags: tags };
        case 'SET_PEOPLE_COUNT':
            return { ...state, peopleCount: action.payload, peopleChoices: [] };
        case 'ADD_PEOPLE_CHOICE':
            return { ...state, peopleChoices: [...state.peopleChoices, action.payload] };
        case 'SET_FINAL':
            return { ...state, finalCategory: action.payload };
        case 'ADD_HISTORY':
            const newHistory = [action.payload, ...state.history].slice(0, 30);
            localStorage.setItem('foodHistory', JSON.stringify(newHistory));
            return { ...state, history: newHistory };
        case 'RESET':
            return { ...initialState, history: state.history, favorites: state.favorites, blacklist: state.blacklist };
        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
