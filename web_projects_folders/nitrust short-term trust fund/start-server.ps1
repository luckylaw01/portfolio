$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()

Write-Host 'NiTRUST Server running at http://localhost:8000/'
Write-Host 'Press Ctrl+C to stop the server'

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        
        $fullPath = Join-Path $PSScriptRoot $path.TrimStart('/')
        
        if (Test-Path $fullPath) {
            $content = [System.IO.File]::ReadAllBytes($fullPath)
            
            $response.ContentType = switch -Regex ($fullPath) {
                '\.html$' { 'text/html' }
                '\.css$' { 'text/css' }
                '\.js$' { 'application/javascript' }
                '\.json$' { 'application/json' }
                '\.png$' { 'image/png' }
                '\.jpg$' { 'image/jpeg' }
                '\.svg$' { 'image/svg+xml' }
                default { 'application/octet-stream' }
            }
            
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}
