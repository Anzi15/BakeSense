import { useState, useEffect } from "react";
import { db } from "../../helpers/firebase/config"; // Adjust path as needed
import Swal from 'sweetalert2';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingAccount, setAddingAccount] = useState(false);
  const [addingBranch, setAddingBranch] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [editBranch, setEditBranch] = useState(null);

  const [newAccount, setNewAccount] = useState({
    accountCode: "",
    accountName: "",
    accountType: "Accounts Payable",
    accountsType: "Supplier",
    openingBalance: 0,
    currentBalance: 0,
  });

  const [newBranch, setNewBranch] = useState({
    branchCode: "",
    branchName: "",
    location: "",
    contact: "",
  });


// Sync offline data when the internet comes back online
useEffect(() => {
  const syncOfflineData = async () => {
    if (navigator.onLine) {
      const offlineData = JSON.parse(localStorage.getItem('offlineAccounts')) || [];
      if (offlineData.length > 0) {
        try {
          // Sync each offline account with Firebase
          for (const account of offlineData) {
            const docRef = await addDoc(collection(db, "accounts"), account);
            setAccounts((prevAccounts) => [
              ...prevAccounts,
              { id: docRef.id, ...account },
            ]);
          }
          // Clear the offline data after successful sync
          localStorage.removeItem('offlineAccounts');
        } catch (error) {
          console.error("Error syncing offline accounts:", error);
        }
      }
    }
  };

  // When the user comes back online, sync data
  window.addEventListener('online', syncOfflineData);

  // Load offline data when the page loads (even after navigation)
  const loadOfflineAccounts = () => {
    const offlineData = JSON.parse(localStorage.getItem('offlineAccounts')) || [];
    if (offlineData.length > 0) {
      // Add offline data to the state (render it in DOM)
      setAccounts((prevAccounts) => [
        ...prevAccounts,
        ...offlineData.map(account => ({
          id: `offline-${Date.now()}`, // Temporary ID for offline data
          ...account,
        })),
      ]);
    }
  };

  loadOfflineAccounts(); // Load any offline data when the component is mounted

  return () => {
    window.removeEventListener('online', syncOfflineData);
  };
}, []);

useEffect(() => {
  const fetchAccounts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      const accountsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Load offline accounts from localStorage
      const offlineAccounts = JSON.parse(localStorage.getItem("offlineAccounts")) || [];

      // Merge and remove duplicates (using accountCode as a unique identifier)
      const mergedAccounts = [...accountsList, ...offlineAccounts].reduce((acc, curr) => {
        acc.set(curr.accountCode, curr); // Use a Map to remove duplicates
        return acc;
      }, new Map());

      const uniqueAccounts = Array.from(mergedAccounts.values());

      // Update state
      setAccounts(uniqueAccounts.filter((acc) => acc.category === "Account"));
      setBranches(uniqueAccounts.filter((acc) => acc.category === "Branch"));
    } catch (error) {
      console.error("Error fetching accounts:", error);

      // If there's an error (e.g., offline), load only offline data
      const offlineAccounts = JSON.parse(localStorage.getItem("offlineAccounts")) || [];
      setAccounts(offlineAccounts.filter((acc) => acc.category === "Account"));
      setBranches(offlineAccounts.filter((acc) => acc.category === "Branch"));
    } finally {
      setLoading(false);
    }
  };

  fetchAccounts();

  // Sync offline data when the internet is restored
  const syncOfflineData = async () => {
    if (navigator.onLine) {
      let offlineAccounts = JSON.parse(localStorage.getItem("offlineAccounts")) || [];
      if (offlineAccounts.length > 0) {
        try {
          const syncedAccounts = [];
          for (const account of offlineAccounts) {
            const docRef = await addDoc(collection(db, "accounts"), account);
            syncedAccounts.push({ id: docRef.id, ...account });
          }

          // Remove synced accounts from localStorage
          localStorage.removeItem("offlineAccounts");

          // Merge freshly synced accounts with existing state (avoiding duplicates)
          setAccounts((prevAccounts) => {
            const merged = [...prevAccounts, ...syncedAccounts].reduce((acc, curr) => {
              acc.set(curr.accountCode, curr);
              return acc;
            }, new Map());
            return Array.from(merged.values());
          });
        } catch (error) {
          console.error("Error syncing offline accounts:", error);
        }
      }
    }
  };

  window.addEventListener("online", syncOfflineData);

  return () => {
    window.removeEventListener("online", syncOfflineData);
  };
}, []);


  
  const addAccount = async (e) => {
    e.preventDefault();
    setAddingAccount(true);
  
    const accountsData = { ...newAccount, category: "Account" };
  
    // Check if the user is offline
    if (!navigator.onLine) {
      alert("You are offline. Your changes will be saved locally and synced when you are back online.");
  
      // Save the account data locally (e.g., in localStorage)
      const offlineData = JSON.parse(localStorage.getItem('offlineAccounts')) || [];
      offlineData.push(accountsData);
      localStorage.setItem('offlineAccounts', JSON.stringify(offlineData));
  
      // Update the UI with the locally saved account
      setAccounts((prevAccounts) => [
        ...prevAccounts,
        { id: `offline-${Date.now()}`, ...accountsData }, // Temporarily use a fake ID
      ]);
  
      setNewAccount({
        accountCode: "",
        accountName: "",
        accountType: "Accounts Payable",
        accountsType: "Supplier",
        openingBalance: 0,
        currentBalance: 0,
      });
      setAddingAccount(false);
      return;
    }
  
    try {
      // If online, add the account to Firebase
      const docRef = await addDoc(collection(db, "accounts"), accountsData);
      setAccounts((prevAccounts) => [
        ...prevAccounts,
        { id: docRef.id, ...accountsData },
      ]);
  
      setNewAccount({
        accountCode: "",
        accountName: "",
        accountType: "Accounts Payable",
        accountsType: "Supplier",
        openingBalance: 0,
        currentBalance: 0,
      });
    } catch (error) {
      console.error("Error adding account:", error);
    } finally {
      setAddingAccount(false);
    }
  };  


  const syncOfflineData = async () => {
    if (navigator.onLine) {
      let offlineDeletes = JSON.parse(localStorage.getItem("offlineDeletes")) || [];
  
      if (offlineDeletes.length > 0) {
        try {
          for (const accountId of offlineDeletes) {
            await deleteDoc(doc(db, "accounts", accountId));
          }
          localStorage.removeItem("offlineDeletes"); // Clear deletion queue after syncing
        } catch (error) {
          console.error("Error syncing offline deletions:", error);
        }
      }
    }
  };
  

  const deleteAccount = async (accountId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
  
    if (result.isConfirmed) {
      try {
        // Load offline accounts
        let offlineAccounts = JSON.parse(localStorage.getItem("offlineAccounts")) || [];
        let offlineDeletes = JSON.parse(localStorage.getItem("offlineDeletes")) || [];
  
        // Check if the account exists in localStorage (offline)
        const isOfflineAccount = offlineAccounts.some(acc => acc.id === accountId);
  
        if (isOfflineAccount) {
          // Remove from localStorage (offline accounts)
          offlineAccounts = offlineAccounts.filter(acc => acc.id !== accountId);
          localStorage.setItem("offlineAccounts", JSON.stringify(offlineAccounts));
  
          // Remove from state
          setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== accountId));
  
          Swal.fire("Deleted!", "The offline account has been deleted.", "success");
        } else if (!navigator.onLine) {
          // If offline, mark for later deletion
          offlineDeletes.push(accountId);
          localStorage.setItem("offlineDeletes", JSON.stringify(offlineDeletes));
  
          // Remove from state immediately
          setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== accountId));
  
          Swal.fire("Deleted!", "The account will be removed from Firestore when online.", "success");
        } else {
          // If online, delete from Firestore immediately
          await deleteDoc(doc(db, "accounts", accountId));
          setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== accountId));
          Swal.fire("Deleted!", "The account has been deleted from Firestore.", "success");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        Swal.fire("Error", "There was an issue deleting the account.", "error");
      }
    }
  };
  
  


  const editAccountHandler = (accounts) => {
    setEditAccount(accounts);
    setNewAccount({
      accountCode: accounts.accountCode,
      accountName: accounts.accountName,
      accountType: accounts.accountType,
      accountsType: accounts.accountsType,
      openingBalance: accounts.openingBalance,
      currentBalance: accounts.currentBalance,
    });
  };



  const updateAccount = async (e) => {
    e.preventDefault();
    try {
      const accountsRef = doc(db, "accounts", editAccount.id);
      await updateDoc(accountsRef, {
        accountCode: newAccount.accountCode,
        accountName: newAccount.accountName,
        accountType: newAccount.accountType,
        accountsType: newAccount.accountsType,
        openingBalance: newAccount.openingBalance,
        currentBalance: newAccount.currentBalance,
      });

      setAccounts((prevAccounts) =>
        prevAccounts.map((accounts) =>
          accounts.id === editAccount.id ? { ...accounts, ...newAccount } : accounts
        )
      );

      setEditAccount(null);
      setNewAccount({
        accountCode: "",
        accountName: "",
        accountType: "Accounts Payable",
        accountsType: "Supplier",
        openingBalance: 0,
        currentBalance: 0,
      });
    } catch (error) {
      console.error("Error updating accounts:", error);
    }
  };


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chart of Accounts</h1>

      {/* Account Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{editAccount ? "Edit Account" : "Add Account"}</h2>
        <form onSubmit={editAccount ? updateAccount : addAccount} className="mb-4 grid grid-cols-3 gap-4">
  <div>
    <label htmlFor="accountCode" className="block text-sm font-medium text-gray-700">Account Code</label>
    <input
      id="accountCode"
      type="text"
      placeholder="Account Code"
      value={newAccount.accountCode}
      onChange={(e) => setNewAccount({ ...newAccount, accountCode: e.target.value })}
      className="border border-gray-300 p-2 mt-1 w-full"
    />
  </div>

  <div>
    <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Account Name</label>
    <input
      id="accountName"
      type="text"
      placeholder="Account Name"
      value={newAccount.accountName}
      onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
      className="border border-gray-300 p-2 mt-1 w-full"
    />
  </div>

  <div>
  <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
    Account Type
  </label>
  <select
    id="accountType"
    value={newAccount.accountType}
    onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
    className="border border-gray-300 p-2 mt-1 w-full bg-white"
  >
    <option value="" disabled>Select Account Type</option>
    <option value="personal">Expense</option>
    <option value="capital">Capital</option>
    <option value="admin">Assets</option>
    <option value="liability">Liability</option>
  </select>
</div>


  <div>
    <label htmlFor="accountsType" className="block text-sm font-medium text-gray-700">Vendor Type</label>
    <input
      id="vendorsType"
      type="text"
      placeholder="Vendors Type"
      value={newAccount.vendorsType}
      onChange={(e) => setNewAccount({ ...newAccount, accountsType: e.target.value })}
      className="border border-gray-300 p-2 mt-1 w-full"
    />
  </div>

  <div>
    <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700">Opening Balance</label>
    <input
      id="openingBalance"
      type="number"
      placeholder="Opening Balance"
      value={newAccount.openingBalance}
      onChange={(e) => setNewAccount({ ...newAccount, openingBalance: e.target.value })}
      className="border border-gray-300 p-2 mt-1 w-full"
    />
  </div>

  <div>
    <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700">Current Balance</label>
    <input
      id="currentBalance"
      type="number"
      placeholder="Current Balance"
      value={newAccount.currentBalance}
      onChange={(e) => setNewAccount({ ...newAccount, currentBalance: e.target.value })}
      className="border border-gray-300 p-2 mt-1 w-full"
    />
  </div>

  <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
    {addingAccount ? "Loading..." : (editAccount ? "Update Account" : "Add Account")}
  </button>
</form>

      </div>

      <div className="pb-8">
        <h2 className="text-xl font-semibold mb-4">Accounts</h2>
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Account Code</th>
              <th className="border p-2">Account Name</th>
              <th className="border p-2">Account Type</th>
              <th className="border p-2">Account Type</th>
              <th className="border p-2">Opening Balance</th>
              <th className="border p-2">Current Balance</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              loading ? <div className="w-full py-3 text-center flex justify-center">
                Loading...
              </div> : 
            <>
            {accounts.map((accounts) => (
              <tr key={accounts.id}>
                <td className="border p-2">{accounts.accountCode}</td>
                <td className="border p-2">{accounts.accountName}</td>
                <td className="border p-2">{accounts.accountType}</td>
                <td className="border p-2">{accounts.accountsType}</td>
                <td className="border p-2">{accounts.openingBalance}</td>
                <td className="border p-2">{accounts.currentBalance}</td>
                <td className="border p-2">
                  <button
                    onClick={() => editAccountHandler(accounts)}
                    className="bg-yellow-500 text-white p-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAccount(accounts.id)}
                    className="bg-red-500 text-white p-1 rounded ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))} 
            </>
            }
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default ChartOfAccounts;
