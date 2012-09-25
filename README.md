# lazySocialButtons
===================

A JavaScript plugin to place social buttons on a page on user interaction (mouseover) 
to spare the initial page load from the 300kb+ download requests for social APIs.

## Requires

* jQuery v1.4+

## Demo

Please see the [demo on jsFiddle.net](http://jsfiddle.net/BlueCockatoo/STths/) for usage and implementation.
Since this plugin has multiple configurations for loading and usage, the demo is helpful for understanding the order of includes.

## Loading

There are two ways to load the plugin on your page: 
* using a blocking script include via an HTML script tag
* loading the script non-blocking via dynamically injecting a script tag

### Blocking Script Load:

The script tag below should either be placed at the bottom of the body after the document HTML for both the HTML attribute usage and the JavaScript call usage. 
It could be placed at the top of the page for the JavaScript call usage, but only if the usage call is within a jQuery document.ready block.

```html
<script id="LazySocialButtonsScript" src="[your path]/lazySocialButtons.js"></script>
```

### Non-Blocking Script Load:
The loading block below should be placed at the bottom of the body after the document HTML for the HTML attribute usage.

```html
<script>
	function lsbReady() {
		$('#sharemetoo').lazySocialButtons({ shareUrl: 'http://godaddy.com' });
	};
	
	(function (loaded){
		var d = document, 
			id = 'LazySocialButtonsScript', 
			src = '[your path]/lazySocialButtons.js';
		var js, st = d.getElementsByTagName('script')[0];
		if (d.getElementById(id)) { return; }
		js = d.createElement('script');
		js.id = id;
		js.type = "text/javascript";
		js.async = true;
		js.src = src;
		st.parentNode.insertBefore(js, st);
		
		// if we have a callback, execute it
		if (typeof(loaded) === 'function') {
			(function checkLoaded() {
				if (!$.fn.lazySocialButtons) setTimeout(checkLoaded, 100);
				else loaded();
			})();
		}
	})(lsbReady);
</script>
```
**NOTE: The ID of 'LazySocialButtonsScript' must be specified for the automatic image pathing to occur (see below).**

## Usage

There are two ways the plugin may be initialized against HTML elements:
* via a JavaScript call any time after document ready
* at plugin load time via auto wire-up through HTML attribute decorations

### JavaScript call with full options:

Place an element in the HTML body where you want the buttons to appear.

```html
	<div id="shareme"></div>
```

Initialize the plugin against the element any time after the plugin script is loaded and the element is rendered on the page.

```html
<script>
$('#shareme').lazySocialButtons({
	shareUrl: 'http://godaddy.com',
	buttons: { facebook: true, google: true, twitter: true },
	facebook: {
		shareUrl: 'http://facebook.godaddy.com',
		hideCommentFlyout: false,
	},
	twitter: {
		shareUrl: 'http://twitter.godaddy.com',
		defaultText: 'Twitter on GoDaddy.com: ',
		hash: 'HotForTech',
		related: 'GoDaddy',
		via: 'twicodeer',
		reply: '35782000644194304'
	},
	google: {
		shareUrl: 'http://google.godaddy.com'
	},
	height: 20,
	imagePath: '[your image path]/'
});
</script>
```

### Decorated HTML tag with full options:

Place and element with HTML attributes in the HTML body where you want the buttons to appear.

```html
<div 
	class="lazysocialbuttons" 
	data-height="20" 
	data-twshareurl="http://twitter.godaddy.com"
	data-twtext="Twitter on GoDaddy.com: "
	data-twhash="HotForTech"
	data-twrelated="GoDaddy"
	data-twvia="twicodeer"
	data-twreply="35782000644194304"
	data-fbshareurl="http://facebook.godaddy.com"		
	data-gpshareurl="http://google.godaddy.com"
	data-shareurl="http://godaddy.com"
	data-buttons="google,facebook,twitter">
</div>   
```
**NOTE: class of 'lazysocialbuttons' *must* be specified.**

Any elements with the class will be initialized on plugin load.  
If you want to add decorated HTML to the DOM dynamically you can initialize the plugin on the element like so:

```html
<script>
	$('<div>')
		.attr({
			'data-twshareurl': http://twitter.godaddy.com',
			'data-twtext': 'Twitter on GoDaddy.com: ',
			'data-twhash': 'HotForTech',
			'data-twrelated': 'GoDaddy',
			'data-twvia': 'twicodeer',
			/* more attributes */
			'data-buttons': 'google,facebook,twitter' 
		})
		.appendTo(myButtonContainer)
		.lazySocialButtons({});
</script>
```

### Image Path specification
The plugin requires two images: one for a placeholder and a loading spinner.
There are three ways to specify the path where these images are located, the most appropriate depending on the type of usage of the plugin.

* If the images are located in the same directory as the plugin script, and the script tag has an id of 'LazySocialButtonsScript' then the path to the images will be derived relative to the script.
* If the images are located somewhere else and the plugin is initialized after page load, the option of imagePath may be specified.
* If the images are located somewhere else and the HTML attribute decorations with auto wire-up is chosen, then the following global variable must be defined prior to the script loading on the page:

```html
<script>
	var lazySocialButtonsImagePath = '[your path to images]/';
</script>
```

## Options

Option                                                    | Default                   | Description
----------------------------------------------------------|---------------------------|------------------
shareUrl [js], data-shareurl [html]                       |                           | The url that will be shared. If not specified, open graph tags will be queried. If no OG tags, then the page's location will be used.
google.shareUrl [js], data-gpshareurl [html]              |                           | The url that will be shared for the Google button. Defaults to shareUrl if not specified.
twitter.shareUrl [js], data-twshareurl [html]             |                           | The url that will be shared for the Twitter button. Defaults to shareUrl if not specified.
twitter.defaultText [js], data-twtext [html]              | 'Check out this site!'    | The text that will appear in the Twitter dialog when clicking on the button before the shared url.
twitter.hash [js], data-twhash [html]                     |                           | See [hashtags](https://dev.twitter.com/docs/intents#tweet-intent)
twitter.reply [js], data-twreply [html]                   |                           | See [in_reply_to](https://dev.twitter.com/docs/intents#tweet-intent)
twitter.via [js], data-twvia [html]                       |                           | See [via](https://dev.twitter.com/docs/intents#tweet-intent)
twitter.related [js], data-twrelated [html]               |                           | See [related](https://dev.twitter.com/docs/intents#tweet-intent)
facebook.shareUrl [js], data-fbshareurl [html]            |                           | The url that will be shared for the Facebook button. Defaults to shareUrl if not specified.
facebook.hideCommentFlyout [js], data-fbhideflyout [html] | false                     | Will hide the comment flyout that normally appears when clicking the Facebook Like button.
height [js], data-height [html]                           | 20                        | The height in pixels of the wrapping div for the buttons.
buttons [js], data-buttons [html]                         | facebook, google, twitter | The buttons that will be displayed. For html it is a comma delimited list, for js it is an object with each one desired as a property set to true.
containerFloat [js], data-float [html]                    |                           | The float position of the share container. If not specified, defaults to 'left'.
imagePath [js]                                            |                           | The path to the two required images. See the Image Path section above.


## License

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