import React, { Component } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // Call the onError callback if provided
        this.props.onError?.(error, errorInfo);

        // Log to external service in production
        if (import.meta.env.PROD) {
            // Example: log to external service
            // logErrorToService(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">Something went wrong</CardTitle>
                            <CardDescription>
                                We're sorry, but something unexpected happened. Please try again.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {import.meta.env.DEV && this.state.error && (
                                <div className="rounded-md bg-muted p-4">
                                    <h4 className="font-semibold text-sm mb-2">Error Details:</h4>
                                    <pre className="text-xs text-muted-foreground overflow-auto">
                                        {this.state.error.message}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <pre className="text-xs text-muted-foreground overflow-auto mt-2">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button onClick={this.handleRetry} className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
    return (error, errorInfo) => {
        console.error('Error caught by useErrorHandler:', error, errorInfo);

        // You can add additional error handling logic here
        // such as sending to an error reporting service

        if (import.meta.env.PROD) {
            // Example: send to error reporting service
            // reportError(error, errorInfo);
        }
    };
}