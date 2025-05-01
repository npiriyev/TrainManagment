FROM node:23

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli

# Copy everything else
COPY . .

# Update API URL in environment file (if needed)
# Uncomment and adjust if you have an environment.ts file
# RUN sed -i 's|http://localhost:5000|http://localhost:5080|g' src/environments/environment.ts

# Start the Angular development server
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]