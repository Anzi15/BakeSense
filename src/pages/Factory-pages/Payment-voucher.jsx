import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
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
          totalPayment:
            doc.data()?.entries?.reduce((sum, entry) => sum + (entry.amount || 0) + (entry.settlement || 0), 0) || 0,
        }));

        const offlineVouchers = JSON.parse(localStorage.getItem("offlinePaymentVouchers")) || [];

        const combinedDates = [...dateList, ...offlineVouchers].reduce((acc, item) => {
          if (!acc.some((entry) => entry.id === item.id)) {
            acc.push(item);
          }
          return acc;
        }, []);

        setDates(combinedDates.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) {
        console.error("Error fetching payment vouchers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, []);

  useEffect(() => {
    const syncOfflineData = async () => {
      if (navigator.onLine) {
        const offlineVouchers = JSON.parse(localStorage.getItem("offlinePaymentVouchers")) || [];
        for (const voucher of offlineVouchers) {
          try {
            await setDoc(doc(db, "paymentVouchers", voucher.id), voucher);
          } catch (error) {
            console.error("Error syncing offline data:", error);
          }
        }
        localStorage.removeItem("offlinePaymentVouchers");
      }
    };

    window.addEventListener("online", syncOfflineData);
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  const addNewDay = async () => {
    if (!selectedDate) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    if (dates.some((entry) => entry.id === formattedDate)) {
      alert("This date is already added.");
      return;
    }

    if (!navigator.onLine) {
      alert("You are offline. Your changes will be saved locally and synced when you are back online.");

      const offlineVouchers = JSON.parse(localStorage.getItem("offlinePaymentVouchers")) || [];
      offlineVouchers.push({ id: formattedDate, date: formattedDate, totalPayment: 0 });
      localStorage.setItem("offlinePaymentVouchers", JSON.stringify(offlineVouchers));

      setDates((prev) => [{ id: formattedDate, date: formattedDate, totalPayment: 0 }, ...prev]);
      setSelectedDate(null);
      return;
    }

    try {
      await setDoc(doc(db, "paymentVouchers", formattedDate), {
        date: formattedDate,
        totalPayment: 0,
      });

      setDates((prev) => [{ id: formattedDate, date: formattedDate, totalPayment: 0 }, ...prev]);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error adding new day:", error);
    }
  };

  const deleteDate = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this date?");
    if (!confirmDelete) return;

    if (!navigator.onLine) {
      alert("You are offline. The deletion will be applied when you're back online.");

      const offlineVouchers = JSON.parse(localStorage.getItem("offlinePaymentVouchers")) || [];
      const updatedVouchers = offlineVouchers.filter((voucher) => voucher.id !== id);
      localStorage.setItem("offlinePaymentVouchers", JSON.stringify(updatedVouchers));

      setDates((prev) => prev.filter((entry) => entry.id !== id));
      return;
    }

    try {
      await deleteDoc(doc(db, "paymentVouchers", id));
      setDates((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting date:", error);
    }
  };

  return (
    <div className="p-4 max-w-3xl">
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
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3" className="text-center p-4">
                Loading...
              </td>
            </tr>
          ) : (
            dates.map((entry) => (
              <tr key={entry.id} className="cursor-pointer hover:bg-gray-100">
                <td className="border border-gray-300 p-2" onClick={() => navigate(`/payment-voucher/day/${entry.id}`)}>
                  {entry.id}
                </td>
                <td className="border border-gray-300 p-2">{entry.totalPayment}</td>
                <td className="border border-gray-300 p-2 text-center">
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => deleteDate(entry.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentVoucher;
