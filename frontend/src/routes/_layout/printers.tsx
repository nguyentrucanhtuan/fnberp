import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Printer as PrinterIcon } from "lucide-react"
import { Suspense } from "react"

import { PrintersService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import AddPrinter from "@/components/Printers/AddPrinter"
import { columns } from "@/components/Printers/columns"

function getPrintersQueryOptions() {
  return {
    queryFn: () => PrintersService.readPrinters({ skip: 0, limit: 100 }),
    queryKey: ["printers"],
  }
}

export const Route = createFileRoute("/_layout/printers")({
  component: PrintersPage,
  head: () => ({
    meta: [{ title: "Quản lý máy in - CoffeeTree ERP" }],
  }),
})

function PrintersTableContent() {
  const { data } = useSuspenseQuery(getPrintersQueryOptions())

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <PrinterIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Chưa có máy in nào</h3>
        <p className="text-muted-foreground">
          Thêm thiết bị máy in để bắt đầu quản lý
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={data.data} />
}

function PrintersTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <PrintersTableContent />
    </Suspense>
  )
}

function PrintersPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Máy in</h2>
            <p className="text-muted-foreground">
              Quản lý thiết bị máy in kết nối với hệ thống
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <AddPrinter />
          </div>
        </div>
        <div className="h-full">
          <PrintersTable />
        </div>
      </div>
    </div>
  )
}
