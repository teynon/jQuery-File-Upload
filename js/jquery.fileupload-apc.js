/*
 * jQuery File Upload PHP APC Plugin 1.0.0
 * https://github.com/teynon/jQuery-File-Upload
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, URL, webkitURL, FileReader */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            './jquery.fileupload-apc'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery
        );
    }
}(function ($) {
    'use strict';

    $.widget('blueimp.fileupload', $.blueimp.fileupload, {

        options: {
            // By default, APC Upload Progress (for older browsers) is disabled
            // if APC is enabled, older browsers will need to limit the maximum
            // number of concurrent uploads to that browsers limit.
            //    Max Concurrent:
            //    IE6/7=2, IE8=2 OR 6(depending on modem) Most others is 6
            apc: false,
            // The default wait time in between apc file progress checks.
            apcTimeout: 1000,
            // The default APC variable name to be included with the post.
            apcVarname: "APC_UPLOAD_PROGRESS",

            // Overwrite the send function to prevent progress from going
            // directly to 100% during APC file uploads.
            send: function (e, data) {
                var that = $(this).data('blueimp-fileupload') ||
                        $(this).data('fileupload');
                if (!data.isValidated) {
                    if (!data.maxNumberOfFilesAdjusted) {
                        that._adjustMaxNumberOfFiles(-data.files.length);
                        data.maxNumberOfFilesAdjusted = true;
                    }
                    if (!that._validate(data.files)) {
                        return false;
                    }
                }
                if (data.context && data.dataType &&
                        data.dataType.substr(0, 6) === 'iframe' && !data.apc) {
                    // Iframe Transport does not support progress events.
                    // In lack of an indeterminate progress bar, we set
                    // the progress to 100%, showing the full animated bar:
                    data.context
                        .find('.progress').addClass(
                            !$.support.transition && 'progress-animated'
                        )
                        .attr('aria-valuenow', 100)
                        .find('.bar').css(
                            'width',
                            '100%'
                        );
                }
                return that._trigger('sent', e, data);
            }
        },

        _apcProgress: function(options) {
            var that = this;
            // Generate a random APC key.
            if (!options.apccode) {
                options.apccode = options.apccode || 'apc' + (new Date()).getTime();
                options.formData = this._getFormData(options);
                options.formData.push({ name: options.apcVarname, value: options.apccode });
            }
            this.apct = setTimeout(function() {
                var self = that, opts = options;
                $.ajax({
                    url: options.url,
                    type: "POST",
                    data: { "apc" : true, "apccode" : options.apccode }
                }).done(function(o) {
                    // Set the apc_data progress.
                    var r = $.parseJSON(o), e = $.Event('progress', {
                        lengthComputable: true,
                        loaded: r.current,
                        total: r.total
                    }), now = (new Date()).getTime(), loaded = Math.floor(r.current);
                    if (r) {
                        r = r.apc_data;
                        // Add the difference from the previously loaded state
                        // to the global loaded counter:
                        self._progress.total = r.total;
                        self._progress.loaded += (loaded - opts._progress.loaded);
                        self._progress.bitrate = self._bitrateTimer.getBitrate(
                            now,
                            self._progress.loaded,
                            self.options.apcTimeout
                        );
                        opts._progress.loaded = opts.loaded = loaded;
                        opts._progress.bitrate = opts.bitrate = opts._bitrateTimer.getBitrate(
                            now,
                            loaded,
                            self.options.apcTimeout
                        );
                        opts._time = now;
                        opts.total = r.total;

                        // Trigger a custom progress event with a total data property set
                        // to the file size(s) of the current upload and a loaded data
                        // property calculated accordingly:
                        self._trigger('progress', e, opts);
                        // Trigger a global progress event for all current file uploads,
                        // including ajax calls queued for sequential file uploads:
                        self._trigger('progressall', e, self._progress);
                    }
                    self._apcProgress(opts);
                }).fail(function(o) {}).always(function(o) {});
            }, this.options.apcTimeout);
        },

        // Override - If APC is enabled, we need to start upload progress timeouts now.
        // - We should also limit the concurrent uploads. (IE 8 and less may have max
        //   of 2 async ajax requests.)
        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
                if (options.postMessage) {
                    // Setting the dataType to postmessage enables the
                    // postMessage transport:
                    options.dataType = 'postmessage ' + (options.dataType || '');
                }
            } else {
                if (options.apc) {
                    options.apccode = false;
                    // If we are using APC, only let one file download at a time.
                    options.limitConcurrentUploads = 0;
                    // If we're using APC, set the APC progress listener.
                    this._apcProgress(options);
                }
                this._initIframeSettings(options);
            }
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            if (this.apct) {
                clearTimeout(this.apct);
            }
            // jqXHRorResult, textStatus and jqXHRorError are added to the
            // options object via done and fail callbacks
            this._trigger('always', null, options);
        }


    });
}));
