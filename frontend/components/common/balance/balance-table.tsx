"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionTableList } from "@/components/common/general/table-data"

import type { OrderType } from "@/lib/services"
import { TransactionProvider, useTransaction } from "@/contexts/transaction-context"

/* 标签触发器样式 */
const TAB_TRIGGER_STYLES = "data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-0 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 bg-transparent rounded-none border-0 border-b-2 border-transparent px-0 text-sm font-bold text-muted-foreground data-[state=active]:text-indigo-500 -mb-[2px] relative hover:text-foreground transition-colors flex-none"

/**
 * 余额活动表格组件
 * 显示收款、转账、社区划转和所有活动的交易记录（支持分页）
 * 
 * @example
 * ```tsx
 * <BalanceTable />
 * ```
 */
export function BalanceTable() {
  const [activeTab, setActiveTab] = useState<OrderType | 'all'>('all')

  /* 计算最近一个月的时间范围 */
  const { startTime, endTime } = useMemo(() => {
    const now = new Date()
    const endTime = now.toISOString()
    const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    return { startTime, endTime }
  }, [])



  return (
    <div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OrderType | 'all')} className="w-full">
        <TabsList className="flex p-0 gap-4 rounded-none w-full bg-transparent justify-start border-b border-border">
          <TabsTrigger value="receive" className={TAB_TRIGGER_STYLES}>
            收款
          </TabsTrigger>
          <TabsTrigger value="payment" className={TAB_TRIGGER_STYLES}>
            付款
          </TabsTrigger>
          <TabsTrigger value="transfer" className={TAB_TRIGGER_STYLES}>
            转账
          </TabsTrigger>
          <TabsTrigger value="community" className={TAB_TRIGGER_STYLES}>
            社区划转
          </TabsTrigger>
          <TabsTrigger value="all" className={TAB_TRIGGER_STYLES}>
            所有活动
          </TabsTrigger>
        </TabsList>

        <div className="mt-2">
          <TransactionProvider defaultParams={{ page_size: 20, startTime, endTime }}>
            <TransactionList type={activeTab === 'all' ? undefined : activeTab} />
          </TransactionProvider>
        </div>
      </Tabs>
    </div>
  )
}

/**
 * 交易列表组件
 * 显示交易记录
 * 
 * @example
 * ```tsx
 * <TransactionList type="receive" />
 * ```
 * @param {OrderType} type - 交易类型
 * @returns {React.ReactNode} 交易列表组件
 */
function TransactionList({ type }: { type?: OrderType }) {
  const {
    transactions,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    lastParams,
    fetchTransactions,
    loadMore,
  } = useTransaction()

  /* 重新加载数据 */
  useEffect(() => {
    fetchTransactions({
      page: 1,
      type,
      startTime: lastParams.startTime,
      endTime: lastParams.endTime,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  /* 加载更多 */
  const handleLoadMore = () => {
    loadMore()
  }

  return (
    <TransactionTableList
      loading={loading}
      error={error}
      transactions={transactions}
      total={total}
      currentPage={currentPage}
      totalPages={totalPages}
      onRetry={() => fetchTransactions({ page: 1 })}
      onLoadMore={handleLoadMore}
    />
  )
}
