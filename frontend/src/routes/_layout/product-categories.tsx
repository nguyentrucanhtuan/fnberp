import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Tag } from "lucide-react"
import { Suspense } from "react"

import { ProductCategoriesService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import AddCategory from "@/components/ProductCategories/AddCategory"
import { columns } from "@/components/ProductCategories/columns"

function getProductCategoriesQueryOptions() {
  return {
    queryFn: () =>
      ProductCategoriesService.readCategories({ skip: 0, limit: 100 }),
    queryKey: ["product-categories"],
  }
}

export const Route = createFileRoute("/_layout/product-categories")({
  component: ProductCategories,
  head: () => ({
    meta: [
      {
        title: "Danh mục sản phẩm - CoffeeTree ERP",
      },
    ],
  }),
})

function ProductCategoriesTableContent() {
  const { data: categories } = useSuspenseQuery(
    getProductCategoriesQueryOptions(),
  )

  if (categories.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Tag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Chưa có danh mục nào</h3>
        <p className="text-muted-foreground">
          Thêm danh mục mới để bắt đầu phân loại sản phẩm của bạn.
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={categories.data} />
}

function ProductCategoriesTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <ProductCategoriesTableContent />
    </Suspense>
  )
}

function ProductCategories() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Danh mục sản phẩm
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <AddCategory />
          </div>
        </div>
        <div className="h-full">
          <ProductCategoriesTable />
        </div>
      </div>
    </div>
  )
}

export default ProductCategories
