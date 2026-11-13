const fs=require('fs');
function write(p,s){fs.mkdirSync(require('path').dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function replace(p,a,b){let s=fs.readFileSync(p,'utf8');if(!s.includes(a))throw Error('Missing text '+p+' '+a);write(p,s.replace(a,b));}
write('src/app/shared/components/mini-chart/mini-chart.ts',`import { Component, Input } from '@angular/core';
import { ChartComponent } from '../chart/chart';
import { OmecoChartDataset } from '../chart/chart.config';
export interface ChartPoint { label: string; value: number; forecast?: boolean; }
@Component({selector:'app-mini-chart',standalone:true,imports:[ChartComponent],templateUrl:'./mini-chart.html',styleUrl:'./mini-chart.scss'})
export class MiniChartComponent {
@Input() points:ChartPoint[]=[]; @Input() title='Incident observations'; @Input() unit='incidents'; @Input() color='#2563eb';
get labels():string[]{return this.points.map(x=>x.label);}
get datasets():OmecoChartDataset[]{const observed:OmecoChartDataset={label:'Historical simulated observations',values:this.points.map(x=>x.forecast?null:x.value),color:this.color};if(!this.points.some(x=>x.forecast))return [observed];const first=this.points.findIndex(x=>x.forecast);return [observed,{label:'Illustrative forecast · untrained',values:this.points.map((x,i)=>x.forecast||i===first-1?x.value:null),color:'#F59E0B',forecast:true}];}
}`);
write('src/app/shared/components/mini-chart/mini-chart.html','<app-chart [labels]="labels" [datasets]="datasets" [title]="title" [unit]="unit" />');
const map='src/app/features/admin/map/map-view.ts';
replace(map,"import * as L from 'leaflet';","import * as L from 'leaflet';\nimport { assessRisk, RISK_CONFIG } from '../../../core/config/risk';");
replace(map,'boundaryCount = 0;','boundaryCount = 0;\n  readonly risks=RISK_CONFIG;');
let s=fs.readFileSync(map,'utf8');s=s.replace(/const count = this.cases.filter\(\(x\) => x.barangayCode === p.ADM4_PCODE\).length;/,'const risk=assessRisk(this.cases.filter(x=>x.barangayCode===p.ADM4_PCODE));').replace(/fillColor: this.density[\s\S]*?fillOpacity: this.density[^\n]+/,'fillColor: risk.color,\n            fillOpacity: 0.6,');
s=s.replace("this.popup(p.ADM4_EN, p.ADM3_EN, 'Available boundary · source metadata 2023')","this.riskPopup(p)").replace('weight: 3, fillOpacity: 0.5','weight: 3, fillOpacity: 0.75');
s=s.replace('  private markers(): void {',`  private riskPopup(p:BarangayProperties):HTMLElement {const r=assessRisk(this.cases.filter(x=>x.barangayCode===p.ADM4_PCODE));return this.popup(p.ADM4_EN+' · '+p.ADM3_EN,'Simulated risk: '+r.level+(r.score===null?' · insufficient data':' · score '+r.score+'/100'),r.total+' incidents · '+r.active+' active · '+r.households+' households. Latest: '+r.recent);}
  private markers(): void {`);write(map,s);
const html='src/app/features/admin/map/map-view.html';s=fs.readFileSync(html,'utf8').replace(/@if \(density\) \{[\s\S]*?\n    \}/,`<details><summary>Simulated barangay risk legend</summary>@for(risk of risks;track risk.level){<span><i [style.background]="risk.color"></i>{{risk.level}}</span>}<p>Count, recurrence, severity, households and unresolved reports. Fewer than two reports: No data. Not validated operational risk.</p></details>`);write(html,s);
