
'use client'

import localForage from 'localforage'

// Initialize localForage
localForage.config({
  name: 'YourAIApp'
})

export async function getData<T>(key: string): Promise<T | null> {
  try {
    const value = await localForage.getItem<T>(key)
    return value
  } catch (err) {
    console.error(`Error getting data for key ${key}:`, err)
    return null
  }
}

export async function setData<T>(key: string, value: T): Promise<void> {
  try {
    await localForage.setItem(key, value)
  } catch (err) {
    console.error(`Error setting data for key ${key}:`, err)
  }
}

export async function removeData(key: string): Promise<void> {
  try {
    await localForage.removeItem(key)
  } catch (err) {
    console.error(`Error removing data for key ${key}:`, err)
  }
}
