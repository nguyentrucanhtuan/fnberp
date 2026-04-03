import { MoreHorizontal, SquareArrowOutUpRight, Trash } from "lucide-react"
import { useState } from "react"

import type { WarehousePublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteWarehouse from "./DeleteWarehouse"
import EditWarehouse from "./EditWarehouse"

interface WarehouseActionsMenuProps {
  warehouse: WarehousePublic
}

export const WarehouseActionsMenu = ({
  warehouse,
}: WarehouseActionsMenuProps) => {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
            Sửa kho
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Xoá kho
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditWarehouse
        warehouse={warehouse}
        isOpen={editOpen}
        setIsOpen={setEditOpen}
      />
      <DeleteWarehouse
        id={warehouse.id}
        isOpen={deleteOpen}
        setIsOpen={setDeleteOpen}
      />
    </>
  )
}
