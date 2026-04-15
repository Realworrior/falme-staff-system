import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ff4444', backgroundColor: '#05050D', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '24px', marginBottom: '1rem' }}>Application Error</h1>
          <p style={{ marginBottom: '1rem' }}>Something went wrong while rendering this page.</p>
          <pre style={{ background: '#111', padding: '1rem', borderRadius: '8px', maxWidth: '80vw', overflowX: 'auto', fontSize: '12px', color: '#ccc' }}>
            {this.state.error?.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </pre>
          <button 
            style={{ marginTop: '1rem', padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
