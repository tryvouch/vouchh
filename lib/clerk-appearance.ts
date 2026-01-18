/**
 * Elite Clerk Appearance Configuration
 * Studio Elite design system - sharp edges, mathematical spacing
 */
export const clerkAppearance = {
    variables: {
        colorBackground: "hsl(var(--background))",
        colorInputBackground: "hsl(var(--card))",
        colorDanger: "hsl(var(--destructive))",
        colorText: "hsl(var(--foreground))",
        colorTextSecondary: "hsl(var(--muted-foreground))",
        colorInputText: "hsl(var(--foreground))",
        colorPrimary: "hsl(var(--foreground))",
        colorTextOnPrimaryBackground: "hsl(var(--background))",
        borderRadius: "0px", // Sharp edges - Studio Elite
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    },
    elements: {
        rootBox: "mx-auto",
        card: "glass-panel shadow-xl",
        headerTitle: "font-bold tracking-[-0.02em] elite-kerning text-foreground",
        headerSubtitle: "text-muted-foreground tracking-tight",
        socialButtonsBlockButton: "border-border bg-card hover:bg-accent text-foreground transition-colors tracking-tight",
        socialButtonsBlockButtonText: "text-foreground font-medium tracking-tight",
        dividerLine: "bg-border",
        dividerText: "text-muted-foreground text-xs tracking-tight",
        formFieldLabel: "text-muted-foreground text-sm tracking-tight",
        formFieldInput: "bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-foreground/20 focus:ring-0 focus:ring-offset-0 tracking-tight",
        formButtonPrimary: "bg-foreground text-background hover:opacity-90 font-medium transition-opacity tracking-tight",
        footerActionLink: "text-muted-foreground hover:text-foreground transition-colors tracking-tight",
        footerActionText: "text-muted-foreground tracking-tight",
        identityPreviewText: "text-foreground tracking-tight",
        identityPreviewEditButton: "text-muted-foreground hover:text-foreground tracking-tight",
        formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
        otpCodeFieldInput: "bg-card border-border text-foreground tracking-tight",
        formResendCodeLink: "text-muted-foreground hover:text-foreground tracking-tight",
    },
};
