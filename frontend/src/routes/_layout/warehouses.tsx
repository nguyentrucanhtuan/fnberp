import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { WarehousesService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import AddWarehouse from "@/components/Warehouses/AddWarehouse"
import { columns } from "@/components/Warehouses/columns"

function getWarehousesQueryOptions() {
  return {
    queryFn: () => WarehousesService.readWarehouses({ skip: 0, limit: 100 }),
    queryKey: ["warehouses"],
  }
}

export const Route = createFileRoute("/_layout/warehouses")({
  component: Warehouses,
  head: () => ({
    meta: [
      {
        title: "Kho hàng - CoffeeTree ERP",
      },
    ],
  }),
})

function WarehousesTableContent() {
  const { data: warehouses } = useSuspenseQuery(getWarehousesQueryOptions())

  if (warehouses.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Chưa có kho nào</h3>
        <p className="text-muted-foreground">
          Thêm kho hàng mới để bắt đầu quản lý
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={warehouses.data} />
}

function WarehousesTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <WarehousesTableContent />
    </Suspense>
  )
}

function Warehouses() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Kho hàng</h2>
          </div>
          <div className="flex items-center space-x-2">
            <AddWarehouse />
          </div>
        </div>
        <div className="h-full">
          <WarehousesTable />
        </div>
      </div>
    </div>
  )
}
