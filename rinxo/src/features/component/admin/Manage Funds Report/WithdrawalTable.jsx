export default function WithdrawalTable({ withdrawals }) {
  return (
    <div className="min-w-200">
      <h2 className="text-xl font-semibold mb-4">Withdrawal Table</h2>
      <table className="w-full text-left">
        <thead className="border-b-2 border-gray-200 bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-gray-600 font-semibold">ID</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Method</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Account Name
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Bank Name</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Account Number
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Routing Number
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Swift Code
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Currency</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Amount</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Processing Fee
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Net Amount
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals &&
            withdrawals.map((withdrawal, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4 font-medium text-gray-800">
                  {index + 1}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.method}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.details.accountName}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.details.bankName}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.details.accountNumber}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.details.routingNumber}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.details.swiftCode}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.currency}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.amount}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.processing_fee}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.net_amount}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {withdrawal.status}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
