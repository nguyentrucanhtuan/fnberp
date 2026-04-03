import type { ColumnDef } from "@tanstack/react-table"

import type { WarehousePublic } from "@/client"
import { WarehouseActionsMenu } from "./WarehouseActionsMenu"

export const columns: ColumnDef<WarehousePublic>[] = [
  {
    accessorKey: "code",
    header: "Mã kho",
    cell: ({ row }) => (
      <span className="font-medium text-blue-600 dark:text-blue-400">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên kho",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "address",
    header: "Địa chỉ",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.address || (
          <span className="italic text-xs">Chưa có</span>
        )}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Hành động</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <WarehouseActionsMenu warehouse={row.original} />
      </div>
    ),
  },
]
