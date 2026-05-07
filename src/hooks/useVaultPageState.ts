import { useCallback, useEffect, useState } from 'react';
import type React from 'react';
import type { ToastState } from '../components/ToastNotice';
import type { VaultItem } from '../lib/vaultItemMapper';

const TOAST_DURATION_MS = 4000;

export function useVaultPageState() {
  const [toast, setToast] = useState<ToastState>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [modalTab, setModalTab] = useState<'password' | 'card' | 'personal'>('password');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalLogin, setModalLogin] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalCardHolder, setModalCardHolder] = useState('');
  const [modalCardNumber, setModalCardNumber] = useState('');
  const [modalCardExpiry, setModalCardExpiry] = useState('');
  const [modalCardCvv, setModalCardCvv] = useState('');
  const [modalPersonalId, setModalPersonalId] = useState('');
  const [modalPersonalFullName, setModalPersonalFullName] = useState('');
  const [modalPersonalEmail, setModalPersonalEmail] = useState('');
  const [modalPersonalPhone, setModalPersonalPhone] = useState('');
  const [modalPersonalAddress, setModalPersonalAddress] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);

  const pushNotify = useCallback((message: string, variant: 'success' | 'error') => {
    setToast({ message, kind: variant });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    if (editingItem) {
      setModalTab(editingItem.type);
    }
  }, [editingItem]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    if (editingItem) {
      setModalTitle(editingItem.title);
      setModalLogin(editingItem.email ?? editingItem.username ?? '');
      setModalPassword(editingItem.password ?? '');
      setModalNotes(editingItem.notes ?? '');
      setModalCardHolder(editingItem.cardHolder ?? '');
      setModalCardNumber(editingItem.cardNumber ?? '');
      setModalCardExpiry(editingItem.expiry ?? '');
      setModalCardCvv(editingItem.cvv ?? '');
      setModalPersonalId(editingItem.personalId ?? '');
      setModalPersonalFullName(editingItem.fullName ?? '');
      setModalPersonalEmail(editingItem.email ?? '');
      setModalPersonalPhone(editingItem.phone ?? '');
      setModalPersonalAddress(editingItem.address ?? '');
      return;
    }
    setModalTitle('');
    setModalLogin('');
    setModalPassword('');
    setModalNotes('');
    setModalCardHolder('');
    setModalCardNumber('');
    setModalCardExpiry('');
    setModalCardCvv('');
    setModalPersonalId('');
    setModalPersonalFullName('');
    setModalPersonalEmail('');
    setModalPersonalPhone('');
    setModalPersonalAddress('');
  }, [isModalOpen, editingItem]);

  const closeVaultModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    setShowModalPassword(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeVaultModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeVaultModal]);

  const handleCopy = useCallback((e: React.MouseEvent, text?: string) => {
    e.stopPropagation();
    if (text) {
      void navigator.clipboard.writeText(text);
    }
    setToast({ message: 'Đã sao chép vào bộ nhớ đệm', kind: 'copy' });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const handleCopyValue = useCallback((text?: string) => {
    if (text) {
      void navigator.clipboard.writeText(text);
    }
    setToast({ message: 'Đã sao chép vào bộ nhớ đệm', kind: 'copy' });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const openEditModal = useCallback((item: VaultItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setModalTab('password');
    setIsModalOpen(true);
  }, []);

  return {
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
  };
}
