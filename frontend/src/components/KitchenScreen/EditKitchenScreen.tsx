import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { KitchenScreenPublic } from "@/client"
import { KitchenScreensService, PosService, ProductCategoriesService } from "@/client"

const formSchema = z.object({
  name: z.string().min(1, "Tên màn hình là bắt buộc"),
  pos_id: z.string().min(1, "POS là bắt buộc"),
  is_active: z.boolean(),
  category_ids: z.array(z.string()),
})

type FormValues = z.infer<typeof formSchema>

interface EditProps {
  isOpen: boolean
  onClose: () => void
  kitchenScreen: KitchenScreenPublic
}

export default function EditKitchenScreen({ isOpen, onClose, kitchenScreen }: EditProps) {
  const queryClient = useQueryClient()

  // Load POS
  const { data: poss } = useQuery({
    queryKey: ["poss"],
    queryFn: () => PosService.readPoss({ limit: 100 }),
  })

  // Load Categories
  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => ProductCategoriesService.readCategories({ limit: 100 }),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: kitchenScreen.name,
      pos_id: kitchenScreen.pos_id,
      is_active: kitchenScreen.is_active ?? true,
      category_ids: kitchenScreen.categories?.map((cat) => cat.id) || [],
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      KitchenScreensService.updateScreen({ id: kitchenScreen.id, requestBody: data }),
    onSuccess: () => {
      toast.success("Cập nhật thành công")
      queryClient.invalidateQueries({ queryKey: ["kitchen-screens"] })
      onClose()
    },
    onError: () => {
      toast.error("Không thể cập nhật màn hình")
    },
  })

  const onSubmit = (data: FormValues) => {
    mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa màn hình nhà bếp</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên màn hình</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="pos_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>POS áp dụng</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn quầy POS" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {poss?.data.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="category_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục hiển thị</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={
                        categories?.data.map((cat) => ({
                          label: cat.name,
                          value: cat.id,
                        })) || []
                      }
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn danh mục"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Hoạt động</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Cập nhật"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
