import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { PaymentMethodsService, type PosCreate, PosService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên quầy là bắt buộc" }).max(255),
  payment_method_ids: z.array(z.string()).default([]),
})

type FormData = z.infer<typeof formSchema>

const AddPos = () => {
  const [isOpen, setIsOpen] = useState(false)
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
      name: "",
      payment_method_ids: [],
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PosCreate) =>
      PosService.createPos({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Tạo quầy bán hàng thành công")
      queryClient.invalidateQueries({ queryKey: ["pos"] })
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as any as PosCreate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          Thêm quầy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Thêm quầy bán hàng</DialogTitle>
          <DialogDescription>
            Thêm địa điểm quầy bán hàng mới vào hệ thống.
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
            <DialogFooter className="pt-4">
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="w-full"
              >
                Thêm quầy
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddPos
