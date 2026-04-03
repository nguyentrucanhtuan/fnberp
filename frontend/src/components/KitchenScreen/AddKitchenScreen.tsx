import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
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
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { KitchenScreensService, PosService, ProductCategoriesService } from "@/client"

const formSchema = z.object({
  name: z.string().min(1, "Tên màn hình là bắt buộc"),
  pos_id: z.string().min(1, "POS là bắt buộc"),
  is_active: z.boolean(),
  category_ids: z.array(z.string()),
})

type FormValues = z.infer<typeof formSchema>

export default function AddKitchenScreen() {
  const [isOpen, setIsOpen] = useState(false)
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
    defaultValues: {
      name: "",
      pos_id: "",
      is_active: true,
      category_ids: [],
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      KitchenScreensService.createScreen({ requestBody: data }),
    onSuccess: () => {
      toast.success("Thêm màn hình thành công")
      queryClient.invalidateQueries({ queryKey: ["kitchen-screens"] })
      setIsOpen(false)
      form.reset()
    },
    onError: () => {
      toast.error("Không thể thêm màn hình")
    },
  })

  const onSubmit = (data: FormValues) => {
    mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm màn hình
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm màn hình nhà bếp mới</DialogTitle>
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
                    <Input placeholder="DV: Khu bếp chính" {...field} />
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Thêm mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
