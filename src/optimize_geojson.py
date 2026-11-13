
import json
from pathlib import Path

source = Path("public/assets/geo/barangays.geojson")
target = Path("public/assets/geo/barangays-optimized.geojson")

# Keep identifiers and names commonly needed by GIS
KEEP_FIELDS = {
    "ADM4_EN",
    "ADM4_PCODE",
    "ADM3_EN",
    "ADM3_PCODE",
    "ADM2_EN",
    "ADM2_PCODE",
    "ADM1_EN",
    "ADM1_PCODE",
    "psgc_id",
    "psgc_code",
    "psgc_name",
}

with source.open("r", encoding="utf-8") as f:
    data = json.load(f)

optimized_features = []

for feature in data.get("features", []):
    props = feature.get("properties") or {}

    optimized_features.append({
        "type": "Feature",
        "geometry": feature.get("geometry"),
        "properties": {
            key: value
            for key, value in props.items()
            if key in KEEP_FIELDS
        }
    })

optimized = {
    "type": "FeatureCollection",
    "features": optimized_features
}

with target.open("w", encoding="utf-8") as f:
    json.dump(
        optimized,
        f,
        separators=(",", ":"),
        ensure_ascii=False
    )

original_size = source.stat().st_size / 1048576
optimized_size = target.stat().st_size / 1048576

print("\n=== OPTIMIZATION RESULTS ===")
print(f"Original: {original_size:.2f} MiB")
print(f"Optimized: {optimized_size:.2f} MiB")
print(f"Features: {len(optimized_features)}")
print("Geometry: Preserved without simplification")

if optimized_size < 25:
    print("SUCCESS: Below Cloudflare 25 MiB limit")
else:
    print("WARNING: Further optimization needed")
