import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { KitchenScreensService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddKitchenScreen from "@/components/KitchenScreen/AddKitchenScreen"
import { columns } from "@/components/KitchenScreen/columns"
import PendingItems from "@/components/Pending/PendingItems"

function getKitchenScreensQueryOptions() {
  return {
    queryFn: () => KitchenScreensService.readScreens({ skip: 0, limit: 100 }),
    queryKey: ["kitchen-screens"],
  }
}

export const Route = createFileRoute("/_layout/kitchen-screens")({
  component: KitchenScreens,
  head: () => ({
    meta: [
      {
        title: "Kitchen Screens - TRCF ERP",
      },
    ],
  }),
})

function KitchenScreensTableContent() {
  const { data: screens } = useSuspenseQuery(getKitchenScreensQueryOptions())

  if (screens.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Chưa có màn hình nhà bếp nào</h3>
        <p className="text-muted-foreground">Thêm màn hình mới để bắt đầu quản lý đơn hàng khu vực bếp</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={screens.data} />
}

function KitchenScreensTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <KitchenScreensTableContent />
    </Suspense>
  )
}

function KitchenScreens() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Màn hình nhà bếp</h1>
          <p className="text-muted-foreground">Quản lý các màn hình hiển thị đơn hàng tại khu vực bếp</p>
        </div>
        <AddKitchenScreen />
      </div>
      <KitchenScreensTable />
    </div>
  )
}
