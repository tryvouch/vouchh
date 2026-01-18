import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function Page() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
            {/* Elite Logo */}
            <Link href="/" className="relative z-10 flex items-center gap-3 mb-12 group">
                <Logo className="w-8 h-8" />
                <span className="font-bold text-2xl tracking-[-0.02em] elite-kerning">Vouch</span>
            </Link>

            {/* Sign In Component */}
            <div className="relative z-10 w-full max-w-md">
                <SignIn
                    appearance={clerkAppearance}
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                />
            </div>
        </div>
    );
}
