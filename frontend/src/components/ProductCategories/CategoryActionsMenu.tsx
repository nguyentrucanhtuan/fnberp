"use client"

import { MoreHorizontal, SquareArrowOutUpRight, Trash } from "lucide-react"
import { useState } from "react"

import type { ProductCategoryPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteCategory from "./DeleteCategory"
import EditCategory from "./EditCategory"

interface CategoryActionsMenuProps {
  category: ProductCategoryPublic
}

export const CategoryActionsMenu = ({ category }: CategoryActionsMenuProps) => {
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
            Sửa danh mục
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Xoá danh mục
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCategory
        category={category}
        isOpen={editOpen}
        setIsOpen={setEditOpen}
      />
      <DeleteCategory
        id={category.id}
        isOpen={deleteOpen}
        setIsOpen={setDeleteOpen}
      />
    </>
  )
}
