"use client"

import * as React from "react"
import { createContext, useContext, useState, useRef, useCallback } from "react"
import type { UserPayConfig, SystemConfig } from "@/lib/services"
import services, { isCancelError } from "@/lib/services"

/**
 * 通用的表格交互 hook
 */
export function useTableInteraction<T extends { id?: number; key?: string }>(getInitialEditData: (item: T) => Partial<T>) {
  const [hoveredItem, setHoveredItem] = useState<T | null>(null)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [editData, setEditData] = useState<Partial<T>>({})
  const [saving, setSaving] = useState(false)

  const handleHover = (item: T | null) => {
    setHoveredItem(item)
  }

  const handleSelect = (item: T) => {
    const itemId = item.id || item.key
    const selectedId = selectedItem?.id || selectedItem?.key

    if (itemId === selectedId) {
      setSelectedItem(null)
      setEditData({})
    } else {
      setSelectedItem(item)
      setEditData(getInitialEditData(item))
    }
    setHoveredItem(null)
  }

  const handleEditDataChange = (field: keyof T, value: T[keyof T]) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return {
    hoveredItem,
    selectedItem,
    editData,
    saving,
    setSaving,
    handleHover,
    handleSelect,
    handleEditDataChange,
    setEditData,
  }
}

/**
 * Admin 上下文状态
 */
interface AdminContextState {
  // User Pay Configs
  userPayConfigs: UserPayConfig[]
  userPayConfigsLoading: boolean
  userPayConfigsError: Error | null
  refetchUserPayConfigs: () => Promise<void>
  createUserPayConfig: (data: {
    level: number
    min_score: number
    max_score: number | null
    daily_limit: number | null
    fee_rate: string
  }) => Promise<void>
  updateUserPayConfig: (id: number, data: {
    min_score: number
    max_score?: number | null
    daily_limit?: number | null
    fee_rate: number | string
  }) => Promise<void>
  deleteUserPayConfig: (id: number) => Promise<void>

  // System Configs
  systemConfigs: SystemConfig[]
  systemConfigsLoading: boolean
  systemConfigsError: Error | null
  refetchSystemConfigs: () => Promise<void>
  updateSystemConfig: (key: string, data: {
    value: string
    description?: string
  }) => Promise<void>
  deleteSystemConfig: (key: string) => Promise<void>
}

const AdminContext = createContext<AdminContextState | null>(null)

/**
 * Admin Provider 属性
 */
interface AdminProviderProps {
  children: React.ReactNode
}

/**
 * Admin Provider
 * 提供 admin 相关的数据状态管理
 */
export function AdminProvider({ children }: AdminProviderProps) {
  // User Pay Configs 状态
  const [userPayConfigs, setUserPayConfigs] = useState<UserPayConfig[]>([])
  const [userPayConfigsLoading, setUserPayConfigsLoading] = useState(false)
  const [userPayConfigsError, setUserPayConfigsError] = useState<Error | null>(null)

  // System Configs 状态
  const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([])
  const [systemConfigsLoading, setSystemConfigsLoading] = useState(false)
  const [systemConfigsError, setSystemConfigsError] = useState<Error | null>(null)

  // 请求 ID 跟踪 - 分别管理
  const userPayRequestIdRef = useRef(0)
  const systemRequestIdRef = useRef(0)

  /**
   * 获取用户支付配置列表
   */
  const refetchUserPayConfigs = useCallback(async () => {
    const requestId = ++userPayRequestIdRef.current

    try {
      setUserPayConfigsLoading(true)
      setUserPayConfigsError(null)
      const data = await services.admin.listUserPayConfigs()

      if (requestId !== userPayRequestIdRef.current) {
        return
      }

      setUserPayConfigs(data)
      setUserPayConfigsLoading(false)
    } catch (error) {
      if (requestId !== userPayRequestIdRef.current) {
        return
      }

      if (!isCancelError(error)) {
        console.error('加载支付配置失败:', error)
        setUserPayConfigsError(error instanceof Error ? error : new Error('加载支付配置失败'))
      }
      setUserPayConfigsLoading(false)
    }
  }, [])

  /**
   * 创建用户支付配置
   */
  const createUserPayConfig = useCallback(async (data: {
    level: number
    min_score: number
    max_score: number | null
    daily_limit: number | null
    fee_rate: string
  }) => {
    await services.admin.createUserPayConfig(data)
    await refetchUserPayConfigs()
  }, [refetchUserPayConfigs])

  /**
   * 更新用户支付配置
   */
  const updateUserPayConfig = useCallback(async (id: number, data: {
    min_score: number
    max_score?: number | null
    daily_limit?: number | null
    fee_rate: number | string
  }) => {
    try {
      await services.admin.updateUserPayConfig(id, data)
      await refetchUserPayConfigs()
    } catch (error) {
      if (isCancelError(error)) {
        return
      }
      throw error
    }
  }, [refetchUserPayConfigs])

  /**
   * 删除用户支付配置
   */
  const deleteUserPayConfig = useCallback(async (id: number) => {
    await services.admin.deleteUserPayConfig(id)
    await refetchUserPayConfigs()
  }, [refetchUserPayConfigs])

  /**
   * 获取系统配置列表
   */
  const refetchSystemConfigs = useCallback(async () => {
    const requestId = ++systemRequestIdRef.current

    try {
      setSystemConfigsLoading(true)
      setSystemConfigsError(null)
      const data = await services.admin.listSystemConfigs()

      if (requestId !== systemRequestIdRef.current) {
        return
      }

      setSystemConfigs(data)
      setSystemConfigsLoading(false)
    } catch (error) {
      if (requestId !== systemRequestIdRef.current) {
        return
      }

      if (!isCancelError(error)) {
        console.error('加载系统配置失败:', error)
        setSystemConfigsError(error instanceof Error ? error : new Error('加载系统配置失败'))
      }
      setSystemConfigsLoading(false)
    }
  }, [])

  /**
   * 更新系统配置
   */
  const updateSystemConfig = useCallback(async (key: string, data: {
    value: string
    description?: string
  }) => {
    try {
      await services.admin.updateSystemConfig(key, data)
      await refetchSystemConfigs()
    } catch (error) {
      if (isCancelError(error)) {
        return
      }
      throw error
    }
  }, [refetchSystemConfigs])

  /**
   * 删除系统配置
   */
  const deleteSystemConfig = useCallback(async (key: string) => {
    await services.admin.deleteSystemConfig(key)
    await refetchSystemConfigs()
  }, [refetchSystemConfigs])

  const value: AdminContextState = {
    // User Pay Configs
    userPayConfigs,
    userPayConfigsLoading,
    userPayConfigsError,
    refetchUserPayConfigs,
    createUserPayConfig,
    updateUserPayConfig,
    deleteUserPayConfig,

    // System Configs
    systemConfigs,
    systemConfigsLoading,
    systemConfigsError,
    refetchSystemConfigs,
    updateSystemConfig,
    deleteSystemConfig,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

/**
 * 使用 Admin 上下文
 */
export function useAdmin() {
  const context = useContext(AdminContext)

  if (!context) {
    throw new Error('useAdmin 必须在 AdminProvider 内部使用')
  }

  return context
}
