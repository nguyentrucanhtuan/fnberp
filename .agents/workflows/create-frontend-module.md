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

> [!IMPORTANT]
> **Luôn chạy lại generate-client sau khi thêm/sửa Backend model.** Nếu không, frontend sẽ thiếu type và bị lỗi khi build.

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
> - Dùng `<MultiSelect />` cho quan hệ N-N (nhiều lựa chọn).
> - Dùng `<Tabs />` để chia form phức tạp thành nhiều tab (VD: "Thông tin chính" + "Tài chính & Quản lý").

### ★ Quy tắc đồng bộ Backend ↔ Frontend

**Tất cả field trong Backend model đều phải có UI tương ứng trong cả AddProduct và EditProduct.**

| Backend Field | Frontend UI Component | Zod Type |
|---|---|---|
| `str` | `<Input />` | `z.string()` |
| `float` | `<Input type="number" />` | `z.coerce.number()` |
| `bool` | `<Switch />` | `z.boolean()` |
| `Literal["a", "b"]` | `<Select />`  | `z.enum(["a", "b"])` |
| `FK uuid` | `<Select />` (load options từ API) | `z.string()` |
| `N-N list[uuid]` | `<MultiSelect />` (load options từ API) | `z.array(z.string())` |

### ★ Xử lý nullable field trong EditProduct (Tránh TS2322)

Khi populate form với dữ liệu từ API, các field có thể là `null | undefined`. Phải dùng `??` để cung cấp fallback:

```tsx
// ✅ Đúng — luôn cung cấp fallback
values: {
  name: product.name,
  uom_id: product.uom_id ?? "",     // string | null → string
  price: product.price ?? 0,         // number | null → number
  is_sale: product.is_sale ?? true,   // bool | null → bool
  uom_ids: product.uoms?.map((u) => u.id) || [],  // N-N
}
```

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

## Bước 6: Cập nhật `routeTree.gen.ts` (Bắt buộc)

**File:** `frontend/src/routeTree.gen.ts`

File này do TanStack Router **tự động generate** khi dev server đang chạy. Tuy nhiên vì môi trường dùng Docker serving static build (nginx), cần **cập nhật thủ công** theo đúng pattern:

```ts
// 1. Thêm import ở đầu file (sau các import hiện có)
import { Route as LayoutProductsRouteImport } from './routes/_layout/products'

// 2. Thêm định nghĩa Route (theo pattern as any)
const LayoutProductsRoute = LayoutProductsRouteImport.update({
  id: '/products',
  path: '/products',
  getParentRoute: () => LayoutRoute,
} as any)

// 3. Thêm vào các interface types (FileRoutesByFullPath, FileRoutesByTo, FileRoutesById, FileRouteTypes)
// - FileRoutesByFullPath: '/products': typeof LayoutProductsRoute
// - FileRoutesByTo: '/products': typeof LayoutProductsRoute
// - FileRoutesById: '/_layout/products': typeof LayoutProductsRoute
// - FileRouteTypes.fullPaths: | '/products'
// - FileRouteTypes.to: | '/products'
// - FileRouteTypes.id: | '/_layout/products'

// 4. Thêm vào declare module FileRoutesByPath
'/_layout/products': {
  id: '/_layout/products'
  path: '/products'
  fullPath: '/products'
  preLoaderRoute: typeof LayoutProductsRouteImport
  parentRoute: typeof LayoutRoute
}

// 5. Thêm vào LayoutRouteChildren interface và object
LayoutProductsRoute: typeof LayoutProductsRoute
// ...
LayoutProductsRoute: LayoutProductsRoute,
```

> [!IMPORTANT]
> Sau khi cập nhật `routeTree.gen.ts`, chạy `npm run build` (hoặc `cd frontend && bun run build`) để xác nhận không có lỗi TypeScript trước khi build Docker.

---

## Bước 7: Đăng ký Sidebar

Thêm đường dẫn vào menu tại `frontend/src/components/Sidebar/AppSidebar.tsx`.

---

## Bước 8: Build và Deploy Docker

Do frontend dùng **production build** (nginx serve static files), mỗi khi thay đổi code cần rebuild Docker image:

```bash
docker compose build frontend && docker compose up -d frontend
```

> [!NOTE]
> `docker compose watch` **không** tự rebuild frontend image. Lệnh trên phải chạy thủ công sau mỗi lần thay đổi code.

---

## Các lỗi thường gặp (Common Pitfalls)

### 1. Build fail do TypeScript (TS2322 — Type mismatch)
**Lỗi**: `Type 'string | null | undefined' is not assignable to type 'string'`
**Nguyên nhân**: Populate form với dữ liệu API có thể null.
**Cách sửa**: Dùng `?? ""` (string), `?? 0` (number), `?? false` (boolean).

### 2. Build fail do TypeScript (TS6133 — Unused import)
**Lỗi**: `'Package' is declared but its value is never read`
**Nguyên nhân**: Import thư viện nhưng không dùng trong JSX.
**Cách sửa**: Xóa import không dùng. **Luôn kiểm tra lại import sau khi refactor.**

### 3. Build fail do TypeScript (TS2322 — FormField control)
**Lỗi**: Form báo lỗi đỏ ở `control`.
**Cách sửa**: Ép kiểu `as any` tại props `control` của `FormField`.

### 4. Dữ liệu không hiện lên bảng
**Cách sửa**: Kiểm tra lại `accessorKey` trong file `columns.tsx` xem có khớp với JSON API không.

### 5. Lưu xong bảng không tự cập nhật
**Cách sửa**: Kiểm tra `queryKey` trong `invalidateQueries` (ở file Add/Edit) phải giống hệt `queryKey` trong file Route.

### 6. Thiếu field trong form so với Backend
**Cách sửa**: So sánh từng trường trong Backend `Base` schema với Zod schema + UI fields. **Mọi field phải có đủ cả 3: Zod, defaultValues, và UI component.**

### 7. Menu mới không xuất hiện sau khi sửa code
**Lỗi**: Sidebar hoặc trang mới không hiện dù đã save file.
**Nguyên nhân**: Docker frontend đang serve **bản build cũ** từ nginx — không phải Vite dev server.
**Cách sửa**:
```bash
docker compose build frontend && docker compose up -d frontend
```

### 8. Route không tìm thấy (404) khi điều hướng
**Nguyên nhân**: Chưa cập nhật `routeTree.gen.ts` với route mới.
**Cách sửa**: Thêm route mới vào file `routeTree.gen.ts` theo đúng pattern (xem Bước 6 ở trên).

---

## ★ Checklist trước khi build Docker

- [ ] Đã chạy `bash ./scripts/generate-client.sh` sau khi sửa Backend
- [ ] Tất cả field Backend có UI tương ứng trong Add + Edit form
- [ ] Zod schema khớp với Backend schema (cùng tên field, cùng type)
- [ ] Không có unused imports (xóa những gì không dùng)
- [ ] Nullable fields có fallback `??` trong Edit form values
- [ ] `queryKey` nhất quán giữa Route và Add/Edit/Delete
- [ ] `routeTree.gen.ts` đã được cập nhật với route mới
- [ ] Sidebar đã đăng ký đường dẫn mới
- [ ] Chạy `cd frontend && npm run build` để xác nhận không có lỗi TypeScript
- [ ] Chạy `docker compose build frontend && docker compose up -d frontend` để deploy
