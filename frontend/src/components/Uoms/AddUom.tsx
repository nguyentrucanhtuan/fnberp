import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type UomCreate, UomsService } from "@/client"
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }).max(20),
  name: z.string().min(1, { message: "Name is required" }),
  relative_factor: z.coerce.number().default(1),
  relative_uom_id: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const AddUom = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: uomsData } = useQuery({
    queryKey: ["uoms", { limit: 100 }],
    queryFn: () => UomsService.readUoms({ limit: 100 }),
  })

  const uoms = uomsData?.data || []

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      code: "",
      name: "",
      relative_factor: 1.0,
      relative_uom_id: "none",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: UomCreate) =>
      UomsService.createUom({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Uom created successfully")
      queryClient.invalidateQueries({ queryKey: ["uoms"] })
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    const payload: UomCreate = {
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
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          Thêm đơn vị
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm đơn vị đo lường</DialogTitle>
          <DialogDescription>
            Thêm đơn vị đo lường cho sản phẩm của bạn.
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
                      placeholder="kg, Cái, Hộp..."
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
                      placeholder="Kilogram, Unit, Box..."
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
            <DialogFooter className="pt-4">
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="w-full"
              >
                Thêm đơn vị
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddUom
