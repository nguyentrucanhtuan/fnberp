import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  type OrderTypePublic,
  OrderTypesService,
  type OrderTypeUpdate,
} from "@/client"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Switch } from "@/components/ui/switch"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface EditOrderTypeProps {
  orderType: OrderTypePublic
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tên loại đơn hàng là bắt buộc" })
    .max(255),
  is_active: z.boolean().default(true),
  is_archived: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

export const EditOrderType = ({
  orderType,
  isOpen,
  setIsOpen,
}: EditOrderTypeProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: orderType.name ?? "",
      is_active: orderType.is_active ?? true,
      is_archived: orderType.is_archived ?? false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: OrderTypeUpdate) =>
      OrderTypesService.updateOrderType({
        id: orderType.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Cập nhật loại đơn hàng thành công")
      queryClient.invalidateQueries({ queryKey: ["order-types"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as any)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa loại đơn hàng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin loại đơn hàng.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên loại đơn hàng</FormLabel>
                  <FormControl>
                    <Input placeholder="Mang đi, Tại chỗ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Hoạt động</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_archived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Lưu trữ</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Ẩn loại đơn hàng này khỏi các danh sách lựa chọn chung.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Lưu thay đổi
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
