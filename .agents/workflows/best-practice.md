---
description: Tuyển tập các Best Practices chuẩn cho TRCF ERP (FastAPI + React)
---

# Best Practices - CoffeeTree ERP

Tài liệu này tổng hợp các quy tắc và cách tiếp cận chuẩn để giữ mã nguồn ổn định, dễ bảo trì.

## 1. Backend: Quản lý Relationship & Schemas

### Trả về dữ liệu lồng nhau (Nested Objects)
- **Problem:** Trả về ID thô (`owner_id`, `parent_id`) khiến Frontend phải gọi thêm API để lấy tên/chi tiết.
- **Solution:** Luôn định nghĩa `Relationship` trong DB Model và bao gồm object lồng nhau trong `Public` schema.
- **Rule:** 
    - Đặt tên relationship rõ ràng (VD: `base_uom`, `owner`).
    - Trong `Public` schema, sử dụng `model_config = ConfigDict(from_attributes=True)`.

### Self-referencing (Tự tham chiếu)
- Khi một bảng trỏ vào chính nó (như UOM hoặc Category), sử dụng `sa_relationship` với `remote_side` để SQLAlchemy hiểu mối quan hệ cha-con.

---

## 2. Frontend: Trải nghiệm người dùng (UX) trên Table

### Hiển thị thông tin thân thiện
- Thay vì hiển thị ID (UUID), hãy luôn hiển thị `name` hoặc `code`.
- **Pattern:** `{name} ({code})` giúp người dùng nhận diện nhanh đối tượng.

### Trạng thái trống (Empty States)
- Nếu dữ liệu liên kết bị thiếu (VD: Không có đơn vị quy đổi), hãy hiển thị một nhãn mô tả như *"Đơn vị gốc"* hoặc *"Không có"* thay vì để trống ô.
- Sử dụng màu sắc tinh tế (`text-muted-foreground`) và kiểu chữ `italic` để phân biệt dữ liệu này với dữ liệu thực tế.

---

## 3. Quản lý State & Form
- Sử dụng `zod` để validate chặt chẽ ở cả 2 đầu.
- Với các trường phụ thuộc (như chọn Đơn vị cha), luôn dùng `Combobox` hoặc `Select` để map từ label sang ID, tránh bắt người dùng nhập tay.
