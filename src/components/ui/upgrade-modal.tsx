"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  requiredPlan?: string;
}

export function UpgradeModal({ open, onOpenChange, featureName = "This feature", requiredPlan = "Growth" }: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push("/billing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            Upgrade Required
          </DialogTitle>
          <DialogDescription className="pt-4 text-base">
            {featureName} is available only in the <span className="font-semibold text-foreground">{requiredPlan} Plan</span>.
            Upgrade your subscription to unlock this capability and continue growing your business.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button onClick={handleUpgrade} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
