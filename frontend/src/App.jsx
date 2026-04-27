import { Component } from "react";
import Dashboard from "./pages/Dashboard";
import { QueryErrorResetBoundary } from "@tanstack/react-query";

class ErrorBoundary extends Component {
constructor(props) {
super(props);
this.state = { hasError: false, error: null };
}

static getDerivedStateFromError(error) {
return { hasError: true, error };
}

resetErrorBoundary = () => {
this.setState({ hasError: false, error: null });
};

render() {
if (this.state.hasError) {
return (
<div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
<div className="animate-fade-in max-w-md rounded-xl border border-red-100 bg-white p-8 text-center shadow-sm">
<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
<svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
</svg>
</div>
<h1 className="mb-2 text-lg font-semibold text-gray-900">
Algo deu errado
</h1>
<p className="mb-6 text-sm text-gray-500">
Ocorreu um erro inesperado ao renderizar o dashboard.
Tente recarregar a página.
</p>
<button
onClick={this.props.resetErrorBoundary ?? (() => window.location.reload())}
className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
>
Recarregar
</button>
</div>
</div>
);
}

return this.props.children;
}
}

export default function App() {
return (
<QueryErrorResetBoundary>
{({ reset }) => (
<ErrorBoundary resetErrorBoundary={reset}>
<Dashboard />
</ErrorBoundary>
)}
</QueryErrorResetBoundary>
);
}
