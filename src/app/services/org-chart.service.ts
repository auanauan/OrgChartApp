import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Position, OrgNode, Level } from '../models/org-chart.models';

@Injectable({
  providedIn: 'root',
})
export class OrgChartService {
  private readonly STORAGE_KEY = 'orgChartData';
  private positions$ = new BehaviorSubject<Position[]>([]);
  private levels$ = new BehaviorSubject<Level[]>([{ levelNumber: 1, nodes: [] }]);
  private orgNodes$ = new BehaviorSubject<OrgNode[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  getPositions(): Observable<Position[]> {
    return this.positions$.asObservable();
  }

  getLevels(): Observable<Level[]> {
    return this.levels$.asObservable();
  }

  getOrgNodes(): Observable<OrgNode[]> {
    return this.orgNodes$.asObservable();
  }

  addPosition(position: Position): void {
    const current = this.positions$.value;
    this.positions$.next([...current, position]);
  }

  addLevel(): void {
    const current = this.levels$.value;
    const newLevel: Level = {
      levelNumber: current.length + 1,
      nodes: [],
    };
    this.levels$.next([...current, newLevel]);
  }

  removeLevel(levelNumber: number): boolean {
    if (levelNumber === 1) {
      return false; // ไม่สามารถลบ Level 1 ได้
    }

    const levels = this.levels$.value;
    const nodes = this.orgNodes$.value;

    // ลบโหนดทั้งหมดในเลเวลนี้และลูกหลานทั้งหมด
    const nodesToRemove = nodes.filter(n => n.level === levelNumber);
    let updatedNodes = [...nodes];

    nodesToRemove.forEach(node => {
      const toRemove = this.getAllChildrenIds(node.id, updatedNodes);
      updatedNodes = updatedNodes.filter(n => !toRemove.includes(n.id) && n.id !== node.id);
    });

    this.orgNodes$.next(updatedNodes);

    // ลบเลเวลและจัดลำดับเลเวลถัดไปใหม่
    const updatedLevels = levels
      .filter(l => l.levelNumber !== levelNumber)
      .map(l => {
        if (l.levelNumber > levelNumber) {
          return {
            ...l,
            levelNumber: l.levelNumber - 1,
            nodes: updatedNodes.filter(n => n.level === l.levelNumber)
          };
        }
        return {
          ...l,
          nodes: updatedNodes.filter(n => n.level === l.levelNumber)
        };
      });

    // Update node levels
    const nodesWithUpdatedLevels = updatedNodes.map(n => {
      if (n.level > levelNumber) {
        return { ...n, level: n.level - 1 };
      }
      return n;
    });

    this.orgNodes$.next(nodesWithUpdatedLevels);
    this.levels$.next(updatedLevels);
    return true;
  }

  addNode(node: OrgNode): void {
    const nodes = this.orgNodes$.value;
    const levels = this.levels$.value;

    // เพิ่มไปยังรายการโหนด
    this.orgNodes$.next([...nodes, node]);

    // อัปเดตเลเวล
    const updatedLevels = levels.map((level) => {
      if (level.levelNumber === node.level) {
        return { ...level, nodes: [...level.nodes, node] };
      }
      return level;
    });
    this.levels$.next(updatedLevels);

    // อัปเดตลูกของโปรแกรม
    if (node.parentId) {
      this.updateParentChildren(node.parentId);
    }
  }

  removeNode(nodeId: string, moveChildrenUp: boolean = false): void {
    const nodes = this.orgNodes$.value;
    const nodeToRemove = nodes.find((n) => n.id === nodeId);

    if (!nodeToRemove) return;

    let updatedNodes = [...nodes];

    if (moveChildrenUp && nodeToRemove.parentId) {
      // ย้ายลูกขึ้นไปหาโปรแกรม
      updatedNodes = updatedNodes.map((node) => {
        if (node.parentId === nodeId) {
          return {
            ...node,
            parentId: nodeToRemove.parentId,
            level: nodeToRemove.level,
          };
        }
        return node;
      });
    } else {
      // ลบลูกทั้งหมดแบบวนซ้ำ
      const toRemove = this.getAllChildrenIds(nodeId, updatedNodes);
      updatedNodes = updatedNodes.filter((n) => !toRemove.includes(n.id) && n.id !== nodeId);
    }

    // ลบโหนดเอง
    updatedNodes = updatedNodes.filter((n) => n.id !== nodeId);

    this.orgNodes$.next(updatedNodes);
    this.rebuildLevels(updatedNodes);
  }

  private getAllChildrenIds(nodeId: string, nodes: OrgNode[]): string[] {
    const children = nodes.filter((n) => n.parentId === nodeId);
    let ids = children.map((c) => c.id);

    children.forEach((child) => {
      ids = [...ids, ...this.getAllChildrenIds(child.id, nodes)];
    });

    return ids;
  }

  private rebuildLevels(nodes: OrgNode[]): void {
    const levels = this.levels$.value;
    const updatedLevels = levels.map((level) => ({
      ...level,
      nodes: nodes.filter((n) => n.level === level.levelNumber),
    }));
    this.levels$.next(updatedLevels);
  }

  private updateParentChildren(parentId: string): void {
    const nodes = this.orgNodes$.value;
    const updatedNodes = nodes.map((node) => {
      if (node.id === parentId) {
        // เปลี่ยนจาก children เป็น array ของ id (string[]) แทน OrgNode[]
        const childrenIds = nodes
          .filter((n) => n.parentId === parentId)
          .map((n) => n.id);
        return { ...node, children: childrenIds };
      }
      return node;
    });
    this.orgNodes$.next(updatedNodes);
  }

  getPossibleParents(level: number): OrgNode[] {
    if (level === 1) return [];
    const nodes = this.orgNodes$.value;
    return nodes.filter((n) => n.level === level - 1);
  }

  getNodeById(id: string): OrgNode | undefined {
    return this.orgNodes$.value.find((n) => n.id === id);
  }

  generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  saveToStorage(): void {
    const data = {
      positions: this.positions$.value,
      levels: this.levels$.value,
      orgNodes: this.orgNodes$.value,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.positions$.next(data.positions || []);
        this.levels$.next(data.levels || [{ levelNumber: 1, nodes: [] }]);
        this.orgNodes$.next(data.orgNodes || []);
      } catch (error) {
        console.error('Failed to load org chart data:', error);
        this.initializeDefaultData();
      }
    } else {
      this.initializeDefaultData();
    }
  }

  private initializeDefaultData(): void {
    this.positions$.next([
      { id: '1', name: 'CEO', code: 'CEO-001' },
      { id: '2', name: 'IT Support', code: 'IT-001' },
      { id: '3', name: 'IT 01', code: 'IT-002' },
      { id: '4', name: 'IT 02', code: 'IT-003' },
      { id: '5', name: 'Financer', code: 'FIN-001' },
    ]);
    this.levels$.next([{ levelNumber: 1, nodes: [] }]);
    this.orgNodes$.next([]);
  }
}
