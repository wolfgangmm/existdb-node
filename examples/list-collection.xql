xquery version "3.0";

declare namespace json="http://www.json.org";

declare variable $collection external;

declare option exist:serialize "method=json media-type=application/json";

for $resource in xmldb:get-child-resources($collection)
let $lastModified := xmldb:last-modified($collection, $resource)
return
    <json:value json:array="true">
        <name>{$resource}</name>
        <modified>{format-dateTime($lastModified, "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]")}</modified>
        <permissions>{xmldb:permissions-to-string(xmldb:get-permissions($collection, $resource))}</permissions>
    </json:value>