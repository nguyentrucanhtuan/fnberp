import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { PosService } from "@/client"
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

interface DeletePosProps {
  id: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DeletePos = ({ id, isOpen, setIsOpen }: DeletePosProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { handleSubmit } = useForm()

  const mutation = useMutation({
    mutationFn: () => PosService.deletePos({ id }),
    onSuccess: () => {
      showSuccessToast("Xoá quầy bán hàng thành công")
      queryClient.invalidateQueries({ queryKey: ["pos"] })
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
            <DialogTitle>Xoá quầy bán hàng</DialogTitle>
            <DialogDescription>
              Quầy này sẽ bị xoá vĩnh viễn. Bạn có chắc chắn không? Hành động
              này không thể hoàn tác.
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

export default DeletePos
