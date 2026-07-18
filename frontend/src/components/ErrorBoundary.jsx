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
        <div className="atlas-error m-6 rounded-sm p-6">
          <h2 className="mb-2 text-xl font-bold">Something went wrong.</h2>
          <pre className="overflow-auto text-sm">{String(this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
