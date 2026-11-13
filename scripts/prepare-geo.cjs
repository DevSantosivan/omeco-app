const fs = require('fs');
const crypto = require('crypto');
const source = 'C:/Ivan-dev/PROJECTS/TYPHOONIMPACT-MIN/frontend/public/assets/barangays.geojson';
const destination = 'public/assets/geo/barangays.geojson';
const raw = fs.readFileSync(destination); const geo = JSON.parse(raw);
if (geo.type !== 'FeatureCollection' || !Array.isArray(geo.features)) throw Error('Invalid collection');
let coordinates=0, invalid=0, unclosed=0; const extent=[180,90,-180,-90]; const types={};
for(const f of geo.features){types[f.geometry?.type]=(types[f.geometry?.type]||0)+1;if(!['Polygon','MultiPolygon'].includes(f.geometry?.type))throw Error('Unexpected geometry');const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const rings of polygons)for(const ring of rings){if(ring.length<4||JSON.stringify(ring[0])!==JSON.stringify(ring.at(-1)))unclosed++;for(const [lon,lat] of ring){coordinates++;if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)invalid++;extent[0]=Math.min(extent[0],lon);extent[1]=Math.min(extent[1],lat);extent[2]=Math.max(extent[2],lon);extent[3]=Math.max(extent[3],lat);}}}
if(invalid||unclosed)throw Error('Invalid coordinates or rings');
const features=geo.features.filter(f=>f.properties.ADM2_EN==='Occidental Mindoro');
const serviceFeatures=features.filter(f=>!['Looc','Lubang'].includes(f.properties.ADM3_EN));
const inside=(p,ring)=>{let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
const pointIn=(p,rings)=>inside(p,rings[0])&&!rings.slice(1).some(r=>inside(p,r));
function interior(f){const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const rings of [...polygons].sort((a,b)=>b[0].length-a[0].length)){const ring=rings[0];const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);for(let step=0;step<40;step++)for(let x=0;x<=step;x++){const p=[minX+(maxX-minX)*(x+.5)/(step+1),minY+(maxY-minY)*(step-x+.5)/(step+1)];if(pointIn(p,rings))return p;}}throw Error('No interior point '+f.properties.ADM4_EN);}
const index=serviceFeatures.map(f=>({code:f.properties.ADM4_PCODE,barangay:f.properties.ADM4_EN,municipality:f.properties.ADM3_EN,province:f.properties.ADM2_EN,coordinates:interior(f)}));
fs.writeFileSync('public/assets/geo/occidental-mindoro-barangays.geojson',JSON.stringify({type:'FeatureCollection',features}));
fs.writeFileSync('public/assets/geo/omeco-barangays.geojson',JSON.stringify({type:'FeatureCollection',features:serviceFeatures}));
fs.writeFileSync('src/app/data/mock/geography.ts','export const BARANGAYS = '+JSON.stringify(index,null,2)+' as const;\n');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={source,destination,sourceUnchanged:hash(raw)===hash(fs.readFileSync(source)),sha256:hash(raw),bytes:raw.length,type:geo.type,features:geo.features.length,geometryTypes:types,coordinates,invalidCoordinates:invalid,unclosedRings:unclosed,coordinateOrder:'longitude, latitude',nationwideExtent:extent,province:'Occidental Mindoro',provinceFeatures:features.length,municipalities:[...new Set(features.map(x=>x.properties.ADM3_EN))],propertyFields:['ADM4_EN','ADM4_PCODE','ADM3_EN','ADM3_PCODE','ADM2_EN'],metadataDates:{date:features[0].properties.date,validOn:features[0].properties.validOn},coverageCaveat:'Available dataset coverage is not a verified current cooperative service-territory boundary. No completeness against current PSGC or legal boundary survey is asserted.'};
report.serviceFeatures=serviceFeatures.length;report.serviceMunicipalities=[...new Set(index.map(x=>x.municipality))];report.serviceReference='https://www.omeco.com.ph/about-us';report.excludedProvinceMunicipalities=['Looc','Lubang'];
fs.writeFileSync('public/assets/geo/validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
