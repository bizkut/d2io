FROM node:18-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy server source code
COPY server/ ./

# Copy scraped data (needed for the API to serve content)
# We go back to root /app to copy scraper data into expected relative path
WORKDIR /app
COPY scraper/data ./scraper/data

# Expose API port
EXPOSE 3000

# Start command
WORKDIR /app/server
CMD ["node", "src/index.js"]
