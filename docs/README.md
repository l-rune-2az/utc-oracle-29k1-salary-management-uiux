# TÀI LIỆU KIẾN TRÚC HỆ THỐNG

## File tài liệu

- **System-Architecture-Documentation.md** - Tài liệu đầy đủ về kiến trúc hệ thống

## Chuyển đổi sang DOCX

### Cách nhanh nhất (Windows PowerShell):

```powershell
cd docs
.\convert-to-docx.ps1
```

### Cách thủ công:

```bash
# Cài đặt Pandoc trước (nếu chưa có)
# Windows: https://pandoc.org/installing.html
# Mac: brew install pandoc
# Linux: sudo apt-get install pandoc

# Chuyển đổi
cd docs
pandoc System-Architecture-Documentation.md -o System-Architecture-Documentation.docx --toc --toc-depth=3 --standalone
```

## Hướng dẫn chi tiết

Xem file **PANDOC-GUIDE.md** để biết:
- Cách cài đặt Pandoc
- Các tùy chọn nâng cao
- Xử lý Mermaid diagrams
- Script tự động hóa
- Xử lý lỗi

## Lưu ý về Mermaid Diagrams

Pandoc không tự động render Mermaid diagrams. Bạn cần:

1. Render diagrams thành ảnh tại: https://mermaid.live/
2. Lưu ảnh vào thư mục `images/`
3. Cập nhật file Markdown với links đến ảnh
4. Sau đó chuyển đổi bằng Pandoc

## Cấu trúc thư mục

```
docs/
├── README.md (file này)
├── System-Architecture-Documentation.md (tài liệu chính)
├── PANDOC-GUIDE.md (hướng dẫn chi tiết Pandoc)
├── convert-to-docx.ps1 (script PowerShell)
└── images/ (thư mục chứa ảnh diagrams - tự tạo)
```

