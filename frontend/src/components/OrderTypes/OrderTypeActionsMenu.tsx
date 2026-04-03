import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { useState } from "react"
import type { OrderTypePublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteOrderType } from "./DeleteOrderType"
import { EditOrderType } from "./EditOrderType"

interface OrderTypeActionsMenuProps {
  orderType: OrderTypePublic
}

export const OrderTypeActionsMenu = ({
  orderType,
}: OrderTypeActionsMenuProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditOrderType
        orderType={orderType}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
      />
      <DeleteOrderType
        id={orderType.id}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
      />
    </>
  )
}
