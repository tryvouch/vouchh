import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/90 backdrop-blur-[20px]">
                <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo className="w-7 h-7" />
                        <span className="font-bold text-xl tracking-[-0.02em] elite-kerning">Vouch</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-tight">
                            Terms
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 px-8 max-w-[900px] mx-auto pb-20 space-y-10">
                <header className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-[-0.03em] elite-kerning">Privacy Policy</h1>
                    <p className="text-muted-foreground tracking-tight">Effective date: January 20, 2026</p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Summary</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        This policy explains what data Vouch collects, how it is used, and the choices you have. It covers both
                        the Vouch application and embedded widgets.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Data We Collect</h2>
                    <ul className="space-y-3 text-muted-foreground tracking-tight">
                        <li>Account data such as name, email, and authentication identifiers.</li>
                        <li>Subscription and billing data associated with paid plans.</li>
                        <li>Review content and metadata you connect to Vouch.</li>
                        <li>Usage analytics such as views, clicks, and conversions for widgets.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">How We Use Data</h2>
                    <ul className="space-y-3 text-muted-foreground tracking-tight">
                        <li>Provide, operate, and improve the Vouch platform.</li>
                        <li>Deliver analytics and reputation insights.</li>
                        <li>Process subscriptions, billing, and service access.</li>
                        <li>Maintain security, prevent fraud, and enforce policies.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Data Sharing</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        We share data with service providers for authentication, hosting, analytics, and payments. We do not sell
                        personal data.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Retention</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        We retain data for as long as necessary to provide the service, comply with legal obligations, and resolve
                        disputes. You can request deletion at any time.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Your Rights</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        You can access, update, or delete your information by contacting us. Additional rights may apply depending
                        on your jurisdiction.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        For privacy requests, contact support@vouch.ai.
                    </p>
                </section>
            </main>
        </div>
    );
}
