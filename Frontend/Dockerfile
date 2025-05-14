# Stage 1: Build the React Vite application
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
ARG NGINX_PORT=80
EXPOSE ${NGINX_PORT}
CMD ["nginx", "-g", "daemon off;"]