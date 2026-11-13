import { GisRiskService } from '../../../core/services/gis-risk.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { RISK_CONFIG } from '../../../core/config/risk';
import { OmecoCase } from '../../../models/concern';
import { GeographySelection } from '../../../models/admin';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { GeoDataService, BarangayProperties } from '../../../core/services/geo-data.service';
import { IconComponent } from '../../../shared/components/icon/icon';
@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss',
})
export class MapView implements AfterViewInit, OnChanges, OnDestroy {
  @Input() cases: OmecoCase[] = [];
  @Input() municipality = 'All';
  @Input() barangay = 'All';
  @Input() density = false;
  @Input() connectionId = '';
  @Input() focusCases = false;
  @Input() selectedCaseId = '';
  @Output() selected = new EventEmitter<OmecoCase>();
  @Output() boundarySelected = new EventEmitter<GeographySelection>();
  @ViewChild('mapRoot', { static: true }) private root!: ElementRef<HTMLDivElement>;
  readonly geo = inject(GeoDataService);
  readonly repository = inject(ConcernRepository);
  showBoundaries = true;
  showIncidents = true;
  showCrews = false;
  showConnection = false;
  boundaryCount = 0;
  readonly risks = RISK_CONFIG;
  readonly risk = inject(GisRiskService);
  private map?: L.Map;
  private boundaryLayer?: L.GeoJSON;
  private incidents = L.featureGroup();
  private crews = L.featureGroup();
  private connections = L.featureGroup();
  private observer?: ResizeObserver;
  private destroyed = false;
  private selectedCode = '';
  async ngAfterViewInit(): Promise<void> {
    this.map = L.map(this.root.nativeElement, { zoomControl: false, preferCanvas: true }).setView(
      [12.65, 120.8],
      9,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    L.control.zoom({ position: 'topright' }).addTo(this.map);
    L.control.scale({ imperial: false }).addTo(this.map);
    this.incidents.addTo(this.map);
    this.crews.addTo(this.map);
    this.connections.addTo(this.map);
    this.map.on('zoomend', this.zoom);
    this.observer = new ResizeObserver(() => {
      this.map?.invalidateSize({ pan: false });
    });
    this.observer.observe(this.root.nativeElement);
    await this.load();
  }
  ngOnChanges(): void {
    if (this.map) {
      this.render();
      this.fit();
    }
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.observer?.disconnect();
    this.map?.off('zoomend', this.zoom);
    this.map?.remove();
  }
  async load(): Promise<void> {
    await this.geo.load();
    if (!this.destroyed) {
      this.render();
      this.fit();
    }
  }
  reset(): void {
    this.fit();
  }
  toggle(): void {
    this.render();
  }
  private readonly zoom = () => this.markers();
  private matches(p: BarangayProperties): boolean {
    return (
      (this.municipality === 'All' || p.ADM3_EN === this.municipality) &&
      (this.barangay === 'All' || p.ADM4_PCODE === this.barangay)
    );
  }
  private render(): void {
    if (!this.map) return;
    if (this.boundaryLayer) this.map.removeLayer(this.boundaryLayer);
    const data = this.geo.data();
    this.boundaryCount = 0;
    if (data && this.showBoundaries) {
      this.boundaryLayer = L.geoJSON(data, {
        filter: (f) => this.matches(f.properties),
        style: (f) => {
          const p = f?.properties as BarangayProperties;
          const risk = this.risk.forBarangay(p.ADM4_PCODE);
          return {
            color: p.ADM4_PCODE === this.selectedCode ? '#102b50' : '#2563eb',
            weight: p.ADM4_PCODE === this.selectedCode ? 3 : 1,
            fillColor: risk.color,
            fillOpacity: 0.6,
          };
        },
        onEachFeature: (f, layer) => {
          const p = f.properties as BarangayProperties;
          layer.bindPopup(this.riskPopup(p));
          layer.on({
            mouseover: () => {
              (layer as L.Path).setStyle({ weight: 3, fillOpacity: 0.75 });
            },
            mouseout: () => this.boundaryLayer?.resetStyle(layer as L.Path),
            click: () => {
              this.selectedCode = p.ADM4_PCODE;
              this.boundarySelected.emit({
                code: p.ADM4_PCODE,
                barangay: p.ADM4_EN,
                municipality: p.ADM3_EN,
              });
              this.boundaryLayer?.setStyle((feature) => ({
                weight: feature?.properties.ADM4_PCODE === this.selectedCode ? 3 : 1,
              }));
            },
          });
        },
      }).addTo(this.map);
      this.boundaryCount = this.boundaryLayer.getLayers().length;
    }
    this.markers();
    this.crews.clearLayers();
    this.connections.clearLayers();
    if (this.showCrews)
      for (const crew of this.repository.crews()) {
        if (this.municipality !== 'All' && crew.municipality !== this.municipality) continue;
        L.circleMarker([crew.coordinates[1], crew.coordinates[0]], {
          radius: 8,
          color: '#fff',
          weight: 2,
          fillColor: '#102b50',
          fillOpacity: 1,
        })
          .bindPopup(
            this.popup(crew.name, crew.expertise, 'Simulated crew position · not live GPS'),
          )
          .addTo(this.crews);
      }
    if (this.showConnection) {
      const incident =
        this.cases.find((x) => x.id === this.connectionId) ||
        this.cases.find((x) => x.assignedCrew && x.coordinates);
      const crew = this.repository.crews().find((x) => x.name === incident?.assignedCrew);
      if (incident?.coordinates && crew) {
        L.polyline(
          [
            [crew.coordinates[1], crew.coordinates[0]],
            [incident.coordinates[1], incident.coordinates[0]],
          ],
          { color: '#7c3aed', weight: 3, dashArray: '7 7' },
        )
          .bindPopup(
            this.popup(
              'Illustrative connection — not a road route',
              'No driving distance or ETA is available.',
              'Crew and incident are simulated.',
            ),
          )
          .addTo(this.connections);
      }
    }
  }
  private riskPopup(p: BarangayProperties): HTMLElement {
    const r = this.risk.forBarangay(p.ADM4_PCODE);
    return this.popup(
      p.ADM4_EN + ' · ' + p.ADM3_EN,
      'Simulated risk: ' +
        r.level +
        (r.score === null ? ' · insufficient data' : ' · score ' + r.score + '/100'),
      r.total +
        ' incidents · ' +
        r.active +
        ' active · ' +
        r.households +
        ' households. Latest: ' +
        r.recent,
    );
  }
  private markers(): void {
    if (!this.map) return;
    this.incidents.clearLayers();
    if (!this.showIncidents) return;
    const groups = new Map<string, OmecoCase[]>();
    for (const x of this.cases) {
      if (!x.coordinates || !x.coordinates.every(Number.isFinite)) continue;
      const [lon, lat] = x.coordinates;
      if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
      const pixel = this.map.latLngToLayerPoint([lat, lon]);
      const key =
        this.map.getZoom() < 12 ? Math.floor(pixel.x / 42) + ':' + Math.floor(pixel.y / 42) : x.id;
      groups.set(key, [...(groups.get(key) || []), x]);
    }
    for (const items of groups.values()) {
      const first = items[0],
        coords = first.coordinates!;
      const lat = items.reduce((n, x) => n + x.coordinates![1], 0) / items.length,
        lon = items.reduce((n, x) => n + x.coordinates![0], 0) / items.length;
      const color = items.some((x) => x.priority === 'Critical')
        ? '#dc2626'
        : items.some((x) => x.priority === 'Urgent')
          ? '#f59e0b'
          : '#2563eb';
      if (items.length > 1) {
        const badge = document.createElement('span');
        badge.textContent = String(items.length);
        badge.style.cssText =
          'display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#102b50;color:white;border:3px solid white;font:bold 12px sans-serif;box-shadow:0 2px 8px #102b5055';
        L.marker([lat, lon], {
          icon: L.divIcon({ html: badge, className: 'incident-cluster', iconSize: [30, 30] }),
        })
          .bindPopup(
            this.popup(
              items.length + ' simulated incidents',
              'Zoom in to inspect individual reports.',
              'Clusters group nearby screen locations.',
            ),
          )
          .on('click', () =>
            this.map?.fitBounds(
              items.map((x) => [x.coordinates![1], x.coordinates![0]] as L.LatLngTuple),
              { maxZoom: 13, padding: [35, 35] },
            ),
          )
          .addTo(this.incidents);
      } else
        L.circleMarker([coords[1], coords[0]], {
          radius: 7,
          color: '#fff',
          weight: 2,
          fillColor: color,
          fillOpacity: 1,
        })
          .bindPopup(
            this.popup(
              first.id + ' · ' + first.category,
              first.location,
              first.priority + ' · ' + first.households + ' households · simulated',
            ),
          )
          .on('click', () => this.selected.emit(first))
          .addTo(this.incidents);
    }
  }
  private fit(): void {
    if (!this.map) return;
    const selected = this.cases.find(
      (x) =>
        x.id === this.selectedCaseId &&
        !!x.coordinates &&
        x.coordinates.every(Number.isFinite) &&
        Math.abs(x.coordinates[0]) <= 180 &&
        Math.abs(x.coordinates[1]) <= 90,
    );
    if (this.focusCases && selected?.coordinates) {
      this.map.setView([selected.coordinates[1], selected.coordinates[0]], 14, { animate: false });
    } else if (this.focusCases && this.incidents.getBounds().isValid())
      this.map.fitBounds(this.incidents.getBounds(), {
        padding: [36, 36],
        maxZoom: 14,
        animate: false,
      });
    else if (this.focusCases && this.boundaryLayer?.getBounds().isValid())
      this.map.fitBounds(this.boundaryLayer.getBounds(), { padding: [24, 24], animate: false });
    else if (this.boundaryLayer?.getBounds().isValid())
      this.map.fitBounds(this.boundaryLayer.getBounds(), {
        padding: [15, 15],
        maxZoom: 13,
        animate: false,
      });
    else if (this.incidents.getBounds().isValid())
      this.map.fitBounds(this.incidents.getBounds(), {
        padding: [20, 20],
        maxZoom: 12,
        animate: false,
      });
  }
  private popup(title: string, detail: string, note: string): HTMLElement {
    const box = document.createElement('div');
    for (const [tag, value] of [
      ['strong', title],
      ['p', detail],
      ['small', note],
    ]) {
      const item = document.createElement(tag);
      item.textContent = value;
      box.appendChild(item);
    }
    return box;
  }
}
