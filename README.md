# Bookmarks Manager for Nextcloud

A feature-rich bookmark management application for Nextcloud that allows you to save, organize, and manage your favorite websites directly within your Nextcloud instance.

## Overview

Bookmarks Manager is a Nextcloud application that provides a centralized solution for managing your bookmarks. It combines a sleek React-based frontend with a robust PHP backend, offering both a user-friendly web interface and a comprehensive REST API for external integrations.

## Features

### Core Functionality
- **Bookmark Management**: Create, edit, delete, and organize bookmarks with rich metadata
- **Collections**: Organize bookmarks into hierarchical collections with custom icons
- **Tags**: Tag bookmarks for flexible multi-dimensional organization
- **Search & Filter**: Filter bookmarks by collections and tags
- **Drag & Drop**: Reorder bookmarks with intuitive drag-and-drop functionality

### Advanced Features
- **Automatic Metadata Fetching**: Automatically capture page titles, descriptions, screenshots, and favicons
- **Icon Picker**: Customize collection icons with a visual picker
- **Import/Export**: Import from and export to Raindrop.io CSV format
- **API Token Management**: Generate and manage tokens for external API access
- **Multi-language Support**: Available in English and French
- **Dark Mode**: Automatically adapts to Nextcloud's theme settings
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **TanStack Router** for client-side routing
- **Tailwind CSS** + **shadcn/ui** for modern, accessible UI components
- **Radix UI** for headless, accessible component primitives
- **@dnd-kit** for drag-and-drop functionality
- **i18next** for internationalization
- **Vite** for fast development and optimized builds

### Backend
- **PHP** with Nextcloud App Framework
- **RESTful API** with JSON responses
- **Entity/Mapper pattern** for database operations
- **Dependency Injection** for clean architecture
- **User isolation** for secure data management

## Installation

### From Nextcloud App Store
1. Open your Nextcloud instance
2. Navigate to **Apps** in the admin menu
3. Search for "Bookmarks Manager"
4. Click **Install**

### Manual Installation
1. Clone this repository into your Nextcloud apps directory:
   ```bash
   cd /path/to/nextcloud/apps
   git clone https://github.com/yawks/bookmark-manager.git bookmarksmanager
   ```

2. Install frontend dependencies and build:
   ```bash
   cd bookmarksmanager/frontend
   npm install
   npm run build
   ```

3. Enable the app in Nextcloud:
   ```bash
   php occ app:enable bookmarksmanager
   ```

## Requirements

- Nextcloud 28, 29, or 30
- PHP 7.4 or higher
- Node.js 16+ and npm (for development)

## Usage

### Web Interface

1. After installation, click on the **Bookmarks Manager** icon in your Nextcloud app menu
2. Click the **+** button to add a new bookmark
3. Enter the URL and optionally edit the title, description, or assign it to a collection
4. Use tags to categorize bookmarks across multiple dimensions
5. Filter bookmarks by clicking on collections or tags in the sidebar
6. Drag and drop bookmarks to reorder them within a view

### API Access

Generate an API token from the settings menu to access bookmarks programmatically.

#### Example: Fetch All Bookmarks
```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks
```

See [API.md](API.md) for complete API documentation.

## API Endpoints

### Bookmarks
- `GET /api/v1/bookmarks` - List all bookmarks (with optional collection/tag filters)
- `POST /api/v1/bookmarks` - Create a new bookmark
- `PUT /api/v1/bookmarks/{id}` - Update a bookmark
- `DELETE /api/v1/bookmarks/{id}` - Delete a bookmark
- `POST /api/v1/bookmarks/reorder` - Reorder bookmarks

### Collections
- `GET /api/v1/collections` - List all collections
- `POST /api/v1/collections` - Create a new collection
- `PUT /api/v1/collections/{id}` - Update a collection
- `DELETE /api/v1/collections/{id}` - Delete a collection

### Tags
- `GET /api/v1/tags` - List all tags
- `POST /api/v1/tags` - Create a new tag
- `PUT /api/v1/tags/{id}` - Update a tag (rename)
- `DELETE /api/v1/tags/{id}` - Delete a tag

### Import/Export
- `POST /api/v1/import/raindrop` - Import bookmarks from Raindrop.io CSV
- `GET /api/v1/export/raindrop` - Export bookmarks to Raindrop.io CSV

### Utilities
- `GET /api/v1/page-info?url={url}` - Fetch metadata for a URL
- `POST /api/v1/token/generate` - Generate an API token
- `GET /api/v1/token` - Get current API token
- `POST /api/v1/token/revoke` - Revoke API token

## Development

### Prerequisites
- Node.js 16+
- npm or yarn
- PHP 7.4+
- Nextcloud development environment

### Frontend Development

```bash
cd bookmarksmanager/frontend
npm install
npm run dev    # Start development server
npm run build  # Build for production
```

### Backend Development

The backend follows Nextcloud's app development guidelines:
- Controllers handle HTTP requests and responses
- Services contain business logic
- Mappers handle database operations
- Entities represent database models

### Project Structure

```
bookmarksmanager/
├── appinfo/              # App metadata and route definitions
├── lib/
│   ├── Controller/       # API controllers
│   ├── Db/              # Database entities and mappers
│   ├── Service/         # Business logic layer
│   └── Migration/       # Database migrations
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── routes/      # TanStack Router routes
│   │   ├── lib/         # Utilities and contexts
│   │   └── locales/     # Translation files
│   └── package.json
├── js/                  # Compiled frontend JavaScript
├── css/                 # Compiled frontend CSS
└── templates/           # PHP templates
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the AGPL-3.0 License - see the LICENSE file for details.

## Acknowledgments

- Built with [Nextcloud App Framework](https://docs.nextcloud.com/server/latest/developer_manual/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Radix UI](https://www.radix-ui.com/icons) and [Lucide](https://lucide.dev/)

## Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/yawks/bookmark-manager/issues)
- Check the [Nextcloud community forums](https://help.nextcloud.com/)