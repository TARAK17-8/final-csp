// ═══════════════════════════════════════════════════════════════
// samaramAI — Global Error Boundary
// Catches React render errors and shows a recovery UI instead
// of a blank white screen.
// ═══════════════════════════════════════════════════════════════

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'var(--color-midnight, #0f0d23)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '420px',
            textAlign: 'center',
            color: 'white',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(185,28,28,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '1px solid rgba(185,28,28,0.3)',
            }}>
              <AlertTriangle size={28} color="#EF4444" />
            </div>

            <h2 style={{
              fontSize: '1.25rem', fontWeight: 700,
              marginBottom: '0.75rem',
              fontFamily: 'var(--font-display, sans-serif)',
            }}>
              Something went wrong
            </h2>

            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}>
              An unexpected error occurred. You can try again or go back to the home page.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#EF4444',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '120px',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: 'var(--color-teal-500, #0d9488)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
              >
                <RotateCcw size={16} /> Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
