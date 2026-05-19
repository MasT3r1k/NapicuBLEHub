# ---- Build stage ----
FROM node:20-bookworm AS builder
LABEL authors="numax"

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Next.js app
RUN npm run build


# ---- Production stage ----
FROM node:20-bookworm

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy build output
COPY --from=builder /app ./

# Expose Next.js port
EXPOSE 6969

# Environment (BLE + server)
ENV NODE_ENV=production
ENV NOBLE_HCI_DEVICE_ID=0
ENV NAPICU_SERVER_LOG_LEVEL=2

# Start app
CMD ["npm", "run", "start"]