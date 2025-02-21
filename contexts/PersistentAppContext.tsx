'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getData, setData, removeData } from './localDataSource'
import { redirect } from 'next/navigation'
import { ObjectId } from 'mongoose'
export type User = {
  name: string,
  password: string
  _id: string | ObjectId
  email: string
}

export type Conversation = {
  messages: string
  _id: string | ObjectId
  label: string
  authorName: string
  slug: string
  updatedAt: string
  isPublished: boolean
}

export type AppContextType = {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void,
  register: (name: string, email: string, password: string) => Promise<boolean>
  logoTextValue: string;
  setLogoTextValue: (string: string) => void;
  removeLogoTextValue: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined)
const initialLogoTextValue = 'Your AI App'
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userAppSettings, setUserAppSettings] = useState({
    logoTextValue: initialLogoTextValue
  })
  const logoTextValue = userAppSettings.logoTextValue
  const setLogoTextValue = (newText: string) => setUserAppSettings(state => ({...state, logoTextValue: newText }))
  const removeLogoTextValue = () => {
    removeData('logoTextValue')
    setLogoTextValue(initialLogoTextValue)
  }
  useEffect(() => {
    const initializeData = async () => {
      const logoTextValue = await getData<string>('logoTextValue')
      const storedUser = await getData<User>('currentUser')
      if (storedUser) setUser(storedUser)
      if(logoTextValue) setLogoTextValue(logoTextValue)
    }
    initializeData()
  }, [])

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const newUser = await fetch('/api/account/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    }).then(res => res.json())

    if(newUser){
      setUser(newUser)
      await setData('currentUser', newUser)
      return true
    }
    return false
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = await fetch('/api/account/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    }).then(res => res.json())

    if(foundUser){
      setUser(foundUser)
      await setData('currentUser', foundUser)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setData('currentUser', null)
    fetch('/api/account/logout').then(() => {
      redirect('/app')
    })
  }




  return (
    <AppContext.Provider value={{ user, setUser, login, logout, register, logoTextValue, setLogoTextValue, removeLogoTextValue }}>
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