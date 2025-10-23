<template>
  <div class="creator-wallet-page">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <BaseButton
          variant="secondary"
          size="md"
          @click="goBack"
        >
          ← Kembali
        </BaseButton>
        <h1>Wallet Management</h1>
        <p class="subtitle">Kelola wallet dan rekening bank Anda</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data wallet...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Gagal Memuat Data</h3>
        <p>{{ error }}</p>
        <BaseButton
          variant="primary"
          size="md"
          @click="loadWalletData"
        >
          Coba Lagi
        </BaseButton>
      </div>

      <!-- Wallet Content -->
      <div v-else class="wallet-content">
        <!-- Wallet Balance -->
        <div class="wallet-balance-section">
          <h2>Saldo Wallet</h2>
          <div class="balance-card">
            <div class="balance-icon">💰</div>
            <div class="balance-info">
              <h3>Total Saldo</h3>
              <p class="balance-amount">{{ formatCurrency(wallet?.balance || 0) }}</p>
              <p class="balance-updated">Terakhir diperbarui: {{ formatDate(wallet?.updated_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Bank Accounts Management -->
        <div class="bank-accounts-section">
          <div class="section-header">
            <h2>Rekening Bank</h2>
            <BaseButton
              variant="primary"
              size="md"
              @click="showAddBankModal = true"
            >
              + Tambah Rekening
            </BaseButton>
          </div>

          <!-- Loading Banks -->
          <div v-if="banksLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat rekening bank...</p>
          </div>

          <!-- Error Loading Banks -->
          <div v-else-if="banksError" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Gagal Memuat Rekening</h3>
            <p>{{ banksError }}</p>
            <BaseButton
              variant="secondary"
              size="md"
              @click="loadBanks"
            >
              Coba Lagi
            </BaseButton>
          </div>

          <!-- Banks List -->
          <div v-else-if="banks.length > 0" class="banks-list">
            <div 
              v-for="bank in banks" 
              :key="bank.Id"
              class="bank-card"
            >
              <div class="bank-info">
                <div class="bank-icon">🏦</div>
                <div class="bank-details">
                  <h4>{{ bank.FullName }}</h4>
                  <p class="account-number">{{ bank.AccountNumber }}</p>
                  <p class="bank-id">Bank ID: {{ bank.BankId }}</p>
                </div>
              </div>
              <div class="bank-actions">
                <BaseButton
                  variant="danger"
                  size="sm"
                  @click="deleteBank(bank.Id)"
                >
                  Hapus
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Empty Banks -->
          <div v-else class="empty-banks">
            <div class="empty-icon">🏦</div>
            <h3>Belum Ada Rekening</h3>
            <p>Tambahkan rekening bank untuk menerima pembayaran dari pembeli.</p>
            <BaseButton
              variant="primary"
              size="md"
              @click="showAddBankModal = true"
            >
              Tambah Rekening Pertama
            </BaseButton>
          </div>
        </div>

        <!-- Wallet Transactions -->
        <div class="transactions-section">
          <div class="section-header">
            <h2>Riwayat Transaksi</h2>
            <div class="transaction-filters">
              <select v-model="transactionFilter" class="filter-select">
                <option value="all">Semua Transaksi</option>
                <option value="income">Pendapatan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
          </div>

          <!-- Loading Transactions -->
          <div v-if="transactionsLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat transaksi...</p>
          </div>

          <!-- Error Loading Transactions -->
          <div v-else-if="transactionsError" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Gagal Memuat Transaksi</h3>
            <p>{{ transactionsError }}</p>
            <BaseButton
              variant="secondary"
              size="md"
              @click="loadTransactions"
            >
              Coba Lagi
            </BaseButton>
          </div>

          <!-- Transactions List -->
          <div v-else-if="filteredTransactions.length > 0" class="transactions-list">
            <div 
              v-for="transaction in filteredTransactions" 
              :key="transaction.id"
              class="transaction-card"
            >
              <div class="transaction-info">
                <div class="transaction-icon" :class="{ income: transaction.amount > 0, expense: transaction.amount < 0 }">
                  {{ transaction.amount > 0 ? '💰' : '💸' }}
                </div>
                <div class="transaction-details">
                  <h4>{{ transaction.amount > 0 ? 'Pendapatan' : 'Pengeluaran' }}</h4>
                  <p class="transaction-id">Transaction Detail ID: {{ transaction.transaction_detail_id }}</p>
                  <p class="transaction-date">{{ formatDate(transaction.created_at) }}</p>
                </div>
              </div>
              <div class="transaction-amount" :class="{ income: transaction.amount > 0, expense: transaction.amount < 0 }">
                {{ transaction.amount > 0 ? '+' : '' }}{{ formatCurrency(transaction.amount) }}
              </div>
            </div>
          </div>

          <!-- Empty Transactions -->
          <div v-else class="empty-transactions">
            <div class="empty-icon">📊</div>
            <h3>Belum Ada Transaksi</h3>
            <p>Transaksi wallet akan muncul di sini.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Bank Modal -->
    <div v-if="showAddBankModal" class="modal-overlay" @click="closeAddBankModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Tambah Rekening Bank</h2>
          <button class="close-button" @click="closeAddBankModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="bankId" class="form-label">Pilih Bank:</label>
            <div v-if="bankListLoading" class="loading-bank-list">
              <div class="spinner-small"></div>
              <span>Memuat daftar bank...</span>
            </div>
            <select
              v-else
              id="bankId"
              v-model="newBank.bank_id"
              class="form-select"
              :disabled="bankListLoading"
              required
            >
              <option value="">-- Pilih Bank --</option>
              <option 
                v-for="bank in bankList" 
                :key="bank.id" 
                :value="bank.id"
              >
                {{ bank.name }} ({{ bank.bank_code }})
              </option>
            </select>
            <div v-if="bankListError" class="error-message">
              {{ bankListError }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="fullName" class="form-label">Nama Lengkap:</label>
            <input
              id="fullName"
              v-model="newBank.full_name"
              type="text"
              class="form-input"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="accountNumber" class="form-label">Nomor Rekening:</label>
            <input
              id="accountNumber"
              v-model="newBank.account_number"
              type="text"
              class="form-input"
              placeholder="Masukkan nomor rekening"
              required
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <BaseButton
            variant="secondary"
            size="md"
            @click="closeAddBankModal"
          >
            Batal
          </BaseButton>
          <BaseButton
            variant="primary"
            size="md"
            :disabled="!isBankFormValid || isSubmittingBank"
            @click="submitAddBank"
          >
            <span v-if="isSubmittingBank">Menambahkan...</span>
            <span v-else>Tambah Rekening</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { apiService } from '../services/api';
import { useNotification } from '../composables/useNotification';
import BaseButton from '../components/BaseButton.vue';
import type { Wallet, BankWallet, WalletTransaction, AddBankRequest, Bank } from '../types/apiContracts';

const router = useRouter();
const userStore = useUserStore();
const { showSuccess, showError } = useNotification();

// Reactive data
const wallet = ref<Wallet | null>(null);
const banks = ref<BankWallet[]>([]);
const bankList = ref<Bank[]>([]);
const transactions = ref<WalletTransaction[]>([]);
const isLoading = ref(false);
const banksLoading = ref(false);
const bankListLoading = ref(false);
const transactionsLoading = ref(false);
const error = ref<string | null>(null);
const banksError = ref<string | null>(null);
const bankListError = ref<string | null>(null);
const transactionsError = ref<string | null>(null);

// Modal state
const showAddBankModal = ref(false);
const isSubmittingBank = ref(false);
const newBank = ref<AddBankRequest>({
  bank_id: '',
  full_name: '',
  account_number: ''
});

// Filter state
const transactionFilter = ref('all');

// Computed
const filteredTransactions = computed(() => {
  if (transactionFilter.value === 'all') {
    return transactions.value;
  } else if (transactionFilter.value === 'income') {
    return transactions.value.filter(t => t.amount > 0);
  } else if (transactionFilter.value === 'expense') {
    return transactions.value.filter(t => t.amount < 0);
  }
  return transactions.value;
});

const isBankFormValid = computed(() => {
  return newBank.value.bank_id.trim() !== '' && 
         newBank.value.full_name.trim() !== '' && 
         newBank.value.account_number.trim() !== '';
});

// Methods
const loadWalletData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await apiService.transaction.getWallet();
    wallet.value = response.data || null;
  } catch (err: any) {
    error.value = err.message || 'Gagal memuat data wallet';
    showError(
      'Gagal Memuat Wallet',
      err.message || 'Terjadi kesalahan saat memuat data wallet',
      5000
    );
  } finally {
    isLoading.value = false;
  }
};

const loadBanks = async () => {
  banksLoading.value = true;
  banksError.value = null;
  
  try {
    const response = await apiService.transaction.getBanks();
    banks.value = response.data || [];
  } catch (err: any) {
    banksError.value = err.message || 'Gagal memuat rekening bank';
    showError(
      'Gagal Memuat Rekening',
      err.message || 'Terjadi kesalahan saat memuat rekening bank',
      5000
    );
  } finally {
    banksLoading.value = false;
  }
};

const loadBankList = async () => {
  bankListLoading.value = true;
  bankListError.value = null;
  
  try {
    const response = await apiService.transaction.getBankList();
    bankList.value = response.data || [];
  } catch (err: any) {
    bankListError.value = err.message || 'Gagal memuat daftar bank';
    showError(
      'Gagal Memuat Daftar Bank',
      err.message || 'Terjadi kesalahan saat memuat daftar bank',
      5000
    );
  } finally {
    bankListLoading.value = false;
  }
};

const loadTransactions = async () => {
  transactionsLoading.value = true;
  transactionsError.value = null;
  
  try {
    const response = await apiService.transaction.getWalletTransactions({
      page: 1,
      size: 50,
      order: 'DESC'
    });
    transactions.value = response.data || [];
  } catch (err: any) {
    transactionsError.value = err.message || 'Gagal memuat transaksi';
    showError(
      'Gagal Memuat Transaksi',
      err.message || 'Terjadi kesalahan saat memuat transaksi',
      5000
    );
  } finally {
    transactionsLoading.value = false;
  }
};

const deleteBank = async (bankWalletId: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus rekening ini?')) {
    return;
  }
  
  try {
    await apiService.transaction.deleteBank(bankWalletId);
    showSuccess(
      'Rekening Dihapus',
      'Rekening bank berhasil dihapus',
      3000
    );
    await loadBanks();
  } catch (err: any) {
    showError(
      'Gagal Menghapus Rekening',
      err.message || 'Terjadi kesalahan saat menghapus rekening',
      5000
    );
  }
};

const submitAddBank = async () => {
  if (!isBankFormValid.value || isSubmittingBank.value) return;
  
  isSubmittingBank.value = true;
  
  try {
    await apiService.transaction.addBank(newBank.value);
    showSuccess(
      'Rekening Ditambahkan',
      'Rekening bank berhasil ditambahkan',
      3000
    );
    closeAddBankModal();
    await loadBanks();
  } catch (err: any) {
    showError(
      'Gagal Menambahkan Rekening',
      err.message || 'Terjadi kesalahan saat menambahkan rekening',
      5000
    );
  } finally {
    isSubmittingBank.value = false;
  }
};

const closeAddBankModal = () => {
  showAddBankModal.value = false;
  newBank.value = {
    bank_id: '',
    full_name: '',
    account_number: ''
  };
  isSubmittingBank.value = false;
};

const goBack = () => {
  router.back();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Initialize
onMounted(() => {
  // Check if user is authenticated
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  loadWalletData();
  loadBanks();
  loadBankList();
  loadTransactions();
});
</script>

<style scoped>
.creator-wallet-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  margin-bottom: 2rem;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
}

.subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.wallet-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.wallet-balance-section,
.bank-accounts-section,
.transactions-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.wallet-balance-section h2,
.bank-accounts-section h2,
.transactions-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.balance-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  color: white;
}

.balance-icon {
  font-size: 3rem;
}

.balance-info h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.balance-amount {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.balance-updated {
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.transaction-filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #374151;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.banks-list,
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bank-card,
.transaction-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.bank-card:hover,
.transaction-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bank-info,
.transaction-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bank-icon,
.transaction-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
}

.transaction-icon.income {
  background: #dcfce7;
  color: #166534;
}

.transaction-icon.expense {
  background: #fee2e2;
  color: #dc2626;
}

.bank-details h4,
.transaction-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.account-number,
.transaction-id {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  font-family: monospace;
}

.bank-id,
.transaction-date {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.transaction-amount {
  font-size: 1.125rem;
  font-weight: 600;
}

.transaction-amount.income {
  color: #059669;
}

.transaction-amount.expense {
  color: #dc2626;
}

.bank-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-banks,
.empty-transactions {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-banks .empty-icon,
.empty-transactions .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-banks h3,
.empty-transactions h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-banks p,
.empty-transactions p {
  margin: 0;
  font-size: 0.875rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  background: white;
  color: #374151;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.loading-bank-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  margin-top: 0.5rem;
  color: #dc2626;
  font-size: 0.75rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .balance-card {
    flex-direction: column;
    text-align: center;
  }
  
  .bank-card,
  .transaction-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .bank-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
