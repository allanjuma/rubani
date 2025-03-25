############################################################
# Dockerfile to build datex server container
# Based on Ubuntu latest version
############################################################

# Use Node.js LTS version as base image
FROM node:20-slim

# Install git and other required packages
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Set working directory
WORKDIR /app

# Clone the repository
RUN git clone https://bitsoko:12Gitlabsrus34@git.bitsoko.org/games/rubani.git .

# Install dependencies
RUN npm install

# Build the application for production
RUN npm run build

# Expose ports for both dev and prod
EXPOSE 4200 8080

# Create an entrypoint script
RUN echo '#!/bin/sh\n\
cd /app\n\
git pull\n\
if [ "$NODE_ENV" = "production" ]; then\n\
    echo "Running in production mode..."\n\
    npx http-server dist/dapp -p 8080\n\
else\n\
    echo "Running in development mode..."\n\
    ng serve --host 0.0.0.0 --port 4200\n\
fi' > /entrypoint.sh && \
chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]


