const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('assert/strict');
const js=ts.transpileModule(fs.readFileSync('src/app/data/mock/admin-seed.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const sandbox={exports:{}};vm.runInNewContext(js,sandbox);const {INCIDENT_SEED,CREW_SEED,USER_SEED}=sandbox.exports;
const data=JSON.parse(fs.readFileSync('public/assets/geo/omeco-barangays.geojson'));
const inside=(p,ring)=>{let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
function contains(feature,p){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;return polygons.some(rings=>inside(p,rings[0])&&!rings.slice(1).some(r=>inside(p,r)));}
assert.equal(data.features.length,139);
assert.equal(new Set(INCIDENT_SEED.map(x=>x.id)).size,INCIDENT_SEED.length);
for(const x of INCIDENT_SEED){const f=data.features.find(f=>f.properties.ADM4_PCODE===x.barangayCode);assert.ok(f,'Missing barangay '+x.id);assert.ok(contains(f,x.coordinates),'Incident outside associated polygon: '+x.id);assert.equal(f.properties.ADM3_EN,x.municipality);assert.ok(USER_SEED.some(u=>u.name===x.member),'Missing member '+x.member);if(x.assignedCrew)assert.ok(CREW_SEED.some(c=>c.name===x.assignedCrew));assert.ok(Number.isFinite(Date.parse(x.reportedAt)));}
for(const c of CREW_SEED)assert.ok(data.features.some(f=>f.properties.ADM3_EN===c.municipality&&contains(f,c.coordinates)),'Crew outside municipality '+c.name);
console.log('Verified 139 available boundaries, '+INCIDENT_SEED.length+' unique incidents inside their matched barangays, connected member/crew identities, timestamps, and '+CREW_SEED.length+' plausible crew positions.');
