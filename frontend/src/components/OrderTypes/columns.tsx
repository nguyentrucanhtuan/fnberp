import type { ColumnDef } from "@tanstack/react-table"
import type { OrderTypePublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { OrderTypeActionsMenu } from "./OrderTypeActionsMenu"

export const columns: ColumnDef<OrderTypePublic>[] = [
  {
    accessorKey: "name",
    header: "Tên loại đơn hàng",
  },
  {
    accessorKey: "is_active",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.original.is_active
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Hoạt động" : "Ngừng"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <OrderTypeActionsMenu orderType={row.original} />,
  },
]
