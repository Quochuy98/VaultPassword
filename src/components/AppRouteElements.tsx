import { useNavigate } from 'react-router-dom';
import type React from 'react';
import { LandingPage } from './LandingPage';
import { DashboardPage } from './DashboardPage';
import { SettingsPage } from './SettingsPage';
import type { MainTab } from './AppShell';

type DashboardRouteElementProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  userLabel: string;
  handleAddNew: () => void;
  vaultLoading: boolean;
  filteredItems: Parameters<typeof DashboardPage>[0]['filteredItems'];
  openEditModal: Parameters<typeof DashboardPage>[0]['openEditModal'];
  activeMenuId: string | null;
  setActiveMenuId: (value: string | null) => void;
  handleDeleteVaultItem: (id: string) => Promise<void>;
  handleCopy: (e: React.MouseEvent, value: string | undefined) => void;
  maskSecret: (value: string | undefined, maxDots?: number) => string;
};

type SettingsRouteElementProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  userLabel: string;
  handleAddNew: () => void;
  signOut: () => Promise<void>;
  pushNotify: (message: string, variant: 'copy' | 'success' | 'error') => void;
  vaultPassCurrent: string;
  setVaultPassCurrent: (value: string) => void;
  vaultPassNext: string;
  setVaultPassNext: (value: string) => void;
  vaultPassConfirm: string;
  setVaultPassConfirm: (value: string) => void;
  handleChangeVaultPassword: () => Promise<void>;
  changingVaultPass: boolean;
};

export function AboutRouteElement() {
  const navigate = useNavigate();
  return <LandingPage onStart={() => navigate('/login')} />;
}

export function DashboardRouteElement({
  searchQuery,
  setSearchQuery,
  userLabel,
  handleAddNew,
  vaultLoading,
  filteredItems,
  openEditModal,
  activeMenuId,
  setActiveMenuId,
  handleDeleteVaultItem,
  handleCopy,
  maskSecret,
}: DashboardRouteElementProps) {
  const navigate = useNavigate();
  const goTab = (tab: MainTab) => {
    navigate(tab === 'dashboard' ? '/dashboard' : '/settings');
  };

  return (
    <DashboardPage
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      userLabel={userLabel}
      handleAddNew={handleAddNew}
      goTab={goTab}
      onGoDashboard={() => navigate('/dashboard')}
      vaultLoading={vaultLoading}
      filteredItems={filteredItems}
      openEditModal={openEditModal}
      activeMenuId={activeMenuId}
      setActiveMenuId={setActiveMenuId}
      handleDeleteVaultItem={handleDeleteVaultItem}
      handleCopy={handleCopy}
      maskSecret={maskSecret}
    />
  );
}

export function SettingsRouteElement({
  searchQuery,
  setSearchQuery,
  userLabel,
  handleAddNew,
  signOut,
  pushNotify,
  vaultPassCurrent,
  setVaultPassCurrent,
  vaultPassNext,
  setVaultPassNext,
  vaultPassConfirm,
  setVaultPassConfirm,
  handleChangeVaultPassword,
  changingVaultPass,
}: SettingsRouteElementProps) {
  const navigate = useNavigate();
  const goTab = (tab: MainTab) => {
    navigate(tab === 'dashboard' ? '/dashboard' : '/settings');
  };

  return (
    <SettingsPage
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      userLabel={userLabel}
      goTab={goTab}
      handleAddNew={handleAddNew}
      onGoDashboard={() => navigate('/dashboard')}
      signOut={signOut}
      pushNotify={pushNotify}
      onAfterSignOut={() => navigate('/login', { replace: true })}
      vaultPassCurrent={vaultPassCurrent}
      setVaultPassCurrent={setVaultPassCurrent}
      vaultPassNext={vaultPassNext}
      setVaultPassNext={setVaultPassNext}
      vaultPassConfirm={vaultPassConfirm}
      setVaultPassConfirm={setVaultPassConfirm}
      handleChangeVaultPassword={handleChangeVaultPassword}
      changingVaultPass={changingVaultPass}
    />
  );
}
