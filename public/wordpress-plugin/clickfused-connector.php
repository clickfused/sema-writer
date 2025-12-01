<?php
/**
 * Plugin Name: ClickFused Connector
 * Plugin URI: https://clickfused.com
 * Description: Connect your WordPress site to ClickFused AI Writer for seamless content publishing, editing, and management directly from your ClickFused dashboard.
 * Version: 1.0.0
 * Author: ClickFused
 * Author URI: https://clickfused.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: clickfused-connector
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CLICKFUSED_VERSION', '1.0.0');
define('CLICKFUSED_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CLICKFUSED_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * ClickFused Connector Main Class
 */
class ClickFused_Connector {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'ClickFused Connector',
            'ClickFused',
            'manage_options',
            'clickfused-connector',
            array($this, 'settings_page'),
            'dashicons-cloud',
            100
        );
    }
    
    /**
     * Register plugin settings
     */
    public function register_settings() {
        register_setting('clickfused_settings', 'clickfused_api_key', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ));
        
        register_setting('clickfused_settings', 'clickfused_enabled', array(
            'type' => 'boolean',
            'default' => false
        ));
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        // Verify API Key endpoint
        register_rest_route('clickfused/v1', '/verify', array(
            'methods' => 'GET',
            'callback' => array($this, 'verify_connection'),
            'permission_callback' => array($this, 'check_api_key_permission')
        ));
        
        // Create/Update post endpoint
        register_rest_route('clickfused/v1', '/posts', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_or_update_post'),
            'permission_callback' => array($this, 'check_api_key_permission')
        ));
        
        // Delete post endpoint
        register_rest_route('clickfused/v1', '/posts/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_post'),
            'permission_callback' => array($this, 'check_api_key_permission')
        ));
        
        // Get posts endpoint
        register_rest_route('clickfused/v1', '/posts', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_posts'),
            'permission_callback' => array($this, 'check_api_key_permission')
        ));
    }
    
    /**
     * Check API key permission
     */
    public function check_api_key_permission($request) {
        $api_key = $request->get_header('X-ClickFused-API-Key');
        $stored_key = get_option('clickfused_api_key');
        $enabled = get_option('clickfused_enabled');
        
        if (!$enabled) {
            return new WP_Error('disabled', 'ClickFused connector is disabled', array('status' => 403));
        }
        
        if (empty($stored_key)) {
            return new WP_Error('no_key', 'API key not configured', array('status' => 401));
        }
        
        if ($api_key !== $stored_key) {
            return new WP_Error('invalid_key', 'Invalid API key', array('status' => 401));
        }
        
        return true;
    }
    
    /**
     * Verify connection
     */
    public function verify_connection($request) {
        $user = wp_get_current_user();
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'ClickFused connection verified',
            'wordpress_version' => get_bloginfo('version'),
            'plugin_version' => CLICKFUSED_VERSION,
            'site_url' => get_site_url(),
            'user' => array(
                'id' => $user->ID,
                'email' => $user->user_email,
                'display_name' => $user->display_name
            )
        ));
    }
    
    /**
     * Create or update post
     */
    public function create_or_update_post($request) {
        $params = $request->get_json_params();
        
        // Validate required fields
        if (empty($params['title']) || empty($params['content'])) {
            return new WP_Error('missing_fields', 'Title and content are required', array('status' => 400));
        }
        
        // Prepare post data
        $post_data = array(
            'post_title' => sanitize_text_field($params['title']),
            'post_content' => wp_kses_post($params['content']),
            'post_status' => isset($params['status']) ? sanitize_text_field($params['status']) : 'draft',
            'post_author' => get_current_user_id(),
            'post_type' => 'post'
        );
        
        // Add slug if provided
        if (!empty($params['slug'])) {
            $post_data['post_name'] = sanitize_title($params['slug']);
        }
        
        // Add excerpt if provided
        if (!empty($params['excerpt'])) {
            $post_data['post_excerpt'] = sanitize_text_field($params['excerpt']);
        }
        
        // Update existing post or create new
        if (!empty($params['post_id'])) {
            $post_data['ID'] = absint($params['post_id']);
            $post_id = wp_update_post($post_data, true);
        } else {
            $post_id = wp_insert_post($post_data, true);
        }
        
        if (is_wp_error($post_id)) {
            return $post_id;
        }
        
        // Update meta description if provided
        if (!empty($params['meta_description'])) {
            update_post_meta($post_id, '_yoast_wpseo_metadesc', sanitize_text_field($params['meta_description']));
            update_post_meta($post_id, '_clickfused_meta_description', sanitize_text_field($params['meta_description']));
        }
        
        // Add ClickFused tracking meta
        update_post_meta($post_id, '_clickfused_synced', true);
        update_post_meta($post_id, '_clickfused_last_sync', current_time('mysql'));
        
        if (!empty($params['clickfused_post_id'])) {
            update_post_meta($post_id, '_clickfused_post_id', sanitize_text_field($params['clickfused_post_id']));
        }
        
        $post = get_post($post_id);
        
        return rest_ensure_response(array(
            'success' => true,
            'post_id' => $post_id,
            'post_url' => get_permalink($post_id),
            'edit_url' => get_edit_post_link($post_id, ''),
            'post' => array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'status' => $post->post_status,
                'slug' => $post->post_name,
                'date' => $post->post_date,
                'modified' => $post->post_modified
            )
        ));
    }
    
    /**
     * Delete post
     */
    public function delete_post($request) {
        $post_id = absint($request['id']);
        
        if (!$post_id) {
            return new WP_Error('invalid_id', 'Invalid post ID', array('status' => 400));
        }
        
        $post = get_post($post_id);
        
        if (!$post) {
            return new WP_Error('not_found', 'Post not found', array('status' => 404));
        }
        
        $result = wp_delete_post($post_id, true);
        
        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete post', array('status' => 500));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Post deleted successfully',
            'post_id' => $post_id
        ));
    }
    
    /**
     * Get posts
     */
    public function get_posts($request) {
        $args = array(
            'post_type' => 'post',
            'post_status' => 'any',
            'posts_per_page' => isset($request['per_page']) ? absint($request['per_page']) : 20,
            'paged' => isset($request['page']) ? absint($request['page']) : 1,
            'meta_query' => array(
                array(
                    'key' => '_clickfused_synced',
                    'value' => true,
                    'compare' => '='
                )
            )
        );
        
        $query = new WP_Query($args);
        $posts = array();
        
        foreach ($query->posts as $post) {
            $posts[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'content' => $post->post_content,
                'excerpt' => $post->post_excerpt,
                'status' => $post->post_status,
                'slug' => $post->post_name,
                'url' => get_permalink($post->ID),
                'edit_url' => get_edit_post_link($post->ID, ''),
                'date' => $post->post_date,
                'modified' => $post->post_modified,
                'clickfused_post_id' => get_post_meta($post->ID, '_clickfused_post_id', true),
                'meta_description' => get_post_meta($post->ID, '_clickfused_meta_description', true)
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'posts' => $posts,
            'total' => $query->found_posts,
            'pages' => $query->max_num_pages
        ));
    }
    
    /**
     * Settings page
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="notice notice-info">
                <p><strong>Welcome to ClickFused Connector!</strong></p>
                <p>Connect your WordPress site to your ClickFused dashboard to publish, edit, and manage posts seamlessly.</p>
            </div>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('clickfused_settings');
                do_settings_sections('clickfused_settings');
                ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="clickfused_enabled">Enable ClickFused</label>
                        </th>
                        <td>
                            <input type="checkbox" 
                                   id="clickfused_enabled" 
                                   name="clickfused_enabled" 
                                   value="1" 
                                   <?php checked(get_option('clickfused_enabled'), 1); ?> />
                            <p class="description">Enable or disable ClickFused connector</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="clickfused_api_key">API Key</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="clickfused_api_key" 
                                   name="clickfused_api_key" 
                                   value="<?php echo esc_attr(get_option('clickfused_api_key')); ?>" 
                                   class="regular-text" 
                                   placeholder="Enter your ClickFused API key" />
                            <p class="description">
                                Get your API key from your ClickFused Dashboard → Settings
                            </p>
                        </td>
                    </tr>
                </table>
                
                <h2>API Endpoints</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">REST API Base URL</th>
                        <td>
                            <code><?php echo esc_url(rest_url('clickfused/v1')); ?></code>
                            <p class="description">Use this URL in your ClickFused dashboard settings</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Site URL</th>
                        <td>
                            <code><?php echo esc_url(get_site_url()); ?></code>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Save Settings'); ?>
            </form>
            
            <hr>
            
            <h2>Connection Test</h2>
            <p>Test your ClickFused connection:</p>
            <button type="button" id="test-connection" class="button button-secondary">Test Connection</button>
            <div id="connection-result" style="margin-top: 10px;"></div>
            
            <hr>
            
            <h2>Setup Instructions</h2>
            <ol>
                <li>Enable the ClickFused connector using the checkbox above</li>
                <li>Generate an API key from your ClickFused Dashboard (Settings page)</li>
                <li>Copy and paste the API key in the field above</li>
                <li>Click "Save Settings"</li>
                <li>Use the "Test Connection" button to verify the setup</li>
                <li>Configure your WordPress site URL in ClickFused settings</li>
            </ol>
            
            <h2>Support</h2>
            <p>
                For help and documentation, visit: 
                <a href="https://clickfused.com/docs" target="_blank">ClickFused Documentation</a>
            </p>
        </div>
        <?php
    }
    
    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if ('toplevel_page_clickfused-connector' !== $hook) {
            return;
        }
        
        wp_enqueue_script(
            'clickfused-admin',
            CLICKFUSED_PLUGIN_URL . 'assets/admin.js',
            array('jquery'),
            CLICKFUSED_VERSION,
            true
        );
        
        wp_localize_script('clickfused-admin', 'clickfusedData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url('clickfused/v1'),
            'nonce' => wp_create_nonce('wp_rest'),
            'apiKey' => get_option('clickfused_api_key')
        ));
    }
}

// Initialize plugin
add_action('plugins_loaded', array('ClickFused_Connector', 'get_instance'));

// Activation hook
register_activation_hook(__FILE__, 'clickfused_activate');
function clickfused_activate() {
    flush_rewrite_rules();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'clickfused_deactivate');
function clickfused_deactivate() {
    flush_rewrite_rules();
}
