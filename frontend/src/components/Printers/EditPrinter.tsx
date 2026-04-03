import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  type PrinterPublic,
  PrintersService,
  type PrinterUpdate,
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

interface EditPrinterProps {
  printer: PrinterPublic
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên thiết bị là bắt buộc" }).max(255),
  ip: z.string().min(1, { message: "Địa chỉ IP là bắt buộc" }).max(255),
  port: z.coerce.number().int().min(1).max(65535),
  printer_type: z.enum(["invoice", "label", "kitchen_order_ticket"]),
  is_active: z.boolean().default(true),
  is_archived: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

const EditPrinter = ({ printer, isOpen, setIsOpen }: EditPrinterProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: printer.name ?? "",
      ip: printer.ip ?? "",
      port: printer.port ?? 9100,
      printer_type: printer.printer_type ?? "invoice",
      is_active: printer.is_active ?? true,
      is_archived: printer.is_archived ?? false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PrinterUpdate) =>
      PrintersService.updatePrinter({ id: printer.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Cập nhật máy in thành công")
      queryClient.invalidateQueries({ queryKey: ["printers"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as any as PrinterUpdate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Sửa máy in</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin thiết bị máy in.
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
                    value={field.value as string}
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
                      Ẩn thiết bị này khỏi danh sách
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

export default EditPrinter
