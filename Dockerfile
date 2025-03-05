FROM node:18.18.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files
COPY . /app

# delete the dist folder
RUN rm -rf /app/dist

# Build the code
RUN yarn build:cjs

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "demo/codAsAServer/server/index.js"]