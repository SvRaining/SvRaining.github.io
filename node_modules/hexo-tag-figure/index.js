/* global hexo */
'use strict'

var includes = require('array-includes')
var url = require('url')
var htmlTag = require('./lib/html_tag')

var rClass = /^[A-Za-z0-9-_]+$/
var rSize = /^\d+(?:|\.\d+)(?:%)?$/
var rMeta = /["']?([^"']+)?["']?\s*["']?([^"']+)?["']?/

/**
* Figure image tag
*
* Syntax:
*   {% figure [class names] /path/to/image [width] [height] [title text [alt text]] %}
*
*   e.g.:
*     {% figure alignleft fig-img /uploads/2016/12/test.png 100% 500 "test image. 'the alt'" %}
*/
hexo.extend.tag.register('figure', function(args) {
  function makeUrl(path) {
    if (path[0] === '#' || path.substring(0, 2) === '//') {
      return path
    }

    var data = url.parse(path)

    if (data && data.protocol) {
      return path
    }

    path = hexo.config.root + path

    return path.replace(/\/{2,}/g, '/')
  }

  function figureTag(args) {
    var classes = []
    var isLazy = false
    var src, width, height, title, alt

    // Find all class names
    while (args.length && rClass.test(args[0])) {
      classes.push(args.shift())
    }

    if (includes(classes, 'lazyload')) {
      isLazy = true
    }

    classes = classes.join(' ')

    // Get path of the image
    src = makeUrl(args.shift())

    if (args.length) {
      // Find image width
      if (rSize.test(args[0])) {
        width = args.shift()
        // and height
        if (args.length && rSize.test(args[0])) {
          height = args.shift()
        }
      }

      var meta = args.join(' ')

      // Find image title and alt
      if (meta && rMeta.test(meta)) {
        var match = meta.match(rMeta)
        title = match[1]
        alt = match[2]
      }
    }

    var imgAttrs = {
      src: src,
      width: width,
      height: height,
      title: title,
      alt: alt
    }
    var figHtml = '<figure'

    if (classes) {
      figHtml += ' class="' + classes + '"'
      if (isLazy) {
        imgAttrs = {
          'data-src': src,
          src: 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=',
          width: width,
          height: height,
          title: title,
          alt: alt
        }
      }
    }

    figHtml += '>' + htmlTag('img', imgAttrs)

    if (title) {
      figHtml += '<figcaption><p>' + title + '</p></figcaption>'
    }

    figHtml += '</figure>'

    return figHtml
  }

  return figureTag(args)
})
