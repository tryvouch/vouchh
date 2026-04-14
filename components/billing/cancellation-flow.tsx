"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";

export function CancellationFlow() {
    const [isOpen, setIsOpen] = useState(false);
    const hibernate = useMutation(api.billing.hibernateSubscription);
    const [isLoading, setIsLoading] = useState(false);

    const handleHibernate = async () => {
        setIsLoading(true);
        try {
            await hibernate({});
            toast.success("Account hibernated. Your data is safe.");
            setIsOpen(false);
        } catch {
            toast.error("Failed to hibernate account.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">Cancel Subscription</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-panel border-red-500/10">
                <DialogHeader>
                    <div className="mx-auto bg-red-100 p-3 rounded-full mb-4 w-fit">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-2xl elite-kerning">Wait, don&apos;t lose your data</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Cancelling will permanently delete your reputation data, widgets, and analytics history.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4 my-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-md">
                            <Lock className="h-4 w-4 text-amber-700" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-amber-900 text-sm">Hibernation Plan ($5/mo)</h4>
                            <p className="text-xs text-amber-700/80 mt-1">
                                Lock your data securely. Reactivate anytime to restore your widgets instantly.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button 
                        onClick={handleHibernate} 
                        className="w-full bg-[#FEF9F0] text-[#0A0A0B] border border-[#0A0A0B]/10 hover:bg-[#FEF9F0]/90"
                        disabled={isLoading}
                    >
                        Hibernate Account ($5/mo)
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="w-full text-muted-foreground hover:text-red-600"
                        onClick={() => {
                            toast.info("Please contact tryvouchapp@gmail.com to permanently delete your account.");
                            setIsOpen(false);
                        }}
                    >
                        I still want to delete everything
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
