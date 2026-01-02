export default function TransactionTable({ transactions }) {
  return (
    <div className="min-w-200">
      <h2 className="text-xl font-semibold mb-4">Transaction Table</h2>
      <table className="w-full text-left">
        <thead className="border-b-2 border-gray-200 bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-gray-600 font-semibold">ID</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Payment ID
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Type</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Amount</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Currency</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Balance Before
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Balance After
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Status</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Description
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions &&
            transactions.map((transaction, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4 font-medium text-gray-800">
                  {index + 1}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.payment_id}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.type}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.amount}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.currency.toUpperCase()}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.status === "completed"
                    ? transaction.balance_before
                    : "NIL"}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.status === "completed"
                    ? transaction.balance_after
                    : "NIL"}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.status}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.description}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {transaction.created_at.split("T")[0]}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
