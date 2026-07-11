import { getCurrentAccount, ForbiddenError } from "./account";

export type SubscriptionTier = "free" | "basic" | "pro" | "premium";

export type FeatureKey = 
  | "contacts"
  | "inbox"
  | "automations"
  | "broadcasts"
  | "ai_assistant"
  | "analytics";

// Define which tiers have access to which features
const TIER_FEATURES: Record<SubscriptionTier, FeatureKey[]> = {
  free: ["contacts", "inbox"],
  basic: ["contacts", "inbox", "analytics"],
  pro: ["contacts", "inbox", "analytics", "automations", "broadcasts"],
  premium: ["contacts", "inbox", "analytics", "automations", "broadcasts", "ai_assistant"],
};

/**
 * Extracts the base tier from the subscription plan string.
 * Examples: "basic_monthly" -> "basic", "premium_yearly" -> "premium", "free" -> "free"
 */
export function getSubscriptionTier(plan: string | null | undefined): SubscriptionTier {
  if (!plan) return "free";
  const tier = plan.split("_")[0] as SubscriptionTier;
  return TIER_FEATURES[tier] ? tier : "free"; // fallback to free if invalid
}

/**
 * Checks if the current account has access to a specific feature based on their subscription tier.
 */
export function hasFeature(tier: SubscriptionTier, feature: FeatureKey): boolean {
  return TIER_FEATURES[tier].includes(feature);
}

/**
 * Validates that the current account has access to a specific feature.
 * Throws a ForbiddenError if the feature is not included in their tier.
 * Super admins always bypass this check.
 */
export async function requireFeature(feature: FeatureKey): Promise<void> {
  const ctx = await getCurrentAccount();
  
  if (ctx.isSuperAdmin) {
    return;
  }

  const tier = getSubscriptionTier(ctx.subscriptionPlan);

  if (!hasFeature(tier, feature)) {
    throw new ForbiddenError(`Feature '${feature}' is not available on your current plan (${tier.toUpperCase()}). Please upgrade your subscription.`);
  }
}
