import { useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, set, onValue, push, remove, update } from 'firebase/database';
import QRCode from 'qrcode.react';
import './GroupVoting.css';

export default function GroupVoting({ categories, onComplete }) {
    const [roomId, setRoomId] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [myVote, setMyVote] = useState(null);
    const [participantName, setParticipantName] = useState('');
    const [showNameInput, setShowNameInput] = useState(true);
    const [error, setError] = useState(null);

    // URL에서 roomId 가져오기
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlRoomId = params.get('room');
        if (urlRoomId) {
            setRoomId(urlRoomId);
            setIsHost(false);
        }
    }, []);

    // 실시간 데이터 감지
    useEffect(() => {
        if (!roomId || !database) return;

        const roomRef = ref(database, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                setRoomData(snapshot.val());
            } else if (!isHost) {
                setError('존재하지 않는 투표방입니다.');
            }
        });

        return () => unsubscribe();
    }, [roomId, isHost]);

    // 투표방 생성
    const createRoom = () => {
        if (!database) {
            setError('Firebase가 설정되지 않았습니다. FIREBASE_SETUP.md를 참고하세요.');
            return;
        }

        if (!participantName.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }

        const newRoomRef = push(ref(database, 'rooms'));
        const newRoomId = newRoomRef.key;

        const roomData = {
            hostName: participantName.trim(),
            createdAt: Date.now(),
            status: 'voting', // 'voting' | 'completed'
            categories: categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon
            })),
            votes: {},
            participants: {
                [generateUserId()]: {
                    name: participantName.trim(),
                    isHost: true,
                    joinedAt: Date.now()
                }
            }
        };

        set(newRoomRef, roomData)
            .then(() => {
                setRoomId(newRoomId);
                setIsHost(true);
                setShowNameInput(false);
                setError(null);
            })
            .catch((err) => {
                setError('투표방 생성 실패: ' + err.message);
            });
    };

    // 투표방 참가
    const joinRoom = () => {
        if (!participantName.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }

        const userId = generateUserId();
        const participantRef = ref(database, `rooms/${roomId}/participants/${userId}`);

        set(participantRef, {
            name: participantName.trim(),
            isHost: false,
            joinedAt: Date.now()
        })
            .then(() => {
                setShowNameInput(false);
                setError(null);
            })
            .catch((err) => {
                setError('참가 실패: ' + err.message);
            });
    };

    // 투표하기
    const vote = (categoryId) => {
        if (!roomId || !database) return;

        const userId = generateUserId();
        const voteRef = ref(database, `rooms/${roomId}/votes/${userId}`);

        set(voteRef, {
            categoryId,
            votedAt: Date.now()
        })
            .then(() => {
                setMyVote(categoryId);
            })
            .catch((err) => {
                setError('투표 실패: ' + err.message);
            });
    };

    // 투표 종료 및 결과 확정
    const completeVoting = () => {
        if (!roomId || !roomData) return;

        // 투표 집계
        const voteCounts = {};
        if (roomData.votes) {
            Object.values(roomData.votes).forEach(vote => {
                voteCounts[vote.categoryId] = (voteCounts[vote.categoryId] || 0) + 1;
            });
        }

        // 최다 득표 찾기
        let winner = null;
        let maxVotes = 0;
        Object.entries(voteCounts).forEach(([catId, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                winner = catId;
            }
        });

        if (winner) {
            const winnerCategory = categories.find(cat => cat.id === winner);
            if (winnerCategory) {
                // 투표방 상태 업데이트
                update(ref(database, `rooms/${roomId}`), { status: 'completed' })
                    .then(() => {
                        onComplete(winnerCategory);
                    })
                    .catch((err) => {
                        setError('종료 실패: ' + err.message);
                    });
            }
        } else {
            setError('아직 투표가 없습니다.');
        }
    };

    // 투표방 삭제
    const deleteRoom = () => {
        if (!roomId || !database) return;

        remove(ref(database, `rooms/${roomId}`))
            .then(() => {
                setRoomId(null);
                setRoomData(null);
                setIsHost(false);
                setShowNameInput(true);
            })
            .catch((err) => {
                setError('삭제 실패: ' + err.message);
            });
    };

    // 고유 사용자 ID 생성 (로컬 스토리지 활용)
    const generateUserId = () => {
        let userId = localStorage.getItem('groupVotingUserId');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('groupVotingUserId', userId);
        }
        return userId;
    };

    // 투표 결과 계산
    const getVoteResults = () => {
        if (!roomData || !roomData.votes) return [];

        const voteCounts = {};
        Object.values(roomData.votes).forEach(vote => {
            voteCounts[vote.categoryId] = (voteCounts[vote.categoryId] || 0) + 1;
        });

        return Object.entries(voteCounts)
            .map(([catId, count]) => {
                const category = roomData.categories.find(cat => cat.id === catId);
                return { category, count };
            })
            .sort((a, b) => b.count - a.count);
    };

    // 공유 URL 생성
    const getShareUrl = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?room=${roomId}`;
    };

    // URL 복사
    const copyUrl = () => {
        const url = getShareUrl();
        navigator.clipboard.writeText(url)
            .then(() => {
                alert('링크가 복사되었습니다!');
            })
            .catch(() => {
                alert('복사 실패. 수동으로 복사해주세요: ' + url);
            });
    };

    // 에러 표시
    if (error && !database) {
        return (
            <div className="voting-error">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <a
                    href="/FIREBASE_SETUP.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="error-link"
                >
                    Firebase 설정 가이드 보기 →
                </a>
            </div>
        );
    }

    // 이름 입력 화면
    if (showNameInput) {
        return (
            <div className="voting-container">
                <h2 className="voting-title">🗳️ 그룹 투표</h2>
                <p className="voting-description">
                    {roomId ? '투표방에 참가하려면 이름을 입력하세요' : '함께 메뉴를 정해봐요!'}
                </p>

                <div className="name-input-section">
                    <input
                        type="text"
                        className="name-input"
                        placeholder="이름을 입력하세요"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                roomId ? joinRoom() : createRoom();
                            }
                        }}
                        maxLength={20}
                    />
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="action-buttons">
                    {roomId ? (
                        <button className="btn btn-primary" onClick={joinRoom}>
                            참가하기
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={createRoom}>
                            투표방 만들기
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // 투표 진행 중
    const participants = roomData?.participants ? Object.values(roomData.participants) : [];
    const voteResults = getVoteResults();
    const totalVotes = roomData?.votes ? Object.keys(roomData.votes).length : 0;

    return (
        <div className="voting-container">
            <div className="voting-header">
                <h2 className="voting-title">🗳️ 그룹 투표</h2>
                <p className="voting-description">
                    방장: {roomData?.hostName} | 참가자: {participants.length}명 | 투표: {totalVotes}명
                </p>
            </div>

            {/* QR 코드 및 공유 링크 (방장만) */}
            {isHost && (
                <div className="share-section">
                    <h3>친구 초대하기</h3>
                    <div className="qr-container">
                        <QRCode value={getShareUrl()} size={200} />
                    </div>
                    <button className="btn btn-secondary" onClick={copyUrl}>
                        📋 링크 복사
                    </button>
                </div>
            )}

            {/* 투표 옵션 */}
            <div className="voting-options">
                <h3>메뉴를 선택하세요</h3>
                <div className="vote-grid">
                    {roomData?.categories.map((cat) => {
                        const voteCount = voteResults.find(v => v.category?.id === cat.id)?.count || 0;
                        const isMyVote = myVote === cat.id;

                        return (
                            <button
                                key={cat.id}
                                className={`vote-btn ${isMyVote ? 'selected' : ''}`}
                                onClick={() => vote(cat.id)}
                            >
                                <span className="icon">{cat.icon}</span>
                                <span className="name">{cat.name}</span>
                                {voteCount > 0 && (
                                    <span className="vote-count">{voteCount}표</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 투표 현황 */}
            {voteResults.length > 0 && (
                <div className="vote-results">
                    <h3>투표 현황</h3>
                    {voteResults.map((result, index) => (
                        <div key={result.category?.id || index} className="result-item">
                            <span className="rank">{index + 1}위</span>
                            <span className="category-info">
                                {result.category?.icon} {result.category?.name}
                            </span>
                            <span className="votes">{result.count}표</span>
                        </div>
                    ))}
                </div>
            )}

            {/* 참가자 목록 */}
            <div className="participants-list">
                <h3>참가자 ({participants.length}명)</h3>
                <div className="participants">
                    {participants.map((p, i) => (
                        <span key={i} className="participant">
                            {p.isHost && '👑 '}{p.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* 액션 버튼 */}
            <div className="action-buttons">
                {isHost ? (
                    <>
                        <button
                            className="btn btn-primary"
                            onClick={completeVoting}
                            disabled={totalVotes === 0}
                        >
                            투표 종료 및 결과 확정
                        </button>
                        <button className="btn btn-secondary" onClick={deleteRoom}>
                            투표방 삭제
                        </button>
                    </>
                ) : (
                    <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                        나가기
                    </button>
                )}
            </div>
        </div>
    );
}
