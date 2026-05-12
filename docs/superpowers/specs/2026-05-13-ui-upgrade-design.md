# UI Upgrade Design: Employee Directory

## Purpose
Nâng cấp toàn diện UI/UX của ứng dụng quản lý nhân viên (React + Supabase) để mang lại cảm giác cao cấp (Premium), hiển thị mượt mà (Animations/Transitions), và trải nghiệm người dùng tối ưu theo đúng yêu cầu đề bài.

## Architecture & Layout
- **Main Layout:** Modern Table (Bảng hiện đại). Bảng dữ liệu được tối ưu hóa không gian, các hàng (rows) có khoảng cách hợp lý. Avatar nhân viên được bo tròn tỉ mỉ.
- **Visual Style:** Premium Light & Minimalist.
  - Sử dụng nền sáng (trắng/xám nhạt) sạch sẽ.
  - Box-shadow cực nhẹ và tinh tế để phân lớp UI.
  - Các đường viền mờ (subtle borders), bo góc (border-radius) đồng nhất.
  - Typography hiện đại với hệ thống phân cấp rõ ràng.

## Core Components & UX Features
1. **Skeleton Loaders:**
   - Xoá bỏ dòng text "Loading..." tĩnh.
   - Thay bằng hiệu ứng khung xương (Skeleton Shimmer) khi đợi tải dữ liệu từ Supabase, giúp người dùng cảm thấy tốc độ tải nhanh hơn.
2. **Toast Notifications:**
   - Tích hợp Toast UI góc trên cùng bên phải.
   - Hiển thị thông báo (Xoá thành công, Sửa thành công, Lỗi kết nối) trượt vào/ra mượt mà, tự ẩn sau 3 giây.
3. **Custom Confirm Modal:**
   - Tự xây dựng Modal xác nhận khi Xoá nhân viên (thay thế triệt để `window.confirm`).
   - Modal hiển thị ra giữa màn hình với hiệu ứng làm mờ nền (backdrop blur).
4. **Smooth Inline Editing:**
   - Thao tác "Sửa" ngay trên hàng (row) với input có viền highlight mượt mà.
   - Thay đổi các nút thao tác thành Save/Cancel trực quan. 
   - Đổi màu nền (highlight background) của hàng đó để người dùng tập trung.
5. **Micro-animations:**
   - Hiệu ứng xuất hiện so le (Staggered fade-in) khi tải xong danh sách.
   - Nút bấm (Buttons) có hiệu ứng chuyển màu và scale nhẹ (đàn hồi) khi tương tác.
   - Các hiệu ứng đều sử dụng transition CSS tối ưu hiệu năng.

## Data Flow & State Management
- Vẫn tuân thủ kiến trúc hiện tại của `App.tsx` (dùng `useState`, `useCallback`).
- Tách các UI phức tạp (Modal, Toast) thành logic độc lập hoặc dùng composition để tránh `App.tsx` quá lớn.
- **TBD:** Có thể tách component `EmployeeRow` nếu logic dòng quá phức tạp (spec review đã xác nhận: Nên tách `EmployeeRow` để làm gọn `App.tsx`).

## Error Handling
- Lỗi kết nối Supabase sẽ được bắn qua Toast Error.
- Empty State (không có dữ liệu) được thiết kế lại thành một component ở giữa màn hình (thay cho đoạn text đơn điệu), kèm icon tinh tế.
