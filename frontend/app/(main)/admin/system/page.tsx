"use client"

import { useEffect } from "react"
import { SystemConfigs } from "@/components/common/admin/system-configs"
import { AdminProvider, useAdmin } from "@/contexts/admin-context"
import { useUser } from "@/contexts/user-context"
import { ErrorPage } from "@/components/common/status/error"
import { LoadingPage } from "@/components/common/status/loading"

export default function SystemConfigPage() {
  return (
    <AdminProvider>
      <SystemConfigPageContent />
    </AdminProvider>
  )
}

function SystemConfigPageContent() {
  const { user, loading } = useUser()
  const { refetchSystemConfigs } = useAdmin()

  useEffect(() => {
    if (user?.is_admin) {
      refetchSystemConfigs()
    }
  }, [user?.is_admin, refetchSystemConfigs])

  if (loading) {
    return <LoadingPage text="系统配置" badgeText="系统" />
  }

  if (!user?.is_admin) {
    return (
      <ErrorPage
        title="访问被拒绝"
        message="您没有权限访问此页面"
      />
    )
  }

  return <SystemConfigs />
}

