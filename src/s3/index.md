---
title: "Dead Agent File Browser"
ogImgUrl: https://deadagent.net/img/siteOgImg.jpg
bodyClass: file-browser
---

# Dead Agent File Browser

<div id="navigation"></div>
<div id="listing"></div>

<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script type="text/javascript">
    var S3BL_IGNORE_PATH = true;
    var BUCKET_URL = 'https://deadagent.s3.amazonaws.com';
    var S3B_ROOT_DIR = '';
    var EXCLUDE_FILE = ['index.html', 'error.html']; // change to array to exclude multiple files
    var AUTO_TITLE = true;
</script>
<script type="text/javascript" src="/js/s3-bucket-listing.js"></script>
