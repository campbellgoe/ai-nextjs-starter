
'use client'

import localForage from 'localforage'

// Initialize localForage
localForage.config({
  name: 'AI-code-challenge-generator'
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

export async function setData<T>(key: string, value: T): Promise<{ error?: unknown, successMessage?: string }> {
  try {
    await localForage.setItem(key, value)
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error)
    return { error }
  }
  return { successMessage: 'Successfully set data for key: '+key }
}

export async function removeData(key: string): Promise<{ error?: unknown, successMessage?: string }> {
  let dataExists = null
  try {
    dataExists = await localForage.getItem(key)
    if(dataExists){
      await localForage.removeItem(key)
    }
  } catch (err) {
    console.error(`Error removing data for key ${key}:`, err)
    return { error: err }
  }
  return { successMessage: dataExists ? 'Successfully removed data of key: '+key : 'Key given does not exist or was already remomved, for key: '+key }
}


