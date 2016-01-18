I am the other index.

When jus runs, it should update the relative paths, but not the absolute ones.

## things with href

- absolute: <a href="http://mango.com">mango.com</a>
- protocol-relative: <a href="//coconut-cdn.com">coconut-cdn.com</a>
- relative: <a href="other/papayas">papayas</a>
- relative with leading slash: <a href="/grapes">grapes</a>

## things with src

- absolute: <img src="https://guava.com/logo.png">
- protocol-relative: <img src="//guava-relative.com/logo.png">
- leading-slashy: <img src="/guava-leading-slashy.png">
- relative: <img id="guava-relative-link" src="other/guava.png">
- script, too: <script id="banana-script" src="other/banana.js">
