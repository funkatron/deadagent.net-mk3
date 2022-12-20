/*
Copyright 2012-2016 Rufus Pollock.

Licensed under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

if (typeof AUTO_TITLE != 'undefined' && AUTO_TITLE == true) {
  document.title = location.hostname;
}

if (typeof S3_REGION != 'undefined') {
  var BUCKET_URL = location.protocol + '//' + location.hostname + '.' + S3_REGION + '.amazonaws.com'; // e.g. just 's3' for us-east-1 region
  var BUCKET_WEBSITE_URL = location.protocol + '//' + location.hostname;
}

if (typeof S3BL_IGNORE_PATH == 'undefined' || S3BL_IGNORE_PATH != true) {
  var S3BL_IGNORE_PATH = false;
}

if (typeof BUCKET_URL == 'undefined') {
  var BUCKET_URL = location.protocol + '//' + location.hostname;
}

if (typeof BUCKET_NAME != 'undefined') {
  // if bucket_url does not start with bucket_name,
  // assume path-style url
  if (!~BUCKET_URL.indexOf(location.protocol + '//' + BUCKET_NAME)) {
    BUCKET_URL += '/' + BUCKET_NAME;
  }
}

if (typeof BUCKET_WEBSITE_URL == 'undefined') {
  var BUCKET_WEBSITE_URL = BUCKET_URL;
}

if (typeof S3B_ROOT_DIR == 'undefined') {
  var S3B_ROOT_DIR = '';
}

if (typeof S3B_SORT == 'undefined') {
  var S3B_SORT = 'DEFAULT';
}

if (typeof EXCLUDE_FILE == 'undefined') {
  var EXCLUDE_FILE = [];
} else if (typeof EXCLUDE_FILE == 'string') {
  var EXCLUDE_FILE = [EXCLUDE_FILE];
}

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1.
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

jQuery(function ($) { getS3Data(); });

// This will sort your file listing by most recently modified.
// Flip the comparator to '>' if you want oldest files first.
function sortFunction(a, b) {
  switch (S3B_SORT) {
    case "OLD2NEW":
      return a.LastModified > b.LastModified ? 1 : -1;
    case "NEW2OLD":
      return a.LastModified < b.LastModified ? 1 : -1;
    case "A2Z":
      return a.Key < b.Key ? 1 : -1;
    case "Z2A":
      return a.Key > b.Key ? 1 : -1;
    case "BIG2SMALL":
      return a.Size < b.Size ? 1 : -1;
    case "SMALL2BIG":
      return a.Size > b.Size ? 1 : -1;
  }
}

function getS3Data(marker, html) {
  var s3_rest_url = createS3QueryUrl(marker);
  // set loading notice
  $('#listing')
    .html('<img src="//assets.okfn.org/images/icons/ajaxload-circle.gif" />');
  $.get(s3_rest_url)
    .done(function (data) {
      // clear loading notice
      $('#listing').html('');
      var xml = $(data);
      var info = getInfoFromS3Data(xml);

      // Slight modification by FuzzBall03
      // This will sort your file listing based on var S3B_SORT
      // See url for example:
      // http://esp-link.s3-website-us-east-1.amazonaws.com/
      if (S3B_SORT != 'DEFAULT') {
        var sortedFiles = info.files;
        sortedFiles.sort(sortFunction);
        info.files = sortedFiles;
      }

      buildNavigation(info);

      // Add a <base> element to the document head to make relative links
      // work even if the URI does not contain a trailing slash
      var base = window.location.href
      base = (base.endsWith('/')) ? base : base + '/';
      $('head').append('<base href="' + base + '">');

      html = typeof html !== 'undefined' ? html + prepareTable(info) :
        prepareTable(info);
      if (info.nextMarker != "null") {
        getS3Data(info.nextMarker, html);
      } else {
        document.getElementById('listing').innerHTML = html;
      }
    })
    .fail(function (error) {
      console.error(error);
      $('#listing').html('<strong>Error: ' + error + '</strong>');
    });
}

function buildNavigation(info) {
  var baseUrl = S3BL_IGNORE_PATH == false ? '/' : '?prefix=';
  var root = '<a href="' + baseUrl + '">' + BUCKET_WEBSITE_URL + '</a> / ';
  if (info.prefix) {
    var processedPathSegments = '';
    var content = $.map(info.prefix.split('/'), function (pathSegment) {
      processedPathSegments =
        processedPathSegments + encodeURIComponent(pathSegment) + '/';
      return '<a href="' + baseUrl + processedPathSegments + '">' +
        pathSegment + '</a>';
    });
    $('#navigation').html(root + content.join(' / '));
  } else {
    $('#navigation').html(root);
  }
}

function createS3QueryUrl(marker) {
  var s3_rest_url = BUCKET_URL;
  s3_rest_url += '?delimiter=/';

  //
  // Handling paths and prefixes:
  //
  // 1. S3BL_IGNORE_PATH = false
  // Uses the pathname
  // {bucket}/{path} => prefix = {path}
  //
  // 2. S3BL_IGNORE_PATH = true
  // Uses ?prefix={prefix}
  //
  // Why both? Because we want classic directory style listing in normal
  // buckets but also allow deploying to non-buckets
  //

  var rx = '.*[?&]prefix=' + S3B_ROOT_DIR + '([^&]+)(&.*)?$';
  var prefix = '';
  if (S3BL_IGNORE_PATH == false) {
    var prefix = location.pathname.replace(/^\//, S3B_ROOT_DIR);
  }
  var match = location.search.match(rx);
  if (match) {
    prefix = S3B_ROOT_DIR + match[1];
  } else {
    if (S3BL_IGNORE_PATH) {
      var prefix = S3B_ROOT_DIR;
    }
  }
  if (prefix) {
    // make sure we end in /
    var prefix = prefix.replace(/\/$/, '') + '/';
    s3_rest_url += '&prefix=' + prefix;
  }
  if (marker) {
    s3_rest_url += '&marker=' + marker;
  }
  return s3_rest_url;
}

function getInfoFromS3Data(xml) {
  var files = $.map(xml.find('Contents'), function (item) {
    item = $(item);
    // clang-format off
    var attributes = {
      Key: item.find('Key').text(),
      LastModified: item.find('LastModified').text(),
      Size: bytesToHumanReadable(item.find('Size').text()),
      Type: 'file'
    }
    // clang-format on
    var lm = new Date(attributes.LastModified);
    attributes.LastModifiedString = lm.toLocaleString();
    return attributes
  });
  var directories = $.map(xml.find('CommonPrefixes'), function (item) {
    item = $(item);
    // clang-format off
    return {
      Key: item.find('Prefix').text(),
      LastModified: '',
      LastModifiedString: '',
      Size: '0',
      Type: 'directory'
    }
    // clang-format on
  });
  if ($(xml.find('IsTruncated')[0]).text() == 'true') {
    var nextMarker = $(xml.find('NextMarker')[0]).text();
  } else {
    var nextMarker = null;
  }
  // clang-format off
  return {
    files: files,
    directories: directories,
    prefix: $(xml.find('Prefix')[0]).text(),
    nextMarker: encodeURIComponent(nextMarker)
  }
  // clang-format on
}

// info is object like:
// {
//    files: ..
//    directories: ..
//    prefix: ...
// }
function prepareTable(info) {
  var files = info.directories.concat(info.files), prefix = info.prefix;
  var cols = [45, 30, 15];
  var content = [];
  content.push('<table>')
  content.push('<thead>')
  content.push('<th>Last Modified</th><th>Size</th><th>Key</th>')
  content.push('</thead>');

  content.push('<tbody>');
  // add ../ at the start of the dir listing, unless we are already at root dir
  if (prefix && prefix !== S3B_ROOT_DIR) {
    var up = prefix.replace(/\/$/, '').split('/').slice(0, -1).concat('').join('/'),  // one directory up
      item =
      {
        Key: up,
        LastModified: '',
        LastModifiedString: '',
        Size: '',
        keyText: '../',
        href: S3BL_IGNORE_PATH ? '?prefix=' + up : '../'
      },
      row = renderRow(item, cols);
    content.push(row);
  }

  jQuery.each(files, function (idx, item) {
    // strip off the prefix
    item.keyText = item.Key.substring(prefix.length);
    if (item.keyText.length < 1) { // this would be the current directory
      return;
    }
    if (item.Type === 'directory') {
      if (S3BL_IGNORE_PATH) {
        item.href = location.protocol + '//' + location.hostname + ":" + location.port +
          location.pathname + '?prefix=' + encodePath(item.Key);
      } else {
        item.href = encodePath(item.keyText);
      }
    } else {
      console.log(BUCKET_WEBSITE_URL, item);
      item.href = BUCKET_WEBSITE_URL + '/' + encodePath(item.Key);
    }
    var row = renderRow(item, cols);
    if (!EXCLUDE_FILE.includes(item.Key))
      content.push(row);
  });
  content.push('</tbody>');
  content.push('</table>');


  return content.join('\n');
}

// Encode everything but "/" which are significant in paths and to S3
function encodePath(path) {
  return encodeURIComponent(path).replace(/%2F/g, '/')
}

function renderRow(item, cols) {
  var row = '<tr>';
  row += "<td>" + item.LastModifiedString + "</td>";
  row += "<td>" + item.Size + "</td>";
  row += '<td><a href="' + item.href + '">' + item.keyText + '</a></td>';
  row += '</tr>'
  return row;
}

function padRight(padString, length) {
  var str = padString.slice(0, length - 3);
  if (padString.length > str.length) {
    str += '...';
  }
  while (str.length < length) {
    str = str + ' ';
  }
  return str;
}

function bytesToHumanReadable(sizeInBytes) {
  var i = -1;
  var units = [' kB', ' MB', ' GB'];
  do {
    sizeInBytes = sizeInBytes / 1024;
    i++;
  } while (sizeInBytes > 1024);
  return Math.max(sizeInBytes, 0.1).toFixed(1) + units[i];
}
