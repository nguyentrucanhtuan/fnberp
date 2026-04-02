---
description: Hướng dẫn chi tiết quy trình tạo module frontend CRUD hoàn chỉnh (Hand-on Learning)
---

# Workflow: Tạo Module Frontend CRUD Mới

Tài liệu này hướng dẫn cách tự tay xây dựng một module quản lý (CRUD) hoàn chỉnh, từ giao diện bảng (DataTable) đến các form Thêm/Sửa/Xóa, theo kiến trúc chuẩn của CoffeeTree ERP.

---

## Cấu trúc thư mục

Mỗi module mới (ví dụ: `Product`) sẽ bao gồm 1 file route và 1 thư mục chứa các component UI:

```text
frontend/src/
├── routes/
│   └── _layout/
│       └── product.tsx          ← [1] Route chính & Page Layout
├── components/
│   └── Product/                 ← Thư mục chứa UI components
│       ├── columns.tsx          ← [2] Cấu trúc cột của DataTable
│       ├── ProductActionsMenu.tsx ← [3] Menu chức năng (Sửa/Xóa) cho mỗi dòng
│       ├── AddProduct.tsx       ← [4] Form Thêm mới (Dialog)
│       ├── EditProduct.tsx      ← [5] Form Cập nhật (Dialog)
│       └── DeleteProduct.tsx    ← [6] Dialog xác nhận xóa
```

---

## Bảng tra cứu chức năng File

| STT | File | Chức năng chính | Tại sao phải tạo? |
|:---:| :--- | :--- | :--- |
| 1 | `product.tsx` | Lắp ráp các component lại thành một trang hoàn chỉnh. | Để router nhận diện và hiển thị trang tại `/product`. |
| 2 | `columns.tsx` | Định nghĩa tiêu đề và cách hiển thị dữ liệu từng cột. | Để DataTable biết cần lấy dữ liệu nào từ API để hiện lên. |
| 3 | `ActionsMenu.tsx` | Chứa nút Sửa và Xóa cho từng bản ghi. | Để người dùng có chỗ ấn vào thực hiện chức năng. |
| 4 | `AddProduct.tsx` | Form nhập liệu để tạo mới bản ghi. | Chứa logic validation (Zod) và gọi API tạo mới. |
| 5 | `EditProduct.tsx` | Form nhập liệu để sửa thông tin có sẵn. | Tương tự Add nhưng điền sẵn dữ liệu và gọi API cập nhật. |
| 6 | `DeleteProduct.tsx` | Hộp thoại xác nhận trước khi xóa. | Đảm bảo người dùng không xóa nhầm dữ liệu quan trọng. |

---

## Bước 1: Đồng bộ API Client (Bắt buộc)

Trước khi code, hãy đảm bảo SDK đã có đủ các type mới từ Backend.

```bash
bash ./scripts/generate-client.sh
```

**Giải thích:**
- **Script làm gì?**: Nó trích xuất sơ đồ API từ Backend (FastAPI) và "dịch" sang code TypeScript trong `frontend/src/client/`.
- **Lợi ích**: Bạn sẽ có sẵn các hàm gọi API (ví dụ: `ProductsService.createProduct`) và các kiểu dữ liệu (Types) mà không cần tự viết tay.

---

## Bước 2: Định nghĩa Cột dữ liệu (`columns.tsx`)

**Mục tiêu**: Quyết định thông tin nào được hiện lên bảng.

```tsx
import type { ColumnDef } from "@tanstack/react-table"
import type { ProductPublic } from "@/client"
import { ProductActionsMenu } from "./ProductActionsMenu"

export const columns: ColumnDef<ProductPublic>[] = [
  { accessorKey: "code", header: "Mã SP" },
  { accessorKey: "name", header: "Tên sản phẩm" },
  {
    id: "actions",
    cell: ({ row }) => <ProductActionsMenu product={row.original} />,
  },
]
```

**Giải thích**: 
- `accessorKey`: Phải khớp chính xác với tên trường dữ liệu trả về từ API.
- `cell`: Dùng để render giao diện tùy chỉnh (như nút chức năng).

---

## Bước 3: Menu chức năng (`ProductActionsMenu.tsx`)

**Mục tiêu**: Tạo nút bấm cho Sửa/Xóa.

**Giải thích**: File này chủ yếu quản lý 2 trạng thái `isEditOpen` và `isDeleteOpen` để mở các Dialog tương ứng.

---

## Bước 4: Xây dựng Form Thêm/Sửa (`AddProduct.tsx`, `EditProduct.tsx`)

Sử dụng `React Hook Form` + `Zod` (để validate) + `TanStack Query` (để gọi API).

**Quy trình chuẩn trong Form:**
1.  **Zod Schema**: Định nghĩa ràng buộc dữ liệu (ví dụ: tên không được để trống).
2.  **useForm**: Liên kết schema với form.
3.  **useMutation**: Gọi API và xử lý kết quả.
4.  **invalidateQueries**: Cực kỳ quan trọng! Sau khi lưu thành công, phải báo cho TanStack Query biết để nó tải lại bảng dữ liệu mới nhất.

> [!TIP]
> **Kinh nghiệm thực chiến**:
> - Dùng `z.coerce.number()` cho các trường số để tránh lỗi string.
> - Dùng `<Select />` cho các trường liên kết ID (như đơn vị tính gốc) để người dùng dễ chọn.

---

## Bước 5: Thiết lập Route (`_layout/product.tsx`)

**Mục tiêu**: Lắp ghép mọi thứ lại.

```tsx
function ProductPage() {
  const { data: products } = useSuspenseQuery({
    queryFn: () => ProductsService.readProducts({ limit: 100 }),
    queryKey: ["products"],
  })

  return (
    <div>
      <AddProduct />
      <DataTable columns={columns} data={products.data} />
    </div>
  )
}
```

---

## Bước 6: Đăng ký Sidebar

Thêm đường dẫn vào menu tại `frontend/src/components/Common/SidebarItems.tsx`.

---

## Các lỗi thường gặp (Common Pitfalls)

### 1. Build fail do TypeScript (TS2322)
**Lỗi**: Form báo lỗi đỏ ở `control`.
**Cách sửa**: Ép kiểu `as any` tại props `control` của `FormField`.

### 2. Dữ liệu không hiện lên bảng
**Cách sửa**: Kiểm tra lại `accessorKey` trong file `columns.tsx` xem có khớp với JSON API không.

### 3. Lưu xong bảng không tự cập nhật
**Cách sửa**: Kiểm tra `queryKey` trong `invalidateQueries` (ở file Add/Edit) phải giống hệt `queryKey` trong file Route.
