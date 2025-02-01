# Use Node.js base image
FROM node:20
# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY ../frontend/package.json .
COPY ../frontend/package-lock.json .
RUN npm install

# Copy the rest of the application code
COPY ../frontend .

# Build the Next.js application
RUN npm run build

# Expose the frontend port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]