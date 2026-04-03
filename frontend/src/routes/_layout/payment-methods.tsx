import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { PaymentMethodsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddPaymentMethod from "@/components/PaymentMethods/AddPaymentMethod"
import { columns } from "@/components/PaymentMethods/columns"
import PendingItems from "@/components/Pending/PendingItems"

function getPaymentMethodsQueryOptions() {
  return {
    queryFn: () =>
      PaymentMethodsService.readPaymentMethods({ skip: 0, limit: 100 }),
    queryKey: ["payment-methods"],
  }
}

export const Route = createFileRoute("/_layout/payment-methods")({
  component: PaymentMethodsPage,
  head: () => ({
    meta: [{ title: "Phương thức thanh toán - CoffeeTree ERP" }],
  }),
})

function PaymentMethodsTableContent() {
  const { data } = useSuspenseQuery(getPaymentMethodsQueryOptions())

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">
          Chưa có phương thức thanh toán nào
        </h3>
        <p className="text-muted-foreground">
          Thêm phương thức thanh toán để bắt đầu
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={data.data} />
}

function PaymentMethodsTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <PaymentMethodsTableContent />
    </Suspense>
  )
}

function PaymentMethodsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Phương thức thanh toán
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <AddPaymentMethod />
          </div>
        </div>
        <div className="h-full">
          <PaymentMethodsTable />
        </div>
      </div>
    </div>
  )
}
