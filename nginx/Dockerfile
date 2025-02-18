FROM nginx:latest

# Create the nginx user and group if they don't exist
RUN if ! getent group nginx; then \
    groupadd -r -g 999 nginx; \
    fi

COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
