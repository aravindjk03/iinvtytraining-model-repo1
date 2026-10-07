import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production or development, log safely to telemetry / console
    console.error('ErrorBoundary caught an unhandled component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-subtle">
          <div className="max-w-md w-full bg-white rounded-lg border border-surface-border p-6 shadow-card text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-semantic-danger flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-surface-foreground">
                Application Safety Boundary Triggered
              </h2>
              <p className="text-xs text-surface-foreground-muted leading-relaxed">
                The interface encountered an unexpected state. The application environment has preserved system integrity.
              </p>
            </div>

            <div className="p-3 bg-surface-muted rounded border border-surface-border text-left">
              <span className="text-[11px] font-mono text-surface-foreground-subtle uppercase block mb-1">
                Diagnostic summary
              </span>
              <p className="text-xs font-mono text-surface-foreground break-all">
                {this.state.error?.message || 'Component tree runtime exception'}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReset}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Return to Platform Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
