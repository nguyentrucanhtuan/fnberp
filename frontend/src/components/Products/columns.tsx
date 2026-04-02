import type { ColumnDef } from "@tanstack/react-table"

import type { ProductPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { ProductActionsMenu } from "./ProductActionsMenu"

export const columns: ColumnDef<ProductPublic>[] = [
  {
    accessorKey: "sku",
    header: "Mã SP",
  },
  {
    accessorKey: "name",
    header: "Tên sản phẩm",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          <span className="text-xs text-muted-foreground">{product.type}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "uom.name",
    header: "Đơn vị chính",
  },
  {
    accessorKey: "price",
    header: "Giá bán",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "is_storable",
    header: "Tồn kho",
    cell: ({ row }) => {
      const isStorable = row.getValue("is_storable")
      return (
        <Badge variant={isStorable ? "default" : "secondary"}>
          {isStorable ? "Theo dõi" : "Không"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductActionsMenu product={row.original} />,
  },
]
