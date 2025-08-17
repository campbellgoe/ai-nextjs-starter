'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getData, setData } from './datasource'

export type User = {
  name: string,
  password: string
  _id: string
  email: string
}

export type AppContextType = {
  // user: User | null
  // setUser: (user: User | null) => void
  // login: (email: string, password: string) => Promise<boolean>
  // logout: () => void,
  // register: (name: string, email: string, password: string) => Promise<boolean>
  userClientSettings: { backgroundColourHex: string },
  setUserClientSettings: (settings: any) => void
  experiencePoints: number;
  setExpPoints:any;
  localCodeKey: string | null;
  setLocalCodeKey: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  // const [user, setUser] = useState<User | null>(null)


  // const register = async (name: string, email: string, password: string): Promise<boolean> => {
  //   const newUser = await fetch('/api/account/register', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ name, email, password })
  //   }).then(res => res.json())

  //   if(newUser){
  //     setUser(newUser)
  //     await setData('currentUser', newUser)
  //     return true
  //   }
  //   return false
  // }

  // const login = async (email: string, password: string): Promise<boolean> => {
  //   const foundUser = await fetch('/api/account/login', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ email, password })
  //   }).then(res => res.json())

  //   if(foundUser){
  //     setUser(foundUser)
  //     await setData('currentUser', foundUser)
  //     return true
  //   }
  //   return false
  // }

  // const logout = () => {
  //   setUser(null)
  //   setData('currentUser', null)
  //   fetch('/api/account/logout').then(() => {
  //     redirect('/')
  //   })
  // }

  const [userClientSettings, setUserClientSettings] = useState({
    backgroundColourHex: '#ffcc00'
  })

  const [experiencePoints, setExpPoints] = useState(0)
  const [localCodeKey, setLocalCodeKey] = useState("code.userAttempt.")

  useEffect(() => {
    let exp = 0
    const loadHandler = async () => {
      exp = await getData<number>("experiencePoints") || 0
      if(exp){
        setExpPoints(exp)
      }
      
    }
    loadHandler()
  }, [])
  useEffect(() => {
    const saveHandler = async () => {
      if(experiencePoints > 0) await setData("experiencePoints", experiencePoints)
    }
    saveHandler()
  } ,[experiencePoints])

  return (
    <AppContext.Provider value={{ localCodeKey, setLocalCodeKey, userClientSettings, setUserClientSettings, experiencePoints, setExpPoints }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}