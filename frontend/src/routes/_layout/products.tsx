import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Package } from "lucide-react"
import { Suspense } from "react"

import { ProductsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import AddProduct from "@/components/Products/AddProduct"
import { columns } from "@/components/Products/columns"

function getProductsQueryOptions() {
  return {
    queryFn: () => ProductsService.readProducts({ skip: 0, limit: 100 }),
    queryKey: ["products"],
  }
}

export const Route = createFileRoute("/_layout/products")({
  component: Products,
  head: () => ({
    meta: [
      {
        title: "Sản phẩm - CoffeeTree ERP",
      },
    ],
  }),
})

function ProductsTableContent() {
  const { data: products } = useSuspenseQuery(getProductsQueryOptions())

  if (products.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Chưa có sản phẩm nào</h3>
        <p className="text-muted-foreground">
          Thêm sản phẩm mới để bắt đầu quản lý kho và bán hàng.
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={products.data} />
}

function ProductsTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <ProductsTableContent />
    </Suspense>
  )
}

function Products() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Quản lý Sản phẩm
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <AddProduct />
          </div>
        </div>
        <div className="h-full">
          <ProductsTable />
        </div>
      </div>
    </div>
  )
}

export default Products
