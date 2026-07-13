import { getCurrentAccount, ForbiddenError } from "./account";
import { getSubscriptionTier, SubscriptionTier } from "./features";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Plan limits per spec (migration 040 plan names: basic / pro / premium)
// ---------------------------------------------------------------------------

export interface PlanLimits {
  /** Max team member seats (profiles in the account). */
  users: number;
  /** Max connected WhatsApp numbers. */
  whatsappNumbers: number;
  /** Max stored contacts. */
  contacts: number;
  /** Max chatbot flows (chatbot_flows = 1 on Basic; unlimited on Pro/Premium). */
  chatbot_flows: number;
  /**
   * Max broadcast messages per calendar month.
   * 0 = broadcasts are entirely blocked on this tier (Basic).
   * UNLIMITED = no cap enforced.
   */
  broadcast_messages_per_month: number;
  storageGb: number;
}

const UNLIMITED = 999_999_999;

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  /**
   * Trial — 7-day full-access window; limits are effectively unlimited
   * so prospects can evaluate every feature without hitting artificial caps.
   */
  trial: {
    users: UNLIMITED,
    whatsappNumbers: UNLIMITED,
    contacts: UNLIMITED,
    chatbot_flows: UNLIMITED,
    broadcast_messages_per_month: UNLIMITED,
    storageGb: UNLIMITED,
  },

  /**
   * Basic — ₹499/mo
   * Automation-in: 1 keyword flow, business-hours auto-reply, welcome msg, FAQ.
   * Hard upsell triggers: >1 flow, any broadcast, drip automation.
   */
  basic: {
    users: 1,
    whatsappNumbers: 1,
    contacts: UNLIMITED,       // unlimited contacts per spec
    chatbot_flows: 1,          // THE key upsell limit for Basic
    broadcast_messages_per_month: 0,  // 0 = broadcasts blocked entirely
    storageGb: 5,
  },

  /**
   * Pro — ₹999/mo
   * Drip automation, unlimited flows, broadcasts (10,000 msgs/mo), 3 seats.
   */
  pro: {
    users: 3,
    whatsappNumbers: 3,
    contacts: 5_000,
    chatbot_flows: UNLIMITED,
    broadcast_messages_per_month: 10_000,
    storageGb: 50,
  },

  /**
   * Premium — ₹4,999/mo
   * AI flows, lead scoring, multi-number routing, 40,000 broadcast msgs/mo.
   */
  premium: {
    users: 10,
    whatsappNumbers: UNLIMITED,
    contacts: 20_000,
    chatbot_flows: UNLIMITED,
    broadcast_messages_per_month: 40_000,
    storageGb: UNLIMITED,
  },
};

export type LimitKey = keyof PlanLimits;

// ---------------------------------------------------------------------------
// Upgrade prompt messages — shown in the UI alongside the 403 response.
// ---------------------------------------------------------------------------

const UPGRADE_MESSAGES: Partial<Record<LimitKey, string>> = {
  chatbot_flows:
    "Your Basic plan includes 1 chatbot flow. Upgrade to Pro to create unlimited multi-step flows.",
  broadcast_messages_per_month:
    "Broadcasts are not available on the Basic plan. Upgrade to Pro to send up to 10,000 messages/month.",
  users:
    "You've reached the team seat limit for your plan. Upgrade to add more team members.",
  contacts:
    "You've reached the contact limit for your plan. Upgrade to store more contacts.",
};

// ---------------------------------------------------------------------------
// requireLimit()
//
// Validates that the account has not reached a resource limit.
// Super admins bypass all limits.
// Throws ForbiddenError with upgrade: true when the limit is hit.
// ---------------------------------------------------------------------------

export class PlanLimitError extends ForbiddenError {
  readonly upgrade = true as const;
  readonly limitKey: LimitKey;
  constructor(limitKey: LimitKey, message: string) {
    super(message);
    this.name = "PlanLimitError";
    this.limitKey = limitKey;
  }
}

export async function requireLimit(limitKey: LimitKey): Promise<void> {
  const ctx = await getCurrentAccount();

  if (ctx.isSuperAdmin) return;

  const tier = getSubscriptionTier(ctx.subscriptionPlan);
  const limit = PLAN_LIMITS[tier][limitKey];

  // 0 means the feature is blocked entirely for this tier (e.g. broadcasts on Basic)
  if (limit === 0) {
    throw new PlanLimitError(
      limitKey,
      UPGRADE_MESSAGES[limitKey] ??
        `This feature is not available on your current plan. Please upgrade.`
    );
  }

  if (limit === UNLIMITED) return;

  const supabase = await createClient();
  let currentUsage = 0;

  if (limitKey === "users") {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("account_id", ctx.accountId);
    if (!error) currentUsage = count ?? 0;
  } else if (limitKey === "whatsappNumbers") {
    const { count, error } = await supabase
      .from("whatsapp_config")
      .select("*", { count: "exact", head: true })
      .eq("account_id", ctx.accountId);
    if (!error) currentUsage = count ?? 0;
  } else if (limitKey === "contacts") {
    const { count, error } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("account_id", ctx.accountId);
    if (!error) currentUsage = count ?? 0;
  } else if (limitKey === "chatbot_flows") {
    const { count, error } = await supabase
      .from("flows")
      .select("*", { count: "exact", head: true })
      .eq("account_id", ctx.accountId);
    if (!error) currentUsage = count ?? 0;
  } else if (limitKey === "broadcast_messages_per_month") {
    // Count broadcast_recipients sent in the current calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from("broadcast_recipients")
      .select("broadcasts!inner(account_id)", { count: "exact", head: true })
      .eq("broadcasts.account_id", ctx.accountId)
      .in("status", ["sent", "delivered", "read", "replied"])
      .gte("sent_at", startOfMonth.toISOString());
    if (!error) currentUsage = count ?? 0;
  } else if (limitKey === "storageGb") {
    // Placeholder — requires storage bucket size API
    currentUsage = 0;
  }

  if (currentUsage >= limit) {
    throw new PlanLimitError(
      limitKey,
      UPGRADE_MESSAGES[limitKey] ??
        `You have reached the limit for ${limitKey} (${limit}) on your current plan. Please upgrade.`
    );
  }
}

/**
 * Returns remaining quota for a limit key without throwing.
 * Returns null if the limit is UNLIMITED.
 * Returns 0 if the feature is blocked (broadcast on Basic).
 */
export async function getRemainingQuota(
  limitKey: LimitKey
): Promise<{ limit: number; used: number; remaining: number } | null> {
  try {
    const ctx = await getCurrentAccount();
    if (ctx.isSuperAdmin) return null;

    const tier = getSubscriptionTier(ctx.subscriptionPlan);
    const limit = PLAN_LIMITS[tier][limitKey];
    if (limit === UNLIMITED) return null;

    // Run requireLimit just to reuse the counting logic — catch PlanLimitError
    // but we actually need the count, so we duplicate the counting here.
    const supabase = await createClient();
    let used = 0;

    if (limitKey === "chatbot_flows") {
      const { count } = await supabase
        .from("flows")
        .select("*", { count: "exact", head: true })
        .eq("account_id", ctx.accountId);
      used = count ?? 0;
    } else if (limitKey === "users") {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("account_id", ctx.accountId);
      used = count ?? 0;
    }

    return { limit, used, remaining: Math.max(0, limit - used) };
  } catch {
    return null;
  }
}
