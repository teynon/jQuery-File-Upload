## Setup
* [How to setup the plugin on your website](https://github.com/blueimp/jQuery-File-Upload/wiki/Setup)
* [How to use only the basic plugin (minimal setup guide).](https://github.com/blueimp/jQuery-File-Upload/wiki/Basic-plugin)

To set up APC for PHP, first ensure that you have APC installed on your PHP server.

A resource for setting up PHP APC can be found at [http://www.debian-administration.org/articles/574](http://www.debian-administration.org/articles/574)

[Remi](http://blog.famillecollet.com/post/2011/01/12/File-upload-progress-in-PHP-with-APC) provides a nice script for testing your APC setup.

## APC Plugin Setup
* The APC plugin only takes effect when the browser does not support file upload progress.

To enable APC, ensure you have the `js/jquery.fileupload-apc.js` included on your page and simply add the option in the widget initialization.

```javascript
$('#fileupload').fileupload({
    url: 'server/php/',
    apc: true
});
```

You can also optionally configure the following settings:

```javascript
$('#fileupload').fileupload({
    url: 'server/php/',
    apc: true,
    apcTimeout: 2000, // Set the time in between progress updates in milliseconds
    apcVarname: "MY_APC_UPLOAD_PROGRESS", // Use only if you have changed apc.rfc1867_name (http://www.php.net/manual/en/apc.configuration.php#ini.apc.rfc1867-name)
    apcPrefix: "myprefix_" // Use only if you have changed apc.rfc1867_prefix (http://www.php.net/manual/en/apc.configuration.php#ini.apc.rfc1867-prefix)
});
```

## About APC
PHP APC is a PECL extension that enables caching of files. With the correct [runtime configuration](http://www.php.net/manual/en/apc.configuration.php#ini.apc.rfc1867), it can cache file information during file uploads and provide information about those files such as current size, total size, and bitrate.

## License
Released under the [MIT license](http://www.opensource.org/licenses/MIT).
