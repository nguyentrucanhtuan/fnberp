import { MoreHorizontal, SquareArrowOutUpRight, Trash } from "lucide-react"
import { useState } from "react"

import type { PaymentMethodPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeletePaymentMethod from "./DeletePaymentMethod"
import EditPaymentMethod from "./EditPaymentMethod"

interface PaymentMethodActionsMenuProps {
  paymentMethod: PaymentMethodPublic
}

export const PaymentMethodActionsMenu = ({
  paymentMethod,
}: PaymentMethodActionsMenuProps) => {
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
            Sửa phương thức
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Xoá phương thức
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPaymentMethod
        paymentMethod={paymentMethod}
        isOpen={editOpen}
        setIsOpen={setEditOpen}
      />
      <DeletePaymentMethod
        id={paymentMethod.id}
        isOpen={deleteOpen}
        setIsOpen={setDeleteOpen}
      />
    </>
  )
}
