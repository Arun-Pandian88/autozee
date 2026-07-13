/**
 * Feature flag utilities — PURE, CLIENT-SAFE module.
 *
 * This file has NO server-side imports (no next/headers, no account.ts).
 * It is safe to import from Client Components.
 *
 * The server-only `requireFeature()` function lives in account.ts
 * so the import chain stays clean.
 *
 * Plan tiers (as of migration 040):
 *   basic     — ₹499/mo  — 1 seat, 1 flow, no broadcast, basic automations
 *   pro       — ₹999/mo  — 3 seats, unlimited flows, broadcasts, drip automation
 *   premium   — ₹4,999/mo — 10 seats, unlimited + AI flows, AI reply, lead scoring
 *   trial     — 7 days, full pro feature access to evaluate the product
 */

export type SubscriptionTier = "trial" | "basic" | "pro" | "premium";

export type FeatureKey =
  | "inbox"
  | "contacts"
  | "pipelines"
  | "deals"
  | "broadcasts"
  | "automations"
  | "automations_drip"         // drip / follow-up automation (Pro+)
  | "automations_keyword_tag"  // keyword-based auto-tagging (Pro+)
  | "automations_ai"           // AI-trained auto-reply flows (Premium)
  | "ai_agents"
  | "ai_reply"
  | "api_access"
  | "webhooks"
  | "team_members"
  | "role_management"
  | "shared_inbox"
  | "flow_builder"
  | "reports"
  | "audit_logs"
  | "departments"
  | "white_label"
  | "custom_domain"
  | "multi_number_routing"     // multi-number bot routing (Premium)
  | "lead_scoring"             // lead scoring automation (Premium)
  | "click_to_whatsapp_ads";   // Click-to-WhatsApp Ads automation (Premium)

// ---------------------------------------------------------------------------
// Per-tier feature access
//
// Basic tier deliberately includes limited automation (business-hours
// auto-reply, welcome message, fixed FAQ) — "automation irukka?" is a
// first-call qualifying question. Upgrade pressure comes from the 1-flow
// cap and no broadcasts, not from zero automation.
// ---------------------------------------------------------------------------
const TIER_FEATURES: Record<SubscriptionTier, FeatureKey[]> = {
  basic: [
    "inbox",
    "contacts",
    "pipelines",
    "deals",
    // Basic automations: business-hours auto-reply, welcome msg, keyword-FAQ (≤10 Q&A)
    "automations",
    // Single chatbot flow (keyword-based) — enforced via limits.ts chatbot_flows cap
    "flow_builder",
    "reports",
  ],

  pro: [
    "inbox",
    "contacts",
    "pipelines",
    "deals",
    "automations",
    "automations_drip",
    "automations_keyword_tag",
    "broadcasts",
    "flow_builder",
    "api_access",
    "webhooks",
    "team_members",
    "role_management",
    "shared_inbox",
    "reports",
  ],

  premium: [
    "inbox",
    "contacts",
    "pipelines",
    "deals",
    "automations",
    "automations_drip",
    "automations_keyword_tag",
    "automations_ai",
    "broadcasts",
    "ai_agents",
    "ai_reply",
    "api_access",
    "webhooks",
    "team_members",
    "role_management",
    "shared_inbox",
    "flow_builder",
    "reports",
    "audit_logs",
    "departments",
    "multi_number_routing",
    "lead_scoring",
    "click_to_whatsapp_ads",
    "white_label",
    "custom_domain",
  ],

  // Trial = full premium access for 7 days so prospects can evaluate everything.
  trial: [
    "inbox",
    "contacts",
    "pipelines",
    "deals",
    "automations",
    "automations_drip",
    "automations_keyword_tag",
    "automations_ai",
    "broadcasts",
    "ai_agents",
    "ai_reply",
    "api_access",
    "webhooks",
    "team_members",
    "role_management",
    "shared_inbox",
    "flow_builder",
    "reports",
    "audit_logs",
    "departments",
    "multi_number_routing",
    "lead_scoring",
    "click_to_whatsapp_ads",
    "white_label",
    "custom_domain",
  ],
};

/**
 * Extracts the base tier from the subscription plan string.
 *
 * Examples:
 *   "basic_monthly"   → "basic"
 *   "pro_yearly"      → "pro"
 *   "premium_monthly" → "premium"
 *   "basic"           → "basic"
 *   null / undefined  → "trial"  (new accounts always start on trial)
 *
 * Legacy mappings (migration 040 migrates these in the DB, but JS guard
 * kept for any cached client state that hasn't refreshed yet):
 *   "free"     → "basic"
 *   "monthly"  → "pro"
 *   "yearly"   → "pro"
 *   "starter"  → "basic"   (old internal name)
 *   "growth"   → "pro"
 *   "professional" → "premium"
 */
export function getSubscriptionTier(
  plan: string | null | undefined
): SubscriptionTier {
  if (!plan) return "trial";

  const lower = plan.toLowerCase();

  // Canonical tier prefix match (most common path post-040)
  if (lower.startsWith("premium")) return "premium";
  if (lower.startsWith("pro"))     return "pro";
  if (lower.startsWith("basic"))   return "basic";

  // Legacy plan name aliases
  if (lower === "free" || lower === "starter")                    return "basic";
  if (lower === "monthly" || lower === "growth")                  return "pro";
  if (lower === "yearly" || lower === "professional")             return "premium";
  if (lower.includes("premium"))                                  return "premium";
  if (lower.includes("pro"))                                      return "pro";
  if (lower.includes("basic") || lower.includes("starter"))       return "basic";

  return "trial";
}

/**
 * Checks if a tier has access to a specific feature.
 */
export function hasFeature(tier: SubscriptionTier, feature: FeatureKey): boolean {
  return TIER_FEATURES[tier]?.includes(feature) ?? false;
}

/**
 * Checks if a specific feature is available for a given plan string.
 * Safe to call from Client Components (no server imports).
 */
export function isFeatureAvailableForPlan(
  plan: string | null | undefined,
  feature: FeatureKey
): boolean {
  const tier = getSubscriptionTier(plan);
  return hasFeature(tier, feature);
}

/**
 * Returns the minimum plan tier that unlocks a feature.
 * Useful for rendering upgrade prompts in the UI.
 */
export function getMinimumTierForFeature(feature: FeatureKey): SubscriptionTier {
  if (TIER_FEATURES.basic.includes(feature))   return "basic";
  if (TIER_FEATURES.pro.includes(feature))     return "pro";
  return "premium";
}

/**
 * Returns the human-readable plan name for an upgrade prompt.
 *
 * @deprecated Use `getMinimumTierForFeature` and format the name yourself.
 * Kept for backward-compat with existing call sites.
 */
export function getMinimumPlanForFeature(feature: FeatureKey): string {
  const tier = getMinimumTierForFeature(feature);
  return tier.charAt(0).toUpperCase() + tier.slice(1); // "Basic" | "Pro" | "Premium"
}

/**
 * Display name for a plan string, e.g. "pro_monthly" → "Pro (Monthly)".
 */
export function planDisplayName(plan: string | null | undefined): string {
  if (!plan) return "Trial";
  const tier = getSubscriptionTier(plan);
  const cycle = plan.includes("yearly") ? " (Yearly)" : plan.includes("monthly") ? " (Monthly)" : "";
  return tier.charAt(0).toUpperCase() + tier.slice(1) + cycle;
}
