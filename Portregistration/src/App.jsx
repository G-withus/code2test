import React from 'react'
import PortTest from './components/PortTestCreate'
import { Toaster } from 'react-hot-toast'


const App = () => {
  return (
    <div><PortTest/>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}

export default App