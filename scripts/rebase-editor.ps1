param([string]$File)
(Get-Content $File) -replace '^pick 7b33aa3', 'edit 7b33aa3' | Set-Content $File
