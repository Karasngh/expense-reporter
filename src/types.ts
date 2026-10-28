export interface SplitAllocation {
  category: string;
  amount: number;
  note?: string;
}

export interface Transaction {
  id: string;
  merchant: string;
  description: string;
  category: string;
  paymentMethod: string;
  date: string;
  displayDate?: string;
  amount: number;
  status: 'Settled' | 'Reconciled' | 'Pending';
  isSplit: boolean;
  splitCount?: number;
  splits?: SplitAllocation[];
  receiptUrl?: string;
  taxDeductible?: boolean;
  gstin?: string;
}

export type ViewType = 'dashboard' | 'transactions' | 'budgets' | 'ai' | 'backend' | 'audit';

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'SPLIT_ALLOCATE' | 'BATCH_DELETE' | 'REVERT';

export interface AuditFieldDiff {
  field: string;
  fieldLabel: string;
  oldValue: string | number | null;
  newValue: string | number | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  displayTimestamp: string;
  action: AuditActionType;
  entityId: string;
  entityType: 'TRANSACTION' | 'SPLIT_SUBLEDGER' | 'BUDGET_CAP';
  merchantTitle: string;
  user: {
    name: string;
    email: string;
    role: string;
    ipAddress?: string;
  };
  summary: string;
  diffs: AuditFieldDiff[];
  integrityHash: string;
  reverted?: boolean;
}

export interface CategoryBudget {
  category: string;
  cap: number;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface ParsedMerchantEntity {
  id: string;
  rawCode: string;
  tokenInfo: string;
  subtext: string;
  inferredCategory: string;
  confidence: number;
  amount: number;
  paymentMethod: string;
  accepted?: boolean;
}

export interface AIRecommendation {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  yieldMonthly: number;
  yieldLabel: string;
  targetOrProgress: string;
  progressPercent: number;
  actionText: string;
  applied: boolean;
}
