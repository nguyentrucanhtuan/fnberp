import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type PrinterCreate, PrintersService } from "@/client"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên thiết bị là bắt buộc" }).max(255),
  ip: z.string().min(1, { message: "Địa chỉ IP là bắt buộc" }).max(255),
  port: z.coerce.number().int().min(1).max(65535).default(9100),
  printer_type: z
    .enum(["invoice", "label", "kitchen_order_ticket"])
    .default("invoice"),
  is_active: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

const AddPrinter = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      ip: "",
      port: 9100,
      printer_type: "invoice",
      is_active: true,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PrinterCreate) =>
      PrintersService.createPrinter({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Thêm máy in thành công")
      queryClient.invalidateQueries({ queryKey: ["printers"] })
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as any as PrinterCreate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          Thêm máy in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Thêm máy in mới</DialogTitle>
          <DialogDescription>
            Cấu hình thiết bị máy in kết nối với hệ thống.
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
                  <FormLabel>Tên thiết bị</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Máy in hoá đơn quầy 1..."
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
              name="printer_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại máy in</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại máy in" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="invoice">Hoá đơn</SelectItem>
                      <SelectItem value="label">Nhãn dán</SelectItem>
                      <SelectItem value="kitchen_order_ticket">
                        Phiếu yêu cầu món
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField<FormData>
                control={form.control as any}
                name="ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ IP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="192.168.1.100"
                        className="font-mono"
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
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cổng (Port)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="9100"
                        className="font-mono"
                        {...field}
                        value={field.value as number}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Trạng thái hoạt động</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Bật nếu máy in đang kết nối và sẵn sàng sử dụng
                </p>
              </div>
              <FormField<FormData>
                control={form.control as any}
                name="is_active"
                render={({ field }) => (
                  <FormControl>
                    <Switch
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="w-full"
              >
                Thêm máy in
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddPrinter
