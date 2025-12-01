jQuery(document).ready(function($) {
    // Test connection button
    $('#test-connection').on('click', function(e) {
        e.preventDefault();
        
        const button = $(this);
        const resultDiv = $('#connection-result');
        
        button.prop('disabled', true).text('Testing...');
        resultDiv.html('');
        
        const apiKey = $('#clickfused_api_key').val();
        
        if (!apiKey) {
            resultDiv.html('<div class="notice notice-error"><p>Please enter an API key first and save settings.</p></div>');
            button.prop('disabled', false).text('Test Connection');
            return;
        }
        
        $.ajax({
            url: clickfusedData.restUrl + '/verify',
            method: 'GET',
            headers: {
                'X-ClickFused-API-Key': apiKey
            },
            success: function(response) {
                resultDiv.html(
                    '<div class="notice notice-success"><p>' +
                    '<strong>✓ Connection Successful!</strong><br>' +
                    'WordPress Version: ' + response.wordpress_version + '<br>' +
                    'Plugin Version: ' + response.plugin_version + '<br>' +
                    'Site URL: ' + response.site_url +
                    '</p></div>'
                );
            },
            error: function(xhr) {
                let errorMsg = 'Connection failed';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                } else if (xhr.statusText) {
                    errorMsg = xhr.statusText;
                }
                
                resultDiv.html(
                    '<div class="notice notice-error"><p>' +
                    '<strong>✗ Connection Failed</strong><br>' +
                    errorMsg +
                    '</p></div>'
                );
            },
            complete: function() {
                button.prop('disabled', false).text('Test Connection');
            }
        });
    });
});
