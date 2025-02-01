# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY ../backend/package.json .
RUN npm install

# Copy the rest of the application code
COPY ../backend .

# Build TypeScript files
RUN npm run build

# Expose the server port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]