import React, { useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VaultGate } from './components/VaultGate';
import { LoginScreen, TwoFactorScreen } from './components/AuthScreens';
import {
  AboutRouteElement,
  DashboardRouteElement,
  SettingsRouteElement,
} from './components/AppRouteElements';
import { VaultItemModal } from './components/VaultItemModal';
import { ToastNotice } from './components/ToastNotice';
import { useAuth } from './context/AuthContext';
import { rotateVaultPassword } from './lib/vaultPasswordRotation';
import { useVaultItems } from './hooks/useVaultItems';
import { useVaultPageState } from './hooks/useVaultPageState';

function maskSecret(value: string | undefined, maxDots = 14): string {
  if (!value) return '••••••••';
  return '•'.repeat(Math.min(value.length, maxDots));
}

function HomeRedirect() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-low gap-3">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-on-surface-variant">Đang tải…</p>
      </div>
    );
  }
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

// --- Main App ---

export default function App() {
  const { user, signOut, supabase, vaultKey, lockVault, unlockVault } = useAuth();
  const {
    toast,
    setToast,
    pushNotify,
    isModalOpen,
    editingItem,
    modalTab,
    setModalTab,
    activeMenuId,
    setActiveMenuId,
    searchQuery,
    setSearchQuery,
    modalTitle,
    setModalTitle,
    modalLogin,
    setModalLogin,
    modalPassword,
    setModalPassword,
    modalNotes,
    setModalNotes,
    modalCardHolder,
    setModalCardHolder,
    modalCardNumber,
    setModalCardNumber,
    modalCardExpiry,
    setModalCardExpiry,
    modalCardCvv,
    setModalCardCvv,
    modalPersonalId,
    setModalPersonalId,
    modalPersonalFullName,
    setModalPersonalFullName,
    modalPersonalEmail,
    setModalPersonalEmail,
    modalPersonalPhone,
    setModalPersonalPhone,
    modalPersonalAddress,
    setModalPersonalAddress,
    showModalPassword,
    setShowModalPassword,
    closeVaultModal,
    handleCopy,
    handleCopyValue,
    openEditModal,
    handleAddNew,
  } = useVaultPageState();
  const [vaultPassCurrent, setVaultPassCurrent] = useState('');
  const [vaultPassNext, setVaultPassNext] = useState('');
  const [vaultPassConfirm, setVaultPassConfirm] = useState('');
  const [changingVaultPass, setChangingVaultPass] = useState(false);
  const { vaultItems, vaultLoading, refreshVaultItems, saveVaultItem, deleteVaultItem } =
    useVaultItems({
      user,
      vaultKey,
      supabase,
      lockVault,
      pushNotify,
    });

  const handleSaveVault = async () => {
    await saveVaultItem({
      modalTab,
      modalTitle,
      modalLogin,
      modalPassword,
      modalNotes,
      modalCardHolder,
      modalCardNumber,
      modalCardExpiry,
      modalCardCvv,
      modalPersonalId,
      modalPersonalFullName,
      modalPersonalEmail,
      modalPersonalPhone,
      modalPersonalAddress,
      editingItem,
      onSaved: closeVaultModal,
    });
  };

  const handleDeleteVaultItem = async (id: string) => {
    const deleted = await deleteVaultItem(id);
    if (deleted) {
      setActiveMenuId(null);
    }
  };

  const handleChangeVaultPassword = async () => {
    setChangingVaultPass(true);
    const isSuccess = await rotateVaultPassword({
      user,
      vaultKey,
      supabase,
      lockVault,
      unlockVault,
      currentPassword: vaultPassCurrent,
      nextPassword: vaultPassNext,
      confirmPassword: vaultPassConfirm,
      pushNotify,
    });
    if (isSuccess) {
      setVaultPassCurrent('');
      setVaultPassNext('');
      setVaultPassConfirm('');
    }
    setChangingVaultPass(false);
  };

  const userLabel = user?.email ?? user?.phone ?? 'Người dùng';
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return vaultItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        (item.email && item.email.toLowerCase().includes(query)) ||
        (item.username && item.username.toLowerCase().includes(query)) ||
        (item.cardHolder && item.cardHolder.toLowerCase().includes(query)) ||
        (item.cardNumber && item.cardNumber.includes(query))
      );
    });
  }, [vaultItems, searchQuery]);

  return (
    <div className="font-sans antialiased">
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/about" element={<AboutRouteElement />} />
        <Route path="/login" element={<LoginScreen onNotify={pushNotify} />} />
        <Route path="/2fa" element={<TwoFactorScreen />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<VaultGate />}>
            <Route
              path="/dashboard"
              element={
                <DashboardRouteElement
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  userLabel={userLabel}
                  handleAddNew={handleAddNew}
                  vaultLoading={vaultLoading}
                  filteredItems={filteredItems}
                  openEditModal={openEditModal}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  handleDeleteVaultItem={handleDeleteVaultItem}
                  handleCopy={handleCopy}
                  maskSecret={maskSecret}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SettingsRouteElement
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  userLabel={userLabel}
                  handleAddNew={handleAddNew}
                  signOut={signOut}
                  pushNotify={pushNotify}
                  vaultPassCurrent={vaultPassCurrent}
                  setVaultPassCurrent={setVaultPassCurrent}
                  vaultPassNext={vaultPassNext}
                  setVaultPassNext={setVaultPassNext}
                  vaultPassConfirm={vaultPassConfirm}
                  setVaultPassConfirm={setVaultPassConfirm}
                  handleChangeVaultPassword={handleChangeVaultPassword}
                  changingVaultPass={changingVaultPass}
                />
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* --- Modals & Toasts --- */}

      <VaultItemModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        modalTab={modalTab}
        setModalTab={setModalTab}
        closeVaultModal={closeVaultModal}
        modalTitle={modalTitle}
        setModalTitle={setModalTitle}
        modalLogin={modalLogin}
        setModalLogin={setModalLogin}
        modalPassword={modalPassword}
        setModalPassword={setModalPassword}
        showModalPassword={showModalPassword}
        setShowModalPassword={setShowModalPassword}
        modalCardHolder={modalCardHolder}
        setModalCardHolder={setModalCardHolder}
        modalCardNumber={modalCardNumber}
        setModalCardNumber={setModalCardNumber}
        modalCardExpiry={modalCardExpiry}
        setModalCardExpiry={setModalCardExpiry}
        modalCardCvv={modalCardCvv}
        setModalCardCvv={setModalCardCvv}
        modalPersonalId={modalPersonalId}
        setModalPersonalId={setModalPersonalId}
        modalPersonalFullName={modalPersonalFullName}
        setModalPersonalFullName={setModalPersonalFullName}
        modalPersonalEmail={modalPersonalEmail}
        setModalPersonalEmail={setModalPersonalEmail}
        modalPersonalPhone={modalPersonalPhone}
        setModalPersonalPhone={setModalPersonalPhone}
        modalPersonalAddress={modalPersonalAddress}
        setModalPersonalAddress={setModalPersonalAddress}
        modalNotes={modalNotes}
        setModalNotes={setModalNotes}
        onCopyValue={handleCopyValue}
        handleSaveVault={handleSaveVault}
      />

      <ToastNotice toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
