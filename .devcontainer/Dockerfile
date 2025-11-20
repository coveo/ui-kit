# Build stage for installing dependencies
FROM node:22-bookworm

# Install essential packages
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack and pnpm
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Set up workspace directory
WORKDIR /workspace

# Create node user with proper permissions if it doesn't exist
RUN id -u node &>/dev/null || (groupadd --gid 1000 node && \
    useradd --uid 1000 --gid node --shell /bin/bash --create-home node)

# Ensure node user owns workspace
RUN chown -R node:node /workspace

# Switch to node user for all subsequent operations
USER node
