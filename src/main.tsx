<<<<<<< HEAD
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { setClerkTokenGetter } from './lib/api'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key — add VITE_CLERK_PUBLISHABLE_KEY to .env')
}

// Inner component to wire Clerk's getToken into the API client
function ClerkTokenBridge() {
  const { getToken } = useAuth()
  useEffect(() => {
    setClerkTokenGetter(() => getToken())
  }, [getToken])
  return null
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/cryptoflow/">
    <ClerkTokenBridge />
    <App />
  </ClerkProvider>
);
=======
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
>>>>>>> a39836595a342adc9ccea188414139736f7c4963
