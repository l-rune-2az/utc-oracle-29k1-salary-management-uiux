# HƯỚNG DẪN CHI TIẾT SỬ DỤNG PANDOC

## 1. CÀI ĐẶT PANDOC

### Windows

#### Cách 1: Tải installer (Khuyến nghị)
1. Truy cập: https://github.com/jgm/pandoc/releases/latest
2. Tải file `pandoc-X.X.X-windows-x86_64.msi`
3. Chạy installer và làm theo hướng dẫn
4. Kiểm tra cài đặt:
   ```powershell
   pandoc --version
   ```

#### Cách 2: Sử dụng Chocolatey
```powershell
choco install pandoc
```

#### Cách 3: Sử dụng Scoop
```powershell
scoop install pandoc
```

### Mac
```bash
# Sử dụng Homebrew
brew install pandoc

# Hoặc sử dụng MacPorts
sudo port install pandoc
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install pandoc
```

### Linux (CentOS/RHEL)
```bash
sudo yum install pandoc
```

## 2. KIỂM TRA CÀI ĐẶT

Mở Terminal/PowerShell/Command Prompt và chạy:
```bash
pandoc --version
```

Kết quả mong đợi:
```
pandoc X.X.X
Compiled with ...
```

## 3. CHUYỂN ĐỔI CƠ BẢN

### Chuyển đổi đơn giản
```bash
# Chuyển từ Markdown sang DOCX
pandoc input.md -o output.docx
```

### Chuyển đổi với đường dẫn đầy đủ
```bash
# Windows
pandoc "D:\0.Code\4.GTVT\salary\utc-oracle-29k1-salary-management-uiux\docs\System-Architecture-Documentation.md" -o "D:\0.Code\4.GTVT\salary\utc-oracle-29k1-salary-management-uiux\docs\System-Architecture-Documentation.docx"

# Mac/Linux
pandoc /path/to/input.md -o /path/to/output.docx
```

### Chuyển đổi từ thư mục hiện tại
```bash
# Di chuyển vào thư mục docs
cd docs

# Chuyển đổi
pandoc System-Architecture-Documentation.md -o System-Architecture-Documentation.docx
```

## 4. CÁC TÙY CHỌN NÂNG CAO

### 4.1. Sử dụng Template DOCX (Để giữ định dạng)

Tạo file template DOCX với định dạng mong muốn, sau đó:
```bash
pandoc input.md -o output.docx --reference-doc=template.docx
```

**Cách tạo template:**
1. Tạo file DOCX mới trong Word
2. Định dạng styles (Heading 1, Heading 2, Body Text, etc.)
3. Lưu thành `template.docx`
4. Sử dụng với `--reference-doc`

### 4.2. Thêm Metadata
```bash
pandoc input.md -o output.docx \
  --metadata title="Tài liệu Kiến trúc Hệ thống" \
  --metadata author="Development Team" \
  --metadata date="2025-01-XX"
```

### 4.3. Chỉ định Table of Contents
```bash
pandoc input.md -o output.docx --toc --toc-depth=3
```

### 4.4. Kết hợp nhiều tùy chọn
```bash
pandoc System-Architecture-Documentation.md \
  -o System-Architecture-Documentation.docx \
  --toc \
  --toc-depth=3 \
  --metadata title="Tài liệu Kiến trúc Hệ thống" \
  --metadata author="Development Team" \
  --standalone
```

## 5. XỬ LÝ MERMAID DIAGRAMS

Pandoc không tự động render Mermaid diagrams. Có 2 cách:

### Cách 1: Render Mermaid trước, chèn ảnh vào Markdown

1. **Render Mermaid thành ảnh:**
   - Truy cập: https://mermaid.live/
   - Copy code Mermaid diagram
   - Export thành PNG hoặc SVG
   - Lưu vào thư mục `docs/images/`

2. **Cập nhật Markdown:**
   Thay thế code block Mermaid bằng:
   ```markdown
   ![Diagram Description](images/diagram-name.png)
   ```

3. **Chuyển đổi:**
   ```bash
   pandoc System-Architecture-Documentation.md -o output.docx
   ```

### Cách 2: Sử dụng Pandoc filter cho Mermaid

Cài đặt filter:
```bash
# Cài đặt Node.js trước (nếu chưa có)
# Sau đó cài mermaid-filter
npm install -g mermaid-filter
```

Chuyển đổi:
```bash
pandoc input.md -o output.docx --filter mermaid-filter
```

**Lưu ý:** Cách này có thể không hoạt động tốt với DOCX, nên khuyến nghị dùng Cách 1.

## 6. SCRIPT TỰ ĐỘNG HÓA

### Script PowerShell (Windows)

Tạo file `convert-to-docx.ps1`:

```powershell
# Script chuyển đổi Markdown sang DOCX
param(
    [string]$InputFile = "System-Architecture-Documentation.md",
    [string]$OutputFile = "System-Architecture-Documentation.docx"
)

# Kiểm tra Pandoc
try {
    $pandocVersion = pandoc --version 2>&1
    Write-Host "Pandoc found: $($pandocVersion -split "`n" | Select-Object -First 1)" -ForegroundColor Green
} catch {
    Write-Host "Error: Pandoc not found. Please install Pandoc first." -ForegroundColor Red
    exit 1
}

# Kiểm tra file input
if (-not (Test-Path $InputFile)) {
    Write-Host "Error: Input file '$InputFile' not found." -ForegroundColor Red
    exit 1
}

# Chuyển đổi
Write-Host "Converting $InputFile to $OutputFile..." -ForegroundColor Yellow
pandoc $InputFile -o $OutputFile --toc --toc-depth=3 --standalone

if ($LASTEXITCODE -eq 0) {
    Write-Host "Conversion completed successfully!" -ForegroundColor Green
    Write-Host "Output file: $OutputFile" -ForegroundColor Green
} else {
    Write-Host "Conversion failed!" -ForegroundColor Red
    exit 1
}
```

**Sử dụng:**
```powershell
cd docs
.\convert-to-docx.ps1
```

### Script Bash (Mac/Linux)

Tạo file `convert-to-docx.sh`:

```bash
#!/bin/bash

# Script chuyển đổi Markdown sang DOCX
INPUT_FILE="${1:-System-Architecture-Documentation.md}"
OUTPUT_FILE="${2:-System-Architecture-Documentation.docx}"

# Kiểm tra Pandoc
if ! command -v pandoc &> /dev/null; then
    echo "Error: Pandoc not found. Please install Pandoc first."
    exit 1
fi

# Kiểm tra file input
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found."
    exit 1
fi

# Chuyển đổi
echo "Converting $INPUT_FILE to $OUTPUT_FILE..."
pandoc "$INPUT_FILE" -o "$OUTPUT_FILE" --toc --toc-depth=3 --standalone

if [ $? -eq 0 ]; then
    echo "Conversion completed successfully!"
    echo "Output file: $OUTPUT_FILE"
else
    echo "Conversion failed!"
    exit 1
fi
```

**Sử dụng:**
```bash
chmod +x convert-to-docx.sh
cd docs
./convert-to-docx.sh
```

### Script Node.js

Tạo file `convert-to-docx.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2] || 'System-Architecture-Documentation.md';
const outputFile = process.argv[3] || 'System-Architecture-Documentation.docx';

// Kiểm tra Pandoc
try {
    execSync('pandoc --version', { stdio: 'ignore' });
    console.log('✓ Pandoc found');
} catch (error) {
    console.error('✗ Error: Pandoc not found. Please install Pandoc first.');
    process.exit(1);
}

// Kiểm tra file input
if (!fs.existsSync(inputFile)) {
    console.error(`✗ Error: Input file '${inputFile}' not found.`);
    process.exit(1);
}

// Chuyển đổi
console.log(`Converting ${inputFile} to ${outputFile}...`);
try {
    execSync(
        `pandoc "${inputFile}" -o "${outputFile}" --toc --toc-depth=3 --standalone`,
        { stdio: 'inherit' }
    );
    console.log('✓ Conversion completed successfully!');
    console.log(`✓ Output file: ${outputFile}`);
} catch (error) {
    console.error('✗ Conversion failed!');
    process.exit(1);
}
```

**Sử dụng:**
```bash
cd docs
node convert-to-docx.js
```

## 7. VÍ DỤ THỰC TẾ

### Ví dụ 1: Chuyển đổi đơn giản
```bash
cd docs
pandoc System-Architecture-Documentation.md -o System-Architecture-Documentation.docx
```

### Ví dụ 2: Với Table of Contents và Metadata
```bash
cd docs
pandoc System-Architecture-Documentation.md \
  -o System-Architecture-Documentation.docx \
  --toc \
  --toc-depth=3 \
  --metadata title="Tài liệu Kiến trúc Hệ thống" \
  --metadata author="Development Team" \
  --metadata date="$(Get-Date -Format 'yyyy-MM-dd')" \
  --standalone
```

### Ví dụ 3: Với Template
```bash
cd docs
pandoc System-Architecture-Documentation.md \
  -o System-Architecture-Documentation.docx \
  --reference-doc=template.docx \
  --toc \
  --toc-depth=3
```

## 8. XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "pandoc: command not found"
**Nguyên nhân:** Pandoc chưa được cài đặt hoặc chưa có trong PATH

**Giải pháp:**
- Windows: Thêm Pandoc vào PATH hoặc khởi động lại terminal
- Mac/Linux: Kiểm tra lại cài đặt: `which pandoc`

### Lỗi: "Could not find data file"
**Nguyên nhân:** Thiếu template hoặc reference file

**Giải pháp:** Bỏ `--reference-doc` hoặc tạo file template

### Lỗi: "Unknown extension"
**Nguyên nhân:** Pandoc không hỗ trợ một số extension Markdown

**Giải pháp:** Thêm `--from markdown+raw_html` hoặc bỏ extension không hỗ trợ

### Diagrams không hiển thị
**Nguyên nhân:** Pandoc không render Mermaid diagrams

**Giải pháp:** Render Mermaid thành ảnh trước (xem mục 5)

## 9. TIPS VÀ BEST PRACTICES

1. **Luôn kiểm tra Pandoc version:**
   ```bash
   pandoc --version
   ```

2. **Sử dụng `--standalone` để tạo file độc lập:**
   ```bash
   pandoc input.md -o output.docx --standalone
   ```

3. **Thêm Table of Contents cho tài liệu dài:**
   ```bash
   pandoc input.md -o output.docx --toc --toc-depth=3
   ```

4. **Sử dụng template để giữ định dạng:**
   - Tạo template DOCX với styles chuẩn
   - Sử dụng `--reference-doc=template.docx`

5. **Xử lý Mermaid diagrams:**
   - Render thành ảnh trước
   - Chèn ảnh vào Markdown
   - Sau đó chuyển đổi

## 10. TÀI LIỆU THAM KHẢO

- Pandoc User's Guide: https://pandoc.org/MANUAL.html
- Pandoc Installation: https://pandoc.org/installing.html
- Mermaid Live Editor: https://mermaid.live/

---

**Lưu ý:** Đối với file `System-Architecture-Documentation.md`, do có nhiều Mermaid diagrams, bạn nên:
1. Render các diagrams thành ảnh trước
2. Cập nhật file Markdown với links đến ảnh
3. Sau đó mới chuyển đổi bằng Pandoc

