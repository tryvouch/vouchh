import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Vouch | Automate Trust. Scale Conversion.",
    description: "The AI-native social proof platform for professional businesses.",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`}>
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
