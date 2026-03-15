# Variables
BACKEND_DIR=.
FRONTEND_DIR=balancebuddy-frontend
PUBLISH_DIR=$(BACKEND_DIR)/bin/Release/net8.0/publish
DEV_WWWROOT=$(BACKEND_DIR)/wwwroot
PUBLISH_WWWROOT=$(PUBLISH_DIR)/wwwroot

# Default target
all: build-frontend copy-dev

# Publish backend + frontend
publish: publish-backend build-frontend copy-dev copy-publish

publish-backend:
	dotnet publish $(BACKEND_DIR) -c Release -o $(PUBLISH_DIR)

# Build frontend
build-frontend:
	cd $(FRONTEND_DIR) && npm install && npm run build

# Copy frontend build to dev wwwroot (for dotnet run)
copy-dev:
	mkdir -p $(DEV_WWWROOT)
	cp -r $(FRONTEND_DIR)/build/* $(DEV_WWWROOT)

# Copy frontend build to publish wwwroot (for dotnet publish)
copy-publish:
	mkdir -p $(PUBLISH_WWWROOT)
	cp -r $(FRONTEND_DIR)/build/* $(PUBLISH_WWWROOT)

# Run backend in dev mode
run:
	dotnet run --project $(BACKEND_DIR)

# Clean everything
clean:
	rm -rf $(PUBLISH_DIR)
	rm -rf $(DEV_WWWROOT)
	rm -rf $(FRONTEND_DIR)/build
