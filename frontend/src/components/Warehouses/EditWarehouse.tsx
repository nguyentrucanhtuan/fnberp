import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  type WarehousePublic,
  WarehousesService,
  type WarehouseUpdate,
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
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface EditWarehouseProps {
  warehouse: WarehousePublic
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const formSchema = z.object({
  code: z.string().min(1, { message: "Mã kho là bắt buộc" }).max(20),
  name: z.string().min(1, { message: "Tên kho là bắt buộc" }),
  address: z.string().max(500).optional(),
  is_archived: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

const EditWarehouse = ({
  warehouse,
  isOpen,
  setIsOpen,
}: EditWarehouseProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      code: warehouse.code ?? "",
      name: warehouse.name ?? "",
      address: warehouse.address ?? "",
      is_archived: warehouse.is_archived ?? false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: WarehouseUpdate) =>
      WarehousesService.updateWarehouse({
        id: warehouse.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Cập nhật kho thành công")
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    const payload: WarehouseUpdate = {
      ...data,
      address: data.address || null,
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa thông tin kho</DialogTitle>
          <DialogDescription>Cập nhật thông tin kho hàng.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4 py-4"
          >
            <FormField<FormData>
              control={form.control as any}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã kho</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="KHO01, WH-HCM..."
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<FormData>
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên kho</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kho chính, Kho phụ..."
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<FormData>
              control={form.control as any}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Số 123, Đường ABC, Quận 1, TP.HCM..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<FormData>
              control={form.control}
              name="is_archived"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem className="flex items-center gap-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      {...fieldProps}
                      checked={value as boolean}
                      onCheckedChange={onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Lưu trữ</FormLabel>
                    <p className="text-[12px] text-muted-foreground italic">
                      Ẩn kho này khỏi danh sách chọn thông thường
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="w-full"
              >
                Lưu thay đổi
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditWarehouse
