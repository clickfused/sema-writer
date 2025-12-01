# ClickFused Connector for WordPress

Connect your WordPress site to ClickFused AI Writer for seamless content publishing, editing, and management directly from your ClickFused dashboard.

## Installation

### Download & Install

1. Download the plugin folder
2. Upload to WordPress:
   - Go to **Plugins > Add New > Upload Plugin**
   - Choose the ZIP file (compress the `wordpress-plugin` folder first)
   - Click **Install Now**
3. Activate the plugin

### Configuration

1. Go to **ClickFused** in your WordPress admin menu
2. Enable the connector by checking "Enable ClickFused"
3. Get your API key:
   - Log in to your ClickFused Dashboard
   - Go to **Settings**
   - Generate a new API key
4. Paste the API key in the WordPress plugin settings
5. Click **Save Settings**
6. Click **Test Connection** to verify

## API Endpoints

The plugin creates the following REST API endpoints:

### Verify Connection
```
GET /wp-json/clickfused/v1/verify
Header: X-ClickFused-API-Key: your-api-key
```

### Create/Update Post
```
POST /wp-json/clickfused/v1/posts
Header: X-ClickFused-API-Key: your-api-key
Body: {
  "title": "Post Title",
  "content": "Post content...",
  "status": "draft|publish",
  "slug": "post-slug",
  "excerpt": "Post excerpt",
  "meta_description": "SEO meta description",
  "clickfused_post_id": "uuid-from-clickfused"
}
```

### Delete Post
```
DELETE /wp-json/clickfused/v1/posts/{post_id}
Header: X-ClickFused-API-Key: your-api-key
```

### Get Posts
```
GET /wp-json/clickfused/v1/posts?page=1&per_page=20
Header: X-ClickFused-API-Key: your-api-key
```

## Features

✅ **One-Click Publishing** - Publish from ClickFused dashboard to WordPress  
✅ **Secure API Authentication** - API key-based secure connection  
✅ **Full Post Management** - Create, update, delete posts remotely  
✅ **SEO Metadata Sync** - Auto-sync meta descriptions  
✅ **Draft or Publish** - Choose post status  
✅ **Connection Testing** - Built-in connection test tool  

## Requirements

- WordPress 5.8+
- PHP 7.4+
- ClickFused account (free at [clickfused.com](https://clickfused.com))

## Support

For help and documentation:
- **Docs**: [clickfused.com/docs](https://clickfused.com/docs)
- **Support**: [clickfused.com/support](https://clickfused.com/support)

## License

GPLv2 or later

---

**Made with ❤️ by ClickFused**
