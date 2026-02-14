import { useEffect, useRef, useState } from 'react';
import './KakaoMap.css';

export default function KakaoMap({ category }) {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 카카오 지도 SDK 로드 및 초기화
    useEffect(() => {
        const kakaoKey = import.meta.env.VITE_KAKAO_APP_KEY;

        if (!kakaoKey || kakaoKey === '여기에_발급받은_JavaScript_키를_입력하세요') {
            setError('카카오 API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
            setLoading(false);
            return;
        }

        // 카카오 지도 SDK가 이미 로드되어 있는지 확인
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                initializeMap();
            });
        } else {
            // SDK 동적 로드
            const script = document.createElement('script');
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services,clusterer&autoload=false`;
            script.async = true;
            script.onload = () => {
                window.kakao.maps.load(() => {
                    initializeMap();
                });
            };
            script.onerror = () => {
                setError('카카오 지도 SDK를 불러올 수 없습니다. API 키를 확인해주세요.');
                setLoading(false);
            };
            document.head.appendChild(script);
        }
    }, []);

    // 지도 초기화
    function initializeMap() {
        try {
            const container = mapContainer.current;
            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 기본 위치
                level: 3 // 확대 레벨
            };

            const kakaoMap = new window.kakao.maps.Map(container, options);
            setMap(kakaoMap);

            // 사용자 현재 위치 가져오기
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        const locPosition = new window.kakao.maps.LatLng(lat, lng);

                        kakaoMap.setCenter(locPosition);
                        searchPlaces(kakaoMap, lat, lng);
                    },
                    (error) => {
                        console.warn('위치 정보를 가져올 수 없습니다:', error);
                        // 기본 위치(서울 시청)에서 검색
                        searchPlaces(kakaoMap, 37.5665, 126.9780);
                    }
                );
            } else {
                // Geolocation을 지원하지 않는 경우
                searchPlaces(kakaoMap, 37.5665, 126.9780);
            }
        } catch (err) {
            setError('지도를 초기화하는 중 오류가 발생했습니다.');
            console.error(err);
        }
    }

    // 주변 음식점 검색
    const searchPlaces = (kakaoMap, lat, lng) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
            setError('카카오 지도 서비스를 불러올 수 없습니다.');
            setLoading(false);
            return;
        }

        const ps = new window.kakao.maps.services.Places();

        // 카테고리 이름으로 키워드 검색
        const keyword = `${category.name} 맛집`;

        const callback = (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setPlaces(result);
                displayPlaces(kakaoMap, result);
                setLoading(false);
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                setError('검색 결과가 없습니다. 다른 지역에서 시도해보세요.');
                setLoading(false);
            } else {
                setError('검색 중 오류가 발생했습니다.');
                setLoading(false);
            }
        };

        // 현재 위치 기준 반경 1km 내 검색
        const options = {
            location: new window.kakao.maps.LatLng(lat, lng),
            radius: 1000, // 1km
            sort: window.kakao.maps.services.SortBy.DISTANCE
        };

        ps.keywordSearch(keyword, callback, options);
    };

    // 검색 결과를 지도에 표시
    const displayPlaces = (kakaoMap, places) => {
        const bounds = new window.kakao.maps.LatLngBounds();

        places.forEach((place, index) => {
            const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);

            // 마커 생성
            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                map: kakaoMap
            });

            // 인포윈도우 생성
            const infowindow = new window.kakao.maps.InfoWindow({
                content: `
                    <div style="padding:8px 12px; font-size:13px; min-width:150px;">
                        <strong style="display:block; margin-bottom:4px;">${place.place_name}</strong>
                        <span style="color:#666; font-size:11px;">${place.distance}m</span>
                    </div>
                `
            });

            // 마커 클릭 이벤트
            window.kakao.maps.event.addListener(marker, 'click', () => {
                infowindow.open(kakaoMap, marker);
            });

            // 처음 5개는 인포윈도우 자동 표시
            if (index < 5) {
                infowindow.open(kakaoMap, marker);
            }

            bounds.extend(markerPosition);
        });

        // 검색된 장소를 모두 포함하도록 지도 범위 재설정
        kakaoMap.setBounds(bounds);
    };

    // 장소 클릭 시 상세 정보 표시
    const handlePlaceClick = (place) => {
        if (map) {
            const position = new window.kakao.maps.LatLng(place.y, place.x);
            map.setCenter(position);
            map.setLevel(2); // 확대
        }
    };

    // 카카오맵으로 길찾기
    const openKakaoMap = (place) => {
        window.open(`https://map.kakao.com/link/to/${place.place_name},${place.y},${place.x}`, '_blank');
    };

    if (error) {
        return (
            <div className="kakao-map-error">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                {error.includes('API 키') && (
                    <a
                        href="https://developers.kakao.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="error-link"
                    >
                        카카오 개발자 사이트에서 키 발급받기 →
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="kakao-map-container">
            <div className="map-header">
                <h3>🗺️ 주변 {category.icon} {category.name} 맛집</h3>
                <p>거리순으로 가까운 곳부터 보여드려요</p>
            </div>

            {loading && (
                <div className="map-loading">
                    <div className="loading-spinner"></div>
                    <p>주변 맛집을 찾는 중...</p>
                </div>
            )}

            <div
                ref={mapContainer}
                className="map-canvas"
                style={{ display: loading ? 'none' : 'block' }}
            />

            {places.length > 0 && (
                <div className="places-list">
                    <h4>검색 결과 ({places.length}개)</h4>
                    {places.slice(0, 10).map((place, index) => (
                        <div
                            key={index}
                            className="place-item"
                            onClick={() => handlePlaceClick(place)}
                        >
                            <div className="place-info">
                                <div className="place-rank">{index + 1}</div>
                                <div className="place-details">
                                    <strong className="place-name">{place.place_name}</strong>
                                    <p className="place-address">{place.road_address_name || place.address_name}</p>
                                    {place.phone && (
                                        <a
                                            href={`tel:${place.phone}`}
                                            className="place-phone"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            📞 {place.phone}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="place-actions">
                                <span className="place-distance">{place.distance}m</span>
                                <button
                                    className="btn-directions"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openKakaoMap(place);
                                    }}
                                >
                                    길찾기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
