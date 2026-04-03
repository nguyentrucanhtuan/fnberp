import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { KitchenScreensService } from "@/client"
import { toast } from "sonner"

interface DeleteProps {
  id: string
  isOpen: boolean
  onClose: () => void
}

export default function DeleteKitchenScreen({ id, isOpen, onClose }: DeleteProps) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => KitchenScreensService.deleteScreen({ id }),
    onSuccess: () => {
      toast.success("Xoá màn hình thành công")
      queryClient.invalidateQueries({ queryKey: ["kitchen-screens"] })
      onClose()
    },
    onError: () => {
      toast.error("Không thể xoá màn hình này")
    },
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xoá?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Màn hình này sẽ bị xoá vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              mutate()
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Đang xoá..." : "Xoá"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
