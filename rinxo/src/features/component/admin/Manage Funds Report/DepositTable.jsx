export default function DepositTable({ deposits }) {
  return (
    <div className="min-w-200">
      <h2 className="text-xl font-semibold mb-4">Deposit Table</h2>
      <table className="w-full text-left">
        <thead className="border-b-2 border-gray-200 bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-gray-600 font-semibold">ID</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Payment ID
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Amount</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Currency</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Balance Before
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Balance After
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Description
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {deposits &&
            deposits.map((deposit, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4 font-medium text-gray-800">
                  {index + 1}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {deposit.payment_id}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {deposit.amount}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {deposit.currency.toUpperCase()}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {deposit.balance_before}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {deposit.balance_after}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {deposit.description}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {deposit.created_at.split("T")[0]}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
