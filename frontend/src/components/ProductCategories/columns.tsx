import type { ColumnDef } from "@tanstack/react-table"

import type { ProductCategoryPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { CategoryActionsMenu } from "./CategoryActionsMenu"

export const columns: ColumnDef<ProductCategoryPublic>[] = [
  {
    accessorKey: "name",
    header: "Tên danh mục",
    cell: ({ row }) => {
      const category = row.original
      return (
        <div className="flex items-center gap-2">
          {category.color && (
            <div
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: category.color }}
            />
          )}
          <span className="font-medium">{category.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => row.getValue("description") || "-",
  },
  {
    accessorKey: "is_archived",
    header: "Lưu trữ",
    cell: ({ row }) => {
      const isArchived = row.getValue("is_archived")
      return (
        <Badge variant={isArchived ? "secondary" : "default"}>
          {isArchived ? "Lưu trữ" : "Hoạt động"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CategoryActionsMenu category={row.original} />,
  },
]
