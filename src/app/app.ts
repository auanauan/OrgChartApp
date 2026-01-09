// ส่วนประกอบแอปพลิเคชัน

import { Component } from '@angular/core';
import { OrgChartComponent } from './components/org-chart/org-chart';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrgChartComponent],
  template: `<app-org-chart></app-org-chart>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }
    `,
  ],
})
export class App {
  title = 'org-chart-app';
}
