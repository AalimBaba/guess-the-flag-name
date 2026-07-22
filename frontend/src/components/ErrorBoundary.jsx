import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <main className="page-shell max-w-3xl py-6">
          <div className="atlas-error min-w-0 rounded-sm p-4 sm:p-6" role="alert">
            <h1 className="allow-wrap mb-2 text-xl font-bold">Something went wrong.</h1>
            <pre className="max-h-[50dvh] max-w-full overflow-auto whitespace-pre-wrap break-words text-xs sm:text-sm">
              {String(this.state.error)}
            </pre>
            <button
              type="button"
              className="atlas-secondary mt-4 w-full rounded-sm px-4 py-2 font-mono text-xs uppercase tracking-widest sm:w-auto"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
