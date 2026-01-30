import { useState } from 'react';
import './Roulette.css';

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
];

export default function Roulette({ choices, onComplete }) {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);

    const spinRoulette = () => {
        if (isSpinning || choices.length === 0) return;

        setIsSpinning(true);
        setWinner(null);

        const spins = 5 + Math.random() * 3;
        const winnerIndex = Math.floor(Math.random() * choices.length);
        const anglePerChoice = 360 / choices.length;
        // 선택된 항목이 위쪽 포인터를 가리키도록 계산
        const targetAngle = spins * 360 + (360 - (winnerIndex * anglePerChoice + anglePerChoice / 2));

        setRotation(targetAngle);

        setTimeout(() => {
            setIsSpinning(false);
            setWinner(choices[winnerIndex]);
        }, 4000);
    };

    const handleComplete = () => {
        if (winner) {
            onComplete(winner);
        }
    };

    // 각 섹션 계산
    const anglePerChoice = 360 / choices.length;

    return (
        <div className="roulette-container">
            <h2 className="roulette-title">🎰 누가 고를까요?</h2>

            <div className="roulette-wrapper">
                <div className="roulette-pointer" />

                <div
                    className="roulette-wheel"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                    }}
                >
                    {/* SVG 기반 룰렛 */}
                    <svg viewBox="0 0 200 200" className="roulette-svg">
                        {choices.map((choice, index) => {
                            const startAngle = index * anglePerChoice - 90;
                            const endAngle = startAngle + anglePerChoice;
                            const startRad = (startAngle * Math.PI) / 180;
                            const endRad = (endAngle * Math.PI) / 180;

                            const x1 = 100 + 100 * Math.cos(startRad);
                            const y1 = 100 + 100 * Math.sin(startRad);
                            const x2 = 100 + 100 * Math.cos(endRad);
                            const y2 = 100 + 100 * Math.sin(endRad);

                            const largeArc = anglePerChoice > 180 ? 1 : 0;

                            // 텍스트 위치 계산 (섹션 중앙)
                            const midAngle = (startAngle + endAngle) / 2;
                            const midRad = (midAngle * Math.PI) / 180;
                            const textRadius = 60;
                            const textX = 100 + textRadius * Math.cos(midRad);
                            const textY = 100 + textRadius * Math.sin(midRad);

                            return (
                                <g key={index}>
                                    <path
                                        d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                    {/* 이모지 */}
                                    <text
                                        x={textX}
                                        y={textY - 8}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="20"
                                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY - 8})`}
                                    >
                                        {choice.icon}
                                    </text>
                                    {/* 텍스트 */}
                                    <text
                                        x={textX}
                                        y={textY + 12}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="10"
                                        fontWeight="600"
                                        fill="white"
                                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY + 12})`}
                                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                    >
                                        {choice.name}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* 중앙 원 */}
                    <div className="roulette-center">
                        {isSpinning ? '🎲' : '🍽️'}
                    </div>
                </div>
            </div>

            <div className="roulette-choices">
                {choices.map((choice, index) => (
                    <div
                        key={index}
                        className={`roulette-choice ${winner?.id === choice.id ? 'winner' : ''}`}
                        style={{ borderColor: COLORS[index % COLORS.length] }}
                    >
                        <span className="icon">{choice.icon}</span>
                        <span className="name">{choice.name}</span>
                    </div>
                ))}
            </div>

            {!winner ? (
                <button
                    className="roulette-button"
                    onClick={spinRoulette}
                    disabled={isSpinning}
                >
                    {isSpinning ? '돌아가는 중...' : '돌려돌려~! 🎰'}
                </button>
            ) : (
                <div className="roulette-result">
                    <div className="result-announce">🎉 당첨!</div>
                    <div className="winner-display">
                        <span className="winner-icon">{winner.icon}</span>
                        <span className="winner-name">{winner.name}</span>
                    </div>
                    <button className="roulette-button" onClick={handleComplete}>
                        그걸로 결정! 👍
                    </button>
                </div>
            )}
        </div>
    );
}
