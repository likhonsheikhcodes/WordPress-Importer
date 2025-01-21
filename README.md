# WordPress Importer

[![Build Status](https://travis-ci.org/likhonsheikhcodes/WordPress-Importer.svg?branch=main)](https://travis-ci.org/likhonsheikhcodes/WordPress-Importer)
[![GitHub License](https://img.shields.io/github/license/likhonsheikhcodes/WordPress-Importer)](https://github.com/likhonsheikhcodes/WordPress-Importer/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/likhonsheikhcodes/WordPress-Importer)](https://github.com/likhonsheikhcodes/WordPress-Importer/issues)
[![GitHub Pull Requests](https://img.shields.io/github/pulls/likhonsheikhcodes/WordPress-Importer)](https://github.com/likhonsheikhcodes/WordPress-Importer/pulls)

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Introduction

WordPress Importer is a powerful tool designed to help you migrate your content, themes, and plugins from one WordPress site to another. It includes advanced features such as a website analyzer, XML generator, theme detector, and plugin detection to ensure a seamless migration process.

## Features

- **Website Analyzer**: Analyze the source WordPress site to gather detailed information about content, themes, and plugins.
- **XML Generator**: Generate a complete XML file that includes all your content (posts, pages, media, etc.).
- **Theme Detector**: Detect and export the current active theme and any customizations.
- **Plugin Detection**:Identify and export all active plugins and their settings.
- **Content Migration**:Seamlessly migrate all content from the source site to the target site.
- **Theme and Plugin Installation**:Automatically install and activate themes and plugins on the target site.

## Installation

### Prerequisites
- Node.js (>= 14.0.0)
- npm (>= 6.0.0)
- A WordPress site to import from and a target WordPress site to import to.

### Install via npm
```bash
npm install -g wordpress-importer
```

### Clone and Build
1. Clone the repository:
   ```bash
   git clone https://github.com/likhonsheikhcodes/WordPress-Importer.git
   ```
2. Navigate to the project directory:
   ```bash
   cd WordPress-Importer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Analyze a Website
```bash
wordpress-importer analyze --url https://source-website-site.com
```

### Generate XML
```bash
wordpress-importer generate-xml --url https://source-WordPress-site.com --output output.xml
```

### Detect Theme
```bash
wordpress-importer detect-theme --url https://source-WordPress-site.com --output theme.zip
```

### Detect Plugins
```bash
wordpress-importer detect-plugins --url https://source-WordPress-site.com --output plugins.zip
```

### Migrate Content
```bash
wordpress-importer migrate-content --source https://source-WordPress-site.com --target https://target-WordPress-site.com --xml output.xml
```

### Install Theme and Plugins
```bash
wordpress-importer install-theme-and-plugins --target https://target-WordPress-site.com --theme theme.zip --plugins plugins.zip
```

## Configuration

You can configure the tool by creating a `.env` file in the root directory of the project. Here are the available configuration options:

- `WORDPRESS_API_KEY`: API key for accessing the WordPress REST API.
- `WORDPRESS_API_SECRET`: API secret for accessing the WordPress REST API.
- `WORDPRESS_SOURCE_URL`: URL of the source WordPress site.
- `WORDPRESS_TARGET_URL`:URL of the target WordPress site.

Example `.env` file:
```env
WORDPRESS_API_KEY=your_api_key
WORDPRESS_API_SECRET=your_api_secret
WORDPRESS_SOURCE_URL=https://source-WordPress-site.com
WORDPRESS_TARGET_URL=https://target-WordPress-site.com
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

## License

This project is licensed under the [MIT License](LICENSE).

---

For more information and support, visit the [GitHub repository](https://github.com/likhonsheikhcodes/WordPress-Importer) or the [WordPress Importer website](https://wordpress-importer.vercel.app).

---

**Note**: This tool is designed to help with the migration process, but it's always a good idea to backup your sites before performing any migrations.
