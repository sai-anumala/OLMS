export const FINE_PER_DAY = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

type BorrowRecord = { dueDate?: Date | string | null };

// Fine for one borrowed book, calculated from its due date.
// Fines are always derived from the due date at the moment they are needed, so they are
// never stale and never need to be written back to the database.
export const fineFor = (record: BorrowRecord, now: Date = new Date()): number => {
  if (!record.dueDate) return 0;
  const overdueDays = Math.floor((now.getTime() - new Date(record.dueDate).getTime()) / DAY_MS);
  return overdueDays > 0 ? overdueDays * FINE_PER_DAY : 0;
};
