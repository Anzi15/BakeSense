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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "accounts"));
        const accountsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAccounts(accountsList.filter((acc) => acc.category === "Account"));
        setBranches(accountsList.filter((acc) => acc.category === "Branch"));
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const addAccount = async (e) => {
    e.preventDefault();
    setAddingAccount(true);

    try {
      const accountsData = { ...newAccount, category: "Account" };
      const docRef = await addDoc(collection(db, "accounts"), accountsData);
      
      setAccounts((prevAccounts) => [...prevAccounts, { id: docRef.id, ...accountsData }]);

      setNewAccount({
        accountCode: "",
        accountName: "",
        accountType: "Accounts Payable",
        accountsType: "Supplier",
        openingBalance: 0,
        currentBalance: 0,
      });
    } catch (error) {
      console.error("Error adding accounts:", error);
    } finally {
      setAddingAccount(false);
    }
  };

  const addBranch = async (e) => {
    e.preventDefault();
    setAddingBranch(true);

    try {
      const branchData = { ...newBranch, category: "Branch" };
      const docRef = await addDoc(collection(db, "accounts"), branchData);
      
      setBranches((prevBranches) => [...prevBranches, { id: docRef.id, ...branchData }]);

      setNewBranch({
        branchCode: "",
        branchName: "",
        location: "",
        contact: "",
      });
    } catch (error) {
      console.error("Error adding branch:", error);
    } finally {
      setAddingBranch(false);
    }
  };

  const deleteAccount = async (accountsId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
  
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "accounts", accountsId));
        setAccounts((prevAccounts) => prevAccounts.filter((accounts) => accounts.id !== accountsId));
        Swal.fire('Deleted!', 'The accounts has been deleted.', 'success');
      } catch (error) {
        console.error("Error deleting accounts:", error);
        Swal.fire('Error', 'There was an issue deleting the accounts.', 'error');
      }
    }
  };
  
  const deleteBranch = async (branchId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
  
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "accounts", branchId));
        setBranches((prevBranches) => prevBranches.filter((branch) => branch.id !== branchId));
        Swal.fire('Deleted!', 'The branch has been deleted.', 'success');
      } catch (error) {
        console.error("Error deleting branch:", error);
        Swal.fire('Error', 'There was an issue deleting the branch.', 'error');
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

  const editBranchHandler = (branch) => {
    setEditBranch(branch);
    setNewBranch({
      branchCode: branch.branchCode,
      branchName: branch.branchName,
      location: branch.location,
      contact: branch.contact,
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

  const updateBranch = async (e) => {
    e.preventDefault();
    try {
      const branchRef = doc(db, "accounts", editBranch.id);
      await updateDoc(branchRef, {
        branchCode: newBranch.branchCode,
        branchName: newBranch.branchName,
        location: newBranch.location,
        contact: newBranch.contact,
      });

      setBranches((prevBranches) =>
        prevBranches.map((branch) =>
          branch.id === editBranch.id ? { ...branch, ...newBranch } : branch
        )
      );

      setEditBranch(null);
      setNewBranch({
        branchCode: "",
        branchName: "",
        location: "",
        contact: "",
      });
    } catch (error) {
      console.error("Error updating branch:", error);
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
    <option value="business">Payable</option>
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
