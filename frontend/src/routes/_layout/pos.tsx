import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { PosService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import AddPos from "@/components/Pos/AddPos"
import { columns } from "@/components/Pos/columns"

function getPosQueryOptions() {
  return {
    queryFn: () => PosService.readPoss({ skip: 0, limit: 100 }),
    queryKey: ["pos"],
  }
}

export const Route = createFileRoute("/_layout/pos")({
  component: PosPage,
  head: () => ({
    meta: [
      {
        title: "Quầy bán hàng - CoffeeTree ERP",
      },
    ],
  }),
})

function PosTableContent() {
  const { data: pos } = useSuspenseQuery(getPosQueryOptions())

  if (pos.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Chưa có quầy bán hàng nào</h3>
        <p className="text-muted-foreground">
          Thêm quầy bán hàng mới để bắt đầu quản lý
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={pos.data} />
}

function PosTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <PosTableContent />
    </Suspense>
  )
}

function PosPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Quầy bán hàng</h2>
          </div>
          <div className="flex items-center space-x-2">
            <AddPos />
          </div>
        </div>
        <div className="h-full">
          <PosTable />
        </div>
      </div>
    </div>
  )
}
