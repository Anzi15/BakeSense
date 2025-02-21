import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../helpers/firebase/config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PaymentVoucher = () => {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paymentVouchers"));
        const dateList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          date: doc.id,
          totalPayment: doc.data()?.entries.reduce((sum, entry) => sum + (entry.amount || 0) + (entry.settlement || 0), 0),
        }));
        setDates(dateList.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) {
        console.error("Error fetching payment vouchers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDates();
  }, []);

  const addNewDay = async () => {
    if (!selectedDate) return;
    try {
      await addDoc(collection(db, "paymentVouchers"), {
        date: selectedDate.toISOString().split("T")[0],
        totalPayment: 0,
      });
      setDates((prev) => [{ date: selectedDate.toISOString().split("T")[0], totalPayment: 0 }, ...prev]);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error adding new day:", error);
    }
  };



  return (
    <div className="p-4 max-w-3xl ">
      <h1 className="text-2xl font-bold mb-4">Payment Vouchers</h1>
      <div className="flex items-center mb-4 w-full">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          className="border p-2 rounded mr-2"
          placeholderText="Select a date"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={addNewDay}>
          Add New Day
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Total Payment</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="2" className="text-center p-4">Loading...</td>
            </tr>
          ) : (
            dates.map((entry) => (
              <tr
                key={entry.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/payment-voucher/day/${entry.id}`)}
              >
                <td className="border border-gray-300 p-2">{entry.id}</td>
                <td className="border border-gray-300 p-2">{entry.totalPayment}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentVoucher;
