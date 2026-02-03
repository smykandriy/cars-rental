import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Alert } from './ui/Alert'
import { Button } from './ui/Button'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: ''
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI Error', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <Alert tone="danger" title="Something went wrong">
            <p>{this.state.message}</p>
            <Button variant="ghost" onClick={this.handleReset}>
              Try again
            </Button>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
