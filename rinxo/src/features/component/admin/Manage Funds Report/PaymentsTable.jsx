export default function PaymentsTable({ payments }) {
  return (
    <div className="min-w-200">
      <h2 className="text-xl font-semibold mb-4">Payments Table</h2>
      <table className="w-full text-left">
        <thead className="border-b-2 border-gray-200 bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-gray-600 font-semibold">ID</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Payment ID
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Order ID</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">Status</th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Price Amount
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Price Currency
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Pay Amount
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Pay Currency
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Actually Paid
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Pay Address
            </th>
            <th className="py-3 px-4 text-gray-600 font-semibold">
              Created At
            </th>
          </tr>
        </thead>
        <tbody>
          {payments &&
            payments.map((payment, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4 font-medium text-gray-800">
                  {index + 1}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.payment_id}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.order_id}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.payment_status}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.price_amount}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.pay_currency}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.pay_amount}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.pay_currency}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.actually_paid}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.pay_address}
                </td>
                <td className="py-4 px-4 font-medium text-gray-800">
                  {payment.created_at.split("T")[0]}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
