# Use Node.js 18 base image
FROM node:18-alpine

# Set working directory
WORKDIR /app


# Copy package.json and package-lock.json
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./


# Build the application
RUN npm run build

# Expose port
EXPOSE 3004

# Run the application
CMD ["node", "dist/index.js"]
