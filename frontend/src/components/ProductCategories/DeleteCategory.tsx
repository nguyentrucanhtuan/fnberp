import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash } from "lucide-react"

import { ProductCategoriesService } from "@/client"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface DeleteCategoryProps {
  id: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DeleteCategory = ({ id, isOpen, setIsOpen }: DeleteCategoryProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => ProductCategoriesService.deleteCategory({ id }),
    onSuccess: () => {
      showSuccessToast("Category deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["product-categories"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xoá?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Danh mục này sẽ bị xoá vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <LoadingButton
            variant="destructive"
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            className="gap-2"
          >
            <Trash className="h-4 w-4" />
            Xoá danh mục
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCategory
