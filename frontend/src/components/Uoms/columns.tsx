import type { ColumnDef } from "@tanstack/react-table"

import type { UomPublic } from "@/client"
import { UomActionsMenu } from "./UomActionsMenu"

// function CopyId({ id }: { id: string }) {
//   const [copiedText, copy] = useCopyToClipboard()
//   const isCopied = copiedText === id

//   return (
//     <div className="flex items-center gap-1.5 group">
//       <span className="font-mono text-xs text-muted-foreground">{id}</span>
//       <Button
//         variant="ghost"
//         size="icon"
//         className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
//         onClick={() => copy(id)}
//       >
//         {isCopied ? (
//           <Check className="size-3 text-green-500" />
//         ) : (
//           <Copy className="size-3" />
//         )}
//         <span className="sr-only">ID</span>
//       </Button>
//     </div>
//   )
// }

export const columns: ColumnDef<UomPublic>[] = [
  {
    accessorKey: "code",
    header: "Mã đơn vị",
    cell: ({ row }) => (
      <span className="font-medium text-blue-600 dark:text-blue-400">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên đơn vị",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "relative_factor",
    header: "Hệ số quy đổi",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.relative_factor?.toFixed(1) || "1"}
      </span>
    ),
  },
  {
    accessorKey: "base_uom",
    header: "Đơn vị quy đổi",
    cell: ({ row }) => {
      const rel = row.original.base_uom
      if (!rel)
        return (
          <span className="text-muted-foreground italic text-xs">
            Đơn vị gốc
          </span>
        )
      return (
        <span className="font-medium">
          {rel.name}{" "}
          <span className="text-muted-foreground font-normal text-xs">
            ({rel.code})
          </span>
        </span>
      )
    },
  },
  // {
  //   accessorKey: "is_archived",
  //   header: "Trạng thái",
  //   cell: ({ row }) => (
  //     <span
  //       className={cn(
  //         "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
  //         row.original.is_archived
  //           ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  //           : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  //       )}
  //     >
  //       {row.original.is_archived ? "Archived" : "Active"}
  //     </span>
  //   ),
  // },
  // {
  //   accessorKey: "id",
  //   header: "ID",
  //   cell: ({ row }) => <CopyId id={row.original.id} />,
  // },
  {
    id: "actions",
    header: () => <span className="sr-only">Hành động</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UomActionsMenu uom={row.original} />
      </div>
    ),
  },
]
