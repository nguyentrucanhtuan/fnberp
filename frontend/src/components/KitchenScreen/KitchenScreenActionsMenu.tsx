import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { useState } from "react"

import type { KitchenScreenPublic } from "@/client"
import EditKitchenScreen from "./EditKitchenScreen"
import DeleteKitchenScreen from "./DeleteKitchenScreen"

interface KitchenScreenActionsMenuProps {
  kitchenScreen: KitchenScreenPublic
}

export function KitchenScreenActionsMenu({ kitchenScreen }: KitchenScreenActionsMenuProps) {
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
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditKitchenScreen
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        kitchenScreen={kitchenScreen}
      />
      <DeleteKitchenScreen
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        id={kitchenScreen.id}
      />
    </>
  )
}
