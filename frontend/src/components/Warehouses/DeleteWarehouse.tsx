import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { WarehousesService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface DeleteWarehouseProps {
  id: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DeleteWarehouse = ({ id, isOpen, setIsOpen }: DeleteWarehouseProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { handleSubmit } = useForm()

  const mutation = useMutation({
    mutationFn: () => WarehousesService.deleteWarehouse({ id: id }),
    onSuccess: () => {
      showSuccessToast("Xoá kho thành công")
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = async () => {
    mutation.mutate()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <DialogHeader>
            <DialogTitle>Xoá kho</DialogTitle>
            <DialogDescription>
              Kho này sẽ bị xoá vĩnh viễn. Bạn có chắc chắn không? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={mutation.isPending}>
                Huỷ
              </Button>
            </DialogClose>
            <LoadingButton
              variant="destructive"
              type="submit"
              loading={mutation.isPending}
            >
              Xoá
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteWarehouse
