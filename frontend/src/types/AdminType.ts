// shapes of the admin data the server calculates

export type DashboardStatsType = {
  totalBooks: number;
  totalMembers: number;
  borrowedCount: number;
  overdueCount: number;
  pendingFines: number;
  collectedFines: number;
};

export type BorrowedItemType = {
  borrowerId: string;
  borrowerName: string;
  bookId: string;
  bookTitle: string;
  author: string;
  bookImage: string;
  borrowDate: string;
  dueDate: string;
  fine: number;
  overdue: boolean;
};

export type DashboardType = {
  stats: DashboardStatsType;
  currentlyBorrowed: BorrowedItemType[];
};

// one payment row for the admin transactions page
export type TransactionRowType = {
  _id: string;
  transactionId: string;
  userId: string;
  username: string;
  bookId: string;
  bookTitle: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  createdAt?: string;
};
