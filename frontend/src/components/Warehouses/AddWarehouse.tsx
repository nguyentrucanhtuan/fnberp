import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type WarehouseCreate, WarehousesService } from "@/client"
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
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  code: z.string().min(1, { message: "Mã kho là bắt buộc" }).max(20),
  name: z.string().min(1, { message: "Tên kho là bắt buộc" }),
  address: z.string().max(500).optional(),
})

type FormData = z.infer<typeof formSchema>

const AddWarehouse = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      code: "",
      name: "",
      address: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: WarehouseCreate) =>
      WarehousesService.createWarehouse({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Tạo kho thành công")
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    const payload: WarehouseCreate = {
      ...data,
      address: data.address || null,
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          Thêm kho
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm kho mới</DialogTitle>
          <DialogDescription>Thêm kho hàng mới vào hệ thống.</DialogDescription>
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
            <DialogFooter className="pt-4">
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="w-full"
              >
                Thêm kho
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddWarehouse
