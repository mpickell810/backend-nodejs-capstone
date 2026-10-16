FROM node:22-slim

WORKDIR /usr/src/app

# 1. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 2. Copy application files and explicitly grant ownership to user 1000
COPY --chown=1000:1000 . .

# 3. Explicitly ensure the public/images folder exists and is writable
RUN mkdir -p /usr/src/app/public/images \
    && chown -R 1000:1000 /usr/src/app/public

# 4. Switch to the non-root user required by Kubernetes
USER 1000

# 5. Expose the port your Express app listens on
EXPOSE 3060

# 6. Execute the application startup (MUST be the final line)
CMD ["node", "app.js"]
