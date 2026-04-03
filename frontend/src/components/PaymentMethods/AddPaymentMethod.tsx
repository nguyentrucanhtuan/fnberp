import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type PaymentMethodCreate, PaymentMethodsService } from "@/client"
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên phương thức là bắt buộc" }).max(255),
  code: z.string().min(1, { message: "Mã phương thức là bắt buộc" }).max(50),
})

type FormData = z.infer<typeof formSchema>

const AddPaymentMethod = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: { name: "", code: "" },
  })

  const mutation = useMutation({
    mutationFn: (data: PaymentMethodCreate) =>
      PaymentMethodsService.createPaymentMethod({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Tạo phương thức thanh toán thành công")
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          Thêm phương thức
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm phương thức thanh toán</DialogTitle>
          <DialogDescription>
            Thêm phương thức thanh toán mới. Mã phương thức phải là duy nhất.
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
            <DialogFooter className="pt-4">
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="w-full"
              >
                Thêm phương thức
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddPaymentMethod
