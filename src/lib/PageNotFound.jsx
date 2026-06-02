import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-light text-muted-foreground/30">404</h1>
                        <div className="h-0.5 w-16 bg-border mx-auto"></div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-foreground font-display">
                            Forge not found
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            The page <span className="font-medium text-foreground">&ldquo;{pageName}&rdquo;</span> doesn't exist in this forge.
                        </p>
                    </div>
                    <div className="pt-4">
                        <a
                            href="/"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border/40 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                            ← Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
