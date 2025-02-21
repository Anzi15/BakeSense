import { useState, useEffect } from "react";
import { db } from "../../helpers/firebase/config"; // Firebase config
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid'
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";
import PaymentVoucherTable from "../../components/PaymentVoucherTable";

const DayEntriesPage = () => {
  const {date} = useParams()
  const [voucherNumber, setVoucherNumber] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedPayer, setSelectedPayer] = useState("");
  const [showPayerList, setShowPayerList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allEntries, setAllEntries] = useState([]);
  const [allEntriesloading, setAllEntriesLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState(0);
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [cashier, setCashier] = useState("");

  useEffect(() => {
    fetchAccounts();
    syncOfflineData();
  }, []);

  const fetchAccounts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      let accountsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      const offlineAccounts = JSON.parse(localStorage.getItem("offlineAccounts")) || [];
      const offlineDeletes = JSON.parse(localStorage.getItem("offlineDeletes")) || [];
  
      accountsList = accountsList.filter(acc => !offlineDeletes.includes(acc.id));
  
      const mergedAccounts = [...accountsList, ...offlineAccounts].reduce((acc, curr) => {
        acc.set(curr.accountCode, curr);
        return acc;
      }, new Map());
  
      const uniqueAccounts = Array.from(mergedAccounts.values());
  
      setAccounts(uniqueAccounts.filter((acc) => acc.category === "Account"))
    } catch (error) {
      console.error("Error fetching accounts:", error);
      const offlineAccounts = JSON.parse(localStorage.getItem("offlineAccounts")) || [];
      const offlineDeletes = JSON.parse(localStorage.getItem("offlineDeletes")) || [];
  
      const filteredAccounts = offlineAccounts.filter(acc => !offlineDeletes.includes(acc.id));
      setAccounts(filteredAccounts.filter((acc) => acc.category === "Account"));
    } finally {
      setLoading(false);
    }
  };

  const generateVoucherNumber = async () => {
    setVoucherNumber(uuidv4());
  };

  const syncOfflineData = async () => {
    if (navigator.onLine) {
      const offlineData = JSON.parse(localStorage.getItem("offlineAccounts")) || [];
      if (offlineData.length > 0) {
        try {
          for (const account of offlineData) {
            const docRef = await addDoc(collection(db, "accounts"), account);
            setAccounts((prevAccounts) => [...prevAccounts, { id: docRef.id, ...account }]);
          }
          localStorage.removeItem("offlineAccounts");
        } catch (error) {
          console.error("Error syncing offline accounts:", error);
        }
      }
    }
  };

  const handlePayerSelection = (payer) => {
    setSelectedPayer(payer);
    setPayer(payer);
    setShowPayerList(false);
  };

  const handleSubmit = async () => {
    if (!voucherNumber || !payer || amount <= 0 || !cashier) {
      alert("Please fill in all required fields.");
      return;
    }
  
    const newEntry = {
      voucherNumber,
      payer,
      amount: parseFloat(amount),
      settlementAmount: parseFloat(settlementAmount),
      paymentMethod,
      transactionId,
      cashier,
      remarks,
      timestamp: Date.now(), // Store entry timestamp
    };
  
    setLoading(true);
  
    try {
      if (navigator.onLine) {
        const dateRef = doc(db, "paymentVouchers", date); // Use 'date' as doc ID
        const docSnap = await getDoc(dateRef);
  
        if (docSnap.exists()) {
          await updateDoc(dateRef, {
            entries: arrayUnion(newEntry),
          });
        } else {
          // If document doesn't exist, create a new one with first entry
          await setDoc(dateRef, {
            entries: [newEntry],
          });
        }
          Swal.fire({icon:"success", title: "Success!!", titleText: "Entry added successfully!"})
      } else {
        // Handle offline storage
        const offlineEntries = JSON.parse(localStorage.getItem("offlineEntries")) || {};
        if (!offlineEntries[date]) offlineEntries[date] = [];
        offlineEntries[date].push(newEntry);
        localStorage.setItem("offlineEntries", JSON.stringify(offlineEntries));
  
        alert("You are offline. Entry saved locally and will sync when online.");
      }
  
      // Clear form fields
      setVoucherNumber("");
      setPayer("");
      setSelectedPayer("");
      setAmount(0);
      setSettlementAmount(0);
      setPaymentMethod("Cash");
      setTransactionId("");
      setCashier("");
      setRemarks("");
  
    } catch (error) {
      console.error("Error adding entry:", error);
      alert("Failed to add entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    const fetchAllEntries = async()=>{
      const getAllEntries = await getDoc(doc(db,"paymentVouchers",date))
      // const allEntries = [];
      // getAllEntries.forEach((doc)=>{
      //     allEntries.push(doc.data())
      // })
      console.log(getAllEntries.data().entries);
      setAllEntries(getAllEntries.data().entries)
      setAllEntriesLoading(false)
    }
    fetchAllEntries()

  },[])
  

  return (
    <>
    <Link to={"/payment-voucher"} className="flex bg-white w-fit p-4 rounded-lg gap-4 items-center justify-center m-6">
    <FaArrowLeft />
      {date}
    </Link>
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Day Entries</h2>

      <div className="border p-4 rounded-lg mb-4">
          <label className="font-semibold">Voucher Number:</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            required
            placeholder="Voucher Number"
            className="border p-2 w-full mb-2"
            value={voucherNumber}
            onInput={(e) => setVoucherNumber(e.target.value.trim())}
          />
          <button className="border bg-blue-600 px-2 text-white" onClick={generateVoucherNumber}>
            Generate
          </button>
        </div>

        <label className="font-semibold">Select Payer:</label>
        <button onClick={() => setShowPayerList(true)} className="border p-2 w-full mb-2">
          {selectedPayer || "Choose an Account"}
        </button>

        <label className="font-semibold">Amount:</label>
        <input
          type="number"
          placeholder="Amount"
          required
          className="border p-2 w-full mb-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label className="font-semibold">Settlement Amount:</label>
        <input
          type="number"
          placeholder="Settlement Amount"
          className="border p-2 w-full mb-2"
          value={settlementAmount}
          onChange={(e) => setSettlementAmount(e.target.value)}
        />

        <label className="font-semibold">Payment Method:</label>
        <select
          className="border p-2 w-full mb-2"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Select Payment Method</option>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>

        <label className="font-semibold">Transaction ID (if digital payment):</label>
        <input
          type="text"
          placeholder="Transaction ID"
          className="border p-2 w-full mb-2"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />

        <label className="font-semibold">Cashier Name/ID:</label>
        <input
          type="text"
          placeholder="Cashier Name/ID"
          className="border p-2 w-full mb-2"
          value={cashier}
          onChange={(e) => setCashier(e.target.value)}
        />

        <label className="font-semibold">Remarks / Comments:</label>
        <input
          type="text"
          placeholder="Remarks / comments"
          className="border p-2 w-full mb-2"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        {showPayerList && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded shadow-lg w-96">
              <h3 className="text-lg font-bold mb-2">Select a Payer</h3>
              <ul>
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-2 border-b hover:bg-gray-200 cursor-pointer flex justify-between gap-6"
                    onClick={() => handlePayerSelection(account.accountCode)}
                  >
                    <p>{account.accountCode}</p>
                    <p>{account.accountName}</p>
                  </div>
                ))}
              </ul>
              <button onClick={() => setShowPayerList(false)} className="mt-4 p-2 bg-red-500 text-white rounded w-full">
                Close
              </button>
            </div>
          </div>
        )}

        <div className="w-full flex gap-3">
          <button className="w-full bg-blue-500 text-white text-lg py-2 mt-6" onClick={handleSubmit}>
           {loading ? "Loading...":  "Add Entry"}
          </button>
        </div>
      </div>
    </div>

    <div>
{
  allEntriesloading ? "Loading..." : (
    <PaymentVoucherTable allEntries={allEntries} editEntry={()=>{}} deleteEntry={()=>{}} />
  )
}
    </div>
    </>
  );
};

export default DayEntriesPage;
