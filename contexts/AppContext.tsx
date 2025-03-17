'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getData, setData } from './datasource'
import { redirect } from 'next/navigation'

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
  hasCollectedExp: boolean;
  setHasCollectedExp: any;
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
  const [hasCollectedExp, setHasCollectedExp] = useState(false)
  const [localCodeKey, setLocalCodeKey] = useState("code.userAttempt.")
  useEffect(() => {
    const handler = async () => {
      const localExp: number = await getData("experiencePoints") || 0
      if(localExp > experiencePoints){
        setExpPoints(localExp)
        await setData(localCodeKey+".hasCollectedExp", true)
      //  await setData(localCodeKey+".experiencePoints", experiencePoints)
      } else {
        // alert("exp ")
      }
    }
    handler()
  }, [])
  useEffect(() => {
    const handler = async () => {
      if(localCodeKey){
        const localHasCollectedExp: boolean | null = await getData(localCodeKey+".hasCollectedExp")
        //

        const localExpPoints: number = await getData("experiencePoints") || 0
        if(localExpPoints > experiencePoints){
          setExpPoints(localExpPoints || 10)
          if(localHasCollectedExp) setHasCollectedExp(true)
        }
      }
    }
    handler()
  }, [localCodeKey, experiencePoints])
  return (
    <AppContext.Provider value={{ localCodeKey, setLocalCodeKey, hasCollectedExp, setHasCollectedExp, userClientSettings, setUserClientSettings, experiencePoints, setExpPoints }}>
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