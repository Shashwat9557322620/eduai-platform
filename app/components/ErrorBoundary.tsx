'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="relative max-w-lg w-full">
            {/* Glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-red-500/10 to-red-500/20 rounded-3xl blur-xl opacity-50" />

            <div className="relative bg-[#07070a] border border-red-500/20 rounded-3xl p-8 md:p-10 text-center">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-xs font-mono text-red-400 uppercase tracking-wider">System Error</span>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              {/* Message */}
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-400 mb-2 leading-relaxed">
                An unexpected error occurred. The system encountered a problem while processing your request.
              </p>

              {/* Error details */}
              {this.state.error && (
                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 text-left">
                  <p className="text-[11px] font-mono text-red-400/80 break-all">
                    {this.state.error.message || "Unknown error"}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
