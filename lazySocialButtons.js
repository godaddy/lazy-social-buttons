/* 
==============================================================================
Plugin: lazySocialButtons.js
Author: Lindsay Donaghe
Project URL: https://github.com/godaddy/lazy-social-buttons
License:
The MIT License (MIT)

Copyright (c) 2012 Go Daddy Operating Company, LLC

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included 
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
============================================================================== 
*/
(function ($)
{
    // initialize each selected element
    function LazySocialButtons(el, options, id)
    {
        this.id = id;
        this.element = el;

        // pick up element decorations to load options
        if ($.isEmptyObject(options)) options = this.gatherOptions();

        // merge in user defined options with defaults
        var ops = $.extend(true, {}, this.options, options);
        ops.shareUrl = this.getShareUrl(ops.shareUrl);

        // override manually to preserve deletions
        if (options.buttons) ops.buttons = options.buttons;
        // set up data-dependent defaults
        ops = $.extend(true, ops, {
            buttons: { google: this.isIE(7) ? false : ops.buttons.google },
            facebook: {
                shareUrl: ops.facebook.shareUrl ? ops.facebook.shareUrl : ops.shareUrl
            },
            twitter: {
                shareUrl: ops.twitter.shareUrl ? ops.twitter.shareUrl : ops.shareUrl
            },
            google: {
                shareUrl: ops.google.shareUrl ? ops.google.shareUrl : ops.shareUrl
            }
        });
        this.options = ops;

        this.baseClass = 'lazysocialbuttons';
        // override image path if specified in options
        this.imagePath = typeof (this.options.imagePath) !== 'undefined' ? this.options.imagePath : this.imagePath;
        this.element.addClass(this.baseClass);
        this.facebookApi = new this.apis('facebook', this.options.buttons);
        this.twitterApi = new this.apis('twitter', this.options.buttons);
        this.googleApi = new this.apis('google', this.options.buttons);
        this.builders = new this.builders(this);

        this.create();
    }

    var proto = LazySocialButtons.prototype;

    // option defaults
    proto.options = {
        shareUrl: null,
        imagePath: undefined,
        containerFloat: 'left',
        buttons: { facebook: true, google: true, twitter: true },
        facebook: {
            shareUrl: null,
            hideCommentFlyout: false
        },
        twitter: {
            shareUrl: null,
            defaultText: 'Check out this site!'
        },
        google: {
            shareUrl: null
        },
        height: 20
    };

    // pull option values from data attributes if supplied
    proto.gatherOptions = function ()
    {
        var ops = {};
        var el = this.element;

        if (el.attr('data-shareurl')) ops.shareUrl = el.attr('data-shareurl');
        if (el.attr('data-float')) ops.containerFloat = el.attr('data-float');
        if (el.attr('data-height')) ops.height = el.attr('data-height');

        if (el.attr('data-buttons'))
        {
            ops.buttons = {};
            var buttons = el.attr('data-buttons').split(',');
            for (var i = 0; i < buttons.length; i++)
            {
                ops.buttons[$.trim(buttons[i])] = true;
            }
        }

        if (!ops.facebok)
            ops.facebook = {};
        if (el.attr('data-fbshareurl')) ops.facebook.shareUrl = el.attr('data-fbshareurl');
        if (el.attr('data-fbhideflyout')) ops.facebook.hideCommentFlyout = el.attr('data-fbhideflyout') === "true";
        if (!ops.twitter)
            ops.twitter = {};
        if (el.attr('data-twshareurl')) ops.twitter.shareUrl = el.attr('data-twshareurl');
        if (el.attr('data-twtext')) ops.twitter.defaultText = el.attr('data-twtext');
        if (el.attr('data-twhash')) ops.twitter.hash = el.attr('data-twhash');
        if (el.attr('data-twreply')) ops.twitter.reply = el.attr('data-twreply');
        if (el.attr('data-twvia')) ops.twitter.via = el.attr('data-twvia');
        if (el.attr('data-twrelated')) ops.twitter.related = el.attr('data-twrelated');
        if (el.attr('data-gpshareurl')) ops.google = { shareUrl: el.attr('data-gpshareurl') };

        return ops;
    };

    // derive the base share url
    proto.getShareUrl = function (shareUrl)
    {
        if (shareUrl === null)
        { // auto-detect
            var grabOgUrl = function ()
            {
                var ogUrlMeta = $('meta[property="og:url"]');
                if (ogUrlMeta.length == 0) return '';
                return ogUrlMeta.attr('content');
            };

            var grabRelCanonicalUrl = function ()
            {
                var canonicalLink = $('link[rel="canonical"]');
                if (canonicalLink.length == 0) return '';
                return canonicalLink.attr('href');
            };

            shareUrl = grabOgUrl();
            if (shareUrl.length == 0)
            {
                shareUrl = grabRelCanonicalUrl();
                if (shareUrl.length == 0)
                {
                    oshareUrl = window.location.href; // last resort
                }
            }
        }

        return shareUrl;
    };

    // This is a way to specify the image path in the case of the
    // auto wiring up of social buttons via the HTML attribute
    // decorations on plugin load.  Since you can't initialize
    // the plugin before that to pass it as an option, a global
    // variable can be defined early on the page that holds the
    // path. Yes, not ideal, but one way around the issue.
    proto.imagePath = typeof (lazySocialButtonsImagePath) === 'undefined' ? undefined : lazySocialButtonsImagePath;

    // This function is a second "automatic" option for getting the 
    // path for the two images when using the HTML attribute auto
    // wireup.  This assumes your script is served from the same 
    // location as the images. If not, update to your needs or 
    // use the global variable specified above.
    proto.getImagePath = function ()
    {
        if (typeof (proto.imagePath) === 'undefined')
        {
            var src = $(document).find('script[id="LazySocialButtonsScript"]').attr('src').toLowerCase();
            src = src.replace(/(lazysocialbuttons(\.min)?\.js)/gi, '');
            proto.imagePath = src;
        }
        return proto.imagePath;
    };

    // helper to determine IE version
    proto.isIE = function (cap)
    {
        var verified = $.browser.msie;
        if (verified && cap && typeof (cap) === 'number')
        {
            verified = parseInt($.browser.version.substring(0, 1)) <= cap;
            // make sure that compatibility mode is not turned on 
            // which will trick us into not showing Google when it 
            // could be shown.
            if (verified) verified = (typeof (document.documentMode) !== 'number' || document.documentMode <= cap);
            if (verified && cap <= 7) verified = navigator.userAgent.indexOf('Trident') < 0;
        }

        return verified;
    };

    // API config and initialization
    proto.apis = function (service, buttons)
    {
        var apis = this;

        this.loadScript = function (service, async)
        {
            var d = document, s = 'script', id = apis[service].scriptId, src = apis[service].path;
            var js, st = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s);
            js.id = id;
            js.type = "text/javascript";
            js.async = async;
            js.src = src;
            var attributes = apis[service].attributes;
            if ($.isPlainObject(attributes))
            {
                for (var attr in attributes)
                {
                    if (attributes.hasOwnProperty(attr)) js[attr] = attributes[attr];
                }
            }
            st.parentNode.insertBefore(js, st);
        };
        // performs a callback once an API is fully loaded.
        // injecting the script on the page is not enough to
        // declare it loaded... in some cases the APIs have 
        // to have certain objects accessible on the page
        // as well.  This ensures the callback isn't called
        // until all criteria for fully loading are met.
        this.ready = function (service, callback)
        {
            if (!$.isFunction(callback) || !buttons[service]) return;
            var me = this[service];

            if (!me.triggeredApiLoad)
            {
                apis.loadJsApi(service, callback);
                return;
            }
            var scriptInDom = $('script#' + me.scriptId).length > 0;
            if (!scriptInDom || !me.testLoaded())
            {
                setTimeout(function () { apis.ready(service, callback); }, 100);
            }
            else callback();
        };
        // loads an API and performs a callback once loaded
        this.loadJsApi = function (service, loaded)
        {
            var me = this[service];
            if (!buttons[service]) return;
            var isLoaded = apis.apiIsLoaded(service);
            if (!isLoaded)
            {
                if ($.isFunction(me.preload)) me.preload();
                apis.loadScript(service, true);
                if ($.isFunction(me.postload)) me.postload();
            }
            me.triggeredApiLoad = true;
            apis.ready(service, loaded);
        };
        // test to see if an API is loaded
        this.apiIsLoaded = function (service)
        {
            var me = this[service];
            var scriptInDom = $('script#' + me.scriptId).length > 0;
            return (scriptInDom && me.testLoaded());
        };
        // API details for Facebook
        this.facebook = {
            path: 'https://connect.facebook.net/en_US/all.js#xfbml=1',
            scriptId: 'facebook-jssdk',
            triggeredApiLoad: false,
            preload: function ()
            {
                // load facebook js sdk
                var fbRoot = $('#fb-root');
                if (fbRoot.length == 0) $('body').append('<div id="fb-root" />');
            },
            testLoaded: function () { return (typeof (window.FB) !== 'undefined'); }
        };
        // API details for Google+
        this.google = {
            path: "//apis.google.com/js/plusone.js",
            scriptId: 'google-jssdk',
            attributes: { lang: 'en-Us', parsetags: 'explicit' },
            triggeredApiLoad: false,
            postload: function ()
            {
                window.___gcfg = {
                    lang: 'en-US',
                    parsetags: 'explicit'
                };
            },
            testLoaded: function () { return (typeof (gapi) !== 'undefined'); }
        };
        // API details for Twitter
        this.twitter = {
            path: "//platform.twitter.com/widgets.js",
            scriptId: 'twitter-wjs',
            triggeredApiLoad: false,
            testLoaded: function () { return (typeof (twttr) !== 'undefined'); }
        };

        // expose public methods
        return {
            load: function (loaded) { return apis.loadJsApi(service, loaded); },
            ready: function (loaded) { return apis.ready(service, loaded); },
            isLoaded: function () { return apis.apiIsLoaded(service); }
        };
    };

    // All the UI construction and configuration for each API
    // The HTML content is loaded before API load and the
    // configuration is called after.
    proto.builders = function (module)
    {
        var $m = module;

        this.facebook = {
            content: function (container)
            {
                if ($m.options.buttons.facebook === true)
                {
                    var el = $('<div />')
                        .addClass('lsbfbbox')
                        .attr('id', 'lsbfbbox-' + $m.id)
                        .css({
                            overflow: 'hidden',
                            width: '90px',
                            height: '20px',
                            'vertical-align': 'top',
                            position: 'relative',
                            display: 'inline-block',
                            'float': 'left',
                            'background': 'transparent url(' + $m.getImagePath() + 'images/sf-share-strip-preload.png) no-repeat -195px 0'
                        })
                        .append(
                            $('<div />')
                                .addClass('fb-like')
                                .attr('data-layout', 'button_count')
                                .attr('data-href', $m.options.facebook.shareUrl)
                                .attr('data-send', 'false')
                                .attr('data-show-faces', 'false')
                                .attr('data-colorscheme', 'light')
                                .attr('data-sfid', $m.id)
                        );
                    if ($m.isIE(7)) el.css({ zoom: '1', display: 'inline' });

                    container.append(el);
                }
            },
            configure: function ()
            {
                if (!$m.options.buttons.facebook) return;

                var loadit = function ()
                {
                    var fbRootSel = '#lsbfbbox-' + $m.id;
                    var fbEl = $(fbRootSel);
                    fbEl.css('background', 'transparent url(' + $m.getImagePath() + 'images/sf-spinner.gif) no-repeat 50% 50%');
                    FB.XFBML.parse(fbEl[0], function ()
                    {
                        var fbFrame = $(fbRootSel).find('iframe');
                        // prevent the comment flyout from showing if option specified
                        var ops = {
                            overflow: ($m.options.facebook.hideCommentFlyout ? 'hidden' : ''),
                            'background': ''
                        };
                        var fbWidth = fbFrame.width();
                        ops.width = fbWidth > 0 && fbWidth < 100 ? fbWidth : 100;
                        if ($m.isIE(7)) ops.position = 'relative';

                        $(fbRootSel).css(ops);
                    });
                };

                $m.facebookApi.ready(loadit);
            }
        };
        this.twitter = {
            content: function (container)
            {
                if ($m.options.buttons.twitter === true)
                {
                    var a = $('<a />')
                                .attr('href', 'https://twitter.com/share')
                                .addClass('twitter-share-button')
                                .attr('data-count', 'none')
                                .attr('data-url', $m.options.twitter.shareUrl)
                                .attr('data-text', $m.options.twitter.defaultText)
                    ;
                    if ($m.options.twitter.hash)
                        a.attr('data-hashtags', $m.options.twitter.hash);
                    if ($m.options.twitter.reply)
                        a.attr('data-in_reply_to', $m.options.twitter.reply);
                    if ($m.options.twitter.via)
                        a.attr('data-via', $m.options.twitter.via);
                    if ($m.options.twitter.related)
                        a.attr('data-related', $m.options.twitter.related);
                    var el = $('<div />')
                        .addClass('lsbtwbox')
                        .attr('id', 'lsbtwbox-' + $m.id)
                        .css({
                            'vertical-align': 'top',
                            position: 'relative',
                            width: '60px',
                            overflow: 'hidden',
                            height: '20px',
                            marginRight: '10px',
                            display: 'inline-block',
                            'float': 'left',
                            'background': 'transparent url(' + $m.getImagePath() + 'images/sf-share-strip-preload.png) no-repeat -84px 0'
                        })
                       .append(a);
                    //if ($m.isIE(7)) el.css({ zoom: '1', display: 'inline' });

                    container.append(el);
                }
            },
            configure: function ()
            {
                if (!$m.options.buttons.twitter) return;

                var twboxSel = '#lsbtwbox-' + $m.id;
                $(twboxSel).css('background', 'transparent url(' + $m.getImagePath() + 'images/sf-spinner.gif) no-repeat 50% 50%');

                $m.twitterApi.ready(function ()
                {
                    var finish = function ()
                    {
                        var frame = $(twboxSel).find('iframe');
                        if (frame.length <= 0) setTimeout(loadit, 1000);
                        else $(twboxSel).css('background', '');
                    };

                    (function loadit()
                    {
                        try
                        {
                            twttr.widgets.load();
                            finish();
                        }
                        catch (ex)
                        {
                            setTimeout(loadit, 100);
                        }
                    })();
                });
            }
        };
        this.google = {
            content: function (container)
            {
                if ($m.options.buttons.google === true)
                {
                    var el = $('<div />')
                        .addClass('lsbgpbox')
                        .attr('id', 'lsbgpbox-' + $m.id)
                        .css({
                            position: 'relative',
                            width: '33px',
                            overflow: 'hidden',
                            height: '20px',
                            display: 'inline-block',
                            marginRight: '10px',
                            'float': 'left',
                            'background': 'transparent url(' + $m.getImagePath() + 'images/sf-share-strip-preload.png) no-repeat 0 0'
                        });
                    // This is a workaround to get around an IE8 bug (version 8.0.7600.16385 only) 
                    // See  http://stackoverflow.com/questions/6877583/adding-a-google-1-button-after-page-load-in-ie-8 
                    var gPlusOne = document.createElement('g:plusone');
                    gPlusOne.setAttribute("size", "medium");
                    gPlusOne.setAttribute("annotation", 'none');
                    gPlusOne.setAttribute("width", '33');
                    gPlusOne.setAttribute("recommendations", 'false');
                    gPlusOne.setAttribute("href", $m.options.google.shareUrl);
                    el[0].appendChild(gPlusOne);
                    // end workaround
                    container.append(el);
                }
            },
            configure: function ()
            {
                if (!$m.options.buttons.google) return;

                var gpboxSel = '#lsbgpbox-' + $m.id;
                $(gpboxSel).css('background', 'transparent url(' + $m.getImagePath() + 'images/sf-spinner.gif) no-repeat 50% 50%');

                $m.googleApi.ready(function ()
                {
                    var finish = function ()
                    {
                        var frame = $(gpboxSel).find('iframe');
                        if (frame.length <= 0) setTimeout(loadit, 500);
                        else $(gpboxSel).css('background', '');
                    };

                    (function loadit()
                    {
                        try
                        {
                            window.gapi.plusone.go($(gpboxSel)[0]);
                            finish();
                        }
                        catch (ex)
                        {
                            setTimeout(loadit, 100);
                        }
                    })();

                });
            }
        };

        return this;
    };

    // launch all configures
    proto.configure = function ()
    {
        var b = this.builders;

        b.facebook.configure(this.holder);
        b.google.configure(this.holder);
        b.twitter.configure(this.holder);
    };

    // load all content
    proto.content = function ()
    {
        var b = this.builders;

        b.google.content(this.holder);
        b.twitter.content(this.holder);
        b.facebook.content(this.holder);
    };

    // kick off the plugin functionality
    proto.create = function ()
    {
        this.element.height(this.options.height);

        // create an element to hold all the buttons
        this.holder = $('<div>')
            .css({
                position: 'relative',
                'float': this.options.containerFloat,
                height: this.options.height
            });
        if (this.isIE(7)) this.holder.css({ zoom: '1', display: 'inline' });

        this.content();

        this.element
            .append(this.holder)
            .append('<div style="clear:both;"></div>'); // be nice to the DOM

        // the on demand part
        if (!(this.googleApi.isLoaded() && this.twitterApi.isLoaded() && this.facebookApi.isLoaded()))
        {
            // bind the mouseover to load the APIs
            this.holder.bind('mouseover.lsb', function ()
            {
                var shares = $('.lazysocialbuttons');
                shares.unbind('mouseover.lsb');

                // go ahead and fix any other instances on the page
                // since there's no reason to hide them with the
                // APIs loaded for one instance.
                shares.each(function (i)
                {
                    var share = $fn.instances[$(this).attr('id')];
                    if (share && share.module)
                    {
                        share.module.configure();
                    }
                });
            });
            this.holder.addClass('lazysocialbuttons');
        }
        // if all APIs is loaded, go ahead and configure
        else
            this.configure();

    };

    // set up the jQuery plugin
    var $fn = $.fn.lazySocialButtons = function (options, more)
    {
        // plugin globals
        if (!$fn.instances)
        {
            $fn.instances = {};
        }

        // loop thru each element in selector (this) to get the party started
        var retVal = this;
        this.each(function (idx)
        {
            var id = $(this).attr('id');
            var instance = $fn.instances[id];

            if (!instance)
            {
                // build the module and store a reference            
                var $el = $(this);
                // provide an id if one doesn't exist
                if (id == null || id.length == 0)
                {
                    id = 'lsb' + Math.round(Math.random() * 65535);
                    $el.attr('id', id);
                }
                // build the new instance and add it to our collection
                var instance = $fn.instances[id] = {};
                $fn.instances[id].module = new LazySocialButtons($el, options, id);
            }
        });

        return retVal;
    };

    // automatically wire up any that are on the page decorated with attributes
    $('.lazysocialbuttons').lazySocialButtons({});

    return $fn;

})(jQuery);