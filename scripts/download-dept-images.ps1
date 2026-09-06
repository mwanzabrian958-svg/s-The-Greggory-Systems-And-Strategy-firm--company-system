# download-dept-images.ps1 — downloads themed royalty-free images for each department
$dest = "public\department-icons"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# department -> list of candidate URLs (first success wins; last resort = picsum seed)
$map = [ordered]@{
  "executive"  = @("https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&q=80&auto=format&fit=crop",
                   "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&q=80&auto=format&fit=crop")
  "development"= @("https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&q=80&auto=format&fit=crop",
                   "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80&auto=format&fit=crop")
  "consulting" = @("https://images.unsplash.com/photo-1552664730-d307ca884978?w=640&q=80&auto=format&fit=crop",
                   "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=640&q=80&auto=format&fit=crop")
  "delivery"   = @("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=640&q=80&auto=format&fit=crop",
                   "https://images.unsplash.com/photo-1566576721346-d4a3b7eaeb27?w=640&q=80&auto=format&fit=crop")
  "design"     = @("https://images.unsplash.com/photo-1561070791-2526d30994b5?w=640&q=80&auto=format&fit=crop",
                   "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=640&q=80&auto=format&fit=crop")
  "sales"      = @("https://images.unsplash.com/photo-1560250097-0b93528c311a?w=640&q=80&auto=format&fit=crop",
                   "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=640&q=80&auto=format&fit=crop")
  "research"   = @("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&q=80&auto=format&fit=crop",
                   "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=640&q=80&auto=format&fit=crop")
  "operations" = @("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=640&q=80&auto=format&fit=crop",
                   "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=640&q=80&auto=format&fit=crop")
}

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
foreach ($name in $map.Keys) {
  $out = Join-Path $dest "$name.jpg"
  $done = $false
  foreach ($url in $map[$name]) {
    try {
      Invoke-WebRequest -Uri $url -OutFile $out -UserAgent $ua -TimeoutSec 25 -ErrorAction Stop
      $len = (Get-Item $out).Length
      if ($len -gt 5000) { Write-Host "OK  $name.jpg  ($([math]::Round($len/1KB)) KB)"; $done = $true; break }
    } catch { Write-Host "FAIL $name <- $url" }
  }
  if (-not $done) {
    try {
      Invoke-WebRequest -Uri "https://picsum.photos/seed/$name/640/440" -OutFile $out -UserAgent $ua -TimeoutSec 25 -ErrorAction Stop
      Write-Host "FALLBACK $name.jpg ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
    } catch { Write-Host "TOTAL-FAIL $name" }
  }
}
# copy the 5 existing pngs so ALL tiles come from public/ (prod-safe)
foreach ($p in @("webmaster","finance","it","hr","marketing","projects")) {
  $src = "src\assets\department-icons\$p.png"
  if (Test-Path $src) { Copy-Item $src (Join-Path $dest "$p.png") -Force; Write-Host "COPIED $p.png" }
}
Write-Host "=== FINAL CONTENTS ==="
Get-ChildItem $dest | Select-Object Name, Length