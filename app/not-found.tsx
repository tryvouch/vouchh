import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-8">
            <div className="max-w-md text-center space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
                <p className="text-muted-foreground tracking-tight">
                    The page you’re looking for doesn’t exist or has been moved.
                </p>
                <Link href="/" className="inline-block font-medium bg-foreground text-background px-6 py-3">
                    Go to Home
                </Link>
            </div>
        </main>
    );
}
