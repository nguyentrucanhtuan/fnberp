import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type UomPublic, UomsService, type UomUpdate } from "@/client"
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface EditUomProps {
  uom: UomPublic
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const formSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }).max(20),
  name: z.string().min(1, { message: "Name is required" }),
  relative_factor: z.coerce.number().default(1),
  relative_uom_id: z.string().optional(),
  is_archived: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

const EditUom = ({ uom, isOpen, setIsOpen }: EditUomProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: uomsData } = useQuery({
    queryKey: ["uoms", { limit: 100 }],
    queryFn: () => UomsService.readUoms({ limit: 100 }),
  })

  // Filter out the current UOM to prevent circular references
  const uoms = (uomsData?.data || []).filter((u) => u.id !== uom.id)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      code: uom.code || "",
      name: uom.name || "",
      relative_factor: uom.relative_factor ?? 1,
      relative_uom_id: uom.relative_uom_id || "none",
      is_archived: uom.is_archived || false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: UomUpdate) =>
      UomsService.updateUom({ id: uom.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Uom updated successfully")
      queryClient.invalidateQueries({ queryKey: ["uoms"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    const payload: UomUpdate = {
      ...data,
      relative_uom_id:
        data.relative_uom_id === "none" || !data.relative_uom_id
          ? null
          : data.relative_uom_id,
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa đơn vị đo lường</DialogTitle>
          <DialogDescription>
            Sửa đơn vị đo lường cho sản phẩm của bạn.
          </DialogDescription>
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
                  <FormLabel>Mã đơn vị</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="kg, cái, hộp..."
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
                  <FormLabel>Tên đơn vị</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kilogram, Hộp, Cái..."
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField<FormData>
                control={form.control as any}
                name="relative_factor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hệ số quy đổi</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={field.value as number}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<FormData>
                control={form.control as any}
                name="relative_uom_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị quy đổi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value as string}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a base unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Đơn vị gốc</SelectItem>
                        {uoms.map((u) => (
                          <SelectItem key={u.id} value={u.id || ""}>
                            {u.name} ({u.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
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
                      Ẩn đơn vị này khỏi danh sách chọn thông thường
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

export default EditUom
