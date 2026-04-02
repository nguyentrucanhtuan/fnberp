import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  ProductCategoriesService,
  type ProductCategoryPublic,
  type ProductCategoryUpdate,
} from "@/client"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên không được để trống" }),
  color: z.string().max(7).optional().default("#000000"),
  description: z.string().optional().default(""),
  is_archived: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

interface EditCategoryProps {
  category: ProductCategoryPublic
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const EditCategory = ({ category, isOpen, setIsOpen }: EditCategoryProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    values: {
      name: category.name,
      color: category.color || "#000000",
      description: category.description || "",
      is_archived: !!category.is_archived,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ProductCategoryUpdate) =>
      ProductCategoriesService.updateCategory({
        id: category.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Category updated successfully")
      queryClient.invalidateQueries({ queryKey: ["product-categories"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as ProductCategoryUpdate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa thông tin danh mục</DialogTitle>
          <DialogDescription>
            Cập nhật chi tiết và trạng thái cho danh mục này.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Cà phê máy, Bánh ngọt..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Màu sắc đại diện</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                       <Input type="color" className="p-1 h-9 w-12" {...field} />
                       <Input placeholder="#000000" className="flex-1" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder="Các loại cà phê pha bằng máy..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Lưu trữ</FormLabel>
                <div className="text-[0.8rem] text-muted-foreground">
                  Ẩn danh mục này khỏi danh sách hoạt động.
                </div>
              </div>
              <FormField
                control={form.control}
                name="is_archived"
                render={({ field }) => (
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                )}
              />
            </div>
            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditCategory
