'use client';

import { useMemo, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { SettingsRail } from '@/components/settings/settings-rail';
import { SettingsOverview } from '@/components/settings/settings-overview';
import { ProfileForm } from '@/components/settings/profile-form';
import { SecurityPanel } from '@/components/settings/security-panel';
import { AppearancePanel } from '@/components/settings/appearance-panel';
import { WhatsAppConfig } from '@/components/settings/whatsapp-config';
import { TemplateManager } from '@/components/settings/template-manager';
import { QuickRepliesManager } from '@/components/settings/quick-replies-manager';
import { FieldsAndTagsPanel } from '@/components/settings/fields-and-tags-panel';
import { DealsSettings } from '@/components/settings/deals-settings';
import { MembersTab } from '@/components/settings/members-tab';
import { ApiKeysSettings } from '@/components/settings/api-keys-settings';
import {
  resolveSection,
  type SettingsSection,
} from '@/components/settings/settings-sections';
import {
  isFeatureAvailableForPlan,
  getMinimumPlanForFeature,
  type FeatureKey,
} from '@/lib/auth/features';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const SECTION_FEATURES: Partial<Record<SettingsSection, FeatureKey>> = {
  members: 'team_members',
  api: 'api_access',
};

function LockedPanel({ featureName, requiredPlan }: { featureName: string; requiredPlan: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 mb-4">
        <Lock className="h-6 w-6 text-orange-500" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Upgrade Required</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {featureName} is available only in the {requiredPlan} Plan. Upgrade now to restore access and continue growing.
      </p>
      <Link href="/billing" className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
        Upgrade Now
      </Link>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { defaultCurrency, subscriptionPlan } = useAuth();
  const { mode } = useTheme();
  const t = useTranslations('Settings');
  
  // The URL (`?tab=`) is the single source of truth for the active
  // section — deep-linkable, and it keeps the existing links in the
  // app sidebar/header working. Legacy tab values (tags, custom-fields)
  // resolve onto their new home; unknown/empty → the Overview landing.
  const section = resolveSection(searchParams.get('tab'));

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [upgradeRequiredPlan, setUpgradeRequiredPlan] = useState('');

  const isTabLocked = (tab: SettingsSection) => {
    const feature = SECTION_FEATURES[tab];
    return feature ? !isFeatureAvailableForPlan(subscriptionPlan, feature) : false;
  };

  const go = (next: SettingsSection) => {
    if (isTabLocked(next)) {
      const feature = SECTION_FEATURES[next]!;
      const required = getMinimumPlanForFeature(feature);
      setUpgradeFeature(t(`sections.${next}` as any));
      setUpgradeRequiredPlan(required);
      setUpgradeOpen(true);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    router.replace(`/settings?${params.toString()}`, { scroll: false });
  };

  // Cheap, fetch-free rail hints. The Overview landing carries the
  // full live status/counts; the rail just surfaces the two that are
  // already in context.
  const hints: Partial<Record<SettingsSection, ReactNode>> = useMemo(
    () => ({
      appearance: mode.charAt(0).toUpperCase() + mode.slice(1),
      deals: defaultCurrency,
    }),
    [mode, defaultCurrency],
  );

  const isCurrentSectionLocked = isTabLocked(section);

  const panel: Record<SettingsSection, ReactNode> = {
    overview: <SettingsOverview onSelect={go} />,
    profile: <ProfileForm />,
    security: <SecurityPanel />,
    appearance: <AppearancePanel />,
    whatsapp: <WhatsAppConfig />,
    templates: <TemplateManager />,
    'quick-replies': <QuickRepliesManager />,
    fields: <FieldsAndTagsPanel />,
    deals: <DealsSettings />,
    members: isCurrentSectionLocked ? (
      <LockedPanel
        featureName={t('sections.members')}
        requiredPlan={getMinimumPlanForFeature(SECTION_FEATURES.members!)}
      />
    ) : (
      <MembersTab />
    ),
    api: isCurrentSectionLocked ? (
      <LockedPanel
        featureName={t('sections.api')}
        requiredPlan={getMinimumPlanForFeature(SECTION_FEATURES.api!)}
      />
    ) : (
      <ApiKeysSettings />
    ),
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('pageTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('pageDesc')}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[236px_minmax(0,1fr)] lg:items-start">
        <SettingsRail active={section} onSelect={go} hints={hints} />
        <div className="min-w-0">{panel[section]}</div>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        featureName={upgradeFeature}
        requiredPlan={upgradeRequiredPlan}
      />
    </div>
  );
}
