import React from 'react'
import { AuthContext } from './hooks/AuthContext'
import { useContext } from 'react';


const App = () => {
  const { user } = useContext(AuthContext);
  return (
    <AuthContext>

    <div>
      <p>
        {  user?.role === "factory" ?"Factory": "branch"}
      </p>
    </div>
    </AuthContext>
  )
}

export default App
