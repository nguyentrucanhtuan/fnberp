import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  type PaymentMethodPublic,
  PaymentMethodsService,
  type PaymentMethodUpdate,
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface EditPaymentMethodProps {
  paymentMethod: PaymentMethodPublic
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên phương thức là bắt buộc" }).max(255),
  code: z.string().min(1, { message: "Mã phương thức là bắt buộc" }).max(50),
  is_archived: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

const EditPaymentMethod = ({
  paymentMethod,
  isOpen,
  setIsOpen,
}: EditPaymentMethodProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: paymentMethod.name ?? "",
      code: paymentMethod.code ?? "",
      is_archived: paymentMethod.is_archived ?? false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PaymentMethodUpdate) =>
      PaymentMethodsService.updatePaymentMethod({
        id: paymentMethod.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Cập nhật phương thức thanh toán thành công")
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa phương thức thanh toán</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin phương thức thanh toán.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4 py-4"
          >
            <FormField<FormData>
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên phương thức thanh toán</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tiền mặt..."
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã phương thức</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CASH, BANK, MOMO..."
                      className="font-mono uppercase"
                      {...field}
                      value={field.value as string}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
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
                      Ẩn phương thức này khỏi danh sách chọn thông thường
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

export default EditPaymentMethod
