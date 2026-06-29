import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

type ErrorBoundaryState = {
  error: Error | null;
  eventId: string | null;
  componentStack: string | null;
};

type ErrorBoundaryProps = {
  children: ReactNode;
};

class ErrorBoundaryComponent extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, eventId: null, componentStack: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    this.setState({
      error,
      eventId: Sentry.lastEventId() || null,
      componentStack: errorInfo.componentStack || null,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
          <section className="panel form-panel" style={{ maxWidth: '600px' }}>
            <div className="brand-mark small"><AlertCircle size={28} style={{ color: '#ef4444' }} /></div>
            <h1>Une erreur est survenue</h1>
            <p className="intro">Notre équipe a été notifiée du problème. Nous travaillons à le résoudre.</p>
            <p style={{ fontSize: '14px', marginTop: '20px', color: '#666' }}>
              Erreur: {this.state.error.message || 'Unknown error'}
            </p>
            <div className="home-actions">
              <button className="primary-action" onClick={() => window.location.href = '/'}><RefreshCw size={18} style={{ marginRight: '8px' }} /> Retourner à l'accueil</button>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Sentry.withProfiler(ErrorBoundaryComponent);
