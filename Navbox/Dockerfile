# Use official Node.js LTS Alpine image for a small footprint
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --production
RUN npm install winston

# Copy the rest of your application
COPY . .

# Expose WebSocket server port
EXPOSE 4000-4050

# Run the WebSocket server
CMD ["node", "server2.js"]
