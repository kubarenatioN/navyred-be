# Base image for building
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Base image for optimizing size
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from the build stage
COPY --from=builder /usr/src/app/package*.json ./

# Copy the .env files
COPY --from=builder /usr/src/app/.env.* ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built "dist" folder from the build stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:game:prod"]