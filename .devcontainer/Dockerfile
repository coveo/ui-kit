# Development container for pnpm-based monorepo
FROM node:jod-bookworm@sha256:4ad2c2b350ab49fb637ab40a269ffe207c61818bb7eb3a4ea122001a0c605e1f

# Install essential packages
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack globally
RUN corepack enable

# Configure pnpm home and path
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Configure pnpm to use the mounted store directory
ENV PNPM_STORE_PATH="/pnpm/store"

# Allow corepack to download package managers without prompting
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Set up workspace directory
WORKDIR /workspaces/ui-kit

# Ensure node user owns pnpm home and store directories
RUN mkdir -p /pnpm/store && chown -R node:node /pnpm

# Switch to node user for all subsequent operations
USER node

# Pre-install pnpm as the node user so it's ready to use
RUN corepack prepare pnpm@10.18.1 --activate

# Install turbo globally so it's available in terminal
RUN pnpm add -g turbo@2.5.5
