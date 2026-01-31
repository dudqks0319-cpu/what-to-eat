import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    background: '#FFF3CD',
                    border: '2px solid #FFC107',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</p>
                    <p style={{ fontSize: '14px', color: '#856404' }}>
                        {this.props.fallbackMessage || '일시적인 오류가 발생했습니다.'}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
