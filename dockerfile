# Base image
FROM node:16

# Working directory inside the container
WORKDIR /app

# Dependencies kopyalama
COPY package*.json ./

# Dependencies yükleme
RUN npm install

# Tüm projeyi kopyalama
COPY . .

# Build işlemi
RUN npm run build

# Kullanılacak portu tanımlama
EXPOSE 3000

# React uygulamasını başlatma
CMD ["npm", "start"]
