

$secrets = @{
  "API_KEY" = ""
  "AUTH_DOMAIN" = ""
  "PROJECT_ID" = ""
  "STORAGE_BUCKET" = ""
  "MESSAGING_SENDER_ID" = ""
  "APP_ID" = ""
  "AES_PASS" = ""
}
foreach ($key in $secrets.Keys) {
  Write-Host "Setting secret $key"
  $value = $secrets[$key]
  $tempFile = [System.IO.Path]::GetTempFileName()
  
  # \r\n karakterlerini engellemek için StreamWriter kullan
  $sw = New-Object System.IO.StreamWriter($tempFile, $false, [System.Text.Encoding]::UTF8)
  $sw.Write($value)
  $sw.Close()

  firebase functions:secrets:set $key --data-file=$tempFile
  Remove-Item $tempFile
}
