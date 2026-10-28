import { Transaction, CategoryBudget, ParsedMerchantEntity, AIRecommendation, AuditLogEntry } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TX-1001",
    date: "2025-03-12",
    displayDate: "12 Mar 2025",
    merchant: "Reliance Retail Ltd",
    description: "Store #442 - Multi-departmental purchase",
    category: "Split",
    paymentMethod: "Corporate Card",
    amount: 1000.00,
    status: "Settled",
    isSplit: true,
    splitCount: 3,
    splits: [
      { category: "Food & Dining", amount: 600.00, note: "Team cafeteria lunch & drinks" },
      { category: "Shopping", amount: 200.00, note: "Uniform shirts replacement" },
      { category: "Grocery", amount: 200.00, note: "Pantry supplies & ground coffee" }
    ]
  },
  {
    id: "TX-1002",
    date: "2025-03-11",
    displayDate: "11 Mar 2025",
    merchant: "Amazon Web Services (India)",
    description: "Monthly production compute clusters",
    category: "Bills & Utilities",
    paymentMethod: "NetBanking",
    amount: 46200.00,
    status: "Reconciled",
    isSplit: false,
    splitCount: 0,
    splits: [],
    taxDeductible: true,
    gstin: "29AABCU9603R1ZM"
  },
  {
    id: "TX-1003",
    date: "2025-03-10",
    displayDate: "10 Mar 2025",
    merchant: "Indigo Airlines",
    description: "Flight 6E-204 BLR to DEL client workshop",
    category: "Travel",
    paymentMethod: "Corporate Card",
    amount: 14800.00,
    status: "Settled",
    isSplit: false,
    splitCount: 0,
    splits: []
  },
  {
    id: "TX-1004",
    date: "2025-03-08",
    displayDate: "08 Mar 2025",
    merchant: "Croma Electronics Hub",
    description: "Office displays & HDMI cables",
    category: "Shopping",
    paymentMethod: "Corporate Card",
    amount: 4250.00,
    status: "Settled",
    isSplit: false,
    splitCount: 0,
    splits: []
  },
  {
    id: "TX-1005",
    date: "2025-03-07",
    displayDate: "07 Mar 2025",
    merchant: "Blue Tokai Coffee Roasters",
    description: "Monthly executive pantry batch",
    category: "Split",
    paymentMethod: "UPI",
    amount: 3200.00,
    status: "Settled",
    isSplit: true,
    splitCount: 2,
    splits: [
      { category: "Food & Dining", amount: 2400.00, note: "Arabica beans 4kg client pitch" },
      { category: "Bills & Utilities", amount: 800.00, note: "Espresso machine descaling filters" }
    ]
  },
  {
    id: "TX-1006",
    date: "2025-03-05",
    displayDate: "05 Mar 2025",
    merchant: "Nature's Basket Organic",
    description: "Team offsite pantry essentials",
    category: "Grocery",
    paymentMethod: "UPI",
    amount: 1820.00,
    status: "Settled",
    isSplit: false,
    splitCount: 0,
    splits: []
  },
  {
    id: "TX-1007",
    date: "2025-03-24",
    displayDate: "Today, 08:15 PM",
    merchant: "Swiggy Express",
    description: "Dinner order #SW-98129",
    category: "Food & Dining",
    paymentMethod: "UPI",
    amount: 640.00,
    status: "Settled",
    isSplit: false,
    splitCount: 0,
    splits: []
  },
  {
    id: "TX-1008",
    date: "2025-03-20",
    displayDate: "Mar 20, 11:24 AM",
    merchant: "Electricity Bill (BESCOM)",
    description: "Account #04889210-Consumer",
    category: "Bills & Utilities",
    paymentMethod: "NetBanking",
    amount: 2450.00,
    status: "Settled",
    isSplit: false,
    splitCount: 0,
    splits: [],
    taxDeductible: true,
    gstin: "29AABCB3981F1Z2"
  },
  {
    id: "TX-1009",
    date: "2025-03-18",
    displayDate: "Mar 18, 02:40 PM",
    merchant: "Amazon India - Tech Gear",
    description: "Mechanical Keyboard + Type-C Hub",
    category: "Shopping",
    paymentMethod: "Corporate Card",
    amount: 4150.00,
    status: "Reconciled",
    isSplit: false,
    splitCount: 0,
    splits: []
  },
  {
    id: "TX-1010",
    date: "2025-03-22",
    displayDate: "Mar 22, 09:10 AM",
    merchant: "Uber Ride to College",
    description: "Morning transit • 14.2 km",
    category: "Travel",
    paymentMethod: "UPI",
    amount: 340.00,
    status: "Settled",
    isSplit: false,
    splitCount: 0,
    splits: []
  },
  {
    id: "TX-1011",
    date: "2025-03-15",
    displayDate: "15 Mar 2025",
    merchant: "Apollo Medical Clinic",
    description: "Prescription vitamins and wellness package",
    category: "Healthcare",
    paymentMethod: "UPI",
    amount: 2000.00,
    status: "Settled",
    isSplit: false,
    splitCount: 0,
    splits: [],
    taxDeductible: true,
    gstin: "36AAACA1258G1ZX"
  },
  {
    id: "TX-1012",
    date: "2025-03-09",
    displayDate: "09 Mar 2025",
    merchant: "O'Reilly Learning Media",
    description: "Annual Tech Learning subscription",
    category: "Education",
    paymentMethod: "Corporate Card",
    amount: 1200.00,
    status: "Settled",
    isSplit: false,
    splitCount: 0,
    splits: [],
    taxDeductible: true,
    gstin: "9917USA29013110"
  }
];

export const CATEGORY_CONFIG: CategoryBudget[] = [
  {
    category: "Food & Dining",
    cap: 18000,
    description: "Corporate meals & client catering",
    icon: "restaurant",
    color: "#0d9488",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700"
  },
  {
    category: "Grocery",
    cap: 12000,
    description: "Breakroom pantry & snacks",
    icon: "shopping_cart",
    color: "#14b8a6",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700"
  },
  {
    category: "Bills & Utilities",
    cap: 8000,
    description: "Cloud infra & telecom bills",
    icon: "bolt",
    color: "#64748b",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700"
  },
  {
    category: "Travel",
    cap: 7000,
    description: "Cabs, metro pass & tollway",
    icon: "directions_car",
    color: "#38bdf8",
    bgColor: "bg-sky-50",
    textColor: "text-sky-700"
  },
  {
    category: "Shopping",
    cap: 10000,
    description: "Office hardware & consumables",
    icon: "devices",
    color: "#f43f5e",
    bgColor: "bg-slate-50",
    textColor: "text-slate-700"
  },
  {
    category: "Education",
    cap: 5000,
    description: "Tech subscriptions & books",
    icon: "menu_book",
    color: "#8b5cf6",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700"
  },
  {
    category: "Healthcare",
    cap: 5000,
    description: "First aid, wellness & insurance",
    icon: "local_hospital",
    color: "#e11d48",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700"
  }
];

export const INITIAL_PARSED_ENTITIES: ParsedMerchantEntity[] = [
  {
    id: "parse-1",
    rawCode: "SWG*BLR_9812",
    tokenInfo: "Regex Hit: POS-SWG",
    subtext: "HDFC CC Debit • Ref #9812040183 • Koramangala, BLR",
    inferredCategory: "Food & Dining",
    confidence: 96,
    amount: 642.00,
    paymentMethod: "Corporate Card"
  },
  {
    id: "parse-2",
    rawCode: "AMZN_IN_MKT",
    tokenInfo: "Token: AMZN-RETAIL",
    subtext: "ICICI NetBanking • Order ID #408-2918231-10",
    inferredCategory: "Shopping",
    confidence: 89,
    amount: 2499.00,
    paymentMethod: "NetBanking"
  },
  {
    id: "parse-3",
    rawCode: "METRO_AUTO_PAY",
    tokenInfo: "Standing Mandate",
    subtext: "BMRCL Card Autotop • Terminal Gate 4",
    inferredCategory: "Travel",
    confidence: 94,
    amount: 450.00,
    paymentMethod: "UPI"
  },
  {
    id: "parse-4",
    rawCode: "UNRECOGNIZED_TXN_77",
    tokenInfo: "Heuristic Lock",
    subtext: "Never hallucinate merchant names; user manual tagging recommended.",
    inferredCategory: "Other",
    confidence: 0,
    amount: 320.00,
    paymentMethod: "Cash"
  }
];

export const INITIAL_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "rec-1",
    title: "Cap Dining Out to ₹3,500/week",
    subtitle: "Emergency Fund Booster",
    description: "By shifting 2 spontaneous weekend deliveries to batch meal prep, you preserve an estimated ₹3,200/month which automatically funds your high-yield contingency buffer.",
    yieldMonthly: 3200,
    yieldLabel: "Yield: ₹3,200/mo",
    targetOrProgress: "Projected 90-Day Compounded Reserve: ₹9,600",
    progressPercent: 65,
    actionText: "Apply Rule",
    applied: false
  },
  {
    id: "rec-2",
    title: "Consolidate OTT Subscriptions",
    subtitle: "Subscription Redundancy",
    description: "Detected concurrent billings across Hotstar, SonyLIV, and Prime Video with overlapping catalog usage. Migrating to bundled telco perks saves ₹799/month.",
    yieldMonthly: 799,
    yieldLabel: "Yield: ₹799/mo",
    targetOrProgress: "3 Subscriptions: ₹1,449/mo → ₹650/mo",
    progressPercent: 45,
    actionText: "Audit Subscriptions",
    applied: false
  }
];

export const OCR_RECEIPT_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuCB8ggS59uQDIWnTnskARelzvi1SE-5Z-3ew-SnwSpdoMWlKF1axuEzwZod2urTCe--ta7eSEY7CJNYNe4xzdtUoDX4UoLm7EmzqzpzSe11m5F_Nk68KXBE6SC_KD3_YqGeDrStE5KENCwkyAIT3wU8elRcNp0ZrOO9kvnnAk7NQl7-IyNRh3F4hcpBrylKi6nf2pZNrD0tLzKwWuP5QEQSVzhrojjm-YeLNLoUG48_b3vfdLznrbdh9Q";
export const LOGO_IMAGE = "https://lh3.googleusercontent.com/aida/AEtjO1X_CJwl_Y8dBGUJM1UO6zrMeY5Ml8TjUma9wFwQ91d9ge1g1nxb-G_u8z6n6o0fdDVlykn-AjAvOf8hB3L0kG0g6ACe_T37_aiRvoGvH6oahiQIFdr5Uiml83NrlJxvD3SvTIyOsRB4S5KuJrKaql-b0JHI69slNtWqacMKMWGGd7rYOp7DfoXJE9CrFr6VWBje7yZjVrcQipSFwZa4u1uukKVn-rReOKX6guI8s_YEVO_4KQG27k7Walk";

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUD-8829",
    timestamp: "2025-03-24T18:45:12Z",
    displayTimestamp: "Today, 06:45 PM",
    action: "SPLIT_ALLOCATE",
    entityId: "TX-1001",
    entityType: "TRANSACTION",
    merchantTitle: "Reliance Retail Ltd",
    user: {
      name: "Admin User",
      email: "admin@expensereporter.internal",
      role: "Lead Controller",
      ipAddress: "192.168.1.104"
    },
    summary: "Decomposed root transaction ₹1,000.00 into 3 departmental child splits (Food, Shopping, Grocery)",
    diffs: [
      {
        field: "isSplit",
        fieldLabel: "Split Allocation Status",
        oldValue: "FALSE",
        newValue: "TRUE"
      },
      {
        field: "category",
        fieldLabel: "Category Tag",
        oldValue: "Grocery",
        newValue: "Split"
      },
      {
        field: "splits",
        fieldLabel: "Child Allocations",
        oldValue: "0 child items",
        newValue: "3 child allocations (₹600, ₹200, ₹200)"
      }
    ],
    integrityHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    id: "AUD-8828",
    timestamp: "2025-03-24T15:20:00Z",
    displayTimestamp: "Today, 03:20 PM",
    action: "CREATE",
    entityId: "TX-1007",
    entityType: "TRANSACTION",
    merchantTitle: "Swiggy Express",
    user: {
      name: "Admin User",
      email: "admin@expensereporter.internal",
      role: "Lead Controller",
      ipAddress: "192.168.1.104"
    },
    summary: "Created new expense entry ₹640.00 via UPI (Dinner order #SW-98129)",
    diffs: [
      {
        field: "amount",
        fieldLabel: "Amount (INR)",
        oldValue: null,
        newValue: "₹640.00"
      },
      {
        field: "merchant",
        fieldLabel: "Merchant",
        oldValue: null,
        newValue: "Swiggy Express"
      },
      {
        field: "paymentMethod",
        fieldLabel: "Payment Channel",
        oldValue: null,
        newValue: "UPI"
      }
    ],
    integrityHash: "a4f89d34201bcf5e791240ac89025e1a2f604812f8a92376dc817293a1048b29"
  },
  {
    id: "AUD-8827",
    timestamp: "2025-03-23T11:14:35Z",
    displayTimestamp: "Yesterday, 11:14 AM",
    action: "UPDATE",
    entityId: "TX-1004",
    entityType: "TRANSACTION",
    merchantTitle: "Croma Electronics Hub",
    user: {
      name: "Siddharth Verma",
      email: "siddharth.v@expensereporter.internal",
      role: "IT Asset Manager",
      ipAddress: "192.168.1.88"
    },
    summary: "Corrected invoice outlay from ₹3,999.00 to ₹4,250.00 to reflect additional HDMI display adapters",
    diffs: [
      {
        field: "amount",
        fieldLabel: "Amount (INR)",
        oldValue: "₹3,999.00",
        newValue: "₹4,250.00"
      },
      {
        field: "notes",
        fieldLabel: "Audit Memo",
        oldValue: "Office displays invoice",
        newValue: "Office displays & HDMI cables (Tax invoice verified)"
      }
    ],
    integrityHash: "7b419c8f219034aa8901bce471092834b67912d8a9f02938475619283746ab19"
  },
  {
    id: "AUD-8826",
    timestamp: "2025-03-22T09:05:12Z",
    displayTimestamp: "22 Mar 2025, 09:05 AM",
    action: "UPDATE",
    entityId: "BUD-2025-03",
    entityType: "BUDGET_CAP",
    merchantTitle: "March 2025 General Budget",
    user: {
      name: "Priya Nair",
      email: "priya.n@expensereporter.internal",
      role: "Finance Director",
      ipAddress: "10.0.4.12"
    },
    summary: "Recalibrated monthly general ledger cap from ₹55,000 to ₹60,000 for Q1 closing sprints",
    diffs: [
      {
        field: "monthlyCap",
        fieldLabel: "Monthly Cap (INR)",
        oldValue: "₹55,000.00",
        newValue: "₹60,000.00"
      },
      {
        field: "runwayBuffer",
        fieldLabel: "Runway Buffer Target",
        oldValue: "₹12,150.00",
        newValue: "₹17,150.00"
      }
    ],
    integrityHash: "c9834190ba3294821a7891230489bca789213401928347102938471029384710"
  },
  {
    id: "AUD-8825",
    timestamp: "2025-03-20T16:30:00Z",
    displayTimestamp: "20 Mar 2025, 04:30 PM",
    action: "DELETE",
    entityId: "TX-1019",
    entityType: "TRANSACTION",
    merchantTitle: "Cancelled Merchant Outflow",
    user: {
      name: "Admin User",
      email: "admin@expensereporter.internal",
      role: "Lead Controller",
      ipAddress: "192.168.1.104"
    },
    summary: "Purged duplicate booking charge #TX-1019 (₹450.00) following bank reversal settlement",
    diffs: [
      {
        field: "status",
        fieldLabel: "Lifecycle Status",
        oldValue: "Pending Reversal",
        newValue: "PURGED_CASCADE"
      }
    ],
    integrityHash: "3290481029384710293847102938471029384710293847102938471029384710"
  }
];

