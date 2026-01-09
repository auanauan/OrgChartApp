import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { OrgChartService } from '../../services/org-chart.service';
import { Position, OrgNode, Level, DropData } from '../../models/org-chart.models';
import { PositionDialogComponent } from '../position-dialog/position-dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import {
  ParentSelectorDialogComponent,
  ParentSelectorResult,
} from '../parent-selector-dialog/parent-selector-dialog';

@Component({
  selector: 'app-org-chart',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './org-chart.html',
  styleUrls: ['./org-chart.css'],
})
export class OrgChartComponent implements OnInit, AfterViewChecked {
  @ViewChild('connectionsSvg', { static: false }) connectionsSvg?: ElementRef<SVGElement>;
  @ViewChild('chartPanel', { static: false }) chartPanel?: ElementRef<HTMLElement>;
  @ViewChild('levelsContainer', { static: false }) levelsContainer?: ElementRef<HTMLElement>;

  private orgChartService = inject(OrgChartService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  private colorMap = new Map<string, string>();
  private nodeColorMap = new Map<string, string>();
  private readonly palette = [
    '#e57373',
    '#64b5f6',
    '#81c784',
    '#ffd54f',
    '#ba68c8',
    '#4db6ac',
    '#ffb74d',
    '#90a4ae',
  ];

  positions: Position[] = [];
  levels: Level[] = [];
  orgNodes: OrgNode[] = [];
  hoveredNodeId: string | null = null;
  connectionsHeight = 0;
  private needsRedraw = false;

  ngOnInit(): void {
    this.orgChartService.getPositions().subscribe((positions) => {
      this.positions = positions;
    });

    this.orgChartService.getLevels().subscribe((levels) => {
      this.levels = levels;
      this.needsRedraw = true;
    });

    this.orgChartService.getOrgNodes().subscribe((nodes) => {
      this.orgNodes = nodes;
      this.colorMap.clear();
      this.nodeColorMap.clear();
      this.needsRedraw = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.needsRedraw) {
      setTimeout(() => {
        this.drawConnections();
        this.needsRedraw = false;
      }, 0);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // วาดเส้นใหม่เมื่อปรับขนาดหน้าต่างเพื่อให้เส้นเชื่อมอยู่ตำแหน่งที่ถูกต้อง
    this.needsRedraw = true;
  }

  onAddLevel(): void {
    this.orgChartService.addLevel();
  }

  onDeleteLevel(level: Level, event: Event): void {
    event.stopPropagation();

    if (level.levelNumber === 1) {
      this.showMessage('ไม่สามารถลบ Level 1 ได้', 'error');
      return;
    }

    const hasNodes = level.nodes.length > 0;
    const message = hasNodes
      ? `ต้องการลบ Level ${level.levelNumber} หรือไม่? (มี ${level.nodes.length} โหนด ทั้งหมดจะถูกลบ)`
      : `ต้องการลบ Level ${level.levelNumber} หรือไม่?`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Delete Level',
        message,
        hasChildren: false
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.confirmed) {
        const success = this.orgChartService.removeLevel(level.levelNumber);
        if (success) {
          this.showMessage('ลบ Level เรียบร้อยแล้ว', 'success');
          this.needsRedraw = true;
        } else {
          this.showMessage('ไม่สามารถลบ Level นี้ได้', 'error');
        }
      }
    });
  }

  onSaveAll(): void {
    this.orgChartService.saveToStorage();
    this.showMessage('ข้อมูลถูกบันทึกเรียบร้อยแล้ว!', 'success');
  }

  openPositionDialog(): void {
    const dialogRef = this.dialog.open(PositionDialogComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe((position: Position) => {
      if (position) {
        this.orgChartService.addPosition(position);
        this.showMessage('Position created successfully!');
        this.needsRedraw = true;
      }
    });
  }

  onDrop(event: CdkDragDrop<any>, level: Level): void {
    const dropData: DropData = event.item.data;

    if (event.previousContainer === event.container) return;

    if (level.levelNumber > 1) {
      const possibleParents = this.orgChartService.getPossibleParents(level.levelNumber);
      if (possibleParents.length === 0) {
        this.showMessage('Cannot drop here! Previous level must have nodes first.', 'error');
        return;
      }
      this.openParentSelector(dropData.position, level.levelNumber, possibleParents);
    } else {
      this.createNode(dropData.position, level.levelNumber, null);
    }

    // อัปเดตเส้นหลัง drop
    setTimeout(() => {
      this.needsRedraw = true;
    }, 0);
  }

  onNodeDrag(event: CdkDragMove<any>) {
    this.needsRedraw = true; // redraw เส้นตอนลาก
  }

  private openParentSelector(position: Position, level: number, possibleParents: OrgNode[]): void {
    const dialogRef = this.dialog.open(ParentSelectorDialogComponent, {
      width: '500px',
      data: { possibleParents, positionName: position.name },
    });
    dialogRef.afterClosed().subscribe((result: ParentSelectorResult | undefined) => {
      if (result?.parentId) {
        this.createNode(position, level, result.parentId);
        setTimeout(() => {
          this.needsRedraw = true;
        }, 0);
      }
    });
  }

  private createNode(position: Position, level: number, parentId: string | null): void {
    const newNode: OrgNode = {
      id: this.orgChartService.generateId(),
      positionId: position.id,
      positionName: position.name,
      level,
      parentId,
      children: [],
    };
    this.orgChartService.addNode(newNode);
    this.showMessage(`${position.name} added to Level ${level}`);
  }

  onDeleteNode(node: OrgNode, event: Event): void {
    event.stopPropagation();
    const children = this.getNodeChildren(node.id);
    const hasChildren = children.length > 0;
    const parent = this.getNodeParent(node);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Delete Node',
        message: `Are you sure you want to delete "${node.positionName}"?`,
        hasChildren,
        childCount: children.length,
        parentName: parent?.positionName ?? null,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.confirmed) {
        this.orgChartService.removeNode(node.id, result.moveChildrenUp);
        this.showMessage('Node deleted successfully');
        this.needsRedraw = true;
      }
    });
  }

  onNodeHover(nodeId: string | null): void {
    this.hoveredNodeId = nodeId;
    this.needsRedraw = true;
  }

  getNodeChildren(nodeId: string): OrgNode[] {
    return this.orgNodes.filter((n) => n.parentId === nodeId);
  }

  getNodeParent(node: OrgNode): OrgNode | undefined {
    if (!node.parentId) return undefined;
    return this.orgChartService.getNodeById(node.parentId);
  }

  getPositionCode(node: OrgNode): string {
    const position = this.positions.find(p => p.id === node.positionId);
    return position?.code || '';
  }

  getNodeBorderColor(nodeId: string): string {
    return this.nodeColorMap.get(nodeId) || '#e91e63';
  }

  getConnectedLists(): string[] {
    return ['position-list', ...this.levels.map((l) => `level-${l.levelNumber}`)];
  }

  private drawConnections(): void {
    if (!this.connectionsSvg) return;
    const svg = this.connectionsSvg.nativeElement;

    this.updateSvgSize();

    // ล้างเส้นเก่า
    while (svg.lastChild && svg.lastChild.nodeName !== 'defs') {
      svg.removeChild(svg.lastChild);
    }

    this.orgNodes.forEach((node) => {
      if (node.parentId) this.drawConnection(svg, node.parentId, node.id);
    });
  }

  private drawConnection(svg: SVGElement, parentId: string, childId: string): void {
    const parentEl = document.getElementById(`node-${parentId}`);
    const childEl = document.getElementById(`node-${childId}`);
    if (!parentEl || !childEl) return;

    const parentRect = parentEl.getBoundingClientRect();
    const childRect = childEl.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    const startX = parentRect.left + parentRect.width / 2 - svgRect.left;
    const startY = parentRect.bottom - svgRect.top;
    const endX = childRect.left + childRect.width / 2 - svgRect.left;
    const endY = childRect.top - svgRect.top;
    const midY = startY + (endY - startY) / 2;

    const connectionKey = `${parentId}-${childId}`;
    const baseColor = this.getColorForConnection(connectionKey);
    this.nodeColorMap.set(childId, baseColor);
    const isHighlighted = this.hoveredNodeId === parentId || this.hoveredNodeId === childId;
    const strokeColor = isHighlighted ? '#1976d2' : baseColor;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // วาดเส้นตั้งฉาก: ลงตรง, ไปแนวนอน, แล้วลงตรงถึงลูก
    path.setAttribute(
      'd',
      `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
    );
    path.setAttribute('stroke', strokeColor);
    path.setAttribute('stroke-width', isHighlighted ? '3' : '2.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('marker-end', 'url(#arrowhead)');
    svg.appendChild(path);
  }

  private getColorForConnection(connectionKey: string): string {
    if (!this.colorMap.has(connectionKey)) {
      const color = this.palette[this.colorMap.size % this.palette.length];
      this.colorMap.set(connectionKey, color);
    }
    return this.colorMap.get(connectionKey)!;
  }

  private updateSvgSize(): void {
    if (!this.connectionsSvg || !this.chartPanel) return;

    const panelEl = this.chartPanel.nativeElement;
    const levelsHeight = this.levelsContainer?.nativeElement.offsetHeight ?? 0;
    const newHeight = Math.max(panelEl.scrollHeight, levelsHeight, panelEl.clientHeight);

    if (newHeight !== this.connectionsHeight) {
      this.connectionsHeight = newHeight;
      this.connectionsSvg.nativeElement.style.height = `${newHeight}px`;
    }
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar'],
    });
  }
  getNodeHighlightClass(nodeId: string): string {
    if (!this.hoveredNodeId || nodeId !== this.hoveredNodeId) {
      const node = this.orgNodes.find((n) => n.id === nodeId);
      const hoveredNode = this.orgNodes.find((n) => n.id === this.hoveredNodeId);

      if (node?.parentId === this.hoveredNodeId) return 'child-highlight';
      if (hoveredNode?.parentId === nodeId) return 'parent-highlight';
    }
    return '';
  }
}
