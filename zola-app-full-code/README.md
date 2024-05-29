# Full Code - Zola App

## Thành viên nhóm
- Nguyễn Khánh An - Backend
- Lê Hữu Hiệp - Frontend web
- Lê Thanh Tùng - Frontend web
- Nguyễn Tuấn Hiệp - Mobile
- Phan Nguyễn Hoài Hiệp - Mobile

## Hướng dẫn sử dụng
- Deploy Back-end lên AWS EC2
- Lưu các file chứng thực ssl vào thư mục /home/ubuntu/certificate
- CI-CD cho Zola App bằng GitHub Actions
- Chỉnh sửa và thêm file cấu hình nginx

## Cài đặt trên EC2
- Cài đặt nodejs 
    - `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash`
    -  `sudo apt-get install -y nodejs`
- Cài đặt nginx 
    - `sudo apt install nginx`
    - `sudo ufw allow 'Nginx HTTP'`
    - `sudo systemctl start nginx`
    - `sudo systemctl enable nginx`
    
- Cài đặt pm2 
    - `sudo npm install pm2@latest -g`

- Cài đặt redis
    - `sudo apt-get update`
    - `sudo apt-get install redis`