import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TermsPage() {
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
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-tight">
                            Privacy
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 px-8 max-w-[900px] mx-auto pb-20 space-y-10">
                <header className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-[-0.03em] elite-kerning">Terms of Service</h1>
                    <p className="text-muted-foreground tracking-tight">Effective date: January 20, 2026</p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Acceptance</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        By accessing or using Vouch, you agree to these terms and our privacy policy.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Accounts</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        You are responsible for maintaining the confidentiality of your account credentials and all activity that
                        occurs under your account.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Subscriptions and Billing</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        Paid plans are billed in advance on a recurring basis. You may cancel at any time; access continues through
                        the end of the billing period.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Acceptable Use</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        You agree not to misuse the service, interfere with security, or upload unlawful content.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        Vouch retains all rights to the platform, and you retain rights to your content.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Disclaimer</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        The service is provided as-is without warranties of any kind to the fullest extent permitted by law.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Limitation of Liability</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        To the fullest extent permitted by law, Vouch will not be liable for indirect or consequential damages.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
                    <p className="text-muted-foreground leading-relaxed tracking-tight">
                        Questions about these terms can be sent to support@vouch.ai.
                    </p>
                </section>
            </main>
        </div>
    );
}
