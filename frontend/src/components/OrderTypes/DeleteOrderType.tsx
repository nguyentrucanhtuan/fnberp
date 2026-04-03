import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OrderTypesService } from "@/client"
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

interface DeleteOrderTypeProps {
  id: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export const DeleteOrderType = ({
  id,
  isOpen,
  setIsOpen,
}: DeleteOrderTypeProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => OrderTypesService.deleteOrderType({ id }),
    onSuccess: () => {
      showSuccessToast("Xóa loại đơn hàng thành công")
      queryClient.invalidateQueries({ queryKey: ["order-types"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Loại đơn hàng này sẽ bị xóa vĩnh
            viễn khỏi hệ thống.
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
          >
            Xác nhận xóa
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
