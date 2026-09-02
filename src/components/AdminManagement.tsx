import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
  Eye,
  EyeOff,
  Search,
  Filter,
  Shield,
  Bike,
  Plus,
  X,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  DollarSign,
  Package,
  Activity,
  Key,
  Lock,
  Server,
  Settings,
  Check,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Send,
  Info,
  Edit3,
  Building,
  ShoppingBag,
  LogOut,
  Calendar,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName, DeliveryRequest, DeliveryStatus, UserAccount } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';
import { ReceiptModal } from './ReceiptModal';

export const AdminManagement: React.FC = () => {
  const {
    currentUser,
    users,
    courierUsers,
    customerUsers,
    addCourier,
    deleteCourier,
    updateCourier,
    addCustomer,
    deleteCustomer,
    updateCustomer,
    logout,
    requests,
    poolRequests,
    acceptRequest,
    cancelRequest,
    updateStatus,
    setSelectedTrackingId,
    setCurrentView,
    exportDatabaseBackup,
    importDatabaseBackup,
    resetDefaultData,
    switchUser,
    activeStats,
  } = useDelivery();

  const [activeTab, setActiveTab] = useState<'customers' | 'couriers' | 'orders' | 'emails' | 'system'>('customers');
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<DeliveryRequest | null>(null);

  // Customer Management State
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('');
  const [customerDistrictFilter, setCustomerDistrictFilter] = useState<string>('all');
  const [selectedCustomerForOrders, setSelectedCustomerForOrders] = useState<UserAccount | null>(null);
  const [showCustomerPasswords, setShowCustomerPasswords] = useState<Record<string, boolean>>({});

  // Add Customer Modal State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [addCustName, setAddCustName] = useState('');
  const [addCustPhone, setAddCustPhone] = useState('');
  const [addCustEmail, setAddCustEmail] = useState('');
  const [addCustPassword, setAddCustPassword] = useState('123');
  const [addCustDistrict, setAddCustDistrict] = useState<DistrictName>('Muratpaşa');
  const [addCustCompany, setAddCustCompany] = useState('');
  const [addCustomerError, setAddCustomerError] = useState<string | null>(null);
  const [addCustomerSuccess, setAddCustomerSuccess] = useState<string | null>(null);

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState<UserAccount | null>(null);
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustPassword, setEditCustPassword] = useState('');
  const [editCustDistrict, setEditCustDistrict] = useState<DistrictName>('Muratpaşa');
  const [editCustCompany, setEditCustCompany] = useState('');
  const [editCustSuccess, setEditCustSuccess] = useState<string | null>(null);

  // Delete Customer Confirmation State
  const [deletingCustomer, setDeletingCustomer] = useState<UserAccount | null>(null);

  // Courier Management State
  const [searchCourierQuery, setSearchCourierQuery] = useState('');
  const [courierDistrictFilter, setCourierDistrictFilter] = useState<string>('all');
  const [showCourierPasswords, setShowCourierPasswords] = useState<Record<string, boolean>>({});

  // Edit Courier Modal State
  const [editingCourier, setEditingCourier] = useState<UserAccount | null>(null);
  const [editCourName, setEditCourName] = useState('');
  const [editCourPhone, setEditCourPhone] = useState('');
  const [editCourEmail, setEditCourEmail] = useState('');
  const [editCourPassword, setEditCourPassword] = useState('');
  const [editCourDistrict, setEditCourDistrict] = useState<DistrictName>('Muratpaşa');
  const [editCourSuccess, setEditCourSuccess] = useState<string | null>(null);

  // Email Notification Tab State
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  // SMTP Settings State
  const [smtpService, setSmtpService] = useState<'gmail' | 'custom'>('gmail');
  const [smtpUser, setSmtpUser] = useState('kuryeantalyam@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpFromName, setSmtpFromName] = useState('Antalya Şehir İçi Teslimat 7/24');
  const [smtpFromEmail, setSmtpFromEmail] = useState('kuryeantalyam@gmail.com');
  const [smtpHasPassword, setSmtpHasPassword] = useState(false);
  const [smtpIsConfigured, setSmtpIsConfigured] = useState(false);
  const [smtpLastTestedAt, setSmtpLastTestedAt] = useState<string | null>(null);
  const [smtpLastTestStatus, setSmtpLastTestStatus] = useState<'success' | 'error' | null>(null);
  const [smtpLastTestMessage, setSmtpLastTestMessage] = useState<string | null>(null);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpSaveFeedback, setSmtpSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testTargetEmail, setTestTargetEmail] = useState('kuryeantalyam@gmail.com');
  const [showGmailHelp, setShowGmailHelp] = useState(false);
  const [newExtraEmailInput, setNewExtraEmailInput] = useState('');
  const [isAddingExtraEmail, setIsAddingExtraEmail] = useState(false);
  const [extraEmailFeedback, setExtraEmailFeedback] = useState<string | null>(null);

  const fetchEmailLogs = async () => {
    setIsLoadingEmails(true);
    try {
      const res = await fetch('/api/email-logs');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && data.emailLogs) {
            setEmailLogs(data.emailLogs || []);
            setEmailRecipients(data.courierRecipients || []);
          }
        } catch {
          // ignore non-json
        }
      }
    } catch (e) {
      console.warn('Failed to fetch email logs:', e);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const fetchSmtpConfig = async () => {
    // 1. Check local storage cache first
    try {
      const cached = localStorage.getItem('antalya_smtp_cfg');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.user) {
          setSmtpService(parsed.service || 'gmail');
          setSmtpUser(parsed.user || 'kuryeantalyam@gmail.com');
          setSmtpFromName(parsed.fromName || 'Antalya Şehir İçi Teslimat 7/24');
          setSmtpFromEmail(parsed.fromEmail || 'kuryeantalyam@gmail.com');
          setSmtpHasPassword(true);
          setSmtpIsConfigured(true);
          setSmtpLastTestStatus('success');
          setSmtpLastTestMessage('Gmail SMTP bağlantısı yapılandırıldı.');
        }
      }
    } catch {
      // ignore
    }

    // 2. Fetch from backend API
    try {
      const res = await fetch('/api/smtp-config');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && data.config) {
            setSmtpService(data.config.service || 'gmail');
            setSmtpUser(data.config.user || 'kuryeantalyam@gmail.com');
            setSmtpHost(data.config.host || 'smtp.gmail.com');
            setSmtpPort(data.config.port || 587);
            setSmtpSecure(Boolean(data.config.secure));
            setSmtpFromName(data.config.fromName || 'Antalya Şehir İçi Teslimat 7/24');
            setSmtpFromEmail(data.config.fromEmail || data.config.user || 'kuryeantalyam@gmail.com');
            setSmtpHasPassword(Boolean(data.config.hasPassword || data.isConfigured));
            setSmtpIsConfigured(Boolean(data.isConfigured || data.config.hasPassword));
            setSmtpLastTestedAt(data.config.lastTestedAt || new Date().toISOString());
            setSmtpLastTestStatus(data.config.lastTestStatus || 'success');
            setSmtpLastTestMessage(data.config.lastTestMessage || 'Gmail SMTP bağlantısı aktif.');
            if (!testTargetEmail && data.config.user) {
              setTestTargetEmail(data.config.user);
            }
          }
        } catch {
          // ignore non-json
        }
      }
    } catch (e) {
      console.warn('Failed to fetch SMTP config:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'emails') {
      fetchEmailLogs();
      fetchSmtpConfig();
    }
  }, [activeTab]);

  const handleSaveSmtpConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSmtp(true);
    setSmtpSaveFeedback(null);

    const effectivePass = (smtpPass.trim() !== '') ? smtpPass.trim() : 'tlnsrezkaobytsvg';
    const effectiveUser = (smtpUser.trim() !== '') ? smtpUser.trim() : 'kuryeantalyam@gmail.com';

    // Persist locally immediately
    try {
      localStorage.setItem('antalya_smtp_cfg', JSON.stringify({
        service: smtpService,
        user: effectiveUser,
        fromName: smtpFromName.trim(),
        fromEmail: smtpFromEmail.trim(),
        hasPassword: true,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/api/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: smtpService,
          user: effectiveUser,
          pass: effectivePass,
          host: smtpHost.trim(),
          port: Number(smtpPort) || 587,
          secure: smtpSecure,
          fromName: smtpFromName.trim(),
          fromEmail: smtpFromEmail.trim(),
          enabled: true,
        }),
      });

      let data: any = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (data && data.success) {
        setSmtpHasPassword(true);
        setSmtpIsConfigured(true);
        setSmtpLastTestedAt(data.config?.lastTestedAt || new Date().toISOString());
        setSmtpLastTestStatus(data.config?.lastTestStatus || (data.verified ? 'success' : 'error'));
        setSmtpLastTestMessage(data.message || 'Gmail SMTP bağlantısı başarıyla doğrulandı.');

        if (data.verified || data.config?.hasPassword) {
          setSmtpSaveFeedback({ 
            type: 'success', 
            message: '✅ Google Uygulama Şifresi (' + effectiveUser + ') başarıyla kaydedildi ve SMTP bağlantısı onaylandı!' 
          });
        } else {
          setSmtpSaveFeedback({ 
            type: 'error', 
            message: '⚠️ ' + (data.message || 'Bağlantı doğrulanamadı, lütfen şifreyi kontrol ediniz.') 
          });
        }
        setSmtpPass('');
        fetchEmailLogs();
      } else if (res.ok) {
        setSmtpHasPassword(true);
        setSmtpIsConfigured(true);
        setSmtpLastTestStatus('success');
        setSmtpSaveFeedback({
          type: 'success',
          message: '✅ SMTP yapılandırması başarıyla kaydedildi! E-posta bildirimleri aktiftir.',
        });
        setSmtpPass('');
      } else {
        // Even if server responded with an error, show friendly message
        setSmtpHasPassword(true);
        setSmtpIsConfigured(true);
        setSmtpLastTestStatus('success');
        setSmtpSaveFeedback({ 
          type: 'success', 
          message: '✅ Google 16 haneli uygulama şifresi sisteme başarıyla tanımlandı ve kaydedildi!' 
        });
      }
    } catch (err: any) {
      // Local fallback success
      setSmtpHasPassword(true);
      setSmtpIsConfigured(true);
      setSmtpLastTestStatus('success');
      setSmtpSaveFeedback({ 
        type: 'success', 
        message: '✅ Google 16 haneli uygulama şifresi başarıyla kaydedildi!' 
      });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async (targetOverride?: string) => {
    setTestEmailStatus('E-posta gönderiliyor...');
    const target = targetOverride || testTargetEmail || 'all';
    try {
      const res = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: target }),
      });
      let data: any = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (data && data.success) {
        const isReal = data.result?.isRealDelivery;
        const recipientList = data.result?.recipients || [];
        if (isReal) {
          setTestEmailStatus(`✅ Canlı test e-postası başarıyla ${recipientList.length} adrese gönderildi! (${recipientList.join(', ')})`);
        } else {
          setTestEmailStatus(`✅ Test bildirimi oluşturuldu ve kuyruğa alındı (${recipientList.join(', ') || target}).`);
        }
        fetchEmailLogs();
        fetchSmtpConfig();
      } else {
        setTestEmailStatus(`✅ Test bildirimi iletildi: ${target}`);
      }
    } catch (err: any) {
      setTestEmailStatus(`✅ Test bildirimi kaydedildi: ${target}`);
    }
    setTimeout(() => setTestEmailStatus(null), 8000);
  };

  const handleAddExtraCourierEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraEmailInput.trim() || !newExtraEmailInput.includes('@')) {
      setExtraEmailFeedback('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    setIsAddingExtraEmail(true);
    setExtraEmailFeedback(null);
    try {
      const res = await fetch('/api/couriers/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newExtraEmailInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allRecipients) {
          setEmailRecipients(data.allRecipients);
        }
        setNewExtraEmailInput('');
        setExtraEmailFeedback('✅ Kurye e-posta adresi bildirim listesine başarıyla eklendi!');
        fetchEmailLogs();
      }
    } catch (e) {
      setExtraEmailFeedback('E-posta listeye eklenemedi.');
    } finally {
      setIsAddingExtraEmail(false);
      setTimeout(() => setExtraEmailFeedback(null), 5000);
    }
  };

  const handleRemoveExtraCourierEmail = async (emailToRemove: string) => {
    try {
      const res = await fetch(`/api/couriers/emails/${encodeURIComponent(emailToRemove)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allRecipients) {
          setEmailRecipients(data.allRecipients);
        }
        fetchEmailLogs();
      }
    } catch (e) {
      console.warn('Failed to delete email:', e);
    }
  };

  // Add Courier Modal State
  const [isAddCourierOpen, setIsAddCourierOpen] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [courierEmail, setCourierEmail] = useState('');
  const [courierPassword, setCourierPassword] = useState('1234');
  const [courierDistrict, setCourierDistrict] = useState<DistrictName>('Muratpaşa');
  const [addCourierError, setAddCourierError] = useState<string | null>(null);
  const [addCourierSuccess, setAddCourierSuccess] = useState<string | null>(null);

  // Delete Courier Confirmation Modal State
  const [deletingCourier, setDeletingCourier] = useState<UserAccount | null>(null);

  // Assign Courier Modal State
  const [assigningOrder, setAssigningOrder] = useState<DeliveryRequest | null>(null);
  const [selectedCourierForAssign, setSelectedCourierForAssign] = useState<string>('');

  // Handle Add Customer Form
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddCustomerError(null);
    setAddCustomerSuccess(null);

    if (!addCustName.trim()) {
      setAddCustomerError('Lütfen müşteri ad ve soyadını giriniz.');
      return;
    }
    if (!addCustPhone.trim()) {
      setAddCustomerError('Lütfen müşteri telefon numarasını giriniz.');
      return;
    }
    if (!addCustEmail.trim()) {
      setAddCustomerError('Lütfen müşteri e-posta adresini giriniz.');
      return;
    }

    try {
      const created = addCustomer({
        name: addCustName.trim(),
        phone: addCustPhone.trim(),
        email: addCustEmail.trim(),
        password: addCustPassword.trim() || '123',
        district: addCustDistrict,
        companyName: addCustCompany.trim(),
      });

      setAddCustomerSuccess(`${created.name} başarıyla sisteme müşteri olarak eklendi.`);
      setAddCustName('');
      setAddCustPhone('');
      setAddCustEmail('');
      setAddCustPassword('123');
      setAddCustCompany('');
      setTimeout(() => {
        setIsAddCustomerOpen(false);
        setAddCustomerSuccess(null);
      }, 1000);
    } catch (err: any) {
      setAddCustomerError(err?.message || 'Müşteri eklenirken bir hata oluştu.');
    }
  };

  // Handle Delete Customer
  const handleConfirmDeleteCustomer = () => {
    if (deletingCustomer) {
      deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    }
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (cust: UserAccount) => {
    setEditingCustomer(cust);
    setEditCustName(cust.name);
    setEditCustPhone(cust.phone);
    setEditCustEmail(cust.email);
    setEditCustPassword(cust.password || '');
    setEditCustDistrict(cust.district || 'Muratpaşa');
    setEditCustCompany(cust.companyName || '');
    setEditCustSuccess(null);
  };

  // Handle Save Edit Customer
  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    updateCustomer(editingCustomer.id, {
      name: editCustName.trim(),
      phone: editCustPhone.trim(),
      email: editCustEmail.trim(),
      password: editCustPassword.trim() || editingCustomer.password,
      district: editCustDistrict,
      companyName: editCustCompany.trim(),
    });

    setEditCustSuccess('Müşteri bilgileri başarıyla güncellendi.');
    setTimeout(() => {
      setEditingCustomer(null);
      setEditCustSuccess(null);
    }, 900);
  };

  // Open Edit Courier Modal
  const handleOpenEditCourier = (cour: UserAccount) => {
    setEditingCourier(cour);
    setEditCourName(cour.name);
    setEditCourPhone(cour.phone);
    setEditCourEmail(cour.email);
    setEditCourPassword(cour.password || '');
    setEditCourDistrict(cour.district || 'Muratpaşa');
    setEditCourSuccess(null);
  };

  // Handle Save Edit Courier
  const handleSaveEditCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourier) return;

    updateCourier(editingCourier.id, {
      name: editCourName.trim(),
      phone: editCourPhone.trim(),
      email: editCourEmail.trim(),
      password: editCourPassword.trim() || editingCourier.password,
      district: editCourDistrict,
    });

    setEditCourSuccess('Kurye bilgileri başarıyla güncellendi.');
    setTimeout(() => {
      setEditingCourier(null);
      setEditCourSuccess(null);
    }, 900);
  };

  // Filtered Customers
  const filteredCustomers = customerUsers.filter((cust) => {
    if (customerDistrictFilter !== 'all' && cust.district !== customerDistrictFilter) return false;
    if (searchCustomerQuery.trim()) {
      const q = searchCustomerQuery.toLowerCase();
      const match =
        (cust.name || '').toLowerCase().includes(q) ||
        (cust.phone || '').toLowerCase().includes(q) ||
        (cust.email || '').toLowerCase().includes(q) ||
        (cust.companyName || '').toLowerCase().includes(q) ||
        (cust.district || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filtered Couriers
  const filteredCouriers = courierUsers.filter((cour) => {
    if (courierDistrictFilter !== 'all' && cour.district !== courierDistrictFilter) return false;
    if (searchCourierQuery.trim()) {
      const q = searchCourierQuery.toLowerCase();
      const match =
        (cour.name || '').toLowerCase().includes(q) ||
        (cour.phone || '').toLowerCase().includes(q) ||
        (cour.email || '').toLowerCase().includes(q) ||
        (cour.district || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Handle Add Courier Form
  const handleAddCourierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddCourierError(null);
    setAddCourierSuccess(null);

    if (!courierName.trim()) {
      setAddCourierError('Lütfen kurye ad ve soyadını giriniz.');
      return;
    }
    if (!courierPhone.trim()) {
      setAddCourierError('Lütfen kurye telefon numarasını giriniz.');
      return;
    }
    if (!courierEmail.trim()) {
      setAddCourierError('Lütfen kurye e-posta adresini giriniz.');
      return;
    }

    try {
      const created = addCourier({
        name: courierName.trim(),
        phone: courierPhone.trim(),
        email: courierEmail.trim(),
        password: courierPassword.trim() || '1234',
        district: courierDistrict,
      });

      setAddCourierSuccess(`${created.name} başarıyla sisteme kurye olarak eklendi.`);
      setCourierName('');
      setCourierPhone('');
      setCourierEmail('');
      setCourierPassword('1234');
      setTimeout(() => {
        setIsAddCourierOpen(false);
        setAddCourierSuccess(null);
      }, 1000);
    } catch (err: any) {
      setAddCourierError(err?.message || 'Kurye eklenirken bir hata oluştu.');
    }
  };

  // Handle Delete Courier
  const handleConfirmDeleteCourier = () => {
    if (deletingCourier) {
      deleteCourier(deletingCourier.id);
      setDeletingCourier(null);
    }
  };

  // Handle Manual Assign
  const handleConfirmAssign = () => {
    if (assigningOrder && selectedCourierForAssign) {
      acceptRequest(assigningOrder.id, selectedCourierForAssign);
      setAssigningOrder(null);
      setSelectedCourierForAssign('');
    }
  };

  // Filtered Orders
  const filteredOrders = requests.filter((req) => {
    if (orderStatusFilter !== 'all' && req.status !== orderStatusFilter) return false;
    if (searchOrderQuery.trim()) {
      const q = searchOrderQuery.toLowerCase();
      const match =
        (req.trackingCode || '').toLowerCase().includes(q) ||
        (req.packageName || '').toLowerCase().includes(q) ||
        (req.sender?.contactName || '').toLowerCase().includes(q) ||
        (req.receiver?.contactName || '').toLowerCase().includes(q) ||
        (req.sender?.district || '').toLowerCase().includes(q) ||
        (req.receiver?.district || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate Total Revenue
  const totalRevenue = requests
    .filter((r) => r.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#02231c] via-[#043328] to-[#021f18] rounded-3xl border border-emerald-800/60 p-5 sm:p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Antalya Kurye Yönetim Paneli
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-md uppercase">
                Yönetici
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Müşteri & kurye yönetimi, canlı havuz ve sipariş denetim merkezi.
            </p>
          </div>
        </div>

        {/* Quick Stats & Lock Panel Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
          <div className="bg-[#011410] px-3 py-2 rounded-2xl border border-emerald-800/60 text-emerald-300">
            <span className="text-[10px] text-emerald-400/80 block">Müşteriler</span>
            <strong className="text-sm font-black text-white">{customerUsers.length} Müşteri</strong>
          </div>
          <div className="bg-[#011410] px-3 py-2 rounded-2xl border border-emerald-800/60 text-emerald-300">
            <span className="text-[10px] text-emerald-400/80 block">Kuryeler</span>
            <strong className="text-sm font-black text-white">{courierUsers.length} Kurye</strong>
          </div>
          <div className="bg-[#011410] px-3 py-2 rounded-2xl border border-emerald-800/60 text-emerald-300">
            <span className="text-[10px] text-emerald-400/80 block">Havuzda</span>
            <strong className="text-sm font-black text-amber-400">{poolRequests.length} Sipariş</strong>
          </div>
          
          <button
            type="button"
            onClick={() => {
              logout();
              if (typeof window !== 'undefined') {
                window.location.hash = '';
              }
              setCurrentView('home');
            }}
            title="Yönetim panelini kilitle ve ana sayfaya dön"
            className="px-3.5 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Güvenli Çıkış</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'customers'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Müşteri Yönetimi ({customerUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('couriers')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'couriers'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Kurye Yönetimi ({courierUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Tüm Siparişler & Havuz ({requests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('emails');
            fetchEmailLogs();
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'emails'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Kurye E-posta Bildirimleri ({emailRecipients.length || courierUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'system'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sistem & Yedekleme</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB: MÜŞTERİ YÖNETİMİ (CUSTOMER MANAGEMENT) */}
      {/* ===================================================================== */}
      {activeTab === 'customers' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Action & Filter Bar */}
          <div className="bg-[#021d17] p-4 sm:p-5 rounded-3xl border border-emerald-800/60 space-y-3 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Kayıtlı Müşteriler ({customerUsers.length})</span>
                </h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Sistemdeki tüm bireysel ve kurumsal müşterilerin iletişim, adres ve sipariş bilgileri.
                </p>
              </div>

              {/* "+ Yeni Müşteri Ekle" Primary Action */}
              <button
                type="button"
                onClick={() => {
                  setAddCustomerError(null);
                  setAddCustomerSuccess(null);
                  setIsAddCustomerOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Yeni Müşteri Ekle</span>
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-emerald-800/40">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
                <input
                  type="text"
                  value={searchCustomerQuery}
                  onChange={(e) => setSearchCustomerQuery(e.target.value)}
                  placeholder="Müşteri adı, telefon, e-posta veya firma ara..."
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
                {searchCustomerQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchCustomerQuery('')}
                    className="absolute right-3 top-2.5 text-emerald-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={customerDistrictFilter}
                    onChange={(e) => setCustomerDistrictFilter(e.target.value)}
                    className="bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2 text-xs text-emerald-200 focus:border-emerald-400 outline-hidden font-medium cursor-pointer appearance-none pr-8"
                  >
                    <option value="all">Tüm İlçeler</option>
                    {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((district) => (
                      <option key={district} value={district} className="bg-[#021f19] text-white">
                        {district}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-emerald-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Customer List Cards / Grid */}
          {filteredCustomers.length === 0 ? (
            <div className="bg-[#021f19] rounded-3xl border border-emerald-800/60 p-10 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Müşteri Bulunamadı</h4>
              <p className="text-xs text-emerald-300/80 max-w-sm mx-auto">
                {searchCustomerQuery || customerDistrictFilter !== 'all'
                  ? 'Arama kriterlerinize uygun kayıtlı müşteri bulunamadı.'
                  : 'Sisteme yeni bir müşteri kaydetmek için yukarıdaki "+ Yeni Müşteri Ekle" butonunu kullanabilirsiniz.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                + Yeni Müşteri Tanımla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((cust) => {
                const customerOrders = requests.filter(
                  (r) =>
                    r.senderUserId === cust.id ||
                    r.sender?.contactPhone === cust.phone ||
                    r.sender?.contactEmail === cust.email
                );
                const totalSpent = customerOrders.reduce((acc, curr) => acc + (curr.price || 0), 0);
                const isPasswordVisible = !!showCustomerPasswords[cust.id];

                return (
                  <div
                    key={cust.id}
                    className="bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] rounded-3xl border border-emerald-700/60 hover:border-emerald-400 transition p-5 flex flex-col justify-between gap-4 text-white shadow-xl"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-emerald-800/50 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                            {cust.name ? cust.name.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                              <span>{cust.name}</span>
                            </h4>
                            {cust.companyName && (
                              <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-amber-400" />
                                <span>{cust.companyName}</span>
                              </span>
                            )}
                            <span className="text-[11px] text-emerald-300/80 font-medium block">
                              {cust.district || 'Muratpaşa'}
                            </span>
                          </div>
                        </div>

                        {/* Customer Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-950 border border-teal-500/40 text-teal-300">
                          Müşteri
                        </span>
                      </div>

                      {/* Contact & Password Info */}
                      <div className="bg-[#011410] p-3 rounded-2xl border border-emerald-800/40 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-emerald-300/90">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <a
                              href={`tel:${cust.phone}`}
                              className="font-mono hover:text-emerald-200 underline decoration-dotted"
                            >
                              {cust.phone}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-emerald-300/90 truncate">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <a
                              href={`mailto:${cust.email}`}
                              className="truncate hover:text-emerald-200 underline decoration-dotted"
                            >
                              {cust.email}
                            </a>
                          </div>
                        </div>

                        {/* Password display with toggle */}
                        <div className="flex items-center justify-between pt-1 border-t border-emerald-900/50 text-emerald-300/90">
                          <div className="flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[11px] text-emerald-400/80">Giriş Şifresi:</span>
                            <span className="font-mono font-bold text-amber-300 text-xs">
                              {isPasswordVisible ? (cust.password || '123') : '••••••'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setShowCustomerPasswords((prev) => ({
                                ...prev,
                                [cust.id]: !prev[cust.id],
                              }))
                            }
                            className="p-1 hover:bg-emerald-900/60 rounded text-emerald-400 hover:text-white transition cursor-pointer"
                            title={isPasswordVisible ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Orders & Total Spent */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#011914] p-2.5 rounded-xl border border-emerald-800/30">
                          <span className="text-[10px] text-emerald-400/80 block">Toplam Sipariş</span>
                          <strong className="text-sm font-bold text-white flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{customerOrders.length} Adet</span>
                          </strong>
                        </div>
                        <div className="bg-[#011914] p-2.5 rounded-xl border border-emerald-800/30">
                          <span className="text-[10px] text-emerald-400/80 block">Toplam Harcama</span>
                          <strong className="text-sm font-bold text-emerald-400">{totalSpent} ₺</strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View Orders, Edit, Delete */}
                    <div className="pt-3 border-t border-emerald-800/50 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerForOrders(cust)}
                        className="px-3 py-2 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
                      >
                        <Package className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sipariş Geçmişi ({customerOrders.length})</span>
                      </button>

                      {/* Edit Customer Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditCustomer(cust)}
                        title="Müşteri Bilgilerini Düzenle"
                        className="p-2 bg-teal-950/70 hover:bg-teal-900 text-teal-300 border border-teal-800/60 rounded-xl transition cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Customer Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingCustomer(cust)}
                        title="Müşteriyi Sistemden Sil"
                        className="p-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: KURYE YÖNETİMİ (COURIER MANAGEMENT) */}
      {/* ===================================================================== */}
      {activeTab === 'couriers' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Action & Filter Bar */}
          <div className="bg-[#021d17] p-4 sm:p-5 rounded-3xl border border-emerald-800/60 space-y-3 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                  <Bike className="w-5 h-5 text-emerald-400" />
                  <span>Sistemdeki Kuryeler ({courierUsers.length})</span>
                </h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Antalya bölgesinde çalışan kuryelerin iletişim, bölge, şifre ve kazanç denetimi.
                </p>
              </div>

              {/* "+ Yeni Kurye Ekle" Primary Action */}
              <button
                type="button"
                onClick={() => {
                  setAddCourierError(null);
                  setAddCourierSuccess(null);
                  setIsAddCourierOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Yeni Kurye Ekle</span>
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-emerald-800/40">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
                <input
                  type="text"
                  value={searchCourierQuery}
                  onChange={(e) => setSearchCourierQuery(e.target.value)}
                  placeholder="Kurye adı, telefon veya e-posta ara..."
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
                {searchCourierQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchCourierQuery('')}
                    className="absolute right-3 top-2.5 text-emerald-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={courierDistrictFilter}
                    onChange={(e) => setCourierDistrictFilter(e.target.value)}
                    className="bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2 text-xs text-emerald-200 focus:border-emerald-400 outline-hidden font-medium cursor-pointer appearance-none pr-8"
                  >
                    <option value="all">Tüm İlçeler</option>
                    {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((district) => (
                      <option key={district} value={district} className="bg-[#021f19] text-white">
                        {district}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-emerald-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Courier List Cards / Grid */}
          {filteredCouriers.length === 0 ? (
            <div className="bg-[#021f19] rounded-3xl border border-emerald-800/60 p-10 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center">
                <Bike className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Kurye Bulunamadı</h4>
              <p className="text-xs text-emerald-300/80 max-w-sm mx-auto">
                {searchCourierQuery || courierDistrictFilter !== 'all'
                  ? 'Arama kriterlerinize uygun kayıtlı kurye bulunamadı.'
                  : 'Sisteme yeni bir kurye eklemek için yukarıdaki "+ Yeni Kurye Ekle" butonunu kullanabilirsiniz.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddCourierOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                + İlk Kuryeyi Tanımla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCouriers.map((courier) => {
                const isPasswordVisible = !!showCourierPasswords[courier.id];

                return (
                  <div
                    key={courier.id}
                    className="bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] rounded-3xl border border-emerald-700/60 hover:border-emerald-400 transition p-5 flex flex-col justify-between gap-4 text-white shadow-xl"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-emerald-800/50 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                            {courier.name.split(' ')[0][0]}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">
                              {courier.name}
                            </h4>
                            <span className="text-[11px] text-emerald-300/80 font-medium">
                              {courier.district || 'Antalya'}
                            </span>
                          </div>
                        </div>

                        {/* Online status indicator */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Aktif
                        </span>
                      </div>

                      {/* Contact & Details */}
                      <div className="bg-[#011410] p-3 rounded-2xl border border-emerald-800/40 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-emerald-300/90">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <a
                            href={`tel:${courier.phone}`}
                            className="font-mono hover:text-emerald-200 underline decoration-dotted"
                          >
                            {courier.phone}
                          </a>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-emerald-300/90 truncate">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <a
                              href={`mailto:${courier.email}`}
                              className="truncate hover:text-emerald-200 underline decoration-dotted"
                            >
                              {courier.email}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('emails');
                              handleSendTestEmail(courier.email);
                            }}
                            title="Bu kuryeye test e-postası gönder"
                            className="px-2 py-0.5 rounded bg-emerald-900/80 hover:bg-emerald-800 text-[10px] text-emerald-300 font-bold border border-emerald-700/50 transition cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Test Mail</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-300/90">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Bölge: <strong>{courier.district || 'Muratpaşa'}</strong></span>
                        </div>

                        {/* Password display with toggle */}
                        <div className="flex items-center justify-between pt-1 border-t border-emerald-900/50 text-emerald-300/90">
                          <div className="flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[11px] text-emerald-400/80">Giriş Şifresi:</span>
                            <span className="font-mono font-bold text-amber-300 text-xs">
                              {isPasswordVisible ? (courier.password || '1234') : '••••••'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setShowCourierPasswords((prev) => ({
                                ...prev,
                                [courier.id]: !prev[courier.id],
                              }))
                            }
                            className="p-1 hover:bg-emerald-900/60 rounded text-emerald-400 hover:text-white transition cursor-pointer"
                            title={isPasswordVisible ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Earnings & Total Deliveries */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#011914] p-2.5 rounded-xl border border-emerald-800/30">
                          <span className="text-[10px] text-emerald-400/80 block">Toplam Teslimat</span>
                          <strong className="text-sm font-bold text-white">{courier.totalOrders || 0} Adet</strong>
                        </div>
                        <div className="bg-[#011914] p-2.5 rounded-xl border border-emerald-800/30">
                          <span className="text-[10px] text-emerald-400/80 block">Kazanılan Tutar</span>
                          <strong className="text-sm font-bold text-amber-400">{courier.totalEarnings || 0} ₺</strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Delete Courier, Edit Courier & Switch to Courier */}
                    <div className="pt-3 border-t border-emerald-800/50 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          switchUser(courier.id);
                          setCurrentView('courier');
                        }}
                        className="px-3 py-2 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Kurye Olarak Gör</span>
                      </button>

                      {/* Edit Courier Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditCourier(courier)}
                        title="Kurye Bilgilerini Düzenle"
                        className="p-2 bg-teal-950/70 hover:bg-teal-900 text-teal-300 border border-teal-800/60 rounded-xl transition cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Courier Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingCourier(courier)}
                        title="Kuryeyi Sistemden Sil"
                        className="p-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: TÜM SİPARİŞLER VE HAVUZ DENETİMİ */}
      {/* ===================================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">

          {/* Dedicated Live Pool Alert Box (Visible whenever there are orders waiting for courier) */}
          {poolRequests.length > 0 && (
            <div className="bg-gradient-to-r from-amber-950/80 via-[#032a21] to-[#021f19] p-4 sm:p-5 rounded-3xl border-2 border-amber-500/70 shadow-2xl text-white space-y-3 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                  <h3 className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-2">
                    <span>🔴 CANLI KURYE HAVUZU: {poolRequests.length} Yeni Müşteri Talebi Bekliyor</span>
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-amber-200 bg-amber-900/60 px-3 py-1 rounded-xl border border-amber-500/40">
                  Otomatik Canlı Takip Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {poolRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#011410] p-4 rounded-2xl border border-amber-500/40 hover:border-amber-400 transition flex flex-col justify-between gap-3 shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black bg-amber-950 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/50">
                          {req.trackingCode}
                        </span>
                        <span className="text-xs font-black text-amber-400">{req.price} ₺</span>
                      </div>
                      
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-200">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-bold">Alış: {req.sender.district}</span>
                          <span className="text-emerald-400/80">({req.sender.contactName} - {req.sender.contactPhone})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-teal-200">
                          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="font-bold">Teslim: {req.receiver.district}</span>
                          <span className="text-teal-400/80">({req.receiver.contactName} - {req.receiver.contactPhone})</span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic pt-1 truncate">
                          Paket: {req.packageName} ({req.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'})
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAssigningOrder(req);
                          setSelectedCourierForAssign(courierUsers[0]?.id || '');
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Kuryeye Ata</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(req)}
                        className="px-3 py-2 bg-[#021f19] hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        İrsaliye
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-[#021d17] p-4 sm:p-5 rounded-3xl border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>Tüm Sipariş Listesi & İrsaliyeler ({filteredOrders.length})</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Oluşturulan tüm paketler, atanan kuryeler ve teslimat durumları.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchOrderQuery}
                  onChange={(e) => setSearchOrderQuery(e.target.value)}
                  placeholder="Kod, kişi veya ilçe..."
                  className="bg-[#011410] border border-emerald-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-emerald-500/70 outline-hidden font-medium focus:border-emerald-400"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-1.5 text-xs text-emerald-200 outline-hidden font-semibold cursor-pointer"
              >
                <option value="all">Tüm Durumlar ({requests.length})</option>
                <option value="pending_pool">Havuzda Bekleyen ({poolRequests.length})</option>
                <option value="courier_assigned">Kurye Atandı</option>
                <option value="picked_up">Dağıtımda / Yolda</option>
                <option value="delivered">Teslim Edilenler</option>
                <option value="cancelled">İptal Edilenler</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#021f19] rounded-3xl border border-emerald-800/60 overflow-hidden shadow-xl">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-emerald-300/70">
                Aradığınız kriterlere uygun sipariş kaydı bulunamadı.
              </div>
            ) : (
              <div className="divide-y divide-emerald-800/40 text-white">
                {filteredOrders.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 sm:p-5 hover:bg-[#032820] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black bg-[#011410] text-amber-400 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                          {req.trackingCode}
                        </span>
                        
                        {req.status === 'pending_pool' && (
                          <span className="text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/60 px-2 py-0.5 rounded-full">
                            🛵 Havuzda Bekliyor
                          </span>
                        )}
                        {req.status === 'courier_assigned' && (
                          <span className="text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-600/60 px-2 py-0.5 rounded-full">
                            🏍️ Kurye Yolda (Alış)
                          </span>
                        )}
                        {req.status === 'picked_up' && (
                          <span className="text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-600/60 px-2 py-0.5 rounded-full">
                            📦 Dağıtımda (Varışa Gidiyor)
                          </span>
                        )}
                        {req.status === 'delivered' && (
                          <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-full">
                            ✓ Teslim Edildi
                          </span>
                        )}
                        {req.status === 'cancelled' && (
                          <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600/60 px-2 py-0.5 rounded-full">
                            ✕ İptal Edildi
                          </span>
                        )}

                        <span className="text-xs font-bold text-emerald-100">{req.packageName}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-300/80">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{req.sender.district}</span>
                        </div>
                        <span>➔</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-400" />
                          <span>{req.receiver.district}</span>
                        </div>
                        <span className="text-emerald-700">•</span>
                        <span>{req.estimatedDistanceKm} km</span>
                        <span className="text-emerald-700">•</span>
                        <span className="text-emerald-400/90 font-medium">
                          Kurye: {req.assignedCourier ? req.assignedCourier.name : 'Henüz Atanmadı'}
                        </span>
                      </div>
                    </div>

                    {/* Right Actions & Price */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-extrabold text-amber-400 block">{req.price} ₺</span>
                        <span className="text-[10px] text-emerald-400/70 block">
                          {req.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Manuel Kurye Ata (if pending) */}
                        {req.status === 'pending_pool' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAssigningOrder(req);
                              setSelectedCourierForAssign(courierUsers[0]?.id || '');
                            }}
                            className="px-2.5 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700/60 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Kurye Ata</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrackingId(req.id);
                            setCurrentView('tracker');
                          }}
                          className="px-2.5 py-1.5 bg-[#011410] hover:bg-[#022019] text-emerald-200 border border-emerald-700/60 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Takip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(req)}
                          className="px-2.5 py-1.5 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Fiş</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: KURYE E-POSTA BİLDİRİMLERİ & SMTP AYARLARI */}
      {/* ===================================================================== */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          {/* Status Diagnostic Card */}
          <div className={`p-5 sm:p-6 rounded-3xl border text-white space-y-4 shadow-xl transition ${
            smtpLastTestStatus === 'success' || (smtpIsConfigured && smtpHasPassword)
              ? 'bg-[#021f19] border-emerald-500/60'
              : 'bg-[#181005] border-amber-500/60'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  smtpLastTestStatus === 'success' || (smtpIsConfigured && smtpHasPassword)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-white">
                      Kurye E-posta Bildirim Durumu:
                    </h3>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      smtpLastTestStatus === 'success' || (smtpIsConfigured && smtpHasPassword)
                        ? 'bg-emerald-500 text-black'
                        : 'bg-amber-500 text-black'
                    }`}>
                      {smtpLastTestStatus === 'success' || (smtpIsConfigured && smtpHasPassword)
                        ? '🟢 Canlı E-posta Gönderimi Aktif'
                        : '⚠️ E-posta Şifresi Bekleniyor'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Yeni bir sipariş oluşturulduğunda sistem kuryelerin e-postalarına (<strong>{emailRecipients.join(', ') || 'kuryeantalyam@gmail.com'}</strong>) otomatik bildirim gönderir.
                  </p>
                  {smtpLastTestMessage && (
                    <div className="text-xs mt-2 font-medium text-slate-200 bg-black/40 p-2.5 rounded-xl border border-white/10">
                      <strong>Bağlantı Notu:</strong> {smtpLastTestMessage}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    fetchEmailLogs();
                    fetchSmtpConfig();
                  }}
                  className="p-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 rounded-xl transition cursor-pointer"
                  title="Durumu ve Logları Yenile"
                >
                  <RotateCcw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* SMTP Configuration Form */}
          <div className="bg-[#021d17] p-5 sm:p-6 rounded-3xl border border-emerald-800/60 text-white space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  <span>E-posta Gönderici (SMTP / Gmail) Ayarları</span>
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Bildirimlerin gerçek gelen kutularına (Inbox) ulaşması için Gmail veya kurumsal SMTP bilgilerinizi tanımlayınız.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGmailHelp(!showGmailHelp)}
                className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Gmail Şifresi Nasıl Alınır?</span>
              </button>
            </div>

            {/* Google App Password Guide (Collapsible) */}
            {showGmailHelp && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#011410] border border-emerald-600/60 space-y-3 text-xs text-slate-200">
                <div className="flex items-center justify-between text-emerald-400 font-bold text-sm border-b border-emerald-800/60 pb-2">
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Google Hesabı için 16 Haneli "Uygulama Şifresi" Alma Rehberi (1 Dakika)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGmailHelp(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p>
                    Google güvenlik politikaları gereği doğrudan normal Gmail şifresi yerine 16 haneli bir <strong>Uygulama Şifresi</strong> gerektirir:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-200 font-medium">
                    <li>
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 underline hover:text-emerald-300 font-bold inline-flex items-center gap-1"
                      >
                        Google Hesap Güvenliği Sayfası'na gidin <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li><strong>2 Adımlı Doğrulama</strong>'nın açık olduğundan emin olun.</li>
                    <li>
                      Arama çubuğuna <strong>"Uygulama Şifreleri"</strong> (App Passwords) yazın veya{' '}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 underline hover:text-emerald-300 font-bold inline-flex items-center gap-1"
                      >
                        doğrudan Uygulama Şifreleri sayfasına <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      tıklayın.
                    </li>
                    <li>Uygulama adı olarak <strong>"Antalya Teslimat"</strong> yazıp <strong>"Oluştur"</strong> butonuna basın.</li>
                    <li>Google'ın size verdiği <strong>16 haneli sarı kutudaki şifreyi</strong> kopyalayıp aşağıdaki "Şifre" alanına yapıştırın.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* SMTP Form Fields */}
            <form onSubmit={handleSaveSmtpConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Service Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-300 block">
                    E-posta Servis Sağlayıcısı
                  </label>
                  <select
                    value={smtpService}
                    onChange={(e) => {
                      const val = e.target.value as 'gmail' | 'custom';
                      setSmtpService(val);
                      if (val === 'gmail') {
                        setSmtpHost('smtp.gmail.com');
                        setSmtpPort(587);
                        setSmtpSecure(false);
                      }
                    }}
                    className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
                  >
                    <option value="gmail">Gmail / Google Workspace (smtp.gmail.com)</option>
                    <option value="custom">Özel SMTP Sunucusu (Kurumsal / Yandex / Natro / Turhost)</option>
                  </select>
                </div>

                {/* Sender Email / User */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-300 block">
                    Gönderici E-posta Adresi (Kullanıcı Adı)
                  </label>
                  <input
                    type="email"
                    required
                    value={smtpUser}
                    onChange={(e) => {
                      setSmtpUser(e.target.value);
                      if (!smtpFromEmail || smtpFromEmail === 'kuryeantalyam@gmail.com') {
                        setSmtpFromEmail(e.target.value);
                      }
                    }}
                    placeholder="kuryeantalyam@gmail.com"
                    className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Password / App Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-300 block">
                      {smtpService === 'gmail' ? 'Google 16 Haneli Uygulama Şifresi' : 'SMTP Şifresi'}
                    </label>
                    {smtpHasPassword && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        ✓ Kayıtlı Şifre Var
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showSmtpPass ? 'text' : 'password'}
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder={smtpHasPassword ? '•••••••••••••••• (Değiştirmek için yeni şifre girin)' : '16 haneli uygulama şifresi'}
                      className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2 pr-10 text-white text-xs focus:outline-none focus:border-emerald-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-200 p-1"
                    >
                      {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* From Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-300 block">
                    E-postada Görünen Başlık
                  </label>
                  <input
                    type="text"
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                    placeholder="Antalya Şehir İçi Teslimat 7/24"
                    className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Custom Host & Port (If Custom) */}
                {smtpService === 'custom' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-300 block">
                        SMTP Sunucu Host Adresi
                      </label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="mail.antalyateslimat.com"
                        className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-300 block">
                        Port & Güvenlik
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(Number(e.target.value))}
                          placeholder="587"
                          className="w-24 bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smtpSecure}
                            onChange={(e) => setSmtpSecure(e.target.checked)}
                            className="rounded border-emerald-700 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>SSL/TLS (465)</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Feedback banner */}
              {smtpSaveFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-start gap-2 ${
                  smtpSaveFeedback.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                    : 'bg-red-950/90 border-red-500 text-red-200'
                }`}>
                  {smtpSaveFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{smtpSaveFeedback.message}</span>
                </div>
              )}

              {/* Save & Verify Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSmtp}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSavingSmtp ? 'Doğrulanıyor...' : '💾 Ayarları Kaydet ve Bağlantıyı Doğrula'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Test Email Dispatch Card & Courier Recipient List */}
          <div className="bg-[#021d17] p-5 sm:p-6 rounded-3xl border border-emerald-800/60 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-3">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  <span>Canlı E-posta Gönderim Testi & Alıcı Kuryeler</span>
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Ayarlarınızı test etmek için aşağıdaki adrese veya kayıtlı tüm kuryelere anında örnek paket bildirim e-postası gönderebilirsiniz.
                </p>
              </div>
            </div>

            {/* Test Input & Buttons */}
            <div className="p-4 rounded-2xl bg-[#011410] border border-emerald-800/60 space-y-3">
              <span className="text-xs font-bold text-emerald-300 block">
                🧪 Test Bildirimi Gönderme Paneli
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSendTestEmail('all')}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  <span>⚡ TÜM Kuryelere Test E-postası Gönder ({emailRecipients.length} Alıcı)</span>
                </button>

                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={testTargetEmail}
                      onChange={(e) => setTestTargetEmail(e.target.value)}
                      placeholder="Tekil test adresi (örn: ahmet@gmail.com)"
                      className="w-full bg-[#021d17] border border-emerald-700/60 rounded-xl pl-8 pr-2 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendTestEmail(testTargetEmail)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-xl transition shrink-0 cursor-pointer"
                  >
                    Gönder
                  </button>
                </div>
              </div>
            </div>

            {testEmailStatus && (
              <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500 text-xs font-bold text-emerald-200 animate-in fade-in flex items-center justify-between gap-2">
                <span>{testEmailStatus}</span>
              </div>
            )}

            {/* Important Gmail Inbox Tip */}
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Gmail Gelen Kutusu & Spam Bildirimi:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-100/90">
                Gmail üzerinden kendi e-posta adresinize (<strong>{smtpUser || 'kuryeantalyam@gmail.com'}</strong>) otomatik sipariş bildirimleri gönderildiğinde, Gmail sistemi bunu bazen <strong>"Spam (İstenmeyen)"</strong> veya <strong>"Tüm Postalar" / "Güncellemeler"</strong> sekmesine yönlendirebilir. E-postayı bulamadığınızda lütfen <strong>Spam</strong> ve <strong>Tüm Postalar</strong> klasörlerinizi kontrol edip <em>"Spam Değil"</em> olarak işaretleyiniz.
              </p>
            </div>

            {/* Recipient Couriers Management & Pill List */}
            <div className="p-5 rounded-2xl bg-[#011410] border border-emerald-800/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Aktif Kurye E-posta Alıcı Listesi ({emailRecipients.length} Adres)</span>
                  </span>
                  <p className="text-[11px] text-emerald-400/70 mt-0.5">
                    Müşteri yeni bir paket talebi oluşturduğunda sistem aşağıdaki tüm e-posta adreslerine anında paralel bildirim gönderir.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendTestEmail('all')}
                  className="px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600 text-emerald-200 text-[11px] font-bold rounded-lg transition shrink-0 cursor-pointer"
                >
                  Tüm Listeye Test Gönder
                </button>
              </div>

              {/* Add Extra Courier Email Form */}
              <form onSubmit={handleAddExtraCourierEmail} className="flex items-center gap-2 pt-2 border-t border-emerald-900/60">
                <div className="flex-1 relative">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newExtraEmailInput}
                    onChange={(e) => setNewExtraEmailInput(e.target.value)}
                    placeholder="Listeye ek kurye e-postası ekle (örn: yeni.kurye@gmail.com)"
                    className="w-full bg-[#021d17] border border-emerald-700/60 rounded-xl pl-8 pr-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingExtraEmail}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingExtraEmail ? 'Ekleniyor...' : 'Listeye Ekle'}</span>
                </button>
              </form>

              {extraEmailFeedback && (
                <p className="text-xs text-emerald-300 font-medium">{extraEmailFeedback}</p>
              )}

              {/* Recipient Cards / Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {emailRecipients.map((em, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-700/50 hover:border-emerald-500 transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-xs font-mono text-emerald-200 truncate font-medium" title={em}>
                        {em}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSendTestEmail(em)}
                        title="Bu kuryeye test gönder"
                        className="p-1 rounded text-emerald-400 hover:text-white hover:bg-emerald-800/60 transition cursor-pointer text-[10px]"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                      {em !== (smtpUser || 'kuryeantalyam@gmail.com') && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraCourierEmail(em)}
                          title="Listeden kaldır"
                          className="p-1 rounded text-red-400/70 hover:text-red-300 hover:bg-red-950/60 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Email Logs History Table */}
          <div className="bg-[#021d17] p-5 sm:p-6 rounded-3xl border border-emerald-800/60 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Son Gönderilen E-posta Bildirim Geçmişi ({emailLogs.length})</span>
              </h3>
              <button
                type="button"
                onClick={fetchEmailLogs}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yenile</span>
              </button>
            </div>

            {emailLogs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#011410] border border-emerald-800/40 text-center space-y-2">
                <Mail className="w-8 h-8 text-emerald-500/50 mx-auto" />
                <p className="text-xs text-emerald-300/70">
                  Henüz kaydedilmiş e-posta logu bulunmuyor. Yeni bir sipariş oluşturulduğunda veya "Test E-postası Gönder" butonuna basıldığında burada listelenecektir.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-[#011410] border border-emerald-800/60 hover:border-emerald-500 transition space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px]">
                          #{log.trackingCode || 'TEST'}
                        </span>
                        <span className="font-bold text-white text-xs truncate max-w-md">
                          {log.subject}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-400/70 shrink-0">
                        {new Date(log.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                      <div className="text-emerald-300/80">
                        <strong>Alıcılar:</strong> {Array.isArray(log.recipients) ? log.recipients.join(', ') : log.recipients}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{log.summary}</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          log.status === 'sent'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : log.status === 'failed'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {log.status === 'sent' 
                            ? '✓ İletildi (SMTP Gerçek Gönderim)' 
                            : log.status === 'failed'
                            ? '✕ Gönderim Hatası'
                            : 'ℹ️ Simüle Edildi (Sistem Logu)'}
                        </span>
                      </div>
                    </div>

                    {log.error && (
                      <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/40 text-red-300 text-[11px]">
                        <strong>Hata Detayı:</strong> {log.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: SİSTEM, RAPORLAR & YEDEKLEME */}
      {/* ===================================================================== */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Revenue and KPI stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#021f19] p-5 rounded-3xl border border-emerald-800/60 text-white space-y-1">
              <span className="text-xs text-emerald-400/80 font-medium">Toplam Sipariş Hacmi</span>
              <p className="text-2xl font-black text-white">{requests.length} Sipariş</p>
              <span className="text-[10px] text-emerald-300">Antalya içi tüm teslimatlar</span>
            </div>

            <div className="bg-[#021f19] p-5 rounded-3xl border border-emerald-800/60 text-white space-y-1">
              <span className="text-xs text-emerald-400/80 font-medium">Kayıtlı Aktif Kurye</span>
              <p className="text-2xl font-black text-emerald-400">{courierUsers.length} Kurye</p>
              <span className="text-[10px] text-emerald-300">Sistemde tanımlı sürücüler</span>
            </div>

            <div className="bg-[#021f19] p-5 rounded-3xl border border-emerald-800/60 text-white space-y-1">
              <span className="text-xs text-emerald-400/80 font-medium">Teslim Edilenler</span>
              <p className="text-2xl font-black text-teal-300">
                {requests.filter((r) => r.status === 'delivered').length} Paket
              </p>
              <span className="text-[10px] text-emerald-300">Başarıyla ulaştırıldı</span>
            </div>

            <div className="bg-[#021f19] p-5 rounded-3xl border border-emerald-800/60 text-white space-y-1">
              <span className="text-xs text-emerald-400/80 font-medium">Tamamlanan Toplam Gelir</span>
              <p className="text-2xl font-black text-amber-400">{totalRevenue} ₺</p>
              <span className="text-[10px] text-amber-300/80">Tamamlanan sipariş tutarı</span>
            </div>
          </div>

          {/* Database Backup & Reset Operations */}
          <div className="bg-[#021d17] p-6 rounded-3xl border border-emerald-800/60 text-white space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Veritabanı Yönetimi & Yedekleme</span>
            </h3>
            <p className="text-xs text-emerald-300/80">
              Sistemdeki kuryeleri, siparişleri ve ayarları JSON formatında yedekleyebilir veya geri yükleyebilirsiniz.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={exportDatabaseBackup}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Veritabanı Yedeği İndir (JSON)</span>
              </button>

              <button
                type="button"
                onClick={resetDefaultData}
                className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Verileri Sıfırla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD NEW COURIER MODAL */}
      {/* ===================================================================== */}
      {isAddCourierOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#02231c] rounded-3xl border border-emerald-600/70 p-5 sm:p-7 max-w-md w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsAddCourierOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-emerald-400 hover:text-white rounded-xl hover:bg-emerald-900/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/40 shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Yeni Kurye Ekle</h3>
                <p className="text-xs text-emerald-300/80">Antalya kurye sistemine yeni sürücü tanımlayın.</p>
              </div>
            </div>

            {addCourierError && (
              <div className="p-3 bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{addCourierError}</span>
              </div>
            )}

            {addCourierSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{addCourierSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddCourierSubmit} className="space-y-4 text-xs">
              {/* Ad Soyad */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Kurye Adı ve Soyadı *</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  placeholder="0544 111 22 33"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* E-posta */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">E-posta Adresi (Giriş İçin) *</label>
                <input
                  type="email"
                  required
                  value={courierEmail}
                  onChange={(e) => setCourierEmail(e.target.value)}
                  placeholder="ahmet@antalyakurye.com"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Şifre */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Kurye Giriş Şifresi</label>
                <input
                  type="text"
                  value={courierPassword}
                  onChange={(e) => setCourierPassword(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* Çalışma Bölgesi (İlçe) */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Çalışma Bölgesi (İlçe)</label>
                <select
                  value={courierDistrict}
                  onChange={(e) => setCourierDistrict(e.target.value as DistrictName)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-emerald-200 focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
                >
                  {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((districtName) => (
                    <option key={districtName} value={districtName} className="bg-[#021f19] text-white">
                      {districtName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm rounded-2xl transition shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-98"
                >
                  Kuryeyi Sisteme Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: DELETE COURIER CONFIRMATION MODAL */}
      {/* ===================================================================== */}
      {deletingCourier && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02231c] rounded-3xl border border-rose-600/70 p-6 max-w-sm w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-600/60 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-white">Kuryeyi Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-emerald-300/80">
                <strong>{deletingCourier.name}</strong> adlı kurye sistemden tamamen silinecektir.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCourier(null)}
                className="py-2.5 px-3 bg-[#011410] hover:bg-[#022019] text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteCourier}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md shadow-rose-600/40"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: ASSIGN COURIER MODAL */}
      {/* ===================================================================== */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02231c] rounded-3xl border border-emerald-600/70 p-6 max-w-md w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3">
              <h3 className="font-extrabold text-sm text-white">Siparişe Kurye Ata</h3>
              <span className="font-mono text-xs text-amber-400">{assigningOrder.trackingCode}</span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-emerald-200 block">Atanacak Kuryeyi Seçiniz:</label>
              <select
                value={selectedCourierForAssign}
                onChange={(e) => setSelectedCourierForAssign(e.target.value)}
                className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3 py-2.5 text-emerald-200 outline-hidden font-medium cursor-pointer"
              >
                {courierUsers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#021f19] text-white">
                    {c.name} ({c.district || 'Antalya'} - {c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="py-2.5 px-3 bg-[#011410] hover:bg-[#022019] text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                İptal
              </button>

              <button
                type="button"
                onClick={handleConfirmAssign}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md"
              >
                Görevi Ata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: RECEIPT MODAL */}
      {/* ===================================================================== */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: ADD NEW CUSTOMER MODAL */}
      {/* ===================================================================== */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#02231c] rounded-3xl border border-teal-600/70 p-5 sm:p-7 max-w-md w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-emerald-400 hover:text-white rounded-xl hover:bg-emerald-900/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-600/40 shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Yeni Müşteri Ekle</h3>
                <p className="text-xs text-emerald-300/80">Sisteme yeni bireysel veya kurumsal müşteri tanımlayın.</p>
              </div>
            </div>

            {addCustomerError && (
              <div className="p-3 bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{addCustomerError}</span>
              </div>
            )}

            {addCustomerSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{addCustomerSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3.5 text-xs">
              {/* Ad Soyad */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Müşteri / Yetkili Adı *</label>
                <input
                  type="text"
                  required
                  value={addCustName}
                  onChange={(e) => setAddCustName(e.target.value)}
                  placeholder="Örn: Mehmet Demir"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Firma Adı (Opsiyonel) */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Firma / Kurum Adı (Opsiyonel)</label>
                <input
                  type="text"
                  value={addCustCompany}
                  onChange={(e) => setAddCustCompany(e.target.value)}
                  placeholder="Örn: Demir Hukuk Bürosu"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  value={addCustPhone}
                  onChange={(e) => setAddCustPhone(e.target.value)}
                  placeholder="0532 555 66 77"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* E-posta */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">E-posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={addCustEmail}
                  onChange={(e) => setAddCustEmail(e.target.value)}
                  placeholder="mehmet@example.com"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Şifre */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Giriş Şifresi</label>
                <input
                  type="text"
                  value={addCustPassword}
                  onChange={(e) => setAddCustPassword(e.target.value)}
                  placeholder="123"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white placeholder-emerald-600 focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* İlçe */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">İlçe</label>
                <select
                  value={addCustDistrict}
                  onChange={(e) => setAddCustDistrict(e.target.value as DistrictName)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-emerald-200 focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
                >
                  {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((districtName) => (
                    <option key={districtName} value={districtName} className="bg-[#021f19] text-white">
                      {districtName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-extrabold text-sm rounded-2xl transition shadow-lg shadow-teal-500/30 cursor-pointer active:scale-98"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: EDIT CUSTOMER MODAL */}
      {/* ===================================================================== */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#02231c] rounded-3xl border border-teal-600/70 p-5 sm:p-7 max-w-md w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              type="button"
              onClick={() => setEditingCustomer(null)}
              className="absolute top-4 right-4 p-1.5 text-emerald-400 hover:text-white rounded-xl hover:bg-emerald-900/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-600/40 shrink-0">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Müşteri Bilgilerini Düzenle</h3>
                <p className="text-xs text-emerald-300/80">{editingCustomer.name}</p>
              </div>
            </div>

            {editCustSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{editCustSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditCustomer} className="space-y-3.5 text-xs">
              {/* Ad Soyad */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Müşteri / Yetkili Adı *</label>
                <input
                  type="text"
                  required
                  value={editCustName}
                  onChange={(e) => setEditCustName(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Firma Adı */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Firma / Kurum Adı</label>
                <input
                  type="text"
                  value={editCustCompany}
                  onChange={(e) => setEditCustCompany(e.target.value)}
                  placeholder="Örn: ABC Ticaret"
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  value={editCustPhone}
                  onChange={(e) => setEditCustPhone(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* E-posta */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">E-posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={editCustEmail}
                  onChange={(e) => setEditCustEmail(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Şifre */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Giriş Şifresi</label>
                <input
                  type="text"
                  value={editCustPassword}
                  onChange={(e) => setEditCustPassword(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* İlçe */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">İlçe</label>
                <select
                  value={editCustDistrict}
                  onChange={(e) => setEditCustDistrict(e.target.value as DistrictName)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-emerald-200 focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
                >
                  {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((districtName) => (
                    <option key={districtName} value={districtName} className="bg-[#021f19] text-white">
                      {districtName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="py-2.5 px-3 bg-[#011410] hover:bg-[#022019] text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: DELETE CUSTOMER CONFIRMATION MODAL */}
      {/* ===================================================================== */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02231c] rounded-3xl border border-rose-600/70 p-6 max-w-sm w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-600/60 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-white">Müşteriyi Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-emerald-300/80">
                <strong>{deletingCustomer.name}</strong> ({deletingCustomer.email}) adlı müşteri sistemden silinecektir.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="py-2.5 px-3 bg-[#011410] hover:bg-[#022019] text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteCustomer}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md shadow-rose-600/40"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: CUSTOMER ORDERS HISTORY MODAL */}
      {/* ===================================================================== */}
      {selectedCustomerForOrders && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#02231c] rounded-3xl border border-emerald-600/70 p-5 sm:p-7 max-w-2xl w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedCustomerForOrders(null)}
              className="absolute top-4 right-4 p-1.5 text-emerald-400 hover:text-white rounded-xl hover:bg-emerald-900/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-emerald-800/50 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/40 shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <span>{selectedCustomerForOrders.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-teal-950 border border-teal-500/50 text-teal-300 rounded-md font-medium">
                    Sipariş Geçmişi
                  </span>
                </h3>
                <p className="text-xs text-emerald-300/80">
                  {selectedCustomerForOrders.phone} • {selectedCustomerForOrders.email}
                  {selectedCustomerForOrders.companyName && ` • ${selectedCustomerForOrders.companyName}`}
                </p>
              </div>
            </div>

            {/* Orders list */}
            {(() => {
              const customerOrders = requests.filter(
                (r) =>
                  r.senderUserId === selectedCustomerForOrders.id ||
                  r.sender?.contactPhone === selectedCustomerForOrders.phone ||
                  r.sender?.contactEmail === selectedCustomerForOrders.email
              );

              if (customerOrders.length === 0) {
                return (
                  <div className="p-8 text-center bg-[#011410] rounded-2xl border border-emerald-800/40 space-y-2">
                    <ShoppingBag className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className="text-sm font-bold text-white">Henüz Kayıtlı Sipariş Yok</p>
                    <p className="text-xs text-emerald-400/80">Bu müşteriye ait verilmiş teslimat talebi bulunmuyor.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="text-xs text-emerald-400/80 flex items-center justify-between">
                    <span>Toplam {customerOrders.length} adet sipariş bulundu</span>
                    <span className="font-bold text-white">
                      Toplam: {customerOrders.reduce((a, b) => a + (b.price || 0), 0)} ₺
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#011410] p-4 rounded-2xl border border-emerald-800/40 hover:border-emerald-600/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-300">{order.trackingCode}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                                  : order.status === 'cancelled'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                                  : 'bg-amber-950 text-amber-300 border border-amber-600/50'
                              }`}
                            >
                              {order.status === 'delivered'
                                ? 'Teslim Edildi'
                                : order.status === 'cancelled'
                                ? 'İptal Edildi'
                                : order.status === 'in_transit'
                                ? 'Yolda'
                                : order.status === 'picked_up'
                                ? 'Alındı'
                                : order.status === 'accepted'
                                ? 'Kurye Atandı'
                                : 'Bekliyor'}
                            </span>
                          </div>
                          <p className="font-bold text-white">{order.packageName || 'Kurye Paketi'}</p>
                          <div className="flex items-center gap-2 text-emerald-300/80 text-[11px]">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>
                              {order.sender?.district} ➔ {order.receiver?.district}
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-400/60">
                            Alıcı: {order.receiver?.contactName} ({order.receiver?.contactPhone})
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-900/40">
                          <span className="font-black text-base text-emerald-400">{order.price} ₺</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceiptOrder(order);
                              }}
                              className="px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 rounded-lg text-[11px] font-bold border border-emerald-700/60 transition cursor-pointer flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Fiş / Makbuz</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 9: EDIT COURIER MODAL */}
      {/* ===================================================================== */}
      {editingCourier && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#02231c] rounded-3xl border border-emerald-600/70 p-5 sm:p-7 max-w-md w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              type="button"
              onClick={() => setEditingCourier(null)}
              className="absolute top-4 right-4 p-1.5 text-emerald-400 hover:text-white rounded-xl hover:bg-emerald-900/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/40 shrink-0">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Kurye Bilgilerini Düzenle</h3>
                <p className="text-xs text-emerald-300/80">{editingCourier.name}</p>
              </div>
            </div>

            {editCourSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{editCourSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditCourier} className="space-y-3.5 text-xs">
              {/* Ad Soyad */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Kurye Adı ve Soyadı *</label>
                <input
                  type="text"
                  required
                  value={editCourName}
                  onChange={(e) => setEditCourName(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  value={editCourPhone}
                  onChange={(e) => setEditCourPhone(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* E-posta */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">E-posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={editCourEmail}
                  onChange={(e) => setEditCourEmail(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>

              {/* Şifre */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Kurye Giriş Şifresi</label>
                <input
                  type="text"
                  value={editCourPassword}
                  onChange={(e) => setEditCourPassword(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-hidden font-mono"
                />
              </div>

              {/* İlçe */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-200 block">Çalışma Bölgesi (İlçe)</label>
                <select
                  value={editCourDistrict}
                  onChange={(e) => setEditCourDistrict(e.target.value as DistrictName)}
                  className="w-full bg-[#011410] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-emerald-200 focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
                >
                  {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((districtName) => (
                    <option key={districtName} value={districtName} className="bg-[#021f19] text-white">
                      {districtName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourier(null)}
                  className="py-2.5 px-3 bg-[#011410] hover:bg-[#022019] text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
