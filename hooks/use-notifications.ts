'use client'

import { create } from 'zustand'
import { InAppNotification, Trade } from '@/types'

interface NotificationStore {
  notifications: InAppNotification[]
  unreadCount: number
  addNotification: (notification: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>) => void
  addTradeNotification: (trade: Trade) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: InAppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }))
  },

  addTradeNotification: (trade) => {
    const action = trade.side === 'BUY' ? 'bought' : 'sold'
    const newNotification: InAppNotification = {
      id: crypto.randomUUID(),
      type: 'trade',
      title: `New ${trade.side}`,
      message: `Wallet ${action} ${trade.outcome} at $${parseFloat(trade.price).toFixed(2)}`,
      trade,
      read: false,
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },
}))
