# Build aşaması
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_CHAT_SOCKET_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_CHAT_SOCKET_URL=$REACT_APP_CHAT_SOCKET_URL
RUN npm run build

# Production aşaması
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf  
EXPOSE 80
