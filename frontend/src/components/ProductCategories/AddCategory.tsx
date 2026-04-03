import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Tag } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { ProductCategoriesService, type ProductCategoryCreate } from "@/client"
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
  name: z.string().min(1, { message: "Tên không được để trống" }),
  color: z.string().max(7).optional().default("#000000"),
  description: z.string().optional().default(""),
})

type FormData = z.infer<typeof formSchema>

const AddCategory = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    defaultValues: {
      name: "",
      color: "#000000",
      description: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ProductCategoryCreate) =>
      ProductCategoriesService.createCategory({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Category created successfully")
      queryClient.invalidateQueries({ queryKey: ["product-categories"] })
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as any as ProductCategoryCreate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm danh mục mới</DialogTitle>
          <DialogDescription>
            Tạo danh mục để phân loại sản phẩm của bạn.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
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
              control={form.control as any}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Màu sắc đại diện</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="p-1 h-9 w-12" {...field} />
                      <Input
                        placeholder="#000000"
                        className="flex-1"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Các loại cà phê pha bằng máy..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Hủy
              </Button>
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="gap-2"
              >
                <Tag className="h-4 w-4" />
                Lưu danh mục
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddCategory
