import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  PaymentMethodsService,
  type PosPublic,
  PosService,
  type PosUpdate,
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
import { MultiSelect } from "@/components/ui/multi-select"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface EditPosProps {
  pos: PosPublic
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên quầy là bắt buộc" }).max(255),
  is_archived: z.boolean().default(false),
  payment_method_ids: z.array(z.string()).default([]),
})

type FormData = z.infer<typeof formSchema>

const EditPos = ({ pos, isOpen, setIsOpen }: EditPosProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Lấy danh sách phương thức thanh toán
  const { data: pmData } = useQuery({
    queryKey: ["payment-methods", { limit: 100 }],
    queryFn: () => PaymentMethodsService.readPaymentMethods({ limit: 100 }),
  })
  const paymentMethodOptions = (pmData?.data || []).map((pm) => ({
    label: `${pm.name} (${pm.code})`,
    value: pm.id,
  }))

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: pos.name ?? "",
      is_archived: pos.is_archived ?? false,
      payment_method_ids: pos.payment_methods?.map((pm) => pm.id) ?? [],
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PosUpdate) =>
      PosService.updatePos({ id: pos.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Cập nhật quầy bán hàng thành công")
      queryClient.invalidateQueries({ queryKey: ["pos"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as any as PosUpdate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Sửa quầy bán hàng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin quầy bán hàng.
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
                  <FormLabel>Tên quầy bán hàng</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CoffeeTree Trương Văn Bang..."
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
              name="payment_method_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phương thức thanh toán</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={paymentMethodOptions}
                      selected={field.value as string[]}
                      onChange={field.onChange}
                      placeholder="Chọn phương thức thanh toán..."
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
                      Ẩn quầy này khỏi danh sách chọn thông thường
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

export default EditPos
