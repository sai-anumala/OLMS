import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // You can also log to an external service here
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
        >
          <div className="card shadow-sm p-5 text-center" style={{ maxWidth: "500px" }}>
            <h2 className="text-danger mb-3">Oops! Something went wrong</h2>
            <p className="text-muted mb-4">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="text-start mb-3">
                <small className="text-muted">Error details (for developers):</small>
                <pre className="bg-light border p-3 mt-2 rounded text-wrap" style={{ fontSize: "0.8rem" }}>
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
