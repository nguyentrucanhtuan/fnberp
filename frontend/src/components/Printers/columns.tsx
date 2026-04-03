import type { ColumnDef } from "@tanstack/react-table"

import type { PrinterPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { PrinterActionsMenu } from "./PrinterActionsMenu"

const PRINTER_TYPE_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  invoice: { label: "Hoá đơn", variant: "default" },
  label: { label: "Nhãn dán", variant: "secondary" },
  kitchen_order_ticket: { label: "Phiếu yêu cầu món", variant: "outline" },
}

export const columns: ColumnDef<PrinterPublic>[] = [
  {
    accessorKey: "name",
    header: "Tên thiết bị",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    id: "printer_type",
    header: "Loại máy in",
    cell: ({ row }) => {
      const type = row.original.printer_type ?? "invoice"
      const config = PRINTER_TYPE_LABELS[type] ?? {
        label: type,
        variant: "outline" as const,
      }
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: "ip",
    header: "Địa chỉ IP",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ip}</span>
    ),
  },
  {
    accessorKey: "port",
    header: "Cổng",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.port}</span>
    ),
  },
  {
    id: "is_active",
    header: "Trạng thái",
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Hoạt động
        </Badge>
      ) : (
        <Badge variant="secondary">Tắt</Badge>
      ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Hành động</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PrinterActionsMenu printer={row.original} />
      </div>
    ),
  },
]
