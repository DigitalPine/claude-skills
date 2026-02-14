# Go Project Makefile
# Requires: Go 1.24+, golangci-lint as tool dependency

# Configuration
BINARY_NAME ?= $(shell basename $(CURDIR))
BUILD_DIR ?= ./bin
MAIN_PKG ?= ./cmd/$(BINARY_NAME)

# Go commands (use go tool for managed tools)
GO ?= go
GOTEST ?= $(GO) test
GOBUILD ?= $(GO) build
GORUN ?= $(GO) run
GOTOOL ?= $(GO) tool

# Build flags
LDFLAGS ?= -s -w
GCFLAGS ?=

# Determine if main package exists, fallback to root
ifneq ($(wildcard $(MAIN_PKG)),)
    ENTRY_POINT := $(MAIN_PKG)
else
    ENTRY_POINT := .
endif

.PHONY: all build run test test-race test-cover lint lint-fix fmt clean help
.PHONY: install-tools update-tools

# Default target
all: lint test build

## Build targets

build: ## Build the binary
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	$(GOBUILD) $(GCFLAGS) -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(BINARY_NAME) $(ENTRY_POINT)

build-all: ## Build for multiple platforms
	@echo "Building for multiple platforms..."
	@mkdir -p $(BUILD_DIR)
	GOOS=linux GOARCH=amd64 $(GOBUILD) -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 $(ENTRY_POINT)
	GOOS=linux GOARCH=arm64 $(GOBUILD) -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(BINARY_NAME)-linux-arm64 $(ENTRY_POINT)
	GOOS=darwin GOARCH=amd64 $(GOBUILD) -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 $(ENTRY_POINT)
	GOOS=darwin GOARCH=arm64 $(GOBUILD) -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 $(ENTRY_POINT)

run: ## Run the application
	$(GORUN) $(ENTRY_POINT)

## Test targets

test: ## Run tests
	$(GOTEST) -v ./...

test-race: ## Run tests with race detector
	$(GOTEST) -race -v ./...

test-cover: ## Run tests with coverage
	$(GOTEST) -coverprofile=coverage.out ./...
	$(GO) tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

test-short: ## Run short tests only
	$(GOTEST) -short -v ./...

bench: ## Run benchmarks
	$(GOTEST) -bench=. -benchmem ./...

## Lint targets

lint: ## Run linter
	$(GOTOOL) golangci-lint run

lint-fix: ## Run linter with auto-fix
	$(GOTOOL) golangci-lint run --fix

fmt: ## Format code
	$(GOTOOL) golangci-lint fmt
	$(GO) fmt ./...

vet: ## Run go vet
	$(GO) vet ./...

## Dependency targets

install-tools: ## Install tool dependencies (Go 1.24+)
	$(GO) get -tool github.com/golangci/golangci-lint/cmd/golangci-lint@latest

update-tools: ## Update all tools
	$(GO) get tool

tidy: ## Tidy go.mod
	$(GO) mod tidy

deps: ## Download dependencies
	$(GO) mod download

## Clean targets

clean: ## Remove build artifacts
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.out coverage.html

clean-cache: ## Clear Go build cache
	$(GO) clean -cache

## Help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Default target when just running 'make'
.DEFAULT_GOAL := help
