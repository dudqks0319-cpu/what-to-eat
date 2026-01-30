import { useState, useMemo } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import './CardSwipe.css';

export default function CardSwipe({ items, onSwipe, onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(null);

    const [{ x, rotate, opacity }, api] = useSpring(() => ({
        x: 0,
        rotate: 0,
        opacity: 1,
        config: { tension: 300, friction: 20 },
    }));

    const bind = useDrag(({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
        const trigger = vx > 0.2 || Math.abs(mx) > 100;
        const dir = xDir < 0 ? -1 : 1;

        if (!active) {
            if (trigger) {
                // Swipe away
                api.start({
                    x: dir * 500,
                    rotate: dir * 30,
                    opacity: 0,
                    onRest: () => {
                        const item = items[currentIndex];
                        onSwipe(item, dir === 1 ? 'right' : 'left');

                        if (currentIndex + 1 >= items.length) {
                            onComplete();
                        } else {
                            setCurrentIndex(i => i + 1);
                            api.start({ x: 0, rotate: 0, opacity: 1, immediate: true });
                        }
                    },
                });
            } else {
                // Snap back
                api.start({ x: 0, rotate: 0 });
                setDirection(null);
            }
        } else {
            // During drag
            api.start({
                x: mx,
                rotate: mx / 15,
                immediate: true,
            });
            setDirection(mx > 50 ? 'right' : mx < -50 ? 'left' : null);
        }
    });

    const currentItem = items[currentIndex];

    if (!currentItem) {
        return (
            <div className="no-cards">
                <p>모든 카테고리를 확인했습니다!</p>
                <button onClick={onComplete}>다음 단계로</button>
            </div>
        );
    }

    const previewItems = currentItem.items?.slice(0, 3).map(i => i.name).join(', ') || '';

    return (
        <div className="card-swipe-container">
            <animated.div
                {...bind()}
                className="card"
                style={{
                    x,
                    rotate: rotate.to(r => `${r}deg`),
                    opacity,
                }}
            >
                <span className={`card-hint left ${direction === 'left' ? 'visible' : ''}`}>
                    제외 ✗
                </span>
                <span className={`card-hint right ${direction === 'right' ? 'visible' : ''}`}>
                    선택 ✓
                </span>

                <span className="card-icon">{currentItem.icon}</span>
                <span className="card-name">{currentItem.name}</span>
                <span className="card-items-preview">{previewItems}...</span>
            </animated.div>

            <div className="swipe-instructions">
                <span>← 제외</span>
                <span>선택 →</span>
            </div>
        </div>
    );
}
