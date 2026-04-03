import type { ColumnDef } from "@tanstack/react-table"

import type { PaymentMethodPublic } from "@/client"
import { PaymentMethodActionsMenu } from "./PaymentMethodActionsMenu"

export const columns: ColumnDef<PaymentMethodPublic>[] = [
  {
    accessorKey: "code",
    header: "Mã phương thức",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên phương thức thanh toán",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Hành động</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PaymentMethodActionsMenu paymentMethod={row.original} />
      </div>
    ),
  },
]
