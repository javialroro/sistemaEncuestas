# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /opt/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install jest
# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]