# JSON to HTML Converter

Converts JSON data to HTML table with collapsible details view for nested objects. Check site for sample outputs.

<a href="https://nikhil-vartak.github.io/json-to-html-converter">https://nikhil-vartak.github.io/json-to-html-converter</a>

<h2>Usage</h2>

<pre style="display:block">var j2ht = new J2HConverter(&lt;json_string&gt;, &lt;id_of_container_element&gt;);
j2ht.convert();</pre>

Additionally, table attributes can be set using object:

<pre style="display:block">j2ht.attributes = { class: &lt;css_class/es&gt; };</pre>
