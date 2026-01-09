export interface Position {
  id: string;
  name: string;
  code: string;
  nameThai?: string;
  nameChinese?: string;
  nameVietnamese?: string;
  section?: string;
  salaryType?: string;
}

export interface OrgNode {
  id: string;
  positionId: string;
  positionName: string;
  level: number;
  parentId: string | null;
  children: string[];
}

export interface Level {
  levelNumber: number;
  nodes: OrgNode[];
}

export interface DropData {
  position: Position;
}
