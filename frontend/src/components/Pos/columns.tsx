import type { ColumnDef } from "@tanstack/react-table"

import type { PosPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { PosActionsMenu } from "./PosActionsMenu"

export const columns: ColumnDef<PosPublic>[] = [
  {
    accessorKey: "name",
    header: "Tên quầy bán hàng",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    id: "payment_methods",
    header: "Phương thức thanh toán",
    cell: ({ row }) => {
      const methods = row.original.payment_methods ?? []
      if (methods.length === 0) {
        return (
          <span className="text-muted-foreground text-sm italic">
            Chưa cấu hình
          </span>
        )
      }
      return (
        <div className="flex flex-wrap gap-1">
          {methods.map((pm) => (
            <Badge
              key={pm.id}
              variant="secondary"
              className="font-mono text-xs"
            >
              {pm.code}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Hành động</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PosActionsMenu pos={row.original} />
      </div>
    ),
  },
]
