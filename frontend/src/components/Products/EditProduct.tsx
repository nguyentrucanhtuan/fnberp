import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  ProductCategoriesService,
  type ProductPublic,
  type ProductUpdate,
  ProductsService,
  UomsService,
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
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên không được để trống" }),
  sku: z.string().min(1, { message: "Mã sản phẩm không được để trống" }),
  type: z.enum(["consu", "service", "combo"]),
  uom_id: z.string().min(1, { message: "Đơn vị chính không được để trống" }),
  uom_ids: z.array(z.string()).default([]),
  category_ids: z.array(z.string()).default([]),
  price: z.coerce.number().default(0),
  cost: z.coerce.number().default(0),
  vat_sale: z.coerce.number().default(0),
  vat_purchase: z.coerce.number().default(0),
  is_storable: z.boolean().default(false),
  is_sale: z.boolean().default(true),
  is_purchase: z.boolean().default(false),
  is_manufacture: z.boolean().default(false),
  description: z.string().nullable().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditProductProps {
  product: ProductPublic
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const EditProduct = ({ product, isOpen, setIsOpen }: EditProductProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Lấy dữ liệu Đơn vị tính
  const { data: uomsData } = useQuery({
    queryKey: ["uoms", { limit: 100 }],
    queryFn: () => UomsService.readUoms({ limit: 100 }),
  })
  const uoms = uomsData?.data || []

  // Lấy dữ liệu Danh mục
  const { data: categoriesData } = useQuery({
    queryKey: ["product-categories", { limit: 100 }],
    queryFn: () => ProductCategoriesService.readCategories({ limit: 100 }),
  })
  const categories = categoriesData?.data || []

  // Chuẩn bị options cho MultiSelect
  const uomOptions = uoms.map((u) => ({ label: `${u.name} (${u.code})`, value: u.id }))
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }))

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    values: {
      name: product.name,
      sku: product.sku,
      type: product.type as "consu" | "service" | "combo",
      uom_id: product.uom_id ?? "",
      uom_ids: product.uoms?.map((u) => u.id) || [],
      category_ids: product.categories?.map((c) => c.id) || [],
      price: product.price ?? 0,
      cost: product.cost ?? 0,
      vat_sale: product.vat_sale ?? 0,
      vat_purchase: product.vat_purchase ?? 0,
      is_storable: product.is_storable ?? false,
      is_sale: product.is_sale ?? true,
      is_purchase: product.is_purchase ?? false,
      is_manufacture: product.is_manufacture ?? false,
      description: product.description ?? "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ProductUpdate) =>
      ProductsService.updateProduct({ id: product.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Product updated successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as any as ProductUpdate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sửa thông tin sản phẩm</DialogTitle>
          <DialogDescription>
            Cập nhật chi tiết sản phẩm và đơn vị quản lý.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Thông tin chính</TabsTrigger>
                <TabsTrigger value="finance">Tài chính & Quản lý</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm</FormLabel>
                        <FormControl>
                          <Input placeholder="Cà phê sữa đá..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã SP (SKU)</FormLabel>
                        <FormControl>
                          <Input placeholder="CPS01..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại sản phẩm</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="consu">Hàng hoá</SelectItem>
                            <SelectItem value="service">Dịch vụ</SelectItem>
                            <SelectItem value="combo">Combo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="uom_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn vị tính chính</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn đơn vị chính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {uoms.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
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

                <FormField
                  control={form.control as any}
                  name="uom_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị tính phụ (Nhiều lựa chọn)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={uomOptions}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Chọn đơn vị phụ..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="category_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục (Nhiều lựa chọn)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={categoryOptions}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Chọn danh mục..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="finance" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá bán</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá vốn</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="vat_sale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT bán ra (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="vat_purchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT mua vào (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Theo dõi tồn kho</FormLabel>
                  </div>
                  <FormField
                    control={form.control as any}
                    name="is_storable"
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Có thể bán</FormLabel>
                    </div>
                    <FormField
                      control={form.control as any}
                      name="is_sale"
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
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Có thể mua</FormLabel>
                    </div>
                    <FormField
                      control={form.control as any}
                      name="is_purchase"
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
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Sản xuất</FormLabel>
                    </div>
                    <FormField
                      control={form.control as any}
                      name="is_manufacture"
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
                </div>
              </TabsContent>
            </Tabs>

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

export default EditProduct
