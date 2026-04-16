# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the build output from Stage 1 to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config with Permissions-Policy headers for YouTube iframe
RUN echo 'server { \
    listen 80; \
    \
    # Allow YouTube iframe features (autoplay, encrypted-media, etc.) \
    add_header Permissions-Policy "autoplay=*, encrypted-media=*, accelerometer=*, gyroscope=*, picture-in-picture=*, fullscreen=*" always; \
    add_header X-Frame-Options "" always; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
