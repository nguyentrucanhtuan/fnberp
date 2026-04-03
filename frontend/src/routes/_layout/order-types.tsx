import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { OrderTypesService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import { AddOrderType } from "@/components/OrderTypes/AddOrderType"
import { columns } from "@/components/OrderTypes/columns"

export const Route = createFileRoute("/_layout/order-types")({
  component: OrderTypesPage,
})

function OrderTypesPage() {
  const { data: orderTypes } = useSuspenseQuery({
    queryFn: () => OrderTypesService.readOrderTypes({ limit: 100 }),
    queryKey: ["order-types"],
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Loại đơn hàng</h2>
        <div className="flex items-center space-x-2">
          <AddOrderType />
        </div>
      </div>
      <DataTable columns={columns} data={orderTypes.data} />
    </div>
  )
}
