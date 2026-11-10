// older versions of this app saved full card numbers and CVVs.
// This replaces them with only the last 4 digits. Safe to run more than once.
//   npm run scrub-card-data
import { config } from "dotenv";
import { connect, disconnect } from "mongoose";
import { TransactionModel } from "../models/TransactionModel";

config();

const run = async () => {
  await connect(process.env["DB_URI"]!);
  const transactions = await TransactionModel.find({ "payments.paymentDetails.card_number": { $exists: true } }).lean();
  let cleaned = 0;

  for (const transaction of transactions) {
    const payments = (transaction.payments as any[]).map((payment) => {
      const cardNumber = payment.paymentDetails?.card_number;
      if (!cardNumber) return payment;
      cleaned++;
      return { ...payment, paymentDetails: { last4: String(cardNumber).slice(-4) } };
    });
    await TransactionModel.collection.updateOne({ _id: transaction._id }, { $set: { payments } });
  }

  console.log(`Removed card numbers/CVVs from ${cleaned} payment(s).`);
  await disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
