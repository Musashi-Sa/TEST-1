import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@financial_life_v2_data_v1';

const TRANSLATIONS = {
  ar: {
    appTitle: 'مدير المال V2',
    subtitle: 'تحكم كامل في الدخل والمصاريف وتدفق الأموال',
    netBalance: 'صافي الرصيد الحالي',
    totalIncome: 'إجمالي الدخل',
    totalExpense: 'إجمالي المصاريف',
    cashflowPositive: 'تدفق مالي إيجابي',
    cashflowNegative: 'تنبيه: المصاريف أعلى من الدخل',
    newTransaction: 'إضافة عملية جديدة',
    income: 'دخل',
    expense: 'مصروف',
    amountPlaceholder: 'المبلغ (مثال: 500)',
    titlePlaceholder: 'البيان أو الوصف (مثال: راتب، كراء، طعام)',
    categoryLabel: 'التصنيف',
    addBtn: 'إضافة العملية',
    filterAll: 'الكل',
    filterIncome: 'الدخل',
    filterExpense: 'المصاريف',
    historyTitle: 'سجل التدفق المالي',
    emptyHistory: 'لا توجد عمليات في هذا القسم حالياً.',
    clearAll: 'مسح الكل',
    deleteItem: 'حذف',
    categories: {
      salary: 'راتب / عمل',
      freelance: 'دخل إضافي',
      food: 'طعام ومقاضي',
      bills: 'فواتير وسكن',
      transport: 'نقل ومواصلات',
      shopping: 'تسوق وخدمات',
      health: 'صحة',
      other: 'متفرقات',
    },
    errorAmount: 'أدخل مبلغاً صحيحاً أكبر من صفر.',
    errorTitle: 'أدخل وصفاً مختصراً للعملية.',
  },
  en: {
    appTitle: 'Money Manager V2',
    subtitle: 'Complete control over income, expenses & cashflow',
    netBalance: 'Net Current Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expenses',
    cashflowPositive: 'Positive Cashflow',
    cashflowNegative: 'Alert: Expenses exceed income',
    newTransaction: 'Add Transaction',
    income: 'Income',
    expense: 'Expense',
    amountPlaceholder: 'Amount (e.g. 500)',
    titlePlaceholder: 'Description (e.g. Salary, Rent, Food)',
    categoryLabel: 'Category',
    addBtn: 'Save Transaction',
    filterAll: 'All',
    filterIncome: 'Income',
    filterExpense: 'Expenses',
    historyTitle: 'Cashflow History',
    emptyHistory: 'No transactions in this filter yet.',
    clearAll: 'Clear All',
    deleteItem: 'Delete',
    categories: {
      salary: 'Salary / Work',
      freelance: 'Side Income',
      food: 'Food & Groceries',
      bills: 'Bills & Housing',
      transport: 'Transport',
      shopping: 'Shopping & Services',
      health: 'Health',
      other: 'Other',
    },
    errorAmount: 'Enter a valid amount greater than 0.',
    errorTitle: 'Enter a short description.',
  },
  fr: {
    appTitle: 'Gestionnaire Argent V2',
    subtitle: 'Contrôle complet des revenus, dépenses et flux',
    netBalance: 'Solde Net Actuel',
    totalIncome: 'Total Revenus',
    totalExpense: 'Total Dépenses',
    cashflowPositive: 'Flux de trésorerie positif',
    cashflowNegative: 'Alerte : Dépenses supérieures aux revenus',
    newTransaction: 'Nouvelle Opération',
    income: 'Revenu',
    expense: 'Dépense',
    amountPlaceholder: 'Montant (ex. 500)',
    titlePlaceholder: 'Libellé (ex. Salaire, Loyer, Courses)',
    categoryLabel: 'Catégorie',
    addBtn: 'Enregistrer',
    filterAll: 'Tout',
    filterIncome: 'Revenus',
    filterExpense: 'Dépenses',
    historyTitle: 'Historique des Flux',
    emptyHistory: 'Aucune opération dans ce filtre.',
    clearAll: 'Tout effacer',
    deleteItem: 'Supprimer',
    categories: {
      salary: 'Salaire / Travail',
      freelance: 'Revenus annexes',
      food: 'Alimentation',
      bills: 'Factures & Logement',
      transport: 'Transport',
      shopping: 'Achats & Services',
      health: 'Santé',
      other: 'Autre',
    },
    errorAmount: 'Entrez un montant valide supérieur à 0.',
    errorTitle: 'Entrez une courte description.',
  },
};

const INITIAL_TRANSACTIONS = [
  {
    id: 'init-1',
    type: 'income',
    amount: 1500,
    title: 'Initial Balance',
    category: 'salary',
    date: 'Now',
  },
  {
    id: 'init-2',
    type: 'expense',
    amount: 250,
    title: 'Starter Expense',
    category: 'bills',
    date: 'Now',
  },
];

export default function App() {
  const [lang, setLang] = useState('ar');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [type, setType] = useState('expense');
  const [amountInput, setAmountInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [category, setCategory] = useState('food');
  const [filter, setFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');
  const [isReady, setIsReady] = useState(false);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    const loadStoredState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.lang && TRANSLATIONS[parsed.lang]) {
            setLang(parsed.lang);
          }
          if (Array.isArray(parsed.transactions)) {
            setTransactions(parsed.transactions);
          }
        }
      } catch (_) {
        // Use defaults if reading fails
      } finally {
        setIsReady(true);
      }
    };
    loadStoredState();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const persistState = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ lang, transactions })
        );
      } catch (_) {
        // Ignore storage write errors
      }
    };
    persistState();
  }, [lang, transactions, isReady]);

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
      const val = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += val;
      } else {
        totalExpense += val;
      }
    }

    const netBalance = totalIncome - totalExpense;
    const burnRate =
      totalIncome > 0
        ? Math.min(100, Math.round((totalExpense / totalIncome) * 100))
        : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      burnRate,
    };
  }, [transactions]);

  const visibleTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  const handleAddTransaction = () => {
    const numericAmount = parseFloat(amountInput.replace(',', '.'));
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg(t.errorAmount);
      return;
    }
    if (!titleInput.trim()) {
      setErrorMsg(t.errorTitle);
      return;
    }

    const now = new Date();
    const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      amount: numericAmount,
      title: titleInput.trim(),
      category,
      date: timeLabel,
    };

    setTransactions((prev) => [entry, ...prev]);
    setAmountInput('');
    setTitleInput('');
    setErrorMsg('');
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const handleClearAll = () => {
    setTransactions([]);
  };

  const formatMoney = (value) => {
    const sign = value < 0 ? '-' : '';
    return `${sign}$${Math.abs(value).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })}`;
  };

  const categoryKeys = Object.keys(t.categories);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header & Language Switcher */}
          <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.appTitle, isRTL && styles.alignRight]}>
                {t.appTitle}
              </Text>
              <Text style={[styles.subtitle, isRTL && styles.alignRight]}>
                {t.subtitle}
              </Text>
            </View>

            <View style={styles.langSwitcher}>
              {['ar', 'en', 'fr'].map((code) => {
                const selected = lang === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => {
                      setLang(code);
                      setErrorMsg('');
                    }}
                    style={[styles.langBtn, selected && styles.langBtnSelected]}
                  >
                    <Text
                      style={[
                        styles.langBtnText,
                        selected && styles.langBtnTextSelected,
                      ]}
                    >
                      {code.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Balance & Cashflow Summary Card */}
          <View style={styles.heroCard}>
            <Text style={[styles.heroLabel, isRTL && styles.alignRight]}>
              {t.netBalance}
            </Text>
            <Text
              style={[
                styles.heroBalance,
                summary.netBalance < 0 && styles.heroBalanceNegative,
                isRTL && styles.alignRight,
              ]}
            >
              {formatMoney(summary.netBalance)}
            </Text>

            <View
              style={[
                styles.cashflowPill,
                summary.netBalance >= 0
                  ? styles.pillPositive
                  : styles.pillNegative,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  summary.netBalance >= 0
                    ? styles.pillTextPositive
                    : styles.pillTextNegative,
                ]}
              >
                {summary.netBalance >= 0
                  ? t.cashflowPositive
                  : t.cashflowNegative}
              </Text>
            </View>

            <View style={[styles.metricsRow, isRTL && styles.rowReverse]}>
              <View style={styles.incomeBox}>
                <Text style={[styles.metricLabel, isRTL && styles.alignRight]}>
                  {t.totalIncome}
                </Text>
                <Text style={[styles.incomeValue, isRTL && styles.alignRight]}>
                  +{formatMoney(summary.totalIncome).replace('-', '')}
                </Text>
              </View>

              <View style={styles.expenseBox}>
                <Text style={[styles.metricLabel, isRTL && styles.alignRight]}>
                  {t.totalExpense}
                </Text>
                <Text style={[styles.expenseValue, isRTL && styles.alignRight]}>
                  -{formatMoney(summary.totalExpense).replace('-', '')}
                </Text>
              </View>
            </View>

            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${summary.burnRate}%`,
                    backgroundColor:
                      summary.burnRate > 80 ? '#F43F5E' : '#F59E0B',
                  },
                ]}
              />
            </View>
          </View>

          {/* Transaction Input Card */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.alignRight]}>
              {t.newTransaction}
            </Text>

            <View style={[styles.typeSelector, isRTL && styles.rowReverse]}>
              <TouchableOpacity
                onPress={() => setType('income')}
                style={[
                  styles.typeOption,
                  type === 'income' && styles.typeOptionIncome,
                ]}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    type === 'income' && styles.typeOptionTextActive,
                  ]}
                >
                  {t.income}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType('expense')}
                style={[
                  styles.typeOption,
                  type === 'expense' && styles.typeOptionExpense,
                ]}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    type === 'expense' && styles.typeOptionTextActive,
                  ]}
                >
                  {t.expense}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder={t.amountPlaceholder}
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              style={[styles.inputField, isRTL && styles.inputRTL]}
            />

            <TextInput
              value={titleInput}
              onChangeText={setTitleInput}
              placeholder={t.titlePlaceholder}
              placeholderTextColor="#64748B"
              style={[styles.inputField, isRTL && styles.inputRTL]}
            />

            <Text style={[styles.fieldLabel, isRTL && styles.alignRight]}>
              {t.categoryLabel}
            </Text>

            <View style={[styles.categoriesWrap, isRTL && styles.rowReverse]}>
              {categoryKeys.map((key) => {
                const active = category === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setCategory(key)}
                    style={[
                      styles.categoryChip,
                      active && styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                    >
                      {t.categories[key]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!!errorMsg && (
              <Text style={[styles.errorText, isRTL && styles.alignRight]}>
                {errorMsg}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleAddTransaction}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{t.addBtn}</Text>
            </TouchableOpacity>
          </View>

          {/* Transactions History Card */}
          <View style={styles.card}>
            <View style={[styles.historyTopRow, isRTL && styles.rowReverse]}>
              <Text style={[styles.cardTitle, styles.noBottomMargin]}>
                {t.historyTitle}
              </Text>

              {transactions.length > 0 && (
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={styles.clearButtonText}>{t.clearAll}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.filterTabs, isRTL && styles.rowReverse]}>
              {[
                { key: 'all', label: t.filterAll },
                { key: 'income', label: t.filterIncome },
                { key: 'expense', label: t.filterExpense },
              ].map((tab) => {
                const active = filter === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setFilter(tab.key)}
                    style={[
                      styles.filterTab,
                      active && styles.filterTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        active && styles.filterTabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {visibleTransactions.length === 0 ? (
              <Text style={styles.emptyText}>{t.emptyHistory}</Text>
            ) : (
              visibleTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <View
                    key={tx.id}
                    style={[styles.txItem, isRTL && styles.rowReverse]}
                  >
                    <View style={styles.txDetails}>
                      <Text style={[styles.txTitle, isRTL && styles.alignRight]}>
                        {tx.title}
                      </Text>
                      <Text style={[styles.txSub, isRTL && styles.alignRight]}>
                        {t.categories[tx.category] || tx.category} • {tx.date}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.txRightCol,
                        isRTL ? styles.txRightRTL : styles.txRightLTR,
                      ]}
                    >
                      <Text
                        style={[
                          styles.txAmount,
                          isIncome ? styles.txAmountIncome : styles.txAmountExpense,
                        ]}
                      >
                        {isIncome ? '+' : '-'}
                        {formatMoney(tx.amount).replace('-', '')}
                      </Text>

                      <TouchableOpacity
                        onPress={() => handleDeleteTransaction(tx.id)}
                        style={styles.deleteChip}
                      >
                        <Text style={styles.deleteChipText}>{t.deleteItem}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  flexOne: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  headerTextWrap: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  alignRight: {
    textAlign: 'right',
  },
  langSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langBtn: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
  },
  langBtnSelected: {
    backgroundColor: '#10B981',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  langBtnTextSelected: {
    color: '#06281E',
  },
  heroCard: {
    backgroundColor: '#111C33',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  heroLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroBalance: {
    fontSize: 34,
    fontWeight: '800',
    color: '#34D399',
    marginTop: 6,
  },
  heroBalanceNegative: {
    color: '#FB7185',
  },
  cashflowPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 10,
  },
  pillPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pillNegative: {
    backgroundColor: 'rgba(244, 63, 94, 0.16)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextPositive: {
    color: '#34D399',
  },
  pillTextNegative: {
    color: '#FDA4AF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  incomeBox: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  expenseBox: {
    flex: 1,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  metricLabel: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  incomeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34D399',
    marginTop: 4,
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FB7185',
    marginTop: 4,
  },
  meterTrack: {
    height: 7,
    backgroundColor: '#1E293B',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  meterFill: {
    height: '100%',
    borderRadius: 999,
  },
  card: {
    backgroundColor: '#131C2E',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 14,
  },
  noBottomMargin: {
    marginBottom: 0,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeOptionIncome: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10B981',
  },
  typeOptionExpense: {
    backgroundColor: 'rgba(244, 63, 94, 0.18)',
    borderColor: '#F43F5E',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  typeOptionTextActive: {
    color: '#F8FAFC',
  },
  inputField: {
    backgroundColor: '#0B1120',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#263449',
    marginBottom: 12,
  },
  inputRTL: {
    textAlign: 'right',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  categoryChipTextActive: {
    color: '#061A2B',
    fontWeight: '800',
  },
  errorText: {
    color: '#FDA4AF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#05231A',
    fontSize: 15,
    fontWeight: '800',
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButtonText: {
    color: '#FB7185',
    fontSize: 13,
    fontWeight: '700',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 18,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 10,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  txSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 3,
  },
  txRightCol: {
    gap: 5,
  },
  txRightLTR: {
    alignItems: 'flex-end',
  },
  txRightRTL: {
    alignItems: 'flex-start',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  txAmountIncome: {
    color: '#34D399',
  },
  txAmountExpense: {
    color: '#FB7185',
  },
  deleteChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.14)',
  },
  deleteChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDA4AF',
  },
});
