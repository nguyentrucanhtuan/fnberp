---
description: Tài liệu xử lý các lỗi thường gặp trong quá trình phát triển (FastAPI + Docker)
---

# Troubleshooting Guide - TRCF ERP

Tài liệu này lưu trữ các lỗi phổ biến và cách khắc phục nhanh trong quá trình phát triển hệ thống.

## 1. Lỗi 404 khi truy cập `/api/v1/users/me`

### Hiện tượng
- Trình duyệt báo lỗi `Fail to load resource: the server responded with a status of 404 (Not Found)` cho API `http://localhost:8000/api/v1/users/me`.
- Xảy ra khi bạn vừa reset Docker Compose, xóa database hoặc thay đổi cấu hình mã bí mật (Secret Key).

### Nguyên nhân
- **Stale Token (Token cũ):** Trình duyệt vẫn đang lưu một mã `access_token` cũ trong Local Storage từ phiên làm việc trước.
- Khi trang web tải, nó tự động gửi token này lên Backend để kiểm tra thông tin người dùng.
- Backend giải mã token thành công nhưng **không tìm thấy** ID người dùng tương ứng trong database mới hiện tại -> Trả về lỗi 404.

### Cách khắc phục
1. **Dùng chế độ ẩn danh:** Mở tab ẩn danh (Incognito) để kiểm tra, nếu hết lỗi thì chính xác là do token cũ.
2. **Xóa Local Storage:**
   - Nhấn `F12` (mở Developer Tools).
   - Chọn tab **Application** (hoặc **Storage** tùy trình duyệt).
   - Chọn **Local Storage** -> `http://localhost:5173`.
   - Tìm khóa `access_token` và xóa nó đi.
   - Tải lại trang (F5).

---

## 2. Lỗi ModuleNotFoundError: No module named 'pwdlib' (hoặc thư viện khác)

### Hiện tượng
- Chạy lệnh `fastapi dev app/main.py` ở máy local trực tiếp bị báo thiếu thư viện.

### Nguyên nhân
- Môi trường Python local chưa được cài đặt đầy đủ các gói phụ thuộc (dependencies) khai báo trong `pyproject.toml`.

### Cách khắc phục
- Di chuyển vào thư mục backend: `cd backend`.
- Sử dụng `uv` để đồng bộ và cài đặt thư viện: `uv sync`.
- Chạy qua `uv run` để đảm bảo dùng đúng môi trường ảo: `uv run fastapi dev app/main.py`.

---

## 3. Lỗi Build Frontend (TypeScript TS2322 / TS2345)

### Hiện tượng
- Chạy lệnh `npm run build` hoặc build Docker thất bại với lỗi `exit code 2`.
- Thông báo lỗi thường gặp: `Type 'Control<..., TFieldValues>' is not assignable to type 'Control<..., { ... }>'`.
- Lỗi tại các file component như `AddUom.tsx`, `EditUom.tsx`.

### Nguyên nhân
- **Type Inference Mismatch:** Do `react-hook-form` không suy luận chính xác kiểu dữ liệu (inference) khi lồng ghép các UI component phức tạp vào trong `FormField`.
- **Zod Schema Complexity:** Khi schema có các trường `boolean` (như `is_archived`) kết hợp với trường `number` (như `relative_factor`), TypeScript có thể gộp chúng thành union type, gây xung đột với component `<Input />` chỉ nhận `string`.

### Cách khắc phục
1. **Ép kiểu Control:** Sử dụng `as any` cho props `control` của `FormField`:
   ```tsx
   <FormField control={form.control as any} ... />
   ```
2. **Ép kiểu Resolver:** Sử dụng `as any` cho `zodResolver`:
   ```tsx
   const form = useForm<FormData>({ resolver: zodResolver(formSchema) as any, ... })
   ```
3. **Narrowing Value:** Ép kiểu tường minh cho `value` của input trong hàm `render`:
   ```tsx
   <Input {...field} value={field.value as string} />
   ```
4. **Submit Handler:** Sử dụng `as any` cho hàm submit nếu cần:
   ```tsx
   <form onSubmit={form.handleSubmit(onSubmit as any)}>
   ```
   
*(Lưu ý: Đây là cách fix nhanh để đảm bảo build thành công khi hệ thống type của thư viện bên thứ ba quá phức tạp).*

---

## 4. Lỗi hiển thị ID thay vì Tên (Relationship không hoạt động)

### Hiện tượng
- API trả về danh sách, nhưng trường liên kết (như `base_uom` hoặc `owner`) bị `null` hoặc không có trong kết cục JSON.
- Giao diện Table hiển thị ID (UUID) thay vì tên thân thiện.

### Nguyên nhân
1. **Thiếu Relationship:** DB Model chưa định nghĩa `Relationship` hoặc định nghĩa sai khóa ngoại.
2. **Thiếu Public Field:** File `models.py` của module đó, tại class `Public` (ví dụ `UomPublic`), chưa khai báo trường chứa object lồng nhau.
3. **Thiếu Config:** Class `Public` quên khai báo `model_config = ConfigDict(from_attributes=True)`, khiến Pydantic không thể tự động map từ các thuộc tính của SQLAlchemy/SQLModel `Relationship`.

### Cách khắc phục
1. Kiểm tra lại `models.py`, đảm bảo có `Relationship`.
2. Kiểm tra class `Public`, đảm bảo có trường tương ứng và **quan trọng nhất** là `ConfigDict(from_attributes=True)`.
3. Kiểm tra file `api/routes.py`, đảm bảo `response_model` đang sử dụng đúng class `Public` (hoặc `ListPublic`).

---

## 5. Lỗi Docker Build Frontend do TypeScript Compiler

### Hiện tượng
- Chạy `docker compose build frontend` (hoặc `docker compose up --build`) thất bại ở bước `RUN bun run build` với `exit code: 2`.
- Log Docker hiển thị lỗi từ `tsc` (TypeScript compiler), ví dụ:
  ```
  src/components/Products/DeleteProduct.tsx(7,3): error TS6133: 'AlertDialogAction' is declared but its value is never read.
  src/components/Products/EditProduct.tsx(3,10): error TS6133: 'Package' is declared but its value is never read.
  src/components/Products/EditProduct.tsx(100,7): error TS2322: Type 'string | null | undefined' is not assignable to type 'string'.
  ```

### Nguyên nhân
- Script `build` trong `package.json` chạy `tsc -p tsconfig.build.json && vite build`.
- `tsc` kiểm tra type nghiêm ngặt. Nếu có bất kỳ lỗi nào (dù nhỏ), nó trả về exit code khác 0 → toàn bộ build dừng → Docker build thất bại.
- **Hai nhóm lỗi phổ biến:**
  1. **TS6133 — Unused import/variable:** Import thư viện hoặc khai báo biến nhưng không dùng trong code.
  2. **TS2322 — Type mismatch:** Giá trị có kiểu `string | null | undefined` được gán vào trường chỉ nhận `string`.

### Cách khắc phục

#### TS6133 — Xóa import không dùng
```tsx
// ❌ Sai — Package không được dùng trong JSX
import { Package, Save } from "lucide-react"

// ✅ Đúng — Chỉ import những gì thực sự dùng
import { Save } from "lucide-react"
```

#### TS2322 — Xử lý nullable field bằng `?? ""`
```tsx
// ❌ Sai — uom_id có thể là null | undefined
uom_id: product.uom_id,

// ✅ Đúng — Cung cấp fallback khi null/undefined
uom_id: product.uom_id ?? "",
```

### Phòng ngừa
- Chạy `bun run build` thủ công ở local trước khi build Docker để phát hiện lỗi sớm.
- Cấu hình IDE (VS Code) để tự động cảnh báo unused imports theo thời gian thực.
- Tránh dùng `null` cho các trường bắt buộc trong form schema; dùng `""` hoặc `0` làm giá trị mặc định.

