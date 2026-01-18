import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
    title: "Vouch | Automate Trust. Scale Conversion.",
    description: "The AI-native social proof platform for professional businesses.",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body className="min-h-screen bg-background text-foreground antialiased font-sans selection:bg-black/10 dark:selection:bg-white/20">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <ConvexClientProvider>
                        {children}
                    </ConvexClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
