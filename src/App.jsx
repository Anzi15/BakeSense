import React from 'react'
import { AuthContext } from './hooks/AuthContext'
import { useContext } from 'react';
import FactoryDashboard from './pages/Factory-pages/FactoryDashboard';
import '@shopify/polaris-viz/build/esm/styles.css';
import {PolarisVizProvider} from '@shopify/polaris-viz';
import { ToastContainer } from 'react-toastify';

const App = () => {
  const { user } = useContext(AuthContext);
  return (
    <AuthContext>
      <PolarisVizProvider>
    <div>
      <p>
        {  user?.role === "factory" ?<FactoryDashboard />: "branch"}
      </p>
    </div>
    <ToastContainer />
      </PolarisVizProvider>

    </AuthContext>
  )
}

export default App
