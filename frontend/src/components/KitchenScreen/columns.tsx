import type { ColumnDef } from "@tanstack/react-table"
import type { KitchenScreenPublic } from "@/client"
import { KitchenScreenActionsMenu } from "./KitchenScreenActionsMenu"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<KitchenScreenPublic>[] = [
  {
    accessorKey: "name",
    header: "Tên màn hình",
  },
  {
    accessorKey: "pos",
    header: "POS áp dụng",
    cell: ({ row }) => row.original.pos?.name || "N/A",
  },
  {
    accessorKey: "categories",
    header: "Danh mục hiển thị",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.categories?.map((cat) => (
          <Badge key={cat.id} variant="secondary">
            {cat.name}
          </Badge>
        )) || "Tất cả"}
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Hoạt động" : "Ngưng"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <KitchenScreenActionsMenu kitchenScreen={row.original} />,
  },
]
