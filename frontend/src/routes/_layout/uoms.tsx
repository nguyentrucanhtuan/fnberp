import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { UomsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import AddUom from "@/components/Uoms/AddUom"
import { columns } from "@/components/Uoms/columns"

function getUomsQueryOptions() {
  return {
    queryFn: () => UomsService.readUoms({ skip: 0, limit: 100 }),
    queryKey: ["uoms"],
  }
}

export const Route = createFileRoute("/_layout/uoms")({
  component: Uoms,
  head: () => ({
    meta: [
      {
        title: "Units of Measure - CoffeeTree ERP",
      },
    ],
  }),
})

function UomsTableContent() {
  const { data: uoms } = useSuspenseQuery(getUomsQueryOptions())

  if (uoms.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any units yet</h3>
        <p className="text-muted-foreground">
          Add a new unit of measure to get started
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={uoms.data} />
}

function UomsTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <UomsTableContent />
    </Suspense>
  )
}

function Uoms() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Đơn vị đo lường
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <AddUom />
          </div>
        </div>
        <div className="h-full">
          <UomsTable />
        </div>
      </div>
    </div>
  )
}
