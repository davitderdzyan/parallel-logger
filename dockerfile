# Use Node LTS image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (cache)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port your service listens on
EXPOSE 4000

# Start the service
CMD ["npm", "start"]
