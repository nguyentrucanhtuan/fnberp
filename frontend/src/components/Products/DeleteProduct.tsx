import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash } from "lucide-react"

import { ProductsService } from "@/client"
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

interface DeleteProductProps {
  id: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DeleteProduct = ({ id, isOpen, setIsOpen }: DeleteProductProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => ProductsService.deleteProduct({ id }),
    onSuccess: () => {
      showSuccessToast("Product deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
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
            Hành động này không thể hoàn tác. Dữ liệu sản phẩm sẽ bị xoá vĩnh viễn
            khỏi hệ thống.
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
            Xoá sản phẩm
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteProduct
